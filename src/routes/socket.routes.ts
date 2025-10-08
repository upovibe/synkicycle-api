import { Router, Request, Response } from 'express';
import { protect } from '@middleware/auth.middleware';

const router = Router();

// Get connected users count
router.get('/connected-users', protect, (_req: Request, res: Response): void => {
  try {
    const socketService = global.socketService;
    
    if (!socketService) {
      res.status(503).json({
        success: false,
        message: 'Socket service not available',
      });
      return;
    }

    const connectedUsers = socketService.getConnectedUsers();
    
    res.status(200).json({
      success: true,
      data: {
        connectedUsers: connectedUsers.length,
        userIds: connectedUsers,
      },
    });
  } catch (error) {
    console.error('Get connected users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching connected users',
    });
  }
});

// Check if user is online
router.get('/user/:userId/online', protect, (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const socketService = global.socketService;
    
    if (!socketService) {
      res.status(503).json({
        success: false,
        message: 'Socket service not available',
      });
      return;
    }

    const isOnline = socketService.isUserOnline(userId!);
    
    res.status(200).json({
      success: true,
      data: {
        userId,
        isOnline,
      },
    });
  } catch (error) {
    console.error('Check user online error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user status',
    });
  }
});

// Send notification to user
router.post('/notify/:userId', protect, (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const { message, type = 'info', data } = req.body;
    const socketService = global.socketService;
    
    if (!socketService) {
      res.status(503).json({
        success: false,
        message: 'Socket service not available',
      });
      return;
    }

    const success = socketService.sendToUser(userId!, 'notification', {
      message,
      type,
      data,
      timestamp: new Date(),
    });

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Notification sent successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not online',
      });
    }
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification',
    });
  }
});

// Broadcast message to all connected users
router.post('/broadcast', protect, (req: Request, res: Response): void => {
  try {
    const { event, data } = req.body;
    const socketService = global.socketService;
    
    if (!socketService) {
      res.status(503).json({
        success: false,
        message: 'Socket service not available',
      });
      return;
    }

    socketService.broadcast(event, data);
    
    res.status(200).json({
      success: true,
      message: 'Broadcast sent successfully',
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Error broadcasting message',
    });
  }
});

export default router;
