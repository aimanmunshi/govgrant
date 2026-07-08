import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  updateProfile,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
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

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await updateProfile(req.user!.userId, req.body);
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const verifyEmailHandler = async (
  req: Request,
  res: Response
) => {
  try {
    await verifyEmail(req.body.token);
    sendSuccess(res, null, 'Email verified successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const resendVerification = async (
  req: Request,
  res: Response
) => {
  try {
    await resendVerificationEmail(req.user!.userId);
    sendSuccess(res, null, 'Verification email sent');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const forgotPasswordHandler = async (
  req: Request,
  res: Response
) => {
  try {
    await forgotPassword(req.body.email);
    // always respond success — don't reveal whether the email exists
    sendSuccess(res, null, 'If that email is registered, a reset link has been sent');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response
) => {
  try {
    await resetPassword(req.body.token, req.body.password);
    sendSuccess(res, null, 'Password reset successfully');
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};