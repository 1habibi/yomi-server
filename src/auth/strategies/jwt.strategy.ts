import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/auth.interface";
import { AuthService } from "../services/auth.service";
import { SessionService } from "../services/session.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload);
    const sessionActive = await this.sessionService.ensureSessionActive(
      payload.sessionId,
    );
    if (!sessionActive) {
      throw new UnauthorizedException("Сессия недействительна");
    }
    if (!user) {
      throw new UnauthorizedException("Недействительный токен");
    }
    return { ...user, sessionId: payload.sessionId };
  }
}
