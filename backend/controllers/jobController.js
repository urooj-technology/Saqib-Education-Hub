const Job = require('../models/Job');
const User = require('../models/User');
const Province = require('../models/Province');
const Company = require('../models/Company');
const { Op, sequelize, col, fn } = require('sequelize');
const logger = require('../config/logger');
const { createError } = require('../middleware/errorHandler');
const cacheService = require('../config/cache');

/**
 * Helper: Get province map with caching
 * Caches provinces for 1 hour to avoid repeated database queries
 * @returns {Promise<Map>} - Map of provinceId => provinceName
 */
const getProvinceMap = async () => {
  return cacheService.getOrSet(
    'province_map',
    async () => {
      logger.info('Fetching provinces from database (cache miss)');
      const allProvinces = await Province.findAll({ 
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
      });
      return new Map(allProvinces.map(p => [p.id, p.name]));
    },
    3600 // Cache for 1 hour
  );
};

/**
 * @desc    Get all jobs with pagination, filtering, and search
 * @route   GET /api/jobs
 * @access  Public
 */
const getAllJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      type,
      status,
      minSalary,
      maxSalary,
      experience,
      province,
      gender,
      expiring,
      company,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;


    // First, check and update expired jobs automatically
    await Job.update(
      { status: 'inactive' },
      {
        where: {
          closing_date: {
            [Op.lt]: new Date()
          },
          status: 'active'
        }
      }
    );

    // Build where clause for filtering
    const whereClause = {};
    
    // For public access, only show active jobs by default
    // Admin can override this by passing status parameter
    if (status) {
      if (status === 'all') {
        // Don't add status filter to show all jobs
        // whereClause.status is not set, so all statuses will be included
      } else {
        whereClause.status = status;
      }
    } else {
      // Default to active jobs only for public access
      whereClause.status = 'active';
    }
    
    if (category) {
      // If category is a string (category name), find the category ID
      if (isNaN(category)) {
        const { JobCategory } = require('../models');
        const categoryRecord = await JobCategory.findOne({ where: { name: category } });
        if (categoryRecord) {
          whereClause.categoryId = categoryRecord.id;
        }
      } else {
        // If category is a number (category ID), use it directly
        whereClause.categoryId = parseInt(category);
      }
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (experience) {
      whereClause.experience = experience;
    }
    
    if (gender) {
      // For gender filtering, we need to handle 'any' as well as specific genders
      if (gender === 'female') {
        whereClause.gender = { [Op.in]: ['female', 'any'] };
      } else if (gender === 'male') {
        whereClause.gender = { [Op.in]: ['male', 'any'] };
      } else {
        whereClause.gender = gender;
      }
    }
    
    if (company) {
      whereClause.company_id = parseInt(company);
    }
    
    // Handle expiring jobs filter
    if (expiring === 'today') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      whereClause.closing_date = {
        [Op.gte]: startOfDay,
        [Op.lt]: endOfDay
      };
    }
    
    // Build OR conditions array for complex queries
    const orConditions = [];
    
    // Province filtering
    if (province) {
      try {
        // First, find the province by name to get its ID
        const provinceRecord = await Province.findOne({ 
          where: { name: province },
          attributes: ['id'] 
        });
        
        if (provinceRecord) {
          // Add province filtering conditions
          orConditions.push(
            { province_id: provinceRecord.id },
            { 
              province_ids: {
                [Op.like]: `%${provinceRecord.id}%`
              }
            }
          );
        }
      } catch (provinceError) {
        logger.error('Error in province filtering:', provinceError);
        // Continue without province filtering if there's an error
      }
    }
    
    // Search functionality
    if (search) {
      orConditions.push(
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      );
    }
    
    // Add OR conditions to whereClause if any exist
    if (orConditions.length > 0) {
      whereClause[Op.or] = orConditions;
    }
    
    // Salary range filtering
    if (minSalary || maxSalary) {
      whereClause.salary = {};
      if (minSalary) whereClause.salary[Op.gte] = parseFloat(minSalary);
      if (maxSalary) whereClause.salary[Op.lte] = parseFloat(maxSalary);
    }


    // Map custom sort options to database fields
    const sortFieldMapping = {
      'newest': 'createdAt',
      'oldest': 'createdAt',
      'salary-high': 'salary',
      'salary-low': 'salary',
      'title': 'title',
      'category': 'category',
      'type': 'type',
      'experience': 'experience',
      'createdAt': 'createdAt',
      'deadline': 'deadline',
      'closing_date': 'deadline'
    };
    
    // Get the actual database field name
    const actualSortField = sortFieldMapping[sortBy] || sortBy;
    
    // Validate sortBy field
    const allowedSortFields = [
      'title', 'category', 'type', 'salary', 
      'experience', 'createdAt', 'deadline', 'status',
      'applicationCount'
    ];
    
    if (!allowedSortFields.includes(actualSortField)) {
      return next(createError(400, 'Invalid sort field'));
    }

    // Determine sort order based on sortBy option
    let actualSortOrder = sortOrder.toUpperCase();
    
    // Override sort order for specific sort options
    if (sortBy === 'newest' || sortBy === 'salary-high') {
      actualSortOrder = 'DESC';
    } else if (sortBy === 'oldest' || sortBy === 'salary-low') {
      actualSortOrder = 'ASC';
    }
    
    // Validate sortOrder
    const allowedSortOrders = ['ASC', 'DESC'];
    if (!allowedSortOrders.includes(actualSortOrder)) {
      return next(createError(400, 'Invalid sort order'));
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query with pagination and include postedBy and province information
    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'postedBy',
          attributes: ['id', 'firstName', 'email', 'avatar']
        },
        {
          model: Province,
          as: 'province',
          attributes: ['id', 'name']
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logo', 'description']
        },
        {
          model: require('../models').JobCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [[actualSortField, actualSortOrder]],
      limit: limitNum,
      offset: offset
    });

    // PERFORMANCE: Use cached province map instead of fetching from DB every time
    const provinceMap = await getProvinceMap();
    
    // Add province names to each job's province_ids
    jobs.forEach(job => {
      if (job.province_ids && Array.isArray(job.province_ids)) {
        job.dataValues.province_names = job.province_ids.map(id => provinceMap.get(id)).filter(Boolean);
      }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Build response
    const response = {
      status: 'success',
      data: {
        jobs,
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
        status: status || null,
        experience: experience || null,
        gender: gender || null,
        expiring: expiring || null,
        company: company || null,
        minSalary: minSalary || null,
        maxSalary: maxSalary || null,
        search: search || null
      };
    }

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error in getAllJobs:', error);
    next(createError(500, 'Failed to fetch jobs'));
  }
};

