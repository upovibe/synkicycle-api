import { Request, Response, NextFunction } from 'express';
import { Connection } from '@models/Connection';
import { User, IUser } from '@models/User';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * @desc    Send connection request
 * @route   POST /api/connections/send
 * @access  Private
 */
export const sendConnectionRequest = async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const currentUser = req.user;
    const { receiverId, message } = req.body;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    if (!receiverId) {
      res.status(400).json({
        success: false,
        message: 'Receiver ID is required',
      });
      return;
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      participants: { $all: [currentUser._id, receiverId] },
    });

    if (existingConnection) {
      res.status(400).json({
        success: false,
        message: 'Connection already exists',
        data: { connection: existingConnection },
      });
      return;
    }

    // Create new connection
    const connection = new Connection({
      participants: [currentUser._id, receiverId],
      initiator: currentUser._id,
      initialMessage: message,
      status: 'pending',
    });

    await connection.save();

    // Populate the connection with user details
    await connection.populate([
      { path: 'participants', select: 'name username email avatar' },
      { path: 'initiator', select: 'name username email avatar' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: { connection },
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send connection request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Respond to connection request
 * @route   PUT /api/connections/:connectionId/respond
 * @access  Private
 */
export const respondToConnectionRequest = async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const currentUser = req.user;
    const { connectionId } = req.params;
    const { status } = req.body;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    if (!status || !['accepted', 'declined'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status must be either "accepted" or "declined"',
      });
      return;
    }

    // Find the connection
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
      return;
    }

    // Check if current user is a participant
    if (!connection.participants.some(p => p.toString() === currentUser._id.toString())) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this connection',
      });
      return;
    }

    // Check if connection is still pending
    if (connection.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Connection request has already been responded to',
      });
      return;
    }

    // Update connection status
    connection.status = status;
    await connection.save();

    // Populate the connection with user details
    await connection.populate([
      { path: 'participants', select: 'name username email avatar' },
      { path: 'initiator', select: 'name username email avatar' },
    ]);

    res.status(200).json({
      success: true,
      message: `Connection request ${status} successfully`,
      data: { connection },
    });
  } catch (error) {
    console.error('Error responding to connection request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to connection request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Get user's connections
 * @route   GET /api/connections
 * @access  Private
 */
export const getUserConnections = async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const currentUser = req.user;
    const { status = 'all', page = 1, limit = 20 } = req.query;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: Record<string, unknown> = {
      participants: { $in: [currentUser._id] },
    };

    if (status !== 'all') {
      query.status = status;
    }

    // Get connections with pagination
    const connections = await Connection.find(query)
      .populate([
        { path: 'participants', select: 'name username email avatar verified' },
        { path: 'initiator', select: 'name username email avatar' },
      ])
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Connection.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Connections retrieved successfully',
      data: {
        connections,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error('Error getting user connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connections',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Get specific connection
 * @route   GET /api/connections/:connectionId
 * @access  Private
 */
export const getConnection = async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const currentUser = req.user;
    const { connectionId } = req.params;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    // Find the connection
    const connection = await Connection.findById(connectionId)
      .populate([
        { path: 'participants', select: 'name username email avatar verified' },
        { path: 'initiator', select: 'name username email avatar' },
      ]);

    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
      return;
    }

    // Check if current user is a participant
    if (!connection.participants.some(p => p.toString() === currentUser._id.toString())) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this connection',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Connection retrieved successfully',
      data: { connection },
    });
  } catch (error) {
    console.error('Error getting connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connection',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
