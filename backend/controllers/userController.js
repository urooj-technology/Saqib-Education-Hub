const User = require('../models/User');
const { UserSubscription, SubscriptionPlan } = require('../models');
const { Op, sequelize } = require('sequelize');
const logger = require('../config/logger');
const { createError } = require('../utils/errorHandler');

/**
 * @desc    Get all users with pagination, filtering, and search
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause for filtering
    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sortBy field
    const allowedSortFields = [
      'firstName', 'email', 'role', 'status', 
      'createdAt', 'lastLoginAt'
    ];
    
    if (!allowedSortFields.includes(sortBy)) {
      return next(createError(400, 'Invalid sort field'));
    }

    // Validate sortOrder
    const allowedSortOrders = ['ASC', 'DESC'];
    if (!allowedSortOrders.includes(sortOrder.toUpperCase())) {
      return next(createError(400, 'Invalid sort order'));
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset,
      attributes: { exclude: ['password'] }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Build response
    const response = {
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? parseInt(page) + 1 : null,
          prevPage: hasPrevPage ? parseInt(page) - 1 : null
        }
      }
    };

    // Add filters applied
    if (Object.keys(whereClause).length > 0) {
      response.data.filters = {
        role: role || null,
        status: status || null,
        search: search || null
      };
    }

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error in getAllUsers:', error);
    next(createError(500, 'Failed to fetch users'));
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin/User own profile)
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await getUserWithSubscription(id);

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });

  } catch (error) {
    logger.error('Error in getUserById:', error);
    next(createError(500, 'Failed to fetch user'));
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
const createUser = async (req, res, next) => {
  try {
    const {
      firstName,
      email,
      password,
      phone,
      role,
      status
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(createError(400, 'User with this email already exists'));
    }

    // Create user
    const user = await User.create({
      firstName,
      email,
      password,
      phone,
      role: role || 'student',
      status: status || 'pending'
    });

    // Remove password from response
    const userResponse = user.toJSON();

    logger.info(`New user created: ${user.email} by admin`);

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: { user: userResponse }
    });

  } catch (error) {
    logger.error('Error in createUser:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to create user'));
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin/User own profile)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Handle subscription update separately
    let subscriptionUpdate = null;
    if (updateData.subscription) {
      subscriptionUpdate = updateData.subscription;
      delete updateData.subscription; // Remove from user update data
    }

    // Clean up update data - remove empty objects and invalid values
    const cleanedUpdateData = {};
    for (const [key, value] of Object.entries(updateData)) {
      // Skip empty objects, arrays, and undefined values
      if (value !== null && value !== undefined && value !== '' && 
          !(typeof value === 'object' && Object.keys(value).length === 0) &&
          !Array.isArray(value)) {
        cleanedUpdateData[key] = value;
      }
    }

    // Check if email is being updated and if it already exists
    if (cleanedUpdateData.email && cleanedUpdateData.email !== user.email) {
      const existingUser = await User.findByEmail(cleanedUpdateData.email);
      if (existingUser) {
        return next(createError(400, 'User with this email already exists'));
      }
    }

    // Update user
    await user.update(cleanedUpdateData);

    // Handle subscription update
    if (subscriptionUpdate) {
      await handleSubscriptionUpdate(user.id, subscriptionUpdate);
    }

    // Get updated user with subscription info
    const updatedUser = await getUserWithSubscription(user.id);

    logger.info(`User updated: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    logger.error('Error in updateUser:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to update user'));
  }
};

/**
 * Handle subscription update for a user
 */
const handleSubscriptionUpdate = async (userId, subscriptionType) => {
  try {
    // Map subscription types to plan IDs
    const planMapping = {
      'none': null,
      'basic': 1,
      'premium': 2,
      'enterprise': 3
    };

    const planId = planMapping[subscriptionType];

    // If subscription is 'none', deactivate all active subscriptions
    if (subscriptionType === 'none') {
      await UserSubscription.update(
        { status: 'cancelled' },
        {
          where: {
            userId,
            status: 'active'
          }
        }
      );
      return;
    }

    // If no plan ID found, throw error
    if (!planId) {
      throw new Error(`Invalid subscription type: ${subscriptionType}`);
    }

    // Get the subscription plan
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      throw new Error(`Subscription plan not found: ${planId}`);
    }

    // Deactivate existing active subscriptions
    await UserSubscription.update(
      { status: 'cancelled' },
      {
        where: {
          userId,
          status: 'active'
        }
      }
    );

    // Create new subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    await UserSubscription.create({
      userId,
      planId,
      startDate: new Date(),
      endDate,
      status: 'active',
      paymentStatus: 'completed',
      paymentMethod: 'admin_assigned',
      amount: plan.price,
      currency: plan.currency
    });

  } catch (error) {
    logger.error('Error handling subscription update:', error);
    throw error;
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
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Check if user is trying to delete themselves
    if (req.user.id === id) {
      return next(createError(400, 'Cannot delete your own account'));
    }

    // Check if user is admin
    if (user.role === 'admin') {
      return next(createError(400, 'Cannot delete admin users'));
    }

    await user.destroy();

    logger.info(`User deleted: ${user.email} by admin`);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteUser:', error);
    next(createError(500, 'Failed to delete user'));
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private (Admin only)
 */
const getUserStats = async (req, res, next) => {
  try {
    const stats = await User.findAll({
      attributes: [
        'role',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role', 'status']
    });

    // Process stats into a more readable format
    const processedStats = {
      totalUsers: 0,
      byRole: {},
      byStatus: {}
    };

    stats.forEach(stat => {
      const count = parseInt(stat.dataValues.count);
      processedStats.totalUsers += count;
      
      // Group by role
      if (!processedStats.byRole[stat.role]) {
        processedStats.byRole[stat.role] = 0;
      }
      processedStats.byRole[stat.role] += count;
      
      // Group by status
      if (!processedStats.byStatus[stat.status]) {
        processedStats.byStatus[stat.status] = 0;
      }
      processedStats.byStatus[stat.status] += count;
    });

    res.status(200).json({
      status: 'success',
      data: { stats: processedStats }
    });

  } catch (error) {
    logger.error('Error in getUserStats:', error);
    next(createError(500, 'Failed to fetch user statistics'));
  }
};

/**
 * @desc    Bulk update users
 * @route   PATCH /api/users/bulk
 * @access  Private (Admin only)
 */
const bulkUpdateUsers = async (req, res, next) => {
  try {
    const { userIds, updateData } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return next(createError(400, 'User IDs array is required'));
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return next(createError(400, 'Update data is required'));
    }

    // Update users
    const result = await User.update(updateData, {
      where: {
        id: { [Op.in]: userIds }
      }
    });

    logger.info(`Bulk update completed for ${result[0]} users`);

    res.status(200).json({
      status: 'success',
      message: `Successfully updated ${result[0]} users`,
      data: { updatedCount: result[0] }
    });

  } catch (error) {
    logger.error('Error in bulkUpdateUsers:', error);
    next(createError(500, 'Failed to bulk update users'));
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  bulkUpdateUsers
};
