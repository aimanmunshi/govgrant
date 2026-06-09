import { io } from '../index';

export const emitProposalStatusChanged = (
  proposalId: number,
  status: string,
  proposalTitle: string,
  applicantId: number
) => {
  // notify everyone in the proposal room
  io.to(`proposal:${proposalId}`).emit('proposal:statusChanged', {
    proposalId,
    status,
    proposalTitle,
    message: `Proposal "${proposalTitle}" status changed to ${status}`,
    timestamp: new Date(),
  });

  // notify admins
  io.to('role:ADMIN').emit('activity:new', {
    action: 'PROPOSAL_STATUS_CHANGED',
    description: `Proposal "${proposalTitle}" status changed to ${status}`,
    timestamp: new Date(),
  });
};

export const emitReviewSubmitted = (
  proposalId: number,
  proposalTitle: string,
  reviewerName: string,
  score: number
) => {
  // notify admins
  io.to('role:ADMIN').emit('review:submitted', {
    proposalId,
    proposalTitle,
    reviewerName,
    score,
    message: `New review submitted for "${proposalTitle}" with score ${score}`,
    timestamp: new Date(),
  });
};

export const emitMilestoneUpdated = (
  proposalId: number,
  milestoneTitle: string,
  status: string
) => {
  // notify everyone in the proposal room
  io.to(`proposal:${proposalId}`).emit('milestone:updated', {
    proposalId,
    milestoneTitle,
    status,
    message: `Milestone "${milestoneTitle}" is now ${status}`,
    timestamp: new Date(),
  });

  // notify admins
  io.to('role:ADMIN').emit('activity:new', {
    action: 'MILESTONE_UPDATED',
    description: `Milestone "${milestoneTitle}" status changed to ${status}`,
    timestamp: new Date(),
  });
};

export const emitActivityNew = (
  action: string,
  description: string,
  proposalId?: number
) => {
  io.to('role:ADMIN').emit('activity:new', {
    action,
    description,
    proposalId,
    timestamp: new Date(),
  });
};