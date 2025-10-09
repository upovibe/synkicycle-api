import { Router } from 'express';
import { getMatches, generateConnectionMessage, getUserProfile } from '@controllers/match.controller';
import { protect } from '@middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(protect);

// Get AI-powered matches for current user
router.get('/', getMatches);

// Generate connection message for a specific user
router.post('/:userId/message', generateConnectionMessage);

// Get public profile of a specific user
router.get('/profile/:userId', getUserProfile);

export default router;
