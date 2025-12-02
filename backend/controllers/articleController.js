const Article = require('../models/Article');
const Author = require('../models/Author');
const User = require('../models/User');
const ArticleAuthor = require('../models/ArticleAuthor');
const ArticleCategory = require('../models/ArticleCategory');
const { Op, sequelize, col, fn } = require('sequelize');
const logger = require('../config/logger');
const { createError } = require('../middleware/errorHandler');
const { compressImage } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedResult = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedResult = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

/**
 * Helper function to convert file paths to URLs
 */
const convertFilePathsToUrls = (article, req) => {
  // Always use HTTPS for production, check for HTTPS header in development
  const protocol = (process.env.NODE_ENV === 'production' || req.get('x-forwarded-proto') === 'https') ? 'https' : 'http';
  const baseUrl = `${protocol}://${req.get('host')}`;
  
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
      author,
      status = 'published',
      sortBy = 'publishedAt',
      sortOrder = 'DESC'
    } = req.query;

    // Create cache key
    const cacheKey = `articles:${page}:${limit}:${search || ''}:${category || ''}:${author || ''}:${status}:${sortBy}:${sortOrder}`;
    
    // Check cache first
    const cached = getCachedResult(cacheKey);
    if (cached) {
      logger.info(`Cache hit for articles: ${cacheKey}`);
      return res.status(200).json(cached);
    }

    // Build where clause for filtering
    const whereClause = {};
    
    // Only filter by status if a specific status is provided
    // Empty string or no status means show all (for admin)
    // For public users, default to 'published' if no status specified
    if (status && status.trim() !== '') {
      whereClause.status = status;
    } else if (!req.user || req.user.role !== 'admin') {
      // Public users should only see published articles
      whereClause.status = 'published';
    }
    
    if (category) {
      // Find category by name to get the ID
      const categoryRecord = await ArticleCategory.findOne({ where: { name: category } });
      if (categoryRecord) {
        whereClause.categoryId = categoryRecord.id;
      }
    }
    
    // For public access, only show active articles
    if (!req.user || req.user.role !== 'admin') {
      whereClause.isActive = true;
    }
    
    // Search functionality
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${searchTerm}%` } },
        { content: { [Op.like]: `%${searchTerm}%` } }
      ];
    }

    // Filter by author if provided
    let articleIds = null;
    if (author) {
      // Find author by pen name
      const authorRecord = await Author.findOne({ where: { penName: author } });
      if (authorRecord) {
        // Get all article IDs for this author
        const articleAuthors = await ArticleAuthor.findAll({
          where: { authorId: authorRecord.id, isActive: true },
          attributes: ['articleId']
        });
        articleIds = articleAuthors.map(aa => aa.articleId);
        
        // Add to where clause
        if (articleIds.length > 0) {
          whereClause.id = { [Op.in]: articleIds };
        } else {
          // No articles for this author, return empty result
          whereClause.id = -1;
        }
      } else {
        // Author not found, return empty result
        whereClause.id = -1;
      }
    }

    // Validate sortBy field
    const allowedSortFields = [
      'title', 'categoryId', 'publishedAt', 'createdAt'
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

    // Execute query with pagination and include category information
    const { count, rows: articles } = await Article.findAndCountAll({
      where: whereClause,
      include: [{
        model: ArticleCategory,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    // First, get all unique category IDs from articles
    const categoryIds = [...new Set(articles.map(article => article.categoryId).filter(id => id))];
    
    // Fetch all categories in one query
    const categories = await ArticleCategory.findAll({
      where: { id: categoryIds },
      attributes: ['id', 'name']
    });
    
    // Create a map for quick lookup
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });
    
    // Transform articles data and fetch authors using Sequelize ORM
    const transformedArticles = await Promise.all(articles.map(async (article) => {
      const articleData = convertFilePathsToUrls(article.toJSON(), req);
      
      // Add category name using the pre-fetched map
      if (articleData.categoryId && categoryMap[articleData.categoryId]) {
        articleData.category = categoryMap[articleData.categoryId];
        console.log(`Article ${article.id}: Found category "${articleData.category}" for categoryId ${articleData.categoryId}`);
      } else {
        console.warn(`Article ${article.id}: No category found for categoryId ${articleData.categoryId}`);
        articleData.category = 'Unknown Category';
      }
      
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
        author: author || null,
        status: status || null,
        search: search || null
      };
    }

    // Cache the response
    setCachedResult(cacheKey, response);
    logger.info(`Cache set for articles: ${cacheKey}`);

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error in getAllArticles:', error);
    
    // Log more details for debugging
    if (error.name) {
      logger.error('Error name:', error.name);
    }
    if (error.message) {
      logger.error('Error message:', error.message);
    }
    if (error.sql) {
      logger.error('SQL query:', error.sql);
    }
    
    next(createError(500, `Failed to fetch articles: ${error.message}`));
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
        isActive: true
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
    
    // Add category name if categoryId exists
    if (articleData.categoryId) {
      try {
        const category = await ArticleCategory.findByPk(articleData.categoryId, {
          attributes: ['id', 'name']
        });
        if (category) {
          articleData.category = category.name;
          console.log(`Article ${article.id}: Found category "${category.name}" for categoryId ${articleData.categoryId}`);
        } else {
          console.warn(`Article ${article.id}: No category found for categoryId ${articleData.categoryId}`);
          articleData.category = 'Unknown Category';
        }
      } catch (error) {
        console.error(`Article ${article.id}: Error fetching category for categoryId ${articleData.categoryId}:`, error);
        articleData.category = 'Unknown Category';
      }
    } else {
      console.warn(`Article ${article.id}: No categoryId found`);
      articleData.category = 'No Category';
    }
    
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
      categoryId,
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

    // Handle file uploads with compression
    let featuredImagePath = null;
    let documentAttachmentPath = null;

    // Check if document attachment was uploaded via chunked upload
    const uploadedDocumentFile = req.body.uploadedDocumentFile;
    console.log('Article - uploadedDocumentFile from req.body:', uploadedDocumentFile);
    
    if (uploadedDocumentFile) {
      try {
        const parsedUpload = typeof uploadedDocumentFile === 'string' ? JSON.parse(uploadedDocumentFile) : uploadedDocumentFile;
        console.log('Article - parsed upload result:', parsedUpload);
        
        // Convert absolute path to relative path for storage
        const relativePath = parsedUpload.filePath.replace(path.join(__dirname, '..'), '');
        documentAttachmentPath = relativePath.replace(/\\/g, '/');
        console.log('Article - documentAttachmentPath set to:', documentAttachmentPath);
        logger.info(`Using chunked upload result for article document: ${parsedUpload.fileName}`);
      } catch (error) {
        console.error('Article - Error parsing uploaded document file data:', error);
        logger.error('Error parsing uploaded document file data:', error);
        return next(createError(400, 'Invalid uploaded document file data'));
      }
    }
    
    console.log('Article - req.files:', req.files);
    
    if (req.files) {
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        const file = req.files.featuredImage[0];
        console.log('Article - featuredImage file:', file);
        // Compress featured image
        try {
          // Don't await - let compression run in background
          compressImage(file.path, {
            maxWidth: 800,
            maxHeight: 800,
            quality: 75,
            format: 'jpeg',
            progressive: true
          }).then(() => {
            logger.info(`Compressed featured image: ${file.originalname}`);
          }).catch(err => {
            logger.warn('Image compression failed:', err.message);
          });
        } catch (error) {
          logger.error(`Failed to compress featured image: ${error.message}`);
        }
        featuredImagePath = `/uploads/article/${file.filename}`;
        console.log('Article - featuredImagePath set to:', featuredImagePath);
      }
      // Handle regular document attachment upload (fallback)
      if (req.files.documentAttachment && req.files.documentAttachment[0] && !documentAttachmentPath) {
        console.log('Article - documentAttachment file:', req.files.documentAttachment[0]);
        documentAttachmentPath = `/uploads/article/${req.files.documentAttachment[0].filename}`;
        console.log('Article - documentAttachmentPath set to:', documentAttachmentPath);
      }
    }

    console.log('Article - Final paths before creating article:');
    console.log('  featuredImagePath:', featuredImagePath);
    console.log('  documentAttachmentPath:', documentAttachmentPath);

    // Create article
    const article = await Article.create({
      title,
      content,
      categoryId,
      status,
      featuredImage: featuredImagePath,
      documentAttachment: documentAttachmentPath
    });

    console.log('Article - Created article with ID:', article.id);
    console.log('Article - Article documentAttachment field:', article.documentAttachment);

    // Associate authors with the article if authorIds are provided (async, non-blocking)
    if (authorIds && authorIds.length > 0) {
      const authorAssociations = authorIds.map(authorId => ({
        articleId: article.id,
        authorId: authorId,
        isActive: true
      }));
      
      // Don't await - let it run in background
      ArticleAuthor.bulkCreate(authorAssociations).catch(err => {
        logger.warn('Failed to associate authors:', err.message);
      });
    }

    // Clear cache asynchronously
    cache.clear();

    // Return minimal response immediately
    const articleData = {
      id: article.id,
      title: article.title,
      status: article.status,
      category: article.category,
      featuredImage: featuredImagePath,
      documentAttachment: documentAttachmentPath,
      createdAt: article.createdAt
    };

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
    let documentAttachmentPath = null;

    // Check if document attachment was uploaded via chunked upload
    const uploadedDocumentFile = req.body.uploadedDocumentFile;
    console.log('Edit Article - uploadedDocumentFile from req.body:', uploadedDocumentFile);
    
    if (uploadedDocumentFile) {
      try {
        const parsedUpload = typeof uploadedDocumentFile === 'string' ? JSON.parse(uploadedDocumentFile) : uploadedDocumentFile;
        console.log('Edit Article - parsed upload result:', parsedUpload);
        
        // Convert absolute path to relative path for storage
        const relativePath = parsedUpload.filePath.replace(path.join(__dirname, '..'), '');
        documentAttachmentPath = relativePath.replace(/\\/g, '/');
        console.log('Edit Article - documentAttachmentPath set to:', documentAttachmentPath);
        logger.info(`Using chunked upload result for article document update: ${parsedUpload.fileName}`);
      } catch (error) {
        console.error('Edit Article - Error parsing uploaded document file data:', error);
        logger.error('Error parsing uploaded document file data in update:', error);
        return next(createError(400, 'Invalid uploaded document file data'));
      }
    }

    if (req.files) {
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        updateData.featuredImage = `/uploads/article/${req.files.featuredImage[0].filename}`;
      }
      // Handle regular document attachment upload (fallback)
      if (req.files.documentAttachment && req.files.documentAttachment[0] && !documentAttachmentPath) {
        console.log('Edit Article - documentAttachment file:', req.files.documentAttachment[0]);
        documentAttachmentPath = `/uploads/article/${req.files.documentAttachment[0].filename}`;
        console.log('Edit Article - documentAttachmentPath set to:', documentAttachmentPath);
      }
    }

    // Add document attachment path to update data if we have it
    if (documentAttachmentPath) {
      updateData.documentAttachment = documentAttachmentPath;
    }

    // Handle author updates
    let authorIds = null;
    if (updateData.authorIds) {
      try {
        authorIds = typeof updateData.authorIds === 'string' 
          ? JSON.parse(updateData.authorIds) 
          : updateData.authorIds;
        console.log('Edit Article - Parsed authorIds:', authorIds);
      } catch (error) {
        console.error('Edit Article - Error parsing authorIds:', error);
        return next(createError(400, 'Invalid author IDs format'));
      }
    }

    // Remove authorIds from updateData as it's not a direct field on Article
    delete updateData.authorIds;

    // Update article
    await article.update(updateData);

    // Update author associations if authorIds provided
    if (authorIds !== null) {
      try {
        // Remove existing author associations
        await ArticleAuthor.destroy({
          where: { articleId: article.id }
        });

        // Create new author associations
        if (authorIds.length > 0) {
          const authorAssociations = authorIds.map(authorId => ({
            articleId: article.id,
            authorId: authorId,
            isActive: true
          }));
          
          await ArticleAuthor.bulkCreate(authorAssociations);
          console.log('Edit Article - Updated author associations:', authorAssociations);
        }
      } catch (error) {
        console.error('Edit Article - Error updating author associations:', error);
        logger.error('Failed to update author associations:', error.message);
        // Don't fail the entire update, just log the error
      }
    }

    logger.info(`Article updated: ${article.title} by ${req.user.email}`);

    // Clear cache to ensure fresh data is served
    cache.clear();

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

    // Clear cache to ensure fresh data is served
    cache.clear();

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

    // Clear cache to ensure fresh data is served
    cache.clear();

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
          { content: { [Op.like]: `%${q}%` } }
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
        [fn('COUNT', col('id')), 'count'],
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
    } else if (article.documentAttachment.startsWith('uploads/')) {
      filePath = path.join(__dirname, '..', article.documentAttachment);
    } else {
      filePath = article.documentAttachment;
    }

    // Normalize the path
    filePath = path.normalize(filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`Document file not found at path: ${filePath}`);
      logger.error(`Original documentAttachment: ${article.documentAttachment}`);
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
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'ETag': `"${stats.mtime.getTime()}-${fileSize}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Range'
      });

      // Create read stream for the requested range with optimized buffer
      const file = fs.createReadStream(filePath, { 
        start, 
        end,
        highWaterMark: 64 * 1024 // 64KB buffer for better performance
      });
      file.pipe(res);

      file.on('error', (error) => {
        logger.error('Error streaming article document:', error);
        if (!res.headersSent) {
          next(createError(500, 'Error streaming document'));
        }
      });

    } else {
      // No range header, send entire file with chunked transfer
      res.set({
        'Content-Length': fileSize,
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'ETag': `"${stats.mtime.getTime()}-${fileSize}"`,
        'Transfer-Encoding': 'chunked',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Range'
      });

      const file = fs.createReadStream(filePath, {
        highWaterMark: 64 * 1024 // 64KB buffer for better performance
      });
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
    } else if (article.documentAttachment.startsWith('uploads/')) {
      filePath = path.join(__dirname, '..', article.documentAttachment);
    } else {
      filePath = article.documentAttachment;
    }

    // Normalize the path
    filePath = path.normalize(filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`Document file not found at path: ${filePath}`);
      logger.error(`Original documentAttachment: ${article.documentAttachment}`);
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
