import { Request, Response } from 'express';
import ChatbotService from '@services/chatbot.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Send message to chatbot
 * @route   POST /api/chatbot/message
 * @access  Private
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({
        success: false,
        message: 'Message is required',
      });
      return;
    }

    // Use provided conversationId or create new one
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      activeConversationId = await ChatbotService.createConversation(userId.toString());
    }

    // Process message with chatbot
    const response = await ChatbotService.processMessage(
      userId.toString(),
      message.trim(),
      activeConversationId
    );

    res.status(200).json({
      success: true,
      data: {
        response,
        conversationId: activeConversationId,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Get conversation history
 * @route   GET /api/chatbot/conversation/:conversationId
 * @access  Private
 */
export const getConversationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const messages = await ChatbotService.getConversationHistory(conversationId);

    res.status(200).json({
      success: true,
      data: {
        messages,
        conversationId,
      },
    });
  } catch (error) {
    console.error('Get conversation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Get user's conversations
 * @route   GET /api/chatbot/conversations
 * @access  Private
 */
export const getUserConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const conversations = await ChatbotService.getUserConversations(userId.toString());

    res.status(200).json({
      success: true,
      data: {
        conversations,
      },
    });
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Create new conversation
 * @route   POST /api/chatbot/conversation
 * @access  Private
 */
export const createConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const conversationId = await ChatbotService.createConversation(userId.toString(), title);

    res.status(201).json({
      success: true,
      data: {
        conversationId,
        title: title || 'New Conversation',
      },
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Get chatbot suggestions based on user profile
 * @route   GET /api/chatbot/suggestions
 * @access  Private
 */
export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    // Create a temporary conversation for suggestions
    const conversationId = `suggestions_${Date.now()}`;
    
    // Get connection suggestions
    const connectionResponse = await ChatbotService.processMessage(
      userId.toString(),
      'Who should I connect with?',
      conversationId
    );

    // Get profile suggestions
    const profileResponse = await ChatbotService.processMessage(
      userId.toString(),
      'How can I improve my profile?',
      conversationId
    );

    res.status(200).json({
      success: true,
      data: {
        connectionSuggestions: connectionResponse,
        profileSuggestions: profileResponse,
      },
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Mark message as read
 * @route   PUT /api/chatbot/message/:messageId/read
 * @access  Private
 */
export const markMessageAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    // This would require updating the ChatMessage model to include a markAsRead method
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
