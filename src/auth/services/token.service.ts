import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtPayload, TokenPair } from "../interfaces/auth.interface";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get("JWT_EXPIRES_IN"),
    });
  }

  generateRefreshToken(): string {
    return uuidv4();
  }

  generateTokenPair(user: User): TokenPair {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(),
    };
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  getRefreshTokenExpiration(): Date {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    return expires;
  }

  async createOrUpdateRefreshToken(
    user: User,
    userAgent: string,
  ): Promise<string> {
    const refreshToken = this.generateRefreshToken();
    const expiresAt = this.getRefreshTokenExpiration();

    await this.prisma.refreshToken.upsert({
      where: {
        userId_userAgent: {
          userId: user.id,
          userAgent,
        },
      },
      update: {
        token: refreshToken,
        expiresAt,
      },
      create: {
        token: refreshToken,
        userId: user.id,
        userAgent,
        expiresAt,
      },
    });

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
