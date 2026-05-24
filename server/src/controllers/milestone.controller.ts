import { Request, Response, NextFunction } from 'express';

import {
  getMilestonesByProposal,
  createMilestone,
  updateMilestoneStatus,
} from '../services/milestone.service';

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

export const getMilestones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposalId = getNumberParam(req.params.id);

    const milestones = await getMilestonesByProposal(
      proposalId
    );

    sendSuccess(
      res,
      milestones,
      'Milestones fetched successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

export const addMilestone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposalId = getNumberParam(req.params.id);

    const milestone = await createMilestone(
      proposalId,
      req.body
    );

    sendSuccess(
      res,
      milestone,
      'Milestone created successfully',
      201
    );
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const updateMilestone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const milestoneId = getNumberParam(req.params.id);

    const milestone = await updateMilestoneStatus(
      milestoneId,
      req.body
    );

    sendSuccess(
      res,
      milestone,
      'Milestone updated successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};