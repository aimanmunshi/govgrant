import { Router } from 'express';
import { getActivity } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', getActivity);

export default router;