import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

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

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
    userId: number;
    role: string;
  };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as {
    userId: number;
  };
};