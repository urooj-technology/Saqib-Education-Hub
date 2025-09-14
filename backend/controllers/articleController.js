const Article = require('../models/Article');
const Author = require('../models/Author');
const User = require('../models/User');
const ArticleAuthor = require('../models/ArticleAuthor');
const { Op, sequelize } = require('sequelize');
const logger = require('../config/logger');
const { createError } = require('../utils/errorHandler');
const path = require('path');
const fs = require('fs');

/**
 * Helper function to convert file paths to URLs
 */
const convertFilePathsToUrls = (article, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  if (article.featuredImage) {
    // If it's already a URL path, use it as is
    if (article.featuredImage.startsWith('/uploads/')) {
      article.featuredImageUrl = `${baseUrl}${article.featuredImage}`;
    } else {
      // If it's a file path, convert it to URL
      const relativePath = article.featuredImage.replace(path.join(__dirname, '..'), '');
      article.featuredImageUrl = `${baseUrl}${relativePath.replace(/\\/g, '/')}`;
    }
  }
  
  if (article.documentAttachment) {
    // If it's already a URL path, use it as is
    if (article.documentAttachment.startsWith('/uploads/')) {
      article.documentAttachmentUrl = `${baseUrl}${article.documentAttachment}`;
    } else {
      // If it's a file path, convert it to URL
      const relativePath = article.documentAttachment.replace(path.join(__dirname, '..'), '');
      article.documentAttachmentUrl = `${baseUrl}${relativePath.replace(/\\/g, '/')}`;
    }
  }
  
  return article;
};

/**
 * @desc    Get all articles with pagination, filtering, and search
 * @route   GET /api/articles
 * @access  Public
 */
const getAllArticles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      status = 'published',
      sortBy = 'publishedAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause for filtering
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    // For public access, only show active articles
    if (!req.user || req.user.role !== 'admin') {
      whereClause.isActive = true;
    }
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sortBy field
    const allowedSortFields = [
      'title', 'category', 'publishedAt', 'readTime', 
      'likeCount', 'commentCount', 'createdAt'
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

    // Execute query with pagination (simplified for now)
    const { count, rows: articles } = await Article.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    // Transform articles data and fetch authors using Sequelize ORM
    const transformedArticles = await Promise.all(articles.map(async (article) => {
      const articleData = convertFilePathsToUrls(article.toJSON(), req);
      
      // Fetch authors for this article using Sequelize ORM
      const articleAuthors = await ArticleAuthor.findAll({
        where: { articleId: article.id, isActive: true },
        include: [{
          model: Author,
          attributes: ['id', 'penName', 'bio', 'profileImage']
        }]
      });
      
      articleData.authors = articleAuthors.map(aa => ({
        id: aa.Author.id,
        penName: aa.Author.penName,
        bio: aa.Author.bio,
        profileImage: aa.Author.profileImage
      }));
      
      return articleData;
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Build response
    const response = {
      status: 'success',
      data: {
        articles: transformedArticles,
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
        status: status || null,
        search: search || null
      };
    }

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error in getAllArticles:', error);
    next(createError(500, 'Failed to fetch articles'));
  }
};

/**
 * @desc    Get featured articles
 * @route   GET /api/articles/featured
 * @access  Public
 */
const getFeaturedArticles = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit);

    const articles = await Article.findAll({
      where: {
        status: 'published',
        featured: true
      },
      order: [['publishedAt', 'DESC']],
      limit: limitNum
    });

    // Transform articles data and fetch authors using Sequelize ORM
    const transformedArticles = await Promise.all(articles.map(async (article) => {
      const articleData = convertFilePathsToUrls(article.toJSON(), req);
      
      // Fetch authors for this article using Sequelize ORM
      const articleAuthors = await ArticleAuthor.findAll({
        where: { articleId: article.id, isActive: true },
        include: [{
          model: Author,
          attributes: ['id', 'penName', 'bio', 'profileImage']
        }]
      });
      
      articleData.authors = articleAuthors.map(aa => ({
        id: aa.Author.id,
        penName: aa.Author.penName,
        bio: aa.Author.bio,
        profileImage: aa.Author.profileImage
      }));
      
      return articleData;
    }));

    res.status(200).json({
      status: 'success',
      data: { articles: transformedArticles }
    });

  } catch (error) {
    logger.error('Error in getFeaturedArticles:', error);
    next(createError(500, 'Failed to fetch featured articles'));
  }
};

