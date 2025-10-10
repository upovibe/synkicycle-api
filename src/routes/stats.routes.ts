import { Router } from 'express';
import { getNetworkStats, getUserActivity } from '../controllers/stats.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/stats/network
// @desc    Get network statistics
// @access  Private
router.get('/network', getNetworkStats);

// @route   GET /api/stats/activity
// @desc    Get user activity timeline
// @access  Private
router.get('/activity', getUserActivity);

export default router;

