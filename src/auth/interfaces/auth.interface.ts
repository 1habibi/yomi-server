import { Role } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    isEmailConfirmed: boolean;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserSafeData {
  id: string;
  email: string;
  name: string;
  role: Role;
  isEmailConfirmed: boolean;
}
