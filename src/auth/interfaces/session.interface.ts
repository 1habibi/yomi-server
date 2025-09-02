import { Role } from "@prisma/client";

export interface SessionData {
  userId: string;
  email: string;
  role: Role;
  userAgent: string;
  ip?: string;
  loginTime: Date;
  lastActivity: Date;
}

export interface SessionInfo extends SessionData {
  sessionId: string;
}

export interface SessionWithId {
  sessionId: string;
  sessionData: SessionData;
}
