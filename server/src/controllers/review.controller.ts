import { Request, Response, NextFunction } from 'express';

import {
  submitReview,
  getReviewsByProposal,
} from '../services/review.service';

import { sendSuccess, sendError } from '../utils/apiResponse';

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
    throw new Error('Invalid ID parameter');
  }

  return Number(value);
};

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposalId = getNumberParam(req.params.id);

    const reviewerId = req.user!.userId;

    const review = await submitReview(
      proposalId,
      reviewerId,
      req.body
    );

    sendSuccess(
      res,
      review,
      'Review submitted successfully',
      201
    );
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposalId = getNumberParam(req.params.id);

    const result = await getReviewsByProposal(
      proposalId
    );

    sendSuccess(
      res,
      result,
      'Reviews fetched successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};