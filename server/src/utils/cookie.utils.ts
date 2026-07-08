import { Response } from 'express';

// In production the frontend (Vercel) and backend (Railway) are on different
// domains, so the refresh cookie needs sameSite:'none' to be sent cross-site —
// which browsers only allow when paired with secure:true. Locally, frontend and
// backend are both on localhost (different ports, same "site"), so 'strict' works.
const isProduction = process.env.NODE_ENV === 'production';

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
  });
};
