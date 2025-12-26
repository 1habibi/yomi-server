import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

@Injectable()
export class CookieManager {
  private readonly COOKIE_OPTIONS;
  private readonly refreshTokenMaxAge: number;

  constructor(private configService: ConfigService) {
    const refreshTokenExpiresIn = this.configService.get<string>(
      "REFRESH_IDLE_TTL",
      "7d",
    );
    this.refreshTokenMaxAge = this.parseTimeToMs(refreshTokenExpiresIn);

    this.COOKIE_OPTIONS = {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax" as const,
      path: "/",
    };
  }

  private parseTimeToMs(timeString: string): number {
    const timeValue = parseInt(timeString);

    if (timeString.endsWith("d")) {
      return timeValue * 24 * 60 * 60 * 1000; // days to ms
    } else if (timeString.endsWith("h")) {
      return timeValue * 60 * 60 * 1000; // hours to ms
    } else if (timeString.endsWith("m")) {
      return timeValue * 60 * 1000; // minutes to ms
    } else if (timeString.endsWith("s")) {
      return timeValue * 1000; // seconds to ms
    }

    return 7 * 24 * 60 * 60 * 1000;
  }

  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie("refreshToken", refreshToken, {
      ...this.COOKIE_OPTIONS,
      maxAge: this.refreshTokenMaxAge,
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie("refreshToken", {
      ...this.COOKIE_OPTIONS,
      maxAge: 0,
    });
  }
}