/**
 * @desc    Get single article by ID
 * @route   GET /api/articles/:id
 * @access  Public
 */
const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);

    if (!article) {
      return next(createError(404, 'Article not found'));
    }


    // Convert file paths to URLs
    const articleData = convertFilePathsToUrls(article.toJSON(), req);
    
    // Fetch authors for this article using Sequelize ORM
    const articleAuthors = await ArticleAuthor.findAll({
      where: { articleId: article.id, isActive: true },
      include: [{
        model: Author,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'email']
        }]
      }]
    });
    
    articleData.authors = articleAuthors.map(aa => {
      const author = aa.Author;
      const user = author.user;
      return {
        id: author.id,
        penName: author.penName,
        bio: author.bio,
        profileImage: author.profileImage,
        user: {
          id: user.id,
          firstName: user.firstName,
          email: user.email
        }
      };
    });

    res.status(200).json({
      status: 'success',
      data: { article: articleData }
    });

  } catch (error) {
    logger.error('Error in getArticleById:', error);
    next(createError(500, 'Failed to fetch article'));
  }
};

/**
 * @desc    Create new article
 * @route   POST /api/articles
 * @access  Private (Admin/Teacher)
 */
const createArticle = async (req, res, next) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      readTime,
      status = 'draft'
    } = req.body;

    // Handle authorIds - it might come as JSON string from FormData
    let authorIds = [];
    if (req.body.authorIds) {
      try {
        authorIds = typeof req.body.authorIds === 'string' 
          ? JSON.parse(req.body.authorIds) 
          : req.body.authorIds;
      } catch (error) {
        logger.warn('Invalid authorIds format:', req.body.authorIds);
        authorIds = [];
      }
    }

    // Handle file uploads
    let featuredImagePath = null;
    let documentAttachmentPath = null;
    
    if (req.files) {
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        featuredImagePath = `/uploads/article/${req.files.featuredImage[0].filename}`;
      }
      if (req.files.documentAttachment && req.files.documentAttachment[0]) {
        documentAttachmentPath = `/uploads/article/${req.files.documentAttachment[0].filename}`;
      }
    }

    // Create article
    const article = await Article.create({
      title,
      content,
      excerpt,
      category,
      readTime,
      status,
      featuredImage: featuredImagePath,
      documentAttachment: documentAttachmentPath
    });

    // Associate authors with the article if authorIds are provided
    if (authorIds && authorIds.length > 0) {
      const authorAssociations = authorIds.map(authorId => ({
        articleId: article.id,
        authorId: authorId,
        isActive: true
      }));
      
      await ArticleAuthor.bulkCreate(authorAssociations);
    }

    logger.info(`New article created: ${article.title} by ${req.user.email} with ${authorIds.length} authors`);

    // Fetch the complete article with authors
    const articleData = convertFilePathsToUrls(article.toJSON(), req);
    
    // Fetch authors for this article
    const articleAuthors = await ArticleAuthor.findAll({
      where: { articleId: article.id, isActive: true },
      include: [{
        model: Author,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'email']
        }]
      }]
    });
    
    articleData.authors = articleAuthors.map(aa => {
      const author = aa.Author;
      const user = author.user;
      return {
        id: author.id,
        penName: author.penName,
        bio: author.bio,
        profileImage: author.profileImage,
        user: {
          id: user.id,
          firstName: user.firstName,
          email: user.email
        }
      };
    });

    res.status(201).json({
      status: 'success',
      message: 'Article created successfully',
      data: { article: articleData }
    });

  } catch (error) {
    logger.error('Error in createArticle:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to create article'));
  }
};

/**
 * @desc    Update article
 * @route   PUT /api/articles/:id
 * @access  Private (Admin/Teacher - article owner)
 */
