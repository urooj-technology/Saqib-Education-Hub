const { Scholarship, User } = require('../models');
const { Op, sequelize, col, fn } = require('sequelize');
const logger = require('../config/logger');
const { createError } = require('../middleware/errorHandler');

/**
 * @desc    Get all scholarships with pagination, filtering, and search
 * @route   GET /api/scholarships
 * @access  Public
 */
const getAllScholarships = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      type,
      level,
      country,
      status,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause for filtering
    const whereClause = {};
    
    if (status && status !== 'All') {
      whereClause.status = status;
    }
    
    // Only show active scholarships for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      whereClause.isActive = true;
      // For non-admin users, default to active status if not specified
      if (!status) {
        whereClause.status = 'active';
      }
    } else {
      // For admin users, don't filter by isActive - show all scholarships
      // This allows admins to see all scholarships regardless of active status
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (level) {
      whereClause.level = level;
    }
    
    if (country) {
      whereClause.country = { [Op.like]: `%${country}%` };
    }
    
    // Amount range filtering
    if (minAmount || maxAmount) {
      whereClause.amount = {};
      if (minAmount) whereClause.amount[Op.gte] = parseFloat(minAmount);
      if (maxAmount) whereClause.amount[Op.lte] = parseFloat(maxAmount);
    }
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { organization: { [Op.like]: `%${search}%` } },
        { requirements: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sortBy field
    const allowedSortFields = [
      'title', 'organization', 'category', 'type', 'level', 'country', 
      'amount', 'deadline', 'createdAt'
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

    // Execute query with pagination and include author information
    const { count, rows: scholarships } = await Scholarship.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Map scholarship data to include deadline field and ensure timestamps
    const mappedScholarships = scholarships.map(scholarship => ({
      ...scholarship.toJSON(),
      deadline: scholarship.applicationDeadline,
      // Ensure timestamps are included
      created_at: scholarship.createdAt,
      updated_at: scholarship.updatedAt
    }));

    // Build response
    const response = {
      status: 'success',
      data: {
        scholarships: mappedScholarships,
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
        category: category || null,
        type: type || null,
        level: level || null,
        country: country || null,
        status: status || null,
        minAmount: minAmount || null,
        maxAmount: maxAmount || null,
        search: search || null
      };
    }

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error in getAllScholarships:', error);
    next(createError(500, 'Failed to fetch scholarships'));
  }
};

/**
 * @desc    Get single scholarship by ID
 * @route   GET /api/scholarships/:id
 * @access  Public
 */
const getScholarshipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ]
    });

    if (!scholarship) {
      return next(createError(404, 'Scholarship not found'));
    }

    // Map scholarship data to include deadline field
    const mappedScholarship = {
      ...scholarship.toJSON(),
      deadline: scholarship.applicationDeadline,
      // Ensure timestamps are included
      created_at: scholarship.createdAt,
      updated_at: scholarship.updatedAt
    };

    res.status(200).json({
      status: 'success',
      data: { scholarship: mappedScholarship }
    });

  } catch (error) {
    logger.error('Error in getScholarshipById:', error);
    next(createError(500, 'Failed to fetch scholarship'));
  }
};

/**
 * @desc    Get featured scholarships
 * @route   GET /api/scholarships/featured
 * @access  Public
 */
const getFeaturedScholarships = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit);

    const scholarships = await Scholarship.findAll({
      where: {
        status: 'active',
        featured: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum
    });

    res.status(200).json({
      status: 'success',
      data: { scholarships }
    });

  } catch (error) {
    logger.error('Error in getFeaturedScholarships:', error);
    next(createError(500, 'Failed to fetch featured scholarships'));
  }
};

/**
 * @desc    Create new scholarship
 * @route   POST /api/scholarships
 * @access  Private (Admin/Moderator)
 */
