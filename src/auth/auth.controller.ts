import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { Request, Response } from "express";
import { UserResponseDto } from "src/users/dto/user-response.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginResponseDto } from "./dto/login-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/reset-password.dto";
import { SessionResponseDto } from "./dto/sessions-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CookieManager } from "./managers/cookie.manager";
import { AuthService } from "./services/auth.service";

@ApiTags("Authentication")
@ApiBearerAuth()
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieManager: CookieManager,
  ) {}

  @ApiOperation({
    summary: "Регистрация нового пользователя",
    description: "Создает новую учетную запись пользователя с указанными данными. После регистрации на email приходит письмо с подтверждением."
  })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Некорректные данные для регистрации' })
  @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует' })
  @ApiResponse({ status: 503, description: 'Не удалось отправить письмо для подтверждения' })
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: "Аутентификация пользователя",
    description: "Выполняет вход пользователя в систему. В случае успеха устанавливает httpOnly cookie с refresh токеном и создает сессию."
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Успешная аутентификация',
    type: LoginResponseDto,
    headers: {
      'Set-Cookie': {
        schema: {
          type: 'string'
        },
        description: 'HTTP-Only cookie с refresh токеном'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  @ApiResponse({ status: 403, description: 'Email не подтвержден' })
  @Post("login")
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const userAgent = req.get("User-Agent") || "Unknown";
    const result = await this.authService.login(loginDto, userAgent, ip);

    this.cookieManager.setRefreshTokenCookie(res, result.refreshToken);

    const { refreshToken, ...responseWithoutRefreshToken } = result;
    return responseWithoutRefreshToken;
  }

  @ApiOperation({
    summary: "Подтверждение email",
    description: "Подтверждает email пользователя по токену, отправленному на почту"
  })
  @ApiResponse({ status: 200, description: 'Email успешно подтвержден' })
  @ApiResponse({ status: 400, description: 'Неверный или истекший токен подтверждения' })
  @Get("confirm-email")
  async confirmEmail(@Query("token") token: string) {
    return this.authService.confirmEmail(token);
  }

  @ApiOperation({
    summary: "Запрос на сброс пароля",
    description: "Инициирует процесс сброса пароля. Отправляет письмо с токеном сброса на указанный email."
  })
  @ApiResponse({ status: 200, description: 'Письмо с инструкциями отправлено на email' })
  @ApiResponse({ status: 404, description: 'Пользователь с указанным email не найден' })
  @Post("forgot-password")
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({
    summary: "Сброс пароля",
    description: "Устанавливает новый пароль пользователя по токену сброса"
  })
  @ApiResponse({ status: 200, description: 'Пароль успешно изменен' })
  @ApiResponse({ status: 400, description: 'Неверный или истекший токен сброса' })
  @Post("reset-password")
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @ApiOperation({
    summary: "Обновление токенов",
    description: "Обновляет пару access и refresh токенов. Требует валидного refresh токена в cookies."
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Токены успешно обновлены',
    type: LoginResponseDto,
    headers: {
      'Set-Cookie': {
        schema: {
          type: 'string'
        },
        description: 'Новый httpOnly refresh токен'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Невалидный refresh токен' })
  @Post("refresh")
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const userAgent = req.get("User-Agent") || "Unknown";
    const result = await this.authService.refreshToken(
      refreshToken,
      userAgent,
      ip,
    );

    this.cookieManager.setRefreshTokenCookie(res, result.refreshToken);

    const { refreshToken: newRefreshToken, ...responseWithoutRefreshToken } =
      result;
    return responseWithoutRefreshToken;
  }

  @ApiOperation({
    summary: "Выход из системы",
    description: "Завершает текущую сессию пользователя. Удаляет refresh токен из базы данных и очищает cookies."
  })
  @ApiResponse({ status: 200, description: 'Выход выполнен успешно' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.cookieManager.clearAuthCookies(res);

    return { message: "Выход выполнен успешно" };
  }

  @ApiOperation({
    summary: "Выход из всех устройств",
    description: "Завершает все активные сессии пользователя на всех устройствах. Очищает все refresh токены пользователя из базы данных."
  })
  @ApiResponse({ status: 200, description: 'Выход со всех устройств выполнен успешно' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @Post("logout-all")
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.id);
    this.cookieManager.clearAuthCookies(res);
    return { message: "Выход из всех устройств выполнен успешно" };
  }

  @ApiOperation({
    summary: "Получение профиля пользователя",
    description: "Возвращает информацию о текущем аутентифицированном пользователе"
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Успешное получение профиля',
    type: UserResponseDto
  })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @Get("profile")
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<UserResponseDto> {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatar_url,
      isEmailConfirmed: user.is_email_confirmed,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  @ApiOperation({
    summary: "Получение списка активных сессий",
    description: "Возвращает список всех активных сессий пользователя с информацией об устройствах"
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Список активных сессий',
    type: [SessionResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  async getSessions(@CurrentUser() user): Promise<(SessionResponseDto | null)[]> {
    const currentSessionId = user?.sessionId;
    return this.authService.getSessions(user.id, currentSessionId);
  }

  @ApiOperation({
    summary: "Завершение сессии",
    description: "Завершает указанную сессию пользователя по её идентификатору"
  })
  @ApiResponse({ status: 200, description: 'Сессия успешно завершена' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав на завершение этой сессии' })
  @ApiResponse({ status: 404, description: 'Сессия не найдена' })
  @Delete("sessions/:id")
  @UseGuards(JwtAuthGuard)
  async terminateSession(
    @Param("id") sessionId: string,
    @CurrentUser() user: User,
  ) {
    return this.authService.terminateSession(sessionId, user.id);
  }
}
