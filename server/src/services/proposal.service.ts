import { prisma } from '../config/db';
import { CreateProposalInput, UpdateProposalInput } from '../schemas/proposal.schema';
import { ProposalStatus } from '@prisma/client';
import { createActivityLog } from './user.service';
import { createNotification } from './notification.service';
import {
  emitProposalStatusChanged,
} from '../socket/socket.events';

export const getAllProposals = async (filters: {
  status?: ProposalStatus;
  domain?: string;
  trlLevel?: number;
  page?: number;
  limit?: number;
  applicantId?: number;
  reviewerId?: number;
}) => {
  const { status, domain, trlLevel, page = 1, limit = 10, applicantId, reviewerId } = filters;

  const where: any = {};
  if (status) where.status = status;
  if (domain) where.domain = { contains: domain };
  if (trlLevel) where.trlLevel = trlLevel;
  if (applicantId) where.applicantId = applicantId;
  if (reviewerId) where.assignments = { some: { reviewerId } };

  const [proposals, total] = await Promise.all([
    prisma.proposal.findMany({
      where,
      include: {
  applicant: {
    select: {
      id: true,
      name: true,
      email: true,
      organization: true,
    },
  },

  milestones: {
    orderBy: {
      dueDate: 'asc',
    },
  },

  _count: {
    select: {
      milestones: true,
      reviews: true,
    },
  },
  assignments: {
  include: {
    reviewer: {
      select: { id: true, name: true, email: true },
    },
  },
},
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
      assignments: {
  include: {
    reviewer: {
      select: { id: true, name: true, email: true },
    },
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

  await createActivityLog(
    applicantId,
    'PROPOSAL_CREATED',
    `New proposal "${proposal.title}" created`,
    proposal.id
  );

  return proposal;
};

export const submitProposal = async (id: number, applicantId: number) => {
  const proposal = await prisma.proposal.findUnique({ where: { id } });

  if (!proposal) throw new Error('Proposal not found');
  if (proposal.applicantId !== applicantId)
    throw new Error('You are not authorized to submit this proposal');
  if (proposal.status !== 'DRAFT')
    throw new Error('Only draft proposals can be submitted');

  const updated = await prisma.proposal.update({
    where: { id },
    data: { status: 'SUBMITTED', submittedAt: new Date() },
  });

  await createActivityLog(
    applicantId,
    'PROPOSAL_SUBMITTED',
    `Proposal "${updated.title}" submitted for review`,
    id
  );

  return updated;
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
  status: ProposalStatus,
  adminId: number
) => {
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) throw new Error('Proposal not found');

  const updated = await prisma.proposal.update({
    where: { id },
    data: { status },
  });

  await createActivityLog(
    adminId,
    'PROPOSAL_STATUS_CHANGED',
    `Proposal "${proposal.title}" status changed to ${status}`,
    id
  );

  emitProposalStatusChanged(
    id,
    status,
    proposal.title,
    proposal.applicantId
  );

  await createNotification(
    proposal.applicantId,
    'PROPOSAL_STATUS_CHANGED',
    'Proposal status updated',
    `Your proposal "${proposal.title}" is now ${status}`,
    `/proposals/${id}`
  );

  return updated;
};

export const deleteProposal = async (id: number) => {
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) throw new Error('Proposal not found');

  await prisma.proposal.delete({ where: { id } });
};
export const assignReviewer = async (
  proposalId: number,
  reviewerId: number,
  adminId: number
) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  if (proposal.status === "DRAFT") {
    throw new Error("Reviewers cannot be assigned to a draft proposal");
  }

  const reviewer = await prisma.user.findUnique({
    where: {
      id: reviewerId,
      role: "REVIEWER",
    },
  });

  if (!reviewer) {
    throw new Error("Reviewer not found");
  }

  const existing = await prisma.proposalAssignment.findUnique({
    where: {
      proposalId_reviewerId: {
        proposalId,
        reviewerId,
      },
    },
  });

  if (existing) {
    throw new Error("Reviewer already assigned");
  }

  const assignment = await prisma.proposalAssignment.create({
    data: {
      proposalId,
      reviewerId,
    },
  });

  await createActivityLog(
    adminId,
    'REVIEWER_ASSIGNED',
    `${reviewer.name} assigned as reviewer for proposal "${proposal.title}"`,
    proposalId
  );

  await createNotification(
    reviewerId,
    'REVIEWER_ASSIGNED',
    'New review assignment',
    `You've been assigned to review "${proposal.title}"`,
    `/proposals/${proposalId}/review`
  );

  return assignment;
};