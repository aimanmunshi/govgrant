import { Router } from 'express';
import {
  getMilestones,
  addMilestone,
  updateMilestone,
} from '../controllers/milestone.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createMilestoneSchema,
  updateMilestoneSchema,
} from '../schemas/milestone.schema';

const router = Router();

router.use(authenticate);

// nested under proposals
router.get('/proposals/:id/milestones', getMilestones);
router.post(
  '/proposals/:id/milestones',
  authorize('ADMIN'),
  validate(createMilestoneSchema),
  addMilestone
);

// standalone milestone update
router.patch(
  '/milestones/:id',
  authorize('ADMIN'),
  validate(updateMilestoneSchema),
  updateMilestone
);

export default router;