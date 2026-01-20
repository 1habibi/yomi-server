import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "../../email/email.service";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import {
  AuthResponse,
  JwtPayload,
  UserSafeData,
} from "../interfaces/auth.interface";
import { PasswordService } from "./password.service";
import { SessionService } from "./session.service";
import { TokenService } from "./token.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException("Пользователь с таким email уже существует");
    }
    const hashedPassword = await this.passwordService.hashPassword(password);
    const email_confirm_token = uuidv4();
    const email_confirm_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        email_confirm_token,
        email_confirm_expires,
      },
    });

    // try {
    //   await this.emailService.sendEmailConfirmation(
    //     email,
    //     email_confirm_token,
    //     name,
    //   );
    // } catch (error) {
    //   await this.prisma.user.delete({ where: { id: user.id } }).catch(() => {
    //     // Игнорируем ошибку удаления, чтобы не скрыть исходную причину.
    //   });
    //   throw new ServiceUnavailableException(
    //     "Не удалось отправить письмо для подтверждения. Попробуйте позже.",
    //   );
    // }

    return {
      message:
        "Регистрация успешна. Проверьте email для подтверждения аккаунта.",
    };
  }

  async login(
    loginDto: LoginDto,
    userAgent: string,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.validateUserCredentials(email, password);
    const { refreshToken, sessionId } =
      await this.sessionService.createSession(user.id, userAgent, ipAddress);
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    });

    return {
      accessToken,
      refreshToken,
      sessionId,
      user: this.mapToUserSafeData(user),
    };
  }

  async confirmEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        email_confirm_token: token,
        email_confirm_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        "Неверный или истекший токен подтверждения",
      );
    }

    if (user.is_email_confirmed) {
      throw new BadRequestException("Email уже подтвержден");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        is_email_confirmed: true,
        email_confirm_token: null,
        email_confirm_expires: null,
      },
    });

    return {
      message: "Email успешно подтвержден",
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message:
          "Если пользователь с таким email существует, на него будет отправлено письмо для сброса пароля",
      };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: resetToken,
        reset_password_expires: resetExpires,
      },
    });

    await this.emailService.sendPasswordReset(email, resetToken, user.name);

    return {
      message:
        "Если пользователь с таким email существует, на него будет отправлено письмо для сброса пароля",
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        "Неверный или истекший токен сброса пароля",
      );
    }

    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    await this.sessionService.revokeAllForUser(user.id);

    return {
      message: "Пароль успешно изменен",
    };
  }

  async refreshToken(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    const {
      user,
      sessionId,
      refreshToken: newRefreshToken,
    } = await this.sessionService.rotateSession(
      refreshToken,
      userAgent || "Unknown",
      ipAddress,
    );

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId,
      user: this.mapToUserSafeData(user),
    };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    try {
      await this.sessionService.revokeSessionByToken(refreshToken);
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        throw error;
      }
      // Если токен некорректен или уже истёк — игнорируем для идемпотентности выхода.
    }

    return {
      message: "Выход выполнен успешно",
    };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.sessionService.revokeAllForUser(userId);

    return {
      message: "Выход из всех устройств выполнен успешно",
    };
  }

  async getSessions(userId: string, currentSessionId?: string) {
    return this.sessionService.getSessionsForUser(userId, currentSessionId);
  }

  async terminateSession(
    sessionId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const revoked = await this.sessionService.revokeSession(sessionId, userId);

    if (!revoked) {
      throw new BadRequestException("Сессия не найдена");
    }

    return {
      message: "Сессия успешно завершена",
    };
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    return user;
  }

  private async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    if (!user.is_email_confirmed) {
      throw new UnauthorizedException(
        "Пожалуйста, подтвердите ваш email адрес",
      );
    }

    return user;
  }

  private mapToUserSafeData(user: User): UserSafeData {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailConfirmed: user.is_email_confirmed,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }
}
