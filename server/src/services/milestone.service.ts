import { prisma } from '../config/db';
import { CreateMilestoneInput, UpdateMilestoneInput } from '../schemas/milestone.schema';
import { MilestoneStatus } from '@prisma/client';
import { emitMilestoneUpdated } from '../socket/socket.events';
import { createActivityLog } from './user.service';
import { createNotification } from './notification.service';

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
  applicantId: number,
  data: CreateMilestoneInput
)=> {
  const proposal = await prisma.proposal.findFirst({
  where: {
    id: proposalId,
    applicantId,
  },
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
  data: UpdateMilestoneInput,
  actorId: number
) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
  });

  if (!milestone) throw new Error('Milestone not found');

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: data.status as MilestoneStatus },
  });
  emitMilestoneUpdated(
  milestone.proposalId,
  milestone.title,
  data.status
);

  await createActivityLog(
    actorId,
    'MILESTONE_STATUS_CHANGED',
    `Milestone "${milestone.title}" status changed to ${data.status}`,
    milestone.proposalId
  );

  const parentProposal = await prisma.proposal.findUnique({
    where: { id: milestone.proposalId },
  });

  if (parentProposal) {
    await createNotification(
      parentProposal.applicantId,
      'MILESTONE_STATUS_CHANGED',
      'Milestone updated',
      `Milestone "${milestone.title}" is now ${data.status}`,
      `/proposals/${milestone.proposalId}/milestones`
    );
  }

  // if all milestones for this proposal are completed, mark proposal as FUNDED
  if (data.status === 'COMPLETED') {
    const allMilestones = await prisma.milestone.findMany({
      where: { proposalId: milestone.proposalId },
    });

    const allCompleted = allMilestones.every((m) => m.status === 'COMPLETED');

    if (allCompleted) {
      const proposal = await prisma.proposal.update({
        where: { id: milestone.proposalId },
        data: { status: 'FUNDED' },
      });

      await createActivityLog(
        actorId,
        'PROPOSAL_FUNDED',
        `Proposal "${proposal.title}" fully funded — all milestones completed`,
        proposal.id
      );
    }
  }

  return updated;
};