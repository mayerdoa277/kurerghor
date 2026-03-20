import express from 'express';
import { register, login, refreshToken, logout, googleAuth, googleCallback, getMe, forgotPassword, verifyEmail, resetPassword } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validation.js';

const router = express.Router();

// Public routes - Traditional auth
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Public routes - Email auth
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.get('/verify-email', verifyEmail);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
