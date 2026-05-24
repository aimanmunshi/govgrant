import { prisma } from '../config/db';
import { CreateMilestoneInput, UpdateMilestoneInput } from '../schemas/milestone.schema';
import { MilestoneStatus } from '@prisma/client';

export const getMilestonesByProposal = async (proposalId: number) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) throw new Error('Proposal not found');

  return await prisma.milestone.findMany({
    where: { proposalId },
    orderBy: { createdAt: 'asc' },
  });
};

export const createMilestone = async (
  proposalId: number,
  data: CreateMilestoneInput
) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) throw new Error('Proposal not found');

  if (proposal.status !== 'APPROVED' && proposal.status !== 'FUNDED') {
    throw new Error('Milestones can only be added to approved proposals');
  }

  return await prisma.milestone.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      fundRelease: data.fundRelease,
      proposalId,
    },
  });
};

export const updateMilestoneStatus = async (
  milestoneId: number,
  data: UpdateMilestoneInput
) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
  });

  if (!milestone) throw new Error('Milestone not found');

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: data.status as MilestoneStatus },
  });

  // if all milestones for this proposal are completed, mark proposal as FUNDED
  if (data.status === 'COMPLETED') {
    const allMilestones = await prisma.milestone.findMany({
      where: { proposalId: milestone.proposalId },
    });

    const allCompleted = allMilestones.every((m) => m.status === 'COMPLETED');

    if (allCompleted) {
      await prisma.proposal.update({
        where: { id: milestone.proposalId },
        data: { status: 'FUNDED' },
      });
    }
  }

  return updated;
};