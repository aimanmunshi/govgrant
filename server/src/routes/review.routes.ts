import { Router } from 'express';
import { createReview, getReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema } from '../schemas/review.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/proposals/:id/reviews',
  authorize('REVIEWER'),
  validate(createReviewSchema),
  createReview
);

router.get(
  '/proposals/:id/reviews',
  authorize('ADMIN', 'REVIEWER'),
  getReviews
);

export default router;