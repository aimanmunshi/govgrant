import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';
import { AuthUser } from '../types/index';

/**
 * Parses simple duration strings ("15m", "7d", "30s", "2h") into milliseconds.
 * Kept local rather than pulling in the `ms` package, since jsonwebtoken's
 * own duration parsing only needs to be mirrored for the DB-stored expiry.
 */
export const parseDurationMs = (duration: string): number => {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Invalid duration format: "${duration}" (expected e.g. "15m", "7d")`);
  }
  const value = Number(match[1]);
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * unitMs[match[2]];
};

export const generateAccessToken = (userId: number, role: string): string => {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId, role }, env.ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (userId: number): string => {
  const options: SignOptions = {
    expiresIn: env.REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId }, env.REFRESH_TOKEN_SECRET, options);
};

export const verifyAccessToken = (token: string): AuthUser => {
  const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
    userId: number;
    role: string;
  };
  return {
    userId: decoded.userId,
    role: decoded.role as Role,
  };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as {
    userId: number;
  };
};