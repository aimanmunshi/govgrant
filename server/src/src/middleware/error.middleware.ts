import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  sendError(res, err.message || 'Internal server error', 500);
};