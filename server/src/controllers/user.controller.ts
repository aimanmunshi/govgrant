import { Request, Response, NextFunction } from 'express';

import {
  getAllUsers,
  updateUserRole,
  getActivityLog,
} from '../services/user.service';

import { sendSuccess, sendError } from '../utils/apiResponse';

import { Role } from '@prisma/client';

/**
 * Safely extract string value from params/query
 */
const getStringValue = (
  param: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(param)) return param[0];
  return param;
};

/**
 * Safely convert param to number
 */
const getNumberParam = (
  param: string | string[] | undefined
): number => {
  const value = getStringValue(param);

  if (!value || isNaN(Number(value))) {
    throw new Error('Invalid numeric parameter');
  }

  return Number(value);
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getAllUsers();

    sendSuccess(
      res,
      users,
      'Users fetched successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getNumberParam(req.params.id);

    const user = await updateUserRole(
      userId,
      req.body.role as Role
    );

    sendSuccess(
      res,
      user,
      'User role updated successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit
      ? getNumberParam(
          req.query.limit as string | string[]
        )
      : 20;

    const activity = await getActivityLog(limit);

    sendSuccess(
      res,
      activity,
      'Activity log fetched successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};