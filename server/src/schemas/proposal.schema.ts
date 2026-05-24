import { z } from 'zod';

export const createProposalSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  trlLevel: z.number().int().min(1).max(9),
  fundingAmount: z.number().positive('Funding amount must be positive'),
  domain: z.string().min(2, 'Domain is required'),
});

export const updateProposalSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  trlLevel: z.number().int().min(1).max(9).optional(),
  fundingAmount: z.number().positive().optional(),
  domain: z.string().min(2).optional(),
});

export const updateProposalStatusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'FUNDED',
  ]),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type UpdateProposalStatusInput = z.infer<typeof updateProposalStatusSchema>;