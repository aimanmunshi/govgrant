import { z } from 'zod';

export const createReviewSchema = z.object({
  score: z
    .number()
    .int()
    .min(0, 'Score must be at least 0')
    .max(100, 'Score cannot exceed 100'),
  comments: z.string().min(10, 'Comments must be at least 10 characters'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;