const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find article
    const article = await Article.findByPk(id);
    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    // Process uploaded files
    if (req.files) {
      if (req.files.featured_image && req.files.featured_image[0]) {
        updateData.featuredImage = `/uploads/article/${req.files.featured_image[0].filename}`;
      }
      if (req.files.documentAttachment && req.files.documentAttachment[0]) {
        updateData.documentAttachment = `/uploads/article/${req.files.documentAttachment[0].filename}`;
      }
    }

    // Update article
    await article.update(updateData);

    logger.info(`Article updated: ${article.title} by ${req.user.email}`);

    // Convert file paths to URLs for response
    const articleData = convertFilePathsToUrls(article.toJSON(), req);

    res.status(200).json({
      status: 'success',
      message: 'Article updated successfully',
      data: { article: articleData }
    });

  } catch (error) {
    logger.error('Error in updateArticle:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to update article'));
  }
};

/**
 * @desc    Delete article
 * @route   DELETE /api/articles/:id
 * @access  Private (Admin/Teacher - article owner)
 */
const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    await article.destroy();

    logger.info(`Article deleted: ${article.title} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Article deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteArticle:', error);
    next(createError(500, 'Failed to delete article'));
  }
};

/**
 * @desc    Toggle article active status
 * @route   PATCH /api/articles/:id/toggle-active
 * @access  Private (Admin only)
 */
const toggleArticleActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    // Toggle the isActive status
    await article.update({ isActive: !article.isActive });

    logger.info(`Article active status toggled: ${article.title} (${article.isActive ? 'active' : 'inactive'}) by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: `Article ${article.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { 
        article: {
          id: article.id,
          title: article.title,
          isActive: article.isActive
        }
      }
    });

  } catch (error) {
    logger.error('Error in toggleArticleActive:', error);
    next(createError(500, 'Failed to toggle article active status'));
  }
};

/**
 * @desc    Get articles by category
 * @route   GET /api/articles/category/:category
 * @access  Public
 */
const getArticlesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sortBy = 'publishedAt', sortOrder = 'DESC' } = req.query;

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: articles } = await Article.findAndCountAll({
      where: { 
        category, 
        status: 'published' 
      },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    // Transform articles data and fetch authors using Sequelize ORM
    const transformedArticles = await Promise.all(articles.map(async (article) => {
      const articleData = article.toJSON();
      
      // Fetch authors for this article using Sequelize ORM
      const articleAuthors = await ArticleAuthor.findAll({
        where: { articleId: article.id, isActive: true },
        include: [{
          model: Author,
          attributes: ['id', 'penName', 'bio', 'profileImage']
        }]
      });
      
      articleData.authors = articleAuthors.map(aa => ({
        id: aa.Author.id,
        penName: aa.Author.penName,
        bio: aa.Author.bio,
        profileImage: aa.Author.profileImage
      }));
      
      return articleData;
    }));

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        articles: transformedArticles,
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
    logger.error('Error in getArticlesByCategory:', error);
    next(createError(500, 'Failed to fetch articles by category'));
  }
};

/**
 * @desc    Search articles
 * @route   GET /api/articles/search
 * @access  Public
 */
const searchArticles = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return next(createError(400, 'Search query is required'));
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: articles } = await Article.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { content: { [Op.like]: `%${q}%` } },
          { excerpt: { [Op.like]: `%${q}%` } }
        ],
        status: 'published'
      },
      order: [['publishedAt', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    // Transform articles data and fetch authors using Sequelize ORM
    const transformedArticles = await Promise.all(articles.map(async (article) => {
      const articleData = article.toJSON();
      
      // Fetch authors for this article using Sequelize ORM
      const articleAuthors = await ArticleAuthor.findAll({
        where: { articleId: article.id, isActive: true },
        include: [{
          model: Author,
          attributes: ['id', 'penName', 'bio', 'profileImage']
        }]
      });
      
      articleData.authors = articleAuthors.map(aa => ({
        id: aa.Author.id,
        penName: aa.Author.penName,
        bio: aa.Author.bio,
        profileImage: aa.Author.profileImage
      }));
      
      return articleData;
    }));

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        articles: transformedArticles,
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
    logger.error('Error in searchArticles:', error);
    next(createError(500, 'Failed to search articles'));
  }
};

/**
 * @desc    Get all authors for article creation
 * @route   GET /api/articles/authors
 * @access  Private (Admin/Teacher)
 */
const getAuthorsForArticle = async (req, res, next) => {
  try {
    const authors = await Author.findAll({
      attributes: ['id', 'penName', 'bio', 'profileImage']
    });

    res.status(200).json({
      status: 'success',
      data: { authors }
    });

  } catch (error) {
    logger.error('Error in getAuthorsForArticle:', error);
    next(createError(500, 'Failed to fetch authors'));
  }
};

/**
 * @desc    Get article statistics
 * @route   GET /api/articles/stats
 * @access  Private (Admin)
 */
const getArticleStats = async (req, res, next) => {
  try {
    const stats = await Article.findAll({
      attributes: [
        'category',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('readTime')), 'avgReadTime'],
        [sequelize.fn('SUM', sequelize.col('likeCount')), 'totalLikes'],
        [sequelize.fn('SUM', sequelize.col('commentCount')), 'totalComments']
      ],
      group: ['category', 'status']
    });

    res.status(200).json({
      status: 'success',
      data: { stats }
    });

  } catch (error) {
    logger.error('Error in getArticleStats:', error);
    next(createError(500, 'Failed to fetch article statistics'));
  }
};

/**
 * @desc    Stream article document with chunked loading
 * @route   GET /api/articles/:id/download
 * @access  Public
 */
const streamArticleDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    if (!article.documentAttachment) {
      return next(createError(404, 'No document attachment found for this article'));
    }

    // Get the file path
    let filePath;
    if (article.documentAttachment.startsWith('/uploads/')) {
      filePath = path.join(__dirname, '..', article.documentAttachment);
    } else {
      filePath = article.documentAttachment;
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(createError(404, 'Document file not found'));
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const range = req.headers.range;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      // Set response headers for partial content
      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=31536000'
      });

      // Create read stream for the requested range
      const file = fs.createReadStream(filePath, { start, end });
      file.pipe(res);

      file.on('error', (error) => {
        logger.error('Error streaming article document:', error);
        if (!res.headersSent) {
          next(createError(500, 'Error streaming document'));
        }
      });

    } else {
      // No range header, send entire file
      res.set({
        'Content-Length': fileSize,
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=31536000'
      });

      const file = fs.createReadStream(filePath);
      file.pipe(res);

      file.on('error', (error) => {
        logger.error('Error streaming article document:', error);
        if (!res.headersSent) {
          next(createError(500, 'Error streaming document'));
        }
      });
    }

  } catch (error) {
    logger.error('Error in streamArticleDocument:', error);
    next(createError(500, 'Failed to stream article document'));
  }
};

/**
 * @desc    Get article document metadata
 * @route   GET /api/articles/:id/download/metadata
 * @access  Public
 */
const getArticleDocumentMetadata = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    if (!article.documentAttachment) {
      return next(createError(404, 'No document attachment found for this article'));
    }

    // Get the file path
    let filePath;
    if (article.documentAttachment.startsWith('/uploads/')) {
      filePath = path.join(__dirname, '..', article.documentAttachment);
    } else {
      filePath = article.documentAttachment;
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(createError(404, 'Document file not found'));
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();

    res.status(200).json({
      status: 'success',
      data: {
        fileName,
        fileSize,
        fileExtension,
        lastModified: stats.mtime,
        contentType: fileExtension === '.pdf' ? 'application/pdf' : 'application/octet-stream'
      }
    });

  } catch (error) {
    logger.error('Error in getArticleDocumentMetadata:', error);
    next(createError(500, 'Failed to get document metadata'));
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleArticleActive,
  getFeaturedArticles,
  getArticlesByCategory,
  searchArticles,
  getAuthorsForArticle,
  getArticleStats,
  streamArticleDocument,
  getArticleDocumentMetadata
};
