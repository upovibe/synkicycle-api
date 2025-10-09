import { Request, Response } from 'express';
import { User } from '@models/User';
import aiService from '@services/ai.service';

/**
 * @desc    Get AI-powered user matches
 * @route   GET /api/match-users
 * @access  Private
 */
export const getMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    // Get all other users (excluding current user)
    const otherUsers = await User.find({
      _id: { $ne: currentUser._id },
      verified: true, // Only match with verified users
    }).select('-password -aiEmbedding'); // Exclude sensitive data

    if (otherUsers.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No other users found for matching',
        data: {
          matches: [],
          totalUsers: 0,
          matchesFound: 0,
        },
      });
      return;
    }

    // Generate AI matches
    const matches = await aiService.generateUserMatches(currentUser, otherUsers);

    res.status(200).json({
      success: true,
      message: 'Matches generated successfully',
      data: {
        matches,
        totalUsers: otherUsers.length,
        matchesFound: matches.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI matches',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Generate connection message for a specific user
 * @route   POST /api/match-users/:userId/message
 * @access  Private
 */
export const generateConnectionMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;
    const { userId } = req.params;
    const { connectionType = 'both' } = req.body;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    // Find target user
    const targetUser = await User.findById(userId).select('-password -aiEmbedding');
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Generate personalized message
    const message = await aiService.generateConnectionMessage(
      currentUser,
      targetUser,
      connectionType
    );

    res.status(200).json({
      success: true,
      message: 'Connection message generated successfully',
      data: {
        message,
        targetUser: {
          id: targetUser._id,
          username: targetUser.username,
          name: targetUser.name,
        },
      },
    });
  } catch (error) {
    console.error('Generate connection message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating connection message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Get user profile for matching (public info only)
 * @route   GET /api/match-users/profile/:userId
 * @access  Private
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -aiEmbedding -email');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          uuid: user.uuid,
          username: user.username,
          name: user.name,
          profession: user.profession,
          bio: user.bio,
          interests: user.interests,
          avatar: user.avatar,
          verified: user.verified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
