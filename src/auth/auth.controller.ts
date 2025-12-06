import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { Request, Response } from "express";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CookieManager } from "./managers/cookie.manager";
import { AuthService } from "./services/auth.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieManager: CookieManager,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
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

  @Get("confirm-email")
  @HttpCode(HttpStatus.OK)
  async confirmEmail(@Query("token") token: string) {
    return this.authService.confirmEmail(token);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
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

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
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

  @Post("logout-all")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.id);
    this.cookieManager.clearAuthCookies(res);
    return { message: "Выход из всех устройств выполнен успешно" };
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailConfirmed: user.is_email_confirmed,
      createdAt: user.created_at,
    };
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  async getSessions(@CurrentUser() user: User, @Req() req: Request) {
    const currentToken = req.cookies?.refreshToken;
    return this.authService.getSessions(user.id, currentToken);
  }

  @Delete("sessions/:id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async terminateSession(
    @Param("id") sessionId: string,
    @CurrentUser() user: User,
  ) {
    return this.authService.terminateSession(sessionId, user.id);
  }
}
