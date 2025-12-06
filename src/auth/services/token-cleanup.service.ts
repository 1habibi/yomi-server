import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TokenCleanupService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredRefreshTokens(): Promise<void> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });

    if (result.count > 0) {
      console.log(`Очищено ${result.count} просроченных refresh токенов`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async cleanupExpiredEmailConfirmTokens(): Promise<void> {
    const result = await this.prisma.user.updateMany({
      where: {
        email_confirm_expires: {
          lt: new Date(),
        },
        is_email_confirmed: false,
      },
      data: {
        email_confirm_token: null,
        email_confirm_expires: null,
      },
    });

    if (result.count > 0) {
      console.log(
        `Очищено ${result.count} просроченных токенов подтверждения email`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredPasswordResetTokens(): Promise<void> {
    const result = await this.prisma.user.updateMany({
      where: {
        reset_password_expires: {
          lt: new Date(),
        },
      },
      data: {
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    if (result.count > 0) {
      console.log(
        `Очищено ${result.count} просроченных токенов сброса пароля`,
      );
    }
  }
}

