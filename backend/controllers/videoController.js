const Video = require('../models/Video');
const User = require('../models/User');
const { Op, sequelize, col, fn } = require('sequelize');
const logger = require('../config/logger');
const { createError } = require('../utils/errorHandler');

/**
 * @desc    Get all videos with pagination, filtering, and search
 * @route   GET /api/videos
 * @access  Public
 */
const getAllVideos = async (req, res, next) => {
  try {
          const {
        page = 1,
        limit = 12,
        search,
        category,
        authorId,
        status = 'published',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

    // Build where clause for filtering
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    // Only show active videos for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      whereClause.isActive = true;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (authorId) {
      whereClause.authorId = authorId;
    }
    

    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sortBy field
    const allowedSortFields = [
      'title', 'category', 'viewCount', 'createdAt'
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
    const { count, rows: videos } = await Video.findAndCountAll({
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

    // Build response
    const response = {
      status: 'success',
      data: {
        videos,
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
        authorId: authorId || null,
        status: status || null,
        search: search || null
      };
    }

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error in getAllVideos:', error);
    next(createError(500, 'Failed to fetch videos'));
  }
};

/**
 * @desc    Get featured videos
 * @route   GET /api/videos/featured
 * @access  Public
 */
const getFeaturedVideos = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit);

    const videos = await Video.findAll({
      where: {
        status: 'published',
        featured: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC'], ['viewCount', 'DESC']],
      limit: limitNum
    });

    res.status(200).json({
      status: 'success',
      data: { videos }
    });

  } catch (error) {
    logger.error('Error in getFeaturedVideos:', error);
    next(createError(500, 'Failed to fetch featured videos'));
  }
};

/**
 * @desc    Get single video by ID
 * @route   GET /api/videos/:id
 * @access  Public
 */
const getVideoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const video = await Video.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ]
    });

    if (!video) {
      return next(createError(404, 'Video not found'));
    }

    // Increment view count
    await video.incrementView();

    res.status(200).json({
      status: 'success',
      data: { video }
    });

  } catch (error) {
    logger.error('Error in getVideoById:', error);
    next(createError(500, 'Failed to fetch video'));
  }
};

/**
 * @desc    Create new video
 * @route   POST /api/videos
 * @access  Private (Admin/Teacher)
 */
const createVideo = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      status = 'draft',
      youtubeUrl
    } = req.body;

    // Extract YouTube ID if URL is provided
    let youtubeId = null;
    if (youtubeUrl) {
      const video = new Video();
      youtubeId = video.extractYouTubeId(youtubeUrl);
      
      if (!youtubeId) {
        return next(createError(400, 'Invalid YouTube URL'));
      }
    }

    // Create video
    const video = await Video.create({
      title,
      description,
      authorId: req.user.id,
      category,
      status,
      youtubeUrl: youtubeUrl || null,
      youtubeId: youtubeId || null
    });

    // Return minimal response immediately
    const videoData = {
      id: video.id,
      title: video.title,
      description: video.description,
      category: video.category,
      status: video.status,
      youtubeUrl: video.youtubeUrl,
      youtubeId: video.youtubeId,
      authorId: video.authorId,
      createdAt: video.createdAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Video created successfully',
      data: { video: videoData }
    });

  } catch (error) {
    logger.error('Error in createVideo:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to create video'));
  }
};

/**
 * @desc    Update video
 * @route   PUT /api/videos/:id
 * @access  Private (Admin/Teacher - video owner)
 */
const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find video
    const video = await Video.findByPk(id);
    if (!video) {
      return next(createError(404, 'Video not found'));
    }

    // Check if user is author or admin
    if (req.user.role !== 'admin' && video.authorId !== req.user.id) {
      return next(createError(403, 'Not authorized to update this video'));
    }

    // Process uploaded files
    if (req.files) {
      if (req.files.video_file && req.files.video_file[0]) {
        updateData.video_file = `/uploads/videos/${req.files.video_file[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        updateData.thumbnail = `/uploads/images/${req.files.thumbnail[0].filename}`;
      }
    }

    // Extract YouTube ID if URL is provided in update
    let youtubeId = video.youtubeId;
    if (updateData.youtubeUrl) {
      const tempVideo = new Video();
      youtubeId = tempVideo.extractYouTubeId(updateData.youtubeUrl);
      
      if (!youtubeId) {
        return next(createError(400, 'Invalid YouTube URL'));
      }
    }

    // Update video
    await video.update({
      ...updateData,
      youtubeId: youtubeId || video.youtubeId
    });

    // Include author information in response
    const updatedVideo = await Video.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ]
    });

    logger.info(`Video updated: ${video.title} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Video updated successfully',
      data: { video: updatedVideo }
    });

  } catch (error) {
    logger.error('Error in updateVideo:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to update video'));
  }
};

/**
 * @desc    Delete video
 * @route   DELETE /api/videos/:id
 * @access  Private (Admin/Teacher - video owner)
 */
const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const video = await Video.findByPk(id);
    if (!video) {
      return next(createError(404, 'Video not found'));
    }

    // Check if user is author or admin
    if (req.user.role !== 'admin' && video.authorId !== req.user.id) {
      return next(createError(403, 'Not authorized to delete this video'));
    }

    await video.destroy();

    logger.info(`Video deleted: ${video.title} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Video deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteVideo:', error);
    next(createError(500, 'Failed to delete video'));
  }
};

/**
 * @desc    Toggle video active status
 * @route   PATCH /api/videos/:id/toggle-active
 * @access  Private (Admin only)
 */
const toggleVideoActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const video = await Video.findByPk(id);
    if (!video) {
      return next(createError(404, 'Video not found'));
    }

    // Toggle the isActive status
    await video.update({ isActive: !video.isActive });

    logger.info(`Video active status toggled: ${video.title} (${video.isActive ? 'active' : 'inactive'}) by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: `Video ${video.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { 
        video: {
          id: video.id,
          title: video.title,
          isActive: video.isActive
        }
      }
    });

  } catch (error) {
    logger.error('Error in toggleVideoActive:', error);
    next(createError(500, 'Failed to toggle video active status'));
  }
};

/**
 * @desc    Get videos by category
 * @route   GET /api/videos/category/:category
 * @access  Public
 */
const getVideosByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: videos } = await Video.findAndCountAll({
      where: { 
        category, 
        status: 'published' 
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
        videos,
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
    logger.error('Error in getVideosByCategory:', error);
    next(createError(500, 'Failed to fetch videos by category'));
  }
};

/**
 * @desc    Search videos
 * @route   GET /api/videos/search
 * @access  Public
 */
const searchVideos = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return next(createError(400, 'Search query is required'));
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: videos } = await Video.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } }
        ],
        status: 'published'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC'], ['viewCount', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        videos,
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
    logger.error('Error in searchVideos:', error);
    next(createError(500, 'Failed to search videos'));
  }
};

/**
 * @desc    Get video statistics
 * @route   GET /api/videos/stats
 * @access  Private (Admin)
 */
const getVideoStats = async (req, res, next) => {
  try {
    const stats = await Video.findAll({
      attributes: [
        'category',
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('viewCount')), 'totalViews']
      ],
      group: ['category', 'status']
    });

    res.status(200).json({
      status: 'success',
      data: { stats }
    });

  } catch (error) {
    logger.error('Error in getVideoStats:', error);
    next(createError(500, 'Failed to fetch video statistics'));
  }
};

module.exports = {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleVideoActive,
  getFeaturedVideos,
  getVideosByCategory,
  searchVideos,
  getVideoStats
};
