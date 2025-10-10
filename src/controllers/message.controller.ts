import { Request, Response, NextFunction } from 'express';
import { Message } from '@models/Message';
import { Connection } from '@models/Connection';
import { IUser } from '@models/User';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * @desc    Send message
 * @route   POST /api/messages/send
 * @access  Private
 */
export const sendMessage = async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const currentUser = req.user;
    const { connectionId, content, messageType = 'text' } = req.body;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    if (!connectionId || !content) {
      res.status(400).json({
        success: false,
        message: 'Connection ID and content are required',
      });
      return;
    }

    // Check if connection exists and user is a participant
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
      return;
    }

    // Check if user is a participant
    if (!connection.participants.some(p => p.toString() === currentUser._id.toString())) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this connection',
      });
      return;
    }

    // Check if connection is accepted
    if (connection.status !== 'accepted') {
      res.status(400).json({
        success: false,
        message: 'Cannot send messages to pending or declined connections',
      });
      return;
    }

    // Get receiver ID
    const receiverId = connection.participants.find(p => p.toString() !== currentUser._id.toString());
    if (!receiverId) {
      res.status(400).json({
        success: false,
        message: 'Invalid connection participants',
      });
      return;
    }

    // Create message
    const message = new Message({
      connectionId,
      senderId: currentUser._id,
      receiverId,
      content: content.trim(),
      messageType,
      status: 'sent',
    });

    await message.save();

    // Update connection's lastMessageAt
    connection.lastMessageAt = new Date();
    await connection.save();

    // Populate message with user details
    const populatedMessage = await message.populate([
      { path: 'senderId', select: 'name username email avatar' },
      { path: 'receiverId', select: 'name username email avatar' },
    ]);

    // Transform to match frontend expectations
    const messageObj = populatedMessage.toObject();
    const messageResponse = {
      ...messageObj,
      sender: messageObj.senderId,
      receiver: messageObj.receiverId,
    };

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: messageResponse },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Get messages for a connection
 * @route   GET /api/messages/:connectionId
 * @access  Private
 */
export const getMessages = async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const currentUser = req.user;
    const { connectionId } = req.params;
    const { page = 1, limit = 50, before } = req.query;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    // Check if connection exists and user is a participant
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
      return;
    }

    // Check if user is a participant
    if (!connection.participants.some(p => p.toString() === currentUser._id.toString())) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view messages in this connection',
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: Record<string, unknown> = { connectionId };

    // If 'before' is provided, get messages before that message
    if (before) {
      const beforeMessage = await Message.findById(before);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    // Get messages with pagination
    const messages = await Message.find(query)
      .populate([
        { path: 'senderId', select: 'name username email avatar' },
        { path: 'receiverId', select: 'name username email avatar' },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Message.countDocuments({ connectionId });

    // Transform messages to match frontend expectations
    const transformedMessages = messages.map(msg => {
      const msgObj = msg.toObject();
      return {
        ...msgObj,
        sender: msgObj.senderId,
        receiver: msgObj.receiverId,
      };
    }).reverse(); // Reverse to show oldest first

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages: transformedMessages,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/messages/:connectionId/read
 * @access  Private
 */
export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const currentUser = req.user;
    const { connectionId } = req.params;
    const { messageIds } = req.body;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    // Check if connection exists and user is a participant
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
      return;
    }

    // Check if user is a participant
    if (!connection.participants.some(p => p.toString() === currentUser._id.toString())) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to mark messages as read in this connection',
      });
      return;
    }

    // Build query
    const query: Record<string, unknown> = {
      connectionId,
      receiverId: currentUser._id,
      status: { $ne: 'read' },
    };

    // If specific message IDs provided, only mark those
    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      query._id = { $in: messageIds };
    }

    // Update messages
    const result = await Message.updateMany(query, {
      status: 'read',
      readAt: new Date(),
    });

    // Emit socket event to notify sender(s) that messages were read
    if (result.modifiedCount > 0 && messageIds && Array.isArray(messageIds)) {
      const { socketService } = await import('../app');
      
      // Broadcast to the connection room
      socketService.broadcast('message-read', {
        connectionId,
        messageIds,
        readBy: currentUser._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Messages marked as read successfully',
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
