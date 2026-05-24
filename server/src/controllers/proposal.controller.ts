import { Request, Response, NextFunction } from 'express';

import {
  getAllProposals,
  getProposalById,
  createProposal,
  updateProposal,
  updateProposalStatus,
  deleteProposal,
  submitProposal,
} from '../services/proposal.service';

import { sendSuccess, sendError } from '../utils/apiResponse';

import { ProposalStatus } from '@prisma/client';

/**
 * Safely extract string value from query/params
 */
const getStringValue = (
  param: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(param)) return param[0];
  return param;
};

/**
 * Safely convert route/query param to number
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

export const getProposals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const isReviewer = req.user?.role === 'REVIEWER';

    const status = getStringValue(
      req.query.status as string | string[] | undefined
    ) as ProposalStatus | undefined;

    const domain = getStringValue(
      req.query.domain as string | string[] | undefined
    );

    const trlLevel = getStringValue(
      req.query.trlLevel as string | string[] | undefined
    );

    const page = getStringValue(
      req.query.page as string | string[] | undefined
    );

    const limit = getStringValue(
      req.query.limit as string | string[] | undefined
    );

    const filters = {
      status,
      domain,
      trlLevel: trlLevel ? Number(trlLevel) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      applicantId:
        isAdmin || isReviewer
          ? undefined
          : req.user?.userId,
    };

    const result = await getAllProposals(filters);

    sendSuccess(
      res,
      result,
      'Proposals fetched successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const getProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposalId = getNumberParam(req.params.id);

    const proposal = await getProposalById(
      proposalId
    );

    sendSuccess(
      res,
      proposal,
      'Proposal fetched successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 404);
  }
};

export const createNewProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposal = await createProposal(
      req.body,
      req.user!.userId
    );

    sendSuccess(
      res,
      proposal,
      'Proposal created successfully',
      201
    );
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const submitNewProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposalId = getNumberParam(req.params.id);

    const proposal = await submitProposal(
      proposalId,
      req.user!.userId
    );

    sendSuccess(
      res,
      proposal,
      'Proposal submitted successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const updateExistingProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposalId = getNumberParam(req.params.id);

    const proposal = await updateProposal(
      proposalId,
      req.body,
      req.user!.userId
    );

    sendSuccess(
      res,
      proposal,
      'Proposal updated successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const changeProposalStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposalId = getNumberParam(req.params.id);

    const proposal = await updateProposalStatus(
      proposalId,
      req.body.status,
      req.user!.userId
    );

    sendSuccess(
      res,
      proposal,
      'Proposal status updated successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const removeProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposalId = getNumberParam(req.params.id);

    await deleteProposal(proposalId);

    sendSuccess(
      res,
      null,
      'Proposal deleted successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};