/**
 * @desc    Get featured jobs
 * @route   GET /api/jobs/featured
 * @access  Public
 */
const getFeaturedJobs = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit);

    // First, check and update expired jobs automatically
    await Job.update(
      { status: 'inactive' },
      {
        where: {
          closing_date: {
            [Op.lt]: new Date()
          },
          status: 'active'
        }
      }
    );

    const jobs = await Job.findAll({
      where: {
        status: 'active',
        featured: true
      },
      include: [
        {
          model: User,
          as: 'postedBy',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC'], ['viewCount', 'DESC']],
      limit: limitNum
    });

    res.status(200).json({
      status: 'success',
      data: { jobs }
    });

  } catch (error) {
    logger.error('Error in getFeaturedJobs:', error);
    next(createError(500, 'Failed to fetch featured jobs'));
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [
        {
          model: User,
          as: 'postedBy',
          attributes: ['id', 'firstName', 'email', 'avatar']
        },
        {
          model: Province,
          as: 'province',
          attributes: ['id', 'name']
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logo', 'description']
        }
      ]
    });

    if (!job) {
      return next(createError(404, 'Job not found'));
    }

    // PERFORMANCE: Use cached province map
    const provinceMap = await getProvinceMap();
    
    if (job.province_ids && Array.isArray(job.province_ids)) {
      job.dataValues.province_names = job.province_ids.map(id => provinceMap.get(id)).filter(Boolean);
    }

    // Increment view count
    await job.incrementView();

    res.status(200).json({
      status: 'success',
      data: { job }
    });

  } catch (error) {
    logger.error('Error in getJobById:', error);
    next(createError(500, 'Failed to fetch job'));
  }
};

