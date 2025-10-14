import { Router } from 'express';
import {
  sendMessage,
  getConversationHistory,
  getUserConversations,
  createConversation,
  getSuggestions,
  markMessageAsRead,
} from '@controllers/chatbot.controller';
import { protect } from '@middleware/auth.middleware';

const router = Router();

// All chatbot routes require authentication
router.use(protect);

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to chatbot
 * @access  Private
 */
router.post('/message', sendMessage);

/**
 * @route   GET /api/chatbot/conversation/:conversationId
 * @desc    Get conversation history
 * @access  Private
 */
router.get('/conversation/:conversationId', getConversationHistory);

/**
 * @route   GET /api/chatbot/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations', getUserConversations);

/**
 * @route   POST /api/chatbot/conversation
 * @desc    Create new conversation
 * @access  Private
 */
router.post('/conversation', createConversation);

/**
 * @route   GET /api/chatbot/suggestions
 * @desc    Get AI-powered suggestions for user
 * @access  Private
 */
router.get('/suggestions', getSuggestions);

/**
 * @route   PUT /api/chatbot/message/:messageId/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/message/:messageId/read', markMessageAsRead);

export default router;
