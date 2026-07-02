import { prisma } from '../config/db';
import { CreateReviewInput } from '../schemas/review.schema';
import { createActivityLog } from './user.service';
import { emitReviewSubmitted } from '../socket/socket.events';

export const submitReview = async (
  proposalId: number,
  reviewerId: number,
  data: CreateReviewInput
) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) throw new Error('Proposal not found');

  if (proposal.status !== 'UNDER_REVIEW')
    throw new Error('Reviews can only be submitted for proposals under review');

  // Validate milestone belongs to this proposal
  const milestone = await prisma.milestone.findUnique({
    where: { id: data.milestoneId },
  });

  if (!milestone) throw new Error('Milestone not found');
  if (milestone.proposalId !== proposalId)
    throw new Error('Milestone does not belong to this proposal');

  // Check unique per milestone per reviewer
  const existingReview = await prisma.review.findUnique({
    where: {
      milestoneId_reviewerId: { milestoneId: data.milestoneId, reviewerId },
    },
  });

  if (existingReview)
    throw new Error('You have already reviewed this milestone');

  const review = await prisma.review.create({
    data: {
      score:       data.score,
      comments:    data.comments,
      proposalId,
      reviewerId,
      milestoneId: data.milestoneId,
    },
    include: {
      reviewer: { select: { id: true, name: true, email: true } },
      milestone: { select: { id: true, title: true } },
    },
  });

  await createActivityLog(
    reviewerId,
    'REVIEW_SUBMITTED',
    `Review submitted for milestone "${milestone.title}" with score ${data.score}`,
    proposalId
  );

  emitReviewSubmitted(proposalId, proposal.title, review.reviewer.name, data.score);

  return review;
};



export const getReviewsByProposal = async (proposalId: number) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) throw new Error('Proposal not found');

  const reviews = await prisma.review.findMany({
  where: { proposalId },
  include: {
    reviewer: { select: { id: true, name: true, email: true } },
    milestone: { select: { id: true, title: true } },  // ← add
  },
  orderBy: { createdAt: 'desc' },
});

  const averageScore =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length
      : null;

  return { reviews, averageScore, totalReviews: reviews.length };
};