import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../utils/cookie.utils';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await registerUser(req.body);
    sendSuccess(res, user, 'User registered successfully', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body);
    setRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken }, 'Login successful');
  } catch (error: any) {
    sendError(res, error.message, 401);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      sendError(res, 'Refresh token missing', 401);
      return;
    }

    const { accessToken } = await refreshAccessToken(refreshToken);
    sendSuccess(res, { accessToken }, 'Access token refreshed');
  } catch (error: any) {
    sendError(res, error.message, 401);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    clearRefreshTokenCookie(res);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};