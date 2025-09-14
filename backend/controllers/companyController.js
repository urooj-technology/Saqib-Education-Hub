const Company = require('../models/Company');
const Job = require('../models/Job');
const Province = require('../models/Province');
const { Op } = require('sequelize');
const logger = require('../config/logger');
const { createError } = require('../utils/errorHandler');
const { getFileUrl } = require('../middleware/upload');

/**
 * @desc    Get all companies with pagination and filtering
 * @route   GET /api/companies
 * @access  Public
 */
const getAllCompanies = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    // Build where clause for filtering
    const whereClause = {};
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sortBy field
    const allowedSortFields = ['name', 'createdAt'];
    if (!allowedSortFields.includes(sortBy)) {
      return next(createError(400, 'Invalid sort field'));
    }

    // Validate sortOrder
    const allowedSortOrders = ['ASC', 'DESC'];
    const actualSortOrder = sortOrder.toUpperCase();
    if (!allowedSortOrders.includes(actualSortOrder)) {
      return next(createError(400, 'Invalid sort order'));
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query with pagination
    const { count, rows: companies } = await Company.findAndCountAll({
      where: whereClause,
      order: [[sortBy, actualSortOrder]],
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
        companies,
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
        search: search || null
      };
    }

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error in getAllCompanies:', error);
    next(createError(500, 'Failed to fetch companies'));
  }
};

/**
 * @desc    Get single company by ID
 * @route   GET /api/companies/:id
 * @access  Public
 */
const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id);

    if (!company) {
      return next(createError(404, 'Company not found'));
    }

    res.status(200).json({
      status: 'success',
      data: { company }
    });

  } catch (error) {
    logger.error('Error in getCompanyById:', error);
    next(createError(500, 'Failed to fetch company'));
  }
};


/**
 * @desc    Create new company
 * @route   POST /api/companies
 * @access  Private (Admin)
 */
const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      description
    } = req.body;

    // Debug logging
    logger.info('Creating company with data:', {
      name,
      description,
      hasFile: !!req.file,
      filePath: req.file?.path,
      body: req.body
    });

    // Handle file upload
    let logo = null;
    if (req.file) {
      logo = getFileUrl(req.file.path, req);
    } else if (req.body.logo) {
      logo = req.body.logo; // Fallback to URL if provided
    }


    // Check if company with same name already exists
    const existingCompany = await Company.findOne({ where: { name } });
    if (existingCompany) {
      return next(createError(400, 'Company with this name already exists'));
    }

    const company = await Company.create({
      name,
      description,
      logo
    });

    logger.info(`New company created: ${company.name} by ${req.user?.email || 'anonymous'}`);

    res.status(201).json({
      status: 'success',
      message: 'Company created successfully',
      data: { company }
    });

  } catch (error) {
    logger.error('Error in createCompany:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      logger.error('Validation errors:', validationErrors);
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    logger.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    next(createError(500, `Failed to create company: ${error.message}`));
  }
};

/**
 * @desc    Update company
 * @route   PUT /api/companies/:id
 * @access  Private (Admin)
 */
const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle file upload
    if (req.file) {
      updateData.logo = getFileUrl(req.file.path, req);
    }

    // Find company
    const company = await Company.findByPk(id);
    if (!company) {
      return next(createError(404, 'Company not found'));
    }

    // Check if name is being changed and if it already exists
    if (updateData.name && updateData.name !== company.name) {
      const existingCompany = await Company.findOne({ 
        where: { name: updateData.name, id: { [Op.ne]: id } } 
      });
      if (existingCompany) {
        return next(createError(400, 'Company with this name already exists'));
      }
    }

    // Update company
    await company.update(updateData);

    logger.info(`Company updated: ${company.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Company updated successfully',
      data: { company }
    });

  } catch (error) {
    logger.error('Error in updateCompany:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to update company'));
  }
};

/**
 * @desc    Delete company
 * @route   DELETE /api/companies/:id
 * @access  Private (Admin)
 */
const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id);
    if (!company) {
      return next(createError(404, 'Company not found'));
    }

    // Check if company has jobs
    const jobsCount = await Job.count({
      where: { company_id: id }
    });

    if (jobsCount > 0) {
      return next(createError(400, 'Cannot delete company with existing jobs. Please delete jobs first.'));
    }

    // Delete company
    await company.destroy();

    logger.info(`Company deleted: ${company.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Company deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteCompany:', error);
    next(createError(500, 'Failed to delete company'));
  }
};

/**
 * @desc    Get company jobs
 * @route   GET /api/companies/:id/jobs
 * @access  Public
 */
const getCompanyJobs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12, status = 'active' } = req.query;

    const company = await Company.findByPk(id);
    if (!company) {
      return next(createError(404, 'Company not found'));
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: { 
        company_id: id,
        status: status
      },
      include: [
        {
          model: Province,
          as: 'province',
          attributes: ['id', 'name']
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
        company: {
          id: company.id,
          name: company.name,
          logo: company.logo
        },
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum
        }
      }
    });

  } catch (error) {
    logger.error('Error in getCompanyJobs:', error);
    next(createError(500, 'Failed to fetch company jobs'));
  }
};

/**
 * @desc    Search companies
 * @route   GET /api/companies/search
 * @access  Public
 */
const searchCompanies = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return next(createError(400, 'Search query is required'));
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: companies } = await Company.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } }
        ]
      },
      order: [['name', 'ASC']],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        companies,
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
    logger.error('Error in searchCompanies:', error);
    next(createError(500, 'Failed to search companies'));
  }
};

/**
 * @desc    Get company statistics
 * @route   GET /api/companies/stats
 * @access  Private (Admin)
 */
const getCompanyStats = async (req, res, next) => {
  try {
    const totalCompanies = await Company.count();

    const stats = {
      totalCompanies
    };

    res.status(200).json({
      status: 'success',
      data: { stats }
    });

  } catch (error) {
    logger.error('Error in getCompanyStats:', error);
    next(createError(500, 'Failed to fetch company statistics'));
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyJobs,
  searchCompanies,
  getCompanyStats
};
