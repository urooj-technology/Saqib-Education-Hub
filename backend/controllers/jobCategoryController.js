const { JobCategory } = require('../models');
const logger = require('../config/logger');
const { createError } = require('../middleware/errorHandler');

/**
 * @desc    Get all job categories
 * @route   GET /api/job-categories
 * @access  Public
 */
const getAllJobCategories = async (req, res, next) => {
  try {
    const categories = await JobCategory.findAll({
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: { categories }
    });
  } catch (error) {
    logger.error('Error in getAllJobCategories:', error);
    next(createError(500, 'Failed to fetch job categories'));
  }
};

/**
 * @desc    Get single job category by ID
 * @route   GET /api/job-categories/:id
 * @access  Public
 */
const getJobCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await JobCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Job category not found'));
    }

    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    logger.error('Error in getJobCategoryById:', error);
    next(createError(500, 'Failed to fetch job category'));
  }
};

/**
 * @desc    Create new job category
 * @route   POST /api/job-categories
 * @access  Private (Admin only)
 */
const createJobCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return next(createError(400, 'Category name is required'));
    }

    // Check if category with same name already exists
    const existingCategory = await JobCategory.findOne({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return next(createError(400, 'Category with this name already exists'));
    }

    const category = await JobCategory.create({
      name: name.trim()
    });

    logger.info(`Job category created: ${category.name} by ${req.user?.email || 'unknown'}`);

    res.status(201).json({
      status: 'success',
      message: 'Job category created successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Error in createJobCategory:', error);
    next(createError(500, 'Failed to create job category'));
  }
};

/**
 * @desc    Update job category
 * @route   PUT /api/job-categories/:id
 * @access  Private (Admin only)
 */
const updateJobCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await JobCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Job category not found'));
    }

    // If name is being updated, check for duplicates
    if (name && name.trim() !== category.name) {
      const existingCategory = await JobCategory.findOne({
        where: {
          name: name.trim(),
          id: { $ne: id }
        }
      });

      if (existingCategory) {
        return next(createError(400, 'Category with this name already exists'));
      }

      category.name = name.trim();
    }

    await category.save();

    logger.info(`Job category updated: ${category.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Job category updated successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Error in updateJobCategory:', error);
    next(createError(500, 'Failed to update job category'));
  }
};

/**
 * @desc    Delete job category
 * @route   DELETE /api/job-categories/:id
 * @access  Private (Admin only)
 */
const deleteJobCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await JobCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Job category not found'));
    }

    // Check if category has associated jobs
    const { Job } = require('../models');
    const jobCount = await Job.count({ where: { categoryId: id } });

    if (jobCount > 0) {
      return next(createError(400, `Cannot delete category. ${jobCount} job(s) are using this category. Please reassign them first.`));
    }

    await category.destroy();

    logger.info(`Job category deleted: ${category.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Job category deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteJobCategory:', error);
    next(createError(500, 'Failed to delete job category'));
  }
};

/**
 * @desc    Get jobs by category
 * @route   GET /api/job-categories/:id/jobs
 * @access  Public
 */
const getJobsByCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const category = await JobCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Job category not found'));
    }

    const { Job } = require('../models');
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: { categoryId: id, status: 'active' },
      include: [
        {
          model: require('../models').User,
          as: 'postedBy',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        },
        {
          model: require('../models').Company,
          as: 'company',
          attributes: ['id', 'name', 'logo', 'description']
        },
        {
          model: require('../models').Province,
          as: 'province',
          attributes: ['id', 'name']
        }
      ],
      limit: limitNum,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        category,
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error in getJobsByCategory:', error);
    next(createError(500, 'Failed to fetch jobs by category'));
  }
};

module.exports = {
  getAllJobCategories,
  getJobCategoryById,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
  getJobsByCategory
};
