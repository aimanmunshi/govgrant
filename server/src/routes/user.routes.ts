import { Router } from 'express';
import { getUsers, changeUserRole, getActivity } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateRoleSchema } from '../schemas/user.schema';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', getUsers);
router.patch('/:id/role', validate(updateRoleSchema), changeUserRole);

export default router;