/**
 * @desc    Create new job
 * @route   POST /api/jobs
 * @access  Private (Admin/HR)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      company_id,
      category,
      categoryId,
      type,
      province_id,
      province_ids,
      remote = false,
      salary_range,
      currency = 'USD',
      experience,
      duties_and_responsibilities,
      job_requirements,
      status = 'active',
      deadline,
      featured = false,
      education,
      gender = 'any',
      contract_type,
      contract_duration,
      contract_extensible = false,
      probation_period,
      number_of_vacancies = 1,
      years_of_experience,
      submission_guidelines,
      closing_date
    } = req.body;

    // Check if user can post a job based on subscription
    const { UserSubscription, SubscriptionPlan } = require('../models');
    
    const activeSubscription = await UserSubscription.findOne({
      where: {
        userId: req.user.id,
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
      ]
    });

    if (!activeSubscription) {
      // Allow admin users to post jobs without subscription for development
      if (req.user.role === 'admin') {
        console.log('Admin user bypassing subscription check for job creation');
      } else {
        return next(createError(403, 'You need an active subscription to post jobs. Please choose a plan first.'));
      }
    }

    if (activeSubscription && !activeSubscription.canPostJob()) {
      return next(createError(403, `You have reached your job posting limit for the ${activeSubscription.plan.name}. Please upgrade your plan to post more jobs.`));
    }

    // Verify company exists
    const company = await Company.findByPk(company_id);
    if (!company) {
      return next(createError(400, 'Invalid company selected'));
    }

    // Handle category - support both categoryId (number) and category (string)
    let finalCategoryId;
    if (categoryId) {
      finalCategoryId = parseInt(categoryId);
    } else if (category) {
      // If category is provided as string, find the category ID
      const { JobCategory } = require('../models');
      const categoryRecord = await JobCategory.findOne({ where: { name: category } });
      if (!categoryRecord) {
        return next(createError(400, 'Invalid category selected'));
      }
      finalCategoryId = categoryRecord.id;
    } else {
      return next(createError(400, 'Category is required'));
    }

    // Create job
    console.log('Creating job with data:', {
      title,
      description,
      company_id: parseInt(company_id),
      author_id: req.user.id,
      category,
      type,
      province_id: parseInt(province_id),
      remote,
      salary_range: salary_range || null,
      currency,
      experience,
      duties_and_responsibilities: duties_and_responsibilities || '',
      job_requirements: job_requirements || '',
      status,
      deadline: deadline ? new Date(deadline) : null,
      featured,
      education,
      gender,
      contract_type,
      contract_duration,
      contract_extensible,
      probation_period,
      number_of_vacancies: parseInt(number_of_vacancies) || 1,
      years_of_experience: years_of_experience || null,
      submission_guidelines: submission_guidelines || null,
      closing_date: closing_date ? new Date(closing_date) : null
    });

    // Handle province selection - prioritize multiple provinces if provided
    let finalProvinceId = null;
    let finalProvinceIds = [];
    
    if (province_ids && Array.isArray(province_ids) && province_ids.length > 0) {
      // Multiple provinces selected
      finalProvinceIds = province_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
      // Set the first province as the primary one
      finalProvinceId = finalProvinceIds[0] || null;
    } else if (province_id) {
      // Single province selected
      finalProvinceId = parseInt(province_id);
      finalProvinceIds = [finalProvinceId];
    }

    const job = await Job.create({
      title,
      description,
      company_id: parseInt(company_id),
      author_id: req.user.id,
      categoryId: finalCategoryId,
      type,
      province_id: finalProvinceId,
      province_ids: finalProvinceIds,
      remote,
      salary_range: salary_range || null,
      currency,
      experience,
      duties_and_responsibilities: duties_and_responsibilities || '',
      job_requirements: job_requirements || '',
      status,
      deadline: deadline ? new Date(deadline) : null,
      featured,
      education,
      gender,
      contract_type,
      contract_duration,
      contract_extensible,
      probation_period,
      number_of_vacancies: parseInt(number_of_vacancies) || 1,
      years_of_experience: years_of_experience || null,
      submission_guidelines: submission_guidelines || null,
      closing_date: closing_date ? new Date(closing_date) : null
    });

    // Increment job count in subscription (async, non-blocking)
    if (activeSubscription) {
      activeSubscription.incrementJobCount().catch(err => {
        logger.warn('Failed to increment job count:', err.message);
      });
    }

    // Return minimal response immediately
    const jobData = {
      id: job.id,
      title: job.title,
      status: job.status,
      categoryId: job.categoryId,
      type: job.type,
      company_id: job.company_id,
      province_id: job.province_id,
      remote: job.remote,
      salary_range: job.salary_range,
      currency: job.currency,
      experience: job.experience,
      deadline: job.deadline,
      featured: job.featured,
      createdAt: job.createdAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Job created successfully',
      data: { job: jobData }
    });

  } catch (error) {
    logger.error('Error in createJob:', error);
    console.error('Detailed error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, `Failed to create job: ${error.message}`));
  }
};

/**
 * @desc    Update job
 * @route   PUT /api/jobs/:id
 * @access  Private (Admin/HR - job owner)
 */
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find job
    const job = await Job.findByPk(id);
    if (!job) {
      return next(createError(404, 'Job not found'));
    }

    // Check if user is job poster or admin
    if (req.user.role !== 'admin' && job.author_id !== req.user.id) {
      return next(createError(403, 'Not authorized to update this job'));
    }

    // Handle duties_and_responsibilities as HTML string
    if (updateData.duties_and_responsibilities) {
      updateData.duties_and_responsibilities = updateData.duties_and_responsibilities;
    }
    if (updateData.job_requirements) {
      updateData.job_requirements = updateData.job_requirements || '';
    }

    // Update job
    await job.update(updateData);

    // Include postedBy information in response
    const updatedJob = await Job.findByPk(id, {
      include: [
        {
          model: User,
          as: 'postedBy',
          attributes: ['id', 'firstName', 'email', 'avatar']
        }
      ]
    });

    logger.info(`Job updated: ${job.title} at ${job.company} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });

  } catch (error) {
    logger.error('Error in updateJob:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to update job'));
  }
};

/**
 * @desc    Toggle job status between 'draft' and 'active'
 * @route   PATCH /api/jobs/:id/toggle-status
 * @access  Private (Admin/HR - job owner)
 */
const toggleJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find job
    const job = await Job.findByPk(id);
    if (!job) {
      return next(createError(404, 'Job not found'));
    }

    // Check if user is job poster or admin
    if (req.user.role !== 'admin' && job.author_id !== req.user.id) {
      return next(createError(403, 'Not authorized to update this job'));
    }

    // Toggle between 'draft' and 'active'
    const newStatus = job.status === 'active' ? 'draft' : 'active';
    
    // Update job status
    await job.update({ status: newStatus });

    logger.info(`Job status toggled: ${job.title} status changed to ${newStatus} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: `Job status updated to ${newStatus}`,
      data: {
        job: {
          id: job.id,
          title: job.title,
          status: job.status
        }
      }
    });

  } catch (error) {
    logger.error('Error in toggleJobStatus:', error);
    next(createError(500, 'Failed to toggle job status'));
  }
};

