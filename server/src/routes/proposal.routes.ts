import { Router } from 'express';
import {
  getProposals,
  getProposal,
  createNewProposal,
  submitNewProposal,
  updateExistingProposal,
  changeProposalStatus,
  removeProposal,
} from '../controllers/proposal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createProposalSchema,
  updateProposalSchema,
  updateProposalStatusSchema,
} from '../schemas/proposal.schema';

const router = Router();

// all routes require authentication
router.use(authenticate);

router.get('/', getProposals);
router.get('/:id', getProposal);
router.post('/', authorize('APPLICANT', 'ADMIN'), validate(createProposalSchema), createNewProposal);
router.post('/:id/submit', authorize('APPLICANT'), submitNewProposal);
router.patch('/:id', authorize('APPLICANT', 'ADMIN'), validate(updateProposalSchema), updateExistingProposal);
router.patch('/:id/status', authorize('ADMIN'), validate(updateProposalStatusSchema), changeProposalStatus);
router.delete('/:id', authorize('ADMIN'), removeProposal);

export default router;