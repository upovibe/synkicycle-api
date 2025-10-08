import { Router } from 'express';
import { register, login, getMe, updateProfile } from '@controllers/auth.controller';
import { protect } from '@middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