const createScholarship = async (req, res, next) => {
  try {
    // Debug: Log entire request body first
    console.log('==== CREATE SCHOLARSHIP DEBUG ====');
    console.log('Full req.body:', JSON.stringify(req.body, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
    
    const {
      title,
      description,
      organization,
      category,
      type = 'full_tuition',
      level = 'undergraduate',
      country,
      amount,
      currency = 'USD',
      requirements,
      benefits,
      status = 'active',
      deadline
    } = req.body;

    // Debug logging to see what values are received
    console.log('Extracted scholarship data:', {
      title, description, organization, category, type, level, country, 
      amount, currency, requirements, benefits, status, deadline
    });

    // Logo field removed from model - no longer handling logo uploads

    // Parse benefits field if it's a string
    let parsedBenefits = [];
    if (benefits) {
      if (typeof benefits === 'string') {
        try {
          parsedBenefits = JSON.parse(benefits);
        } catch (e) {
          parsedBenefits = [benefits];
        }
      } else if (Array.isArray(benefits)) {
        parsedBenefits = benefits;
      }
    }

    // Create scholarship with default values for empty fields
    const scholarshipData = {
      title: title || 'Untitled Scholarship',
      description: description || 'No description provided',
      organization: organization || 'Unknown Organization',
      authorId: req.user.id,
      category: category || 'other',
      type: type || 'full_tuition',
      level: level || '',
      country: country || 'Unknown',
      amount: (amount !== '' && amount !== null && amount !== undefined) ? parseFloat(amount) : 0,
      currency: currency || 'USD',
      requirements: (requirements !== '' && requirements !== null && requirements !== undefined) ? requirements : 'No requirements specified',
      benefits: parsedBenefits,
      status: status || 'active',
      applicationDeadline: (deadline !== '' && deadline !== null && deadline !== undefined) ? new Date(deadline) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };

    // Debug logging to see what values are being saved
    console.log('Saving scholarship data:', scholarshipData);

    const scholarship = await Scholarship.create(scholarshipData);

    // Return complete response with all fields
    const responseData = {
      id: scholarship.id,
      title: scholarship.title,
      description: scholarship.description,
      organization: scholarship.organization,
      category: scholarship.category,
      type: scholarship.type,
      level: scholarship.level,
      country: scholarship.country,
      amount: scholarship.amount,
      currency: scholarship.currency,
      requirements: scholarship.requirements,
      benefits: scholarship.benefits,
      status: scholarship.status,
      deadline: scholarship.applicationDeadline,
      applicationDeadline: scholarship.applicationDeadline,
      isActive: scholarship.isActive,
      featured: scholarship.featured,
      authorId: scholarship.authorId,
      createdAt: scholarship.createdAt,
      updatedAt: scholarship.updatedAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Scholarship created successfully',
      data: { scholarship: responseData }
    });

  } catch (error) {
    logger.error('Error in createScholarship:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to create scholarship'));
  }
};

/**
 * @desc    Update scholarship
 * @route   PUT /api/scholarships/:id
 * @access  Private (Admin/Moderator - scholarship owner)
 */
const updateScholarship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find scholarship
    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) {
      return next(createError(404, 'Scholarship not found'));
    }

    // Check if user is author or admin
    if (req.user.role !== 'admin' && scholarship.authorId !== req.user.id) {
      return next(createError(403, 'Not authorized to update this scholarship'));
    }

    // Parse JSON fields if they exist
    if (updateData.benefits) {
      if (typeof updateData.benefits === 'string') {
        try {
          updateData.benefits = JSON.parse(updateData.benefits);
        } catch (e) {
          updateData.benefits = [updateData.benefits];
        }
      } else if (!Array.isArray(updateData.benefits)) {
        updateData.benefits = [];
      }
    }

    // Map deadline field to applicationDeadline
    if (updateData.deadline) {
      updateData.applicationDeadline = new Date(updateData.deadline);
      delete updateData.deadline; // Remove the original deadline field
    }

    // Provide default values for empty fields
    if (updateData.amount === '' || updateData.amount === null || updateData.amount === undefined) {
      updateData.amount = 0;
    }
    if (updateData.requirements === '' || updateData.requirements === null || updateData.requirements === undefined) {
      updateData.requirements = 'No requirements specified';
    }
    if (updateData.applicationDeadline === null || updateData.applicationDeadline === undefined) {
      updateData.applicationDeadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default to 1 year from now
    }

    // Update scholarship
    await scholarship.update(updateData);

    // Include author information in response
    const updatedScholarship = await Scholarship.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ]
    });

    logger.info(`Scholarship updated: ${scholarship.title} by ${req.user.email}`);

    // Map scholarship data to include deadline field and ensure timestamps
    const mappedScholarship = {
      ...updatedScholarship.toJSON(),
      deadline: updatedScholarship.applicationDeadline,
      // Ensure timestamps are included
      created_at: updatedScholarship.createdAt,
      updated_at: updatedScholarship.updatedAt
    };

    res.status(200).json({
      status: 'success',
      message: 'Scholarship updated successfully',
      data: { scholarship: mappedScholarship }
    });

  } catch (error) {
    logger.error('Error in updateScholarship:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to update scholarship'));
  }
};

