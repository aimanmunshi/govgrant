import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';
import { AuthUser } from '../types/index';

export const generateAccessToken = (userId: number, role: string): string => {
  const options: SignOptions = {
    expiresIn: '15m',
  };
  return jwt.sign({ userId, role }, env.ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (userId: number): string => {
  const options: SignOptions = {
    expiresIn: '7d',
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