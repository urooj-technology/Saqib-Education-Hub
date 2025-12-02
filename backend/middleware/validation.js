const { body, validationResult } = require('express-validator');
const { createError } = require('./errorHandler');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return next(createError(400, 'Validation failed', validationErrors));
  }
  next();
};

/**
 * User validation rules (for creation)
 */
const validateUser = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender selection'),
  
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin', 'moderator', 'hr'])
    .withMessage('Invalid role selection'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Invalid status selection'),
  
  body('subscription')
    .optional()
    .isIn(['none', 'basic', 'premium', 'enterprise'])
    .withMessage('Invalid subscription selection'),
  
  handleValidationErrors
];

/**
 * User update validation rules (for updates - no password required)
 */
const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty phone
      // More flexible phone validation that accepts international formats
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    })
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender selection'),
  
  body('role')
    .optional()
    .isIn(['user', 'student', 'teacher', 'admin', 'moderator', 'hr'])
    .withMessage('Invalid role selection'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Invalid status selection'),
  
  body('subscription')
    .optional()
    .isIn(['none', 'basic', 'premium', 'enterprise'])
    .withMessage('Invalid subscription selection'),
  
  handleValidationErrors
];

/**
 * Book validation rules
 */
const validateBook = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('authors')
    .optional()
    .custom((value) => {
      // Allow both string (JSON) and array formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) && parsed.length > 0;
        } catch {
          return false;
        }
      }
      return Array.isArray(value) && value.length > 0;
    })
    .withMessage('Authors must be a valid array or JSON string with at least one author'),
  
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  
  
  body('publisher')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Publisher cannot exceed 100 characters'),
  
  body('publicationYear')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() + 1 })
    .withMessage('Publication year must be between 1800 and next year'),
  
  body('edition')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Edition cannot exceed 20 characters'),
  
  body('pages')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Pages must be a positive number'),
  
  body('language')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Language must be between 1 and 50 characters'),
  
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid positive integer'),
  
  body('subcategory')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Subcategory cannot exceed 100 characters'),
  
  body('tags')
    .optional()
    .custom((value) => {
      // Allow both string (JSON) and array formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Tags must be a valid array or JSON string'),
  
  body('format')
    .optional()
    .isIn(['pdf', 'epub', 'mobi', 'docx', 'txt', 'html'])
    .withMessage('Invalid format selection'),
  
  body('fileSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('File size must be a positive number'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be exactly 3 characters'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived', 'pending_review'])
    .withMessage('Invalid status selection'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'restricted'])
    .withMessage('Invalid visibility selection'),
  
  // File fields should not be validated as they are handled by multer
  body('coverImage')
    .optional()
    .custom((value) => {
      // Skip validation for file fields - they are handled by multer
      // Allow empty objects, arrays, or any value for file fields
      return true;
    }),
  
  body('bookFile')
    .optional()
    .custom((value) => {
      // Skip validation for file fields - they are handled by multer
      // Allow empty objects, arrays, or any value for file fields
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Article validation rules
 */
const validateArticle = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  

  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),
  
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid positive integer'),
  
  body('tags')
    .optional()
    .custom((value) => {
      // Allow both string (JSON) and array formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Tags must be a valid array or JSON string'),
  
  body('readTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Read time must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived', 'pending_review'])
    .withMessage('Invalid status selection'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'restricted'])
    .withMessage('Invalid visibility selection'),
  
  // File fields should not be validated as they are handled by multer
  body('featured_image')
    .optional()
    .custom((value) => {
      // Skip validation for file fields - they are handled by multer
      // Allow empty objects, arrays, or any value for file fields
      return true;
    }),
  
  body('documentAttachment')
    .optional()
    .custom((value) => {
      // Skip validation for file fields - they are handled by multer
      // Allow empty objects, arrays, or any value for file fields
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Video validation rules
 */
const validateVideo = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters'),
  
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  
  body('subcategory')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Subcategory cannot exceed 100 characters'),
  
  body('tags')
    .optional()
    .custom((value) => {
      // Allow both string (JSON) and array formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Tags must be a valid array or JSON string'),
  

  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived', 'pending_review'])
    .withMessage('Invalid status selection'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'restricted'])
    .withMessage('Invalid visibility selection'),
  
  body('youtubeUrl')
    .optional()
    .isURL()
    .withMessage('YouTube URL must be a valid URL')
    .custom((value) => {
      if (value && !value.includes('youtube.com') && !value.includes('youtu.be')) {
        throw new Error('URL must be a valid YouTube link');
      }
      return true;
    }),
  
  // File fields should not be validated as they are handled by multer
  body('video_file')
    .optional()
    .custom((value) => {
      // Skip validation for file fields - they are handled by multer
      // Allow empty objects, arrays, or any value for file fields
      return true;
    }),
  
  body('thumbnail')
    .optional()
    .custom((value) => {
      // Skip validation for file fields - they are handled by multer
      // Allow empty objects, arrays, or any value for file fields
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Job validation rules (for creation)
 */
const validateJob = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters'),
  
  body('company_id')
    .isInt({ min: 1 })
    .withMessage('Company ID must be a valid positive integer'),
  
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid positive integer'),
  
  body('subcategory')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Subcategory cannot exceed 100 characters'),
  
  body('type')
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
    .withMessage('Invalid job type selection'),
  
  body('contract_type')
    .isIn(['permanent', 'temporary', 'contract', 'internship'])
    .withMessage('Invalid contract type selection'),
  
  body('province_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Province ID must be a valid positive integer'),
  
  body('province_ids')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty
      if (!Array.isArray(value)) return false;
      return value.every(id => Number.isInteger(id) && id > 0);
    })
    .withMessage('Province IDs must be an array of positive integers'),
  
  // Custom validation to ensure at least one province is selected
  body().custom((value, { req }) => {
    const { province_id, province_ids } = req.body;
    if (!province_id && (!province_ids || province_ids.length === 0)) {
      throw new Error('At least one province must be selected');
    }
    return true;
  }),
  
  body('remote')
    .optional()
    .isBoolean()
    .withMessage('Remote must be a boolean value'),
  
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a non-negative number'),
  
  body('salary_range')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Salary range cannot exceed 100 characters'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be exactly 3 characters'),
  
  body('salaryType')
    .optional()
    .isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid salary type selection'),
  
  body('experience')
    .isIn(['entry', 'junior', 'mid-level', 'senior', 'lead', 'executive'])
    .withMessage('Invalid experience level selection'),
  
  body('years_of_experience')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Years of experience cannot exceed 100 characters'),
  
  body('submission_email')
    .optional()
    .isEmail()
    .withMessage('Submission email must be a valid email address'),
  
  body('submission_guidelines')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Submission guidelines cannot exceed 2000 characters'),
  
  body('requirements')
    .optional()
    .isString()
    .withMessage('Requirements must be a string'),
  
  body('benefits')
    .optional()
    .custom((value) => {
      // Allow both string (JSON) and array formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Benefits must be an array or valid JSON string'),
  
  body('education')
    .optional()
    .isIn(['high-school', 'diploma', 'associate', 'bachelor', 'master', 'phd', 'any'])
    .withMessage('Invalid education level selection'),
  
  body('gender')
    .optional()
    .isIn(['any', 'male', 'female'])
    .withMessage('Invalid gender selection'),
  
  body('number_of_vacancies')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of vacancies must be a positive integer'),
  
  body('closing_date')
    .optional()
    .isISO8601()
    .withMessage('Closing date must be a valid date'),
  
  body('post_date')
    .optional()
    .isISO8601()
    .withMessage('Post date must be a valid date'),
  
  handleValidationErrors
];

/**
 * Job validation rules (for updates - all fields optional)
 */
const validateJobUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters'),
  
  body('company_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Company ID must be a valid positive integer'),
  
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid positive integer'),
  
  body('subcategory')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Subcategory cannot exceed 100 characters'),
  
  body('type')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
    .withMessage('Invalid job type selection'),
  
  body('contract_type')
    .optional()
    .isIn(['permanent', 'temporary', 'contract', 'internship'])
    .withMessage('Invalid contract type selection'),
  
  body('province_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Province ID must be a valid positive integer'),
  
  body('province_ids')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty
      if (!Array.isArray(value)) return false;
      return value.every(id => Number.isInteger(id) && id > 0);
    })
    .withMessage('Province IDs must be an array of positive integers'),
  
  body('remote')
    .optional()
    .isBoolean()
    .withMessage('Remote must be a boolean value'),
  
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a non-negative number'),
  
  body('salary_range')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Salary range cannot exceed 100 characters'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be exactly 3 characters'),
  
  body('salaryType')
    .optional()
    .isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid salary type selection'),
  
  body('experience')
    .optional()
    .isIn(['entry', 'junior', 'mid-level', 'senior', 'lead', 'executive'])
    .withMessage('Invalid experience level selection'),
  
  body('years_of_experience')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Years of experience cannot exceed 100 characters'),
  
  body('submission_email')
    .optional()
    .isEmail()
    .withMessage('Submission email must be a valid email address'),
  
  body('submission_guidelines')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Submission guidelines cannot exceed 2000 characters'),
  
  body('requirements')
    .optional()
    .isString()
    .withMessage('Requirements must be a string'),
  
  body('benefits')
    .optional()
    .custom((value) => {
      // Allow both string (JSON) and array formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Benefits must be a valid array or JSON string'),
  
  body('tags')
    .optional()
    .custom((value) => {
      // Allow both string (JSON) and array formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Tags must be a valid array or JSON string'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'expired', 'draft'])
    .withMessage('Invalid status selection'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'restricted'])
    .withMessage('Invalid visibility selection'),
  
  body('closing_date')
    .optional()
    .isISO8601()
    .withMessage('Closing date must be a valid date'),
  
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  
  body('contract_duration')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Contract duration cannot exceed 100 characters'),
  
  body('probation_period')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Probation period cannot exceed 100 characters'),
  
  body('education')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Education cannot exceed 100 characters'),
  
  body('gender')
    .optional()
    .isIn(['any', 'male', 'female'])
    .withMessage('Invalid gender selection'),
  
  body('number_of_vacancies')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of vacancies must be a positive integer'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'expired', 'draft'])
    .withMessage('Invalid status selection'),
  
  body('closing_date')
    .optional()
    .isISO8601()
    .withMessage('Closing date must be a valid date'),
  
  body('post_date')
    .optional()
    .isISO8601()
    .withMessage('Post date must be a valid date'),
  
  handleValidationErrors
];

/**
 * Scholarship validation rules - completely removed, no validation
 */
const validateScholarship = [
  // All validation completely removed - accept any input
  handleValidationErrors
];

/**
 * Scholarship validation rules (for updates - all fields optional)
 */
const validateScholarshipUpdate = [
  // All validation completely removed - accept any input
  
  
  handleValidationErrors
];

/**
 * Generic ID validation
 */
const validateId = [
  body('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

/**
 * Search validation
 */
const validateSearch = [
  body('search')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateUser,
  validateUserUpdate,
  validateBook,
  validateArticle,
  validateVideo,
  validateJob,
  validateJobUpdate,
  validateScholarship,
  validateScholarshipUpdate,
  validateId,
  validatePagination,
  validateSearch,
  handleValidationErrors
};
