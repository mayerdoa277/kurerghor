import express from 'express';
import { register, login, refreshToken, logout, googleCallback, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { validate, registerSchema, loginSchema } from '../utils/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.get('/google/callback', googleCallback);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
