import { Request, Response } from 'express';
import { User } from '@models/User';
import { generateToken } from '@utils/jwt';
import { isValidEmail, isValidPassword, isValidName, isValidUsername } from '@utils/validation';

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, name, email, password } = req.body;

    // Validate input
    if (!username || !name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide username, name, email, and password',
      });
      return;
    }

    // Validate username
    if (!isValidUsername(username)) {
      res.status(400).json({
        success: false,
        message: 'Username must be 3-30 characters and contain only lowercase letters, numbers, and underscores',
      });
      return;
    }

    // Validate name
    if (!isValidName(name)) {
      res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 50 characters',
      });
      return;
    }

    // Validate email
    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
      return;
    }

    // Validate password
    if (!isValidPassword(password)) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
      return;
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      res.status(400).json({
        success: false,
        message: 'Username already taken',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Create user
    const user = await User.create({
      username,
      name,
      email,
      password,
      verified: true,
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          uuid: user.uuid,
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          profession: user.profession,
          interests: user.interests,
          verified: user.verified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    // Check if user exists (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          uuid: user.uuid,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          bio: user.bio,
          profession: user.profession,
          interests: user.interests,
          verified: user.verified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
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
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          bio: user.bio,
          profession: user.profession,
          interests: user.interests,
          verified: user.verified,
          lastActive: user.lastActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const { name, phone, bio, profession, interests, avatar } = req.body;

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (profession) user.profession = profession;
    if (interests) user.interests = interests;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          uuid: user.uuid,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          bio: user.bio,
          profession: user.profession,
          interests: user.interests,
          verified: user.verified,
          lastActive: user.lastActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