/**
 * @desc    Delete scholarship
 * @route   DELETE /api/scholarships/:id
 * @access  Private (Admin/Moderator - scholarship owner)
 */
const deleteScholarship = async (req, res, next) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) {
      return next(createError(404, 'Scholarship not found'));
    }

    // Check if user is author or admin
    if (req.user.role !== 'admin' && scholarship.authorId !== req.user.id) {
      return next(createError(403, 'Not authorized to delete this scholarship'));
    }

    await scholarship.destroy();

    logger.info(`Scholarship deleted: ${scholarship.title} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Scholarship deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteScholarship:', error);
    next(createError(500, 'Failed to delete scholarship'));
  }
};

/**
 * @desc    Toggle scholarship active status
 * @route   PATCH /api/scholarships/:id/toggle-active
 * @access  Private (Admin only)
 */
const toggleScholarshipActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) {
      return next(createError(404, 'Scholarship not found'));
    }

    // Toggle the isActive status
    await scholarship.update({ isActive: !scholarship.isActive });

    logger.info(`Scholarship active status toggled: ${scholarship.title} (${scholarship.isActive ? 'active' : 'inactive'}) by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: `Scholarship ${scholarship.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { 
        scholarship: {
          id: scholarship.id,
          title: scholarship.title,
          isActive: scholarship.isActive
        }
      }
    });

  } catch (error) {
    logger.error('Error in toggleScholarshipActive:', error);
    next(createError(500, 'Failed to toggle scholarship active status'));
  }
};

/**
 * @desc    Get scholarships by category
 * @route   GET /api/scholarships/category/:category
 * @access  Public
 */
const getScholarshipsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: scholarships } = await Scholarship.findAndCountAll({
      where: { 
        category, 
        status: 'active' 
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        scholarships,
        category,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum
        }
      }
    });

  } catch (error) {
    logger.error('Error in getScholarshipsByCategory:', error);
    next(createError(500, 'Failed to fetch scholarships by category'));
  }
};

/**
 * @desc    Search scholarships
 * @route   GET /api/scholarships/search
 * @access  Public
 */
const searchScholarships = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return next(createError(400, 'Search query is required'));
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: scholarships } = await Scholarship.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { organization: { [Op.like]: `%${q}%` } },
          { requirements: { [Op.like]: `%${q}%` } }
        ],
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        scholarships,
        searchQuery: q,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum
        }
      }
    });

  } catch (error) {
    logger.error('Error in searchScholarships:', error);
    next(createError(500, 'Failed to search scholarships'));
  }
};

/**
 * @desc    Get scholarship statistics
 * @route   GET /api/scholarships/stats
 * @access  Private (Admin)
 */
const getScholarshipStats = async (req, res, next) => {
  try {
    const stats = await Scholarship.findAll({
      attributes: [
        'category',
        'type',
        'level',
        'country',
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('amount')), 'avgAmount']
      ],
      group: ['category', 'type', 'level', 'country', 'status']
    });

    res.status(200).json({
      status: 'success',
      data: { stats }
    });

  } catch (error) {
    logger.error('Error in getScholarshipStats:', error);
    next(createError(500, 'Failed to fetch scholarship statistics'));
  }
};

// incrementScholarshipView function removed - viewCount field no longer exists

module.exports = {
  getAllScholarships,
  getScholarshipById,
  getFeaturedScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  toggleScholarshipActive,
  getScholarshipsByCategory,
  searchScholarships,
  getScholarshipStats
};
