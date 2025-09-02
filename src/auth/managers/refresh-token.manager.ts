import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { TokenService } from "../services/token.service";

@Injectable()
export class RefreshTokenManager {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async createOrUpdateRefreshToken(
    user: User,
    userAgent: string,
  ): Promise<string> {
    const refreshToken = this.tokenService.generateRefreshToken();
    const expiresAt = this.tokenService.getRefreshTokenExpiration();
    const userAgentValue = userAgent || "Unknown";

    const existingRefreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
        userAgent: userAgentValue,
      },
    });

    if (existingRefreshToken) {
      await this.prisma.refreshToken.update({
        where: { id: existingRefreshToken.id },
        data: { token: refreshToken, expiresAt },
      });
    } else {
      await this.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          userAgent: userAgentValue,
          expiresAt,
        },
      });
    }

    return refreshToken;
  }

  async validateRefreshToken(token: string): Promise<User | null> {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    return refreshToken?.user || null;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