/**
 * @desc    Delete job
 * @route   DELETE /api/jobs/:id
 * @access  Private (Admin/HR - job owner)
 */
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id);
    if (!job) {
      return next(createError(404, 'Job not found'));
    }

    // Check if user is job poster or admin
    if (req.user.role !== 'admin' && job.author_id !== req.user.id) {
      return next(createError(403, 'Not authorized to delete this job'));
    }

    await job.destroy();

    logger.info(`Job deleted: ${job.title} at ${job.company} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Job deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteJob:', error);
    next(createError(500, 'Failed to delete job'));
  }
};

/**
 * @desc    Get jobs by category
 * @route   GET /api/jobs/category/:category
 * @access  Public
 */
const getJobsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Handle category parameter - support both category name and ID
    let categoryId;
    if (isNaN(category)) {
      // Category is a name, find the ID
      const { JobCategory } = require('../models');
      const categoryRecord = await JobCategory.findOne({ where: { name: category } });
      if (!categoryRecord) {
        return next(createError(404, 'Category not found'));
      }
      categoryId = categoryRecord.id;
    } else {
      // Category is an ID
      categoryId = parseInt(category);
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: { 
        categoryId, 
        status: 'active' 
      },
      include: [
        {
          model: User,
          as: 'postedBy',
          attributes: ['id', 'firstName', 'email', 'avatar']
        },
        {
          model: require('../models').JobCategory,
          as: 'category',
          attributes: ['id', 'name']
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
        jobs,
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
    logger.error('Error in getJobsByCategory:', error);
    next(createError(500, 'Failed to fetch jobs by category'));
  }
};

/**
 * @desc    Search jobs
 * @route   GET /api/jobs/search
 * @access  Public
 */
const searchJobs = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return next(createError(400, 'Search query is required'));
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { requirements: { [Op.like]: `%${q}%` } }
        ],
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'postedBy',
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
        jobs,
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
    logger.error('Error in searchJobs:', error);
    next(createError(500, 'Failed to search jobs'));
  }
};

/**
 * @desc    Get job statistics
 * @route   GET /api/jobs/stats
 * @access  Private (Admin)
 */
const getJobStats = async (req, res, next) => {
  try {
    const stats = await Job.findAll({
      attributes: [
        'category',
        'type',
        'status',
        'experience',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('salary')), 'avgSalary'],
        [fn('SUM', col('viewCount')), 'totalViews'],
        [fn('SUM', col('applicationCount')), 'totalApplications']
      ],
      group: ['category', 'type', 'status', 'experience']
    });

    res.status(200).json({
      status: 'success',
      data: { stats }
    });

  } catch (error) {
    logger.error('Error in getJobStats:', error);
    next(createError(500, 'Failed to fetch job statistics'));
  }
};

/**
 * @desc    Get user's own jobs
 * @route   GET /api/jobs/my-jobs
 * @access  Private
 */
const getMyJobs = async (req, res, next) => {
  try {
    // First, check and update expired jobs automatically
    await Job.update(
      { status: 'inactive' },
      {
        where: {
          author_id: req.user.id,
          closing_date: {
            [Op.lt]: new Date()
          },
          status: 'active'
        }
      }
    );

    const jobs = await Job.findAll({
      where: { author_id: req.user.id },
      include: [
        {
          model: User,
          as: 'postedBy',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logo', 'description']
        },
        {
          model: Province,
          as: 'province',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { jobs }
    });

  } catch (error) {
    logger.error('Error in getMyJobs:', error);
    next(createError(500, 'Failed to fetch user jobs'));
  }
};

/**
 * @desc    Get jobs by province
 * @route   GET /api/jobs/province/:provinceId
 * @access  Public
 */
const getJobsByProvince = async (req, res, next) => {
  try {
    const { province_id } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: { 
        [Op.or]: [
          { province_id: parseInt(province_id) },
          { 
            province_ids: {
              [Op.contains]: [parseInt(province_id)]
            }
          }
        ],
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'postedBy',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        },
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
    logger.error('Error in getJobsByProvince:', error);
    next(createError(500, 'Failed to fetch jobs by province'));
  }
};

/**
 * @desc    Get similar jobs
 * @route   GET /api/jobs/:id/similar
 * @access  Public
 */
const getSimilarJobs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);
    
    if (!job) {
      return next(createError(404, 'Job not found'));
    }

    const similarJobs = await Job.findAll({
      where: {
        id: { [Op.ne]: id },
        categoryId: job.categoryId,
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'postedBy',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ],
      limit: 6,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { jobs: similarJobs }
    });

  } catch (error) {
    logger.error('Error in getSimilarJobs:', error);
    next(createError(500, 'Failed to fetch similar jobs'));
  }
};

/**
 * @desc    Bulk update job status
 * @route   PUT /api/jobs/bulk/status
 * @access  Private (Admin)
 */
const bulkUpdateJobStatus = async (req, res, next) => {
  try {
    const { jobIds, status } = req.body;

    if (!jobIds || !Array.isArray(jobIds) || !status) {
      return next(createError(400, 'Job IDs array and status are required'));
    }

    const result = await Job.update(
      { status },
      { where: { id: jobIds } }
    );

    res.status(200).json({
      status: 'success',
      message: `Updated ${result[0]} jobs status to ${status}`,
      data: { updatedCount: result[0] }
    });

  } catch (error) {
    logger.error('Error in bulkUpdateJobStatus:', error);
    next(createError(500, 'Failed to bulk update job status'));
  }
};

/**
 * @desc    Bulk delete jobs
 * @route   DELETE /api/jobs/bulk
 * @access  Private (Admin)
 */
const bulkDeleteJobs = async (req, res, next) => {
  try {
    const { jobIds } = req.body;

    if (!jobIds || !Array.isArray(jobIds)) {
      return next(createError(400, 'Job IDs array is required'));
    }

    const result = await Job.destroy({
      where: { id: jobIds }
    });

    res.status(200).json({
      status: 'success',
      message: `Deleted ${result} jobs`,
      data: { deletedCount: result }
    });

  } catch (error) {
    logger.error('Error in bulkDeleteJobs:', error);
    next(createError(500, 'Failed to bulk delete jobs'));
  }
};

/**
 * @desc    Get job analytics
 * @route   GET /api/jobs/analytics
 * @access  Private (Admin)
 */
const getJobAnalytics = async (req, res, next) => {
  try {
    const totalJobs = await Job.count();
    const activeJobs = await Job.count({ where: { status: 'active' } });
    const featuredJobs = await Job.count({ where: { featured: true } });
    const totalViews = await Job.sum('viewCount') || 0;
    const totalApplications = await Job.sum('applicationCount') || 0;

    const analytics = {
      totalJobs,
      activeJobs,
      featuredJobs,
      totalViews,
      totalApplications,
      averageViews: totalJobs > 0 ? Math.round(totalViews / totalJobs) : 0,
      averageApplications: totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0
    };

    res.status(200).json({
      status: 'success',
      data: { analytics }
    });

  } catch (error) {
    logger.error('Error in getJobAnalytics:', error);
    next(createError(500, 'Failed to fetch job analytics'));
  }
};

/**
 * @desc    Check and update expired jobs
 * @route   POST /api/jobs/check-expired
 * @access  Private (Admin)
 */
const checkAndUpdateExpiredJobs = async (req, res, next) => {
  try {
    const expiredJobs = await Job.update(
      { status: 'inactive' },
      {
        where: {
          closing_date: {
            [Op.lt]: new Date()
          },
          status: 'active'
        }
      }
    );

    res.status(200).json({
      status: 'success',
      message: `Updated ${expiredJobs[0]} expired jobs`,
      data: { updatedCount: expiredJobs[0] }
    });

  } catch (error) {
    logger.error('Error in checkAndUpdateExpiredJobs:', error);
    next(createError(500, 'Failed to check and update expired jobs'));
  }
};

/**
 * @desc    Toggle job featured status
 * @route   PUT /api/jobs/:id/feature
 * @access  Private (Admin)
 */
const toggleJobFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);
    
    if (!job) {
      return next(createError(404, 'Job not found'));
    }

    job.featured = !job.featured;
    await job.save();

    res.status(200).json({
      status: 'success',
      message: `Job ${job.featured ? 'featured' : 'unfeatured'} successfully`,
      data: { featured: job.featured }
    });

  } catch (error) {
    logger.error('Error in toggleJobFeatured:', error);
    next(createError(500, 'Failed to toggle job featured status'));
  }
};

/**
 * @desc    Increment job view count
 * @route   POST /api/jobs/:id/view
 * @access  Public
 */
const incrementJobView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);
    
    if (!job) {
      return next(createError(404, 'Job not found'));
    }

    // Increment view count
    await job.incrementView();

    res.status(200).json({
      status: 'success',
      message: 'View count incremented successfully',
      data: { 
        viewCount: job.viewCount + 1,
        id: job.id 
      }
    });

  } catch (error) {
    logger.error('Error in incrementJobView:', error);
    next(createError(500, 'Failed to increment view count'));
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  toggleJobStatus,
  deleteJob,
  getFeaturedJobs,
  getJobsByCategory,
  searchJobs,
  getJobStats,
  getMyJobs,
  getJobsByProvince,
  getSimilarJobs,
  bulkUpdateJobStatus,
  bulkDeleteJobs,
  getJobAnalytics,
  checkAndUpdateExpiredJobs,
  toggleJobFeatured,
  incrementJobView
};
