import { Router } from 'express';
import { protect } from '@middleware/auth.middleware';
import {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getUnreadCounts,
} from '@controllers/message.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Message routes
router.post('/send', sendMessage);
router.get('/unread/count', getUnreadCounts);
router.get('/:connectionId', getMessages);
router.put('/:connectionId/read', markMessagesAsRead);

export default router;
