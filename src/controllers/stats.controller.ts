import { Request, Response, NextFunction } from 'express';
import { Connection } from '../models/Connection';
import { Message } from '../models/Message';
import { User } from '../models/User';

/**
 * @desc    Get network statistics for the current user
 * @route   GET /api/stats/network
 * @access  Private
 */
export const getNetworkStats = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    // Get total connections (accepted only)
    const totalConnections = await Connection.countDocuments({
      participants: currentUser._id,
      status: 'accepted',
    });

    // Get pending connection requests (received)
    const pendingRequests = await Connection.countDocuments({
      participants: currentUser._id,
      status: 'pending',
      initiator: { $ne: currentUser._id },
    });

    // Get total messages sent by the user
    const messagesSent = await Message.countDocuments({
      senderId: currentUser._id,
    });

    // Get total messages received by the user
    const messagesReceived = await Message.countDocuments({
      receiverId: currentUser._id,
    });

    // Get total messages (sent + received)
    const totalMessages = messagesSent + messagesReceived;

    // Get unread messages count
    const unreadMessages = await Message.countDocuments({
      receiverId: currentUser._id,
      status: { $ne: 'read' },
    });

    // Calculate match score based on various factors
    const matchScore = await calculateMatchScore(currentUser._id.toString());

    // Get recent connections (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentConnections = await Connection.countDocuments({
      participants: currentUser._id,
      status: 'accepted',
      updatedAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
      success: true,
      message: 'Network statistics retrieved successfully',
      data: {
        connections: {
          total: totalConnections,
          pending: pendingRequests,
          recent: recentConnections,
        },
        messages: {
          sent: messagesSent,
          received: messagesReceived,
          total: totalMessages,
          unread: unreadMessages,
        },
        matchScore,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error('Error getting network stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get network statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Calculate match score based on user activity and profile completeness
 */
async function calculateMatchScore(userId: string): Promise<number> {
  try {
    const user = await User.findById(userId);
    if (!user) return 0;

    let score = 0;
    const maxScore = 100;

    // Profile completeness (40 points)
    if (user.name) score += 10;
    if (user.bio && user.bio.length > 20) score += 10;
    if (user.interests && user.interests.length > 0) score += 10;
    if (user.profession) score += 10;

    // Network activity (30 points)
    const connectionCount = await Connection.countDocuments({
      participants: userId,
      status: 'accepted',
    });
    
    if (connectionCount > 0) score += 10;
    if (connectionCount >= 5) score += 10;
    if (connectionCount >= 10) score += 10;

    // Messaging activity (30 points)
    const messageCount = await Message.countDocuments({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });
    
    if (messageCount > 0) score += 10;
    if (messageCount >= 10) score += 10;
    if (messageCount >= 50) score += 10;

    return Math.min(score, maxScore);
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0;
  }
}

/**
 * @desc    Get user activity timeline
 * @route   GET /api/stats/activity
 * @access  Private
 */
export const getUserActivity = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const { days = 7 } = req.query;
    const daysNum = parseInt(days as string);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Get messages activity per day
    const messagesActivity = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }],
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get new connections per day
    const connectionsActivity = await Connection.aggregate([
      {
        $match: {
          participants: currentUser._id,
          status: 'accepted',
          updatedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'User activity retrieved successfully',
      data: {
        messages: messagesActivity,
        connections: connectionsActivity,
        period: {
          start: startDate,
          end: new Date(),
          days: daysNum,
        },
      },
    });
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

