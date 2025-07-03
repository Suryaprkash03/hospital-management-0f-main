
import { Router } from 'express';
import { authController } from '@/controllers/authController';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

router.post('/login', asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/change-password', authenticateToken, asyncHandler(authController.changePassword));
router.post('/refresh-token', asyncHandler(authController.refreshToken));
router.post('/logout', authenticateToken, asyncHandler(authController.logout));
router.get('/me', authenticateToken, asyncHandler(authController.getProfile));
router.put('/profile', authenticateToken, asyncHandler(authController.updateProfile));

export { router as authRoutes };
