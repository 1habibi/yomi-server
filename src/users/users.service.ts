import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PasswordService } from '../auth/services/password.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private uploadService: UploadService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar_url: true,
        is_email_confirmed: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar_url: true,
        is_email_confirmed: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Пользователь не найден');

    const isPasswordValid = await this.passwordService.comparePassword(
      dto.currentPassword,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Неверный текущий пароль');

    const hashedPassword = await this.passwordService.hashPassword(
      dto.newPassword,
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Пароль успешно изменен' };
  }

  async changeEmail(
    userId: string,
    dto: ChangeEmailDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Пользователь не найден');

    const isPasswordValid = await this.passwordService.comparePassword(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) throw new UnauthorizedException('Неверный пароль');

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.newEmail },
    });
    if (existingUser)
      throw new ConflictException(
        'Пользователь с таким email уже существует',
      );

    const email_confirm_token = uuidv4();
    const email_confirm_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.newEmail,
        is_email_confirmed: false,
        email_confirm_token,
        email_confirm_expires,
      },
    });
    return {
      message:
        'Email успешно изменен. Проверьте новый email для подтверждения.',
    };
  }

  async updateAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar_url: true },
    });

    if (user?.avatar_url) {
      await this.uploadService.deleteFromS3(user.avatar_url);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar_url: avatarUrl },
    });

    return this.mapToResponseDto(updatedUser);
  }

  async deleteAvatar(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar_url: true },
    });

    if (user?.avatar_url) {
      await this.uploadService.deleteFromS3(user.avatar_url);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar_url: null },
    });

    return this.mapToResponseDto(updatedUser);
  }

  private mapToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatar_url,
      isEmailConfirmed: user.is_email_confirmed,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}
