import { Role } from '@prisma/client';

export interface AuthUser {
  userId: number;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}