import { prisma } from '../config/db';
import { CreateProposalInput, UpdateProposalInput } from '../schemas/proposal.schema';
import { ProposalStatus } from '@prisma/client';

export const getAllProposals = async (filters: {
  status?: ProposalStatus;
  domain?: string;
  trlLevel?: number;
  page?: number;
  limit?: number;
  applicantId?: number;
}) => {
  const { status, domain, trlLevel, page = 1, limit = 10, applicantId } = filters;

  const where: any = {};
  if (status) where.status = status;
  if (domain) where.domain = { contains: domain };
  if (trlLevel) where.trlLevel = trlLevel;
  if (applicantId) where.applicantId = applicantId;

  const [proposals, total] = await Promise.all([
    prisma.proposal.findMany({
      where,
      include: {
        applicant: {
          select: { id: true, name: true, email: true, organization: true },
        },
        _count: { select: { milestones: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.proposal.count({ where }),
  ]);

  return {
    proposals,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProposalById = async (id: number) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      applicant: {
        select: { id: true, name: true, email: true, organization: true },
      },
      milestones: { orderBy: { createdAt: 'asc' } },
      reviews: {
        include: {
          reviewer: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!proposal) throw new Error('Proposal not found');
  return proposal;
};

export const createProposal = async (
  data: CreateProposalInput,
  applicantId: number
) => {
  const proposal = await prisma.proposal.create({
    data: {
      ...data,
      applicantId,
      status: 'DRAFT',
    },
  });
  return proposal;
};

export const submitProposal = async (id: number, applicantId: number) => {
  const proposal = await prisma.proposal.findUnique({ where: { id } });

  if (!proposal) throw new Error('Proposal not found');
  if (proposal.applicantId !== applicantId)
    throw new Error('You are not authorized to submit this proposal');
  if (proposal.status !== 'DRAFT')
    throw new Error('Only draft proposals can be submitted');

  return await prisma.proposal.update({
    where: { id },
    data: { status: 'SUBMITTED', submittedAt: new Date() },
  });
};

export const updateProposal = async (
  id: number,
  data: UpdateProposalInput,
  applicantId: number
) => {
  const proposal = await prisma.proposal.findUnique({ where: { id } });

  if (!proposal) throw new Error('Proposal not found');
  if (proposal.applicantId !== applicantId)
    throw new Error('You are not authorized to update this proposal');
  if (proposal.status !== 'DRAFT')
    throw new Error('Only draft proposals can be edited');

  return await prisma.proposal.update({ where: { id }, data });
};

export const updateProposalStatus = async (
  id: number,
  status: ProposalStatus
) => {
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) throw new Error('Proposal not found');

  return await prisma.proposal.update({ where: { id }, data: { status } });
};

export const deleteProposal = async (id: number) => {
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) throw new Error('Proposal not found');

  await prisma.proposal.delete({ where: { id } });
};