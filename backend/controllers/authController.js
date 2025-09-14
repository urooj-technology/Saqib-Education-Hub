const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UserSubscription, SubscriptionPlan } = require('../models');
const { Op } = require('sequelize');
const { createError } = require('../utils/errorHandler');
const logger = require('../config/logger');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, role = 'hr' } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(createError(400, 'User with this email already exists'));
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      status: 'pending' // Users start as pending until verified
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const userResponse = user.toJSON();

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    logger.error('Error in register:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to register user'));
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(createError(400, 'Please provide email and password'));
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return next(createError(401, 'Invalid credentials'));
    }

    // Check if account is active
    if (user.status !== 'active') {
      return next(createError(401, 'Account is not active. Please contact support.'));
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(createError(401, 'Invalid credentials'));
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Get user with subscription info
    const userWithSubscription = await getUserWithSubscription(user.id);

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithSubscription,
        token
      }
    });

  } catch (error) {
    logger.error('Error in login:', error);
    next(createError(500, 'Login failed'));
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await getUserWithSubscription(req.user.id);

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });

  } catch (error) {
    logger.error('Error in getMe:', error);
    next(createError(500, 'Failed to fetch user profile'));
  }
};

/**
 * Get user with subscription information
 */
const getUserWithSubscription = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return null;
    }

    // Get active subscription
    const activeSubscription = await UserSubscription.findOne({
      where: {
        userId,
        status: 'active',
        endDate: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['name', 'jobLimit', 'features']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Add subscription info to user object
    const userData = user.toJSON();
    userData.subscription = activeSubscription ? activeSubscription.plan.name.toLowerCase() : 'none';
    userData.subscriptionDetails = activeSubscription;

    return userData;
  } catch (error) {
    logger.error('Error getting user with subscription:', error);
    throw error;
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/update-me
 * @access  Private
 */
const updateMe = async (req, res, next) => {
  try {
    const { firstName, phone } = req.body;

    // Find user
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Update user
    await user.update({
      firstName,
      phone
    });

    // Remove password from response
    const userResponse = user.toJSON();

    logger.info(`User profile updated: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user: userResponse }
    });

  } catch (error) {
    logger.error('Error in updateMe:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to update profile'));
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return next(createError(400, 'Please provide current and new password'));
    }

    // Find user
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return next(createError(400, 'Current password is incorrect'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Error in changePassword:', error);
    next(createError(500, 'Failed to change password'));
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createError(400, 'Please provide email address'));
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        status: 'success',
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real application, you would send this token via email
    // For now, we'll just return it (remove this in production)
    logger.info(`Password reset requested for user: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent',
      data: {
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      }
    });

  } catch (error) {
    logger.error('Error in forgotPassword:', error);
    next(createError(500, 'Failed to process password reset request'));
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(createError(400, 'Please provide reset token and new password'));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return next(createError(400, 'Invalid or expired reset token'));
    }

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password reset for user: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });

  } catch (error) {
    logger.error('Error in resetPassword:', error);
    next(createError(500, 'Failed to reset password'));
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Error in logout:', error);
    next(createError(500, 'Logout failed'));
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  changePassword,
  logout
};
