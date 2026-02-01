import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserSettingsResponseDto } from './dto/user-settings-response.dto';

@Injectable()
export class UserSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string): Promise<UserSettingsResponseDto> {
    let settings = await this.prisma.userSettings.findUnique({
      where: { user_id: userId },
    });

    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: {
          user_id: userId,
          lists_are_public: true,
          show_ratings_publicly: true,
        },
      });
    }

    return settings;
  }

  async updateSettings(
    userId: string,
    dto: UpdateUserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    const existing = await this.prisma.userSettings.findUnique({
      where: { user_id: userId },
    });

    if (existing) {
      return this.prisma.userSettings.update({
        where: { user_id: userId },
        data: dto,
      });
    } else {
      return this.prisma.userSettings.create({
        data: {
          user_id: userId,
          lists_are_public: dto.lists_are_public ?? true,
          show_ratings_publicly: dto.show_ratings_publicly ?? true,
        },
      });
    }
  }

  async areListsPublic(userId: string): Promise<boolean> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { user_id: userId },
    });

    return settings?.lists_are_public ?? true;
  }

  async areRatingsPublic(userId: string): Promise<boolean> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { user_id: userId },
    });

    return settings?.show_ratings_publicly ?? true;
  }
}
