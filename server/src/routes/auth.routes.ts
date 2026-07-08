import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  updateMe,
  verifyEmailHandler,
  resendVerification,
  forgotPasswordHandler,
  resetPasswordHandler,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginLimiter, registerLimiter, emailActionLimiter } from '../middleware/rateLimit.middleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema';

const router = Router();

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.patch('/me', authenticate, validate(updateProfileSchema), updateMe);

router.post('/verify-email', validate(verifyEmailSchema), verifyEmailHandler);
router.post('/resend-verification', authenticate, emailActionLimiter, resendVerification);
router.post('/forgot-password', emailActionLimiter, validate(forgotPasswordSchema), forgotPasswordHandler);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordHandler);

export default router;
