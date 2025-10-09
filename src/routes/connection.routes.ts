import { Router } from 'express';
import { protect } from '@middleware/auth.middleware';
import {
  sendConnectionRequest,
  respondToConnectionRequest,
  getUserConnections,
  getConnection,
} from '@controllers/connection.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Connection routes
router.post('/send', sendConnectionRequest);
router.put('/:connectionId/respond', respondToConnectionRequest);
router.get('/', getUserConnections);
router.get('/:connectionId', getConnection);

export default router;
