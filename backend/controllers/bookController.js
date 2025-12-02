const Book = require('../models/Book');
const { Op, sequelize, col, fn } = require('sequelize');
const { sequelize: db } = require('../config/database');
const { Author, BookAuthor } = require('../models');
const logger = require('../config/logger');
const { createError } = require('../utils/errorHandler');
const { compressImage } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Get all books with pagination, filtering, and search
 * @route   GET /api/books
 * @access  Public
 */
const getAllBooks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      language,
      format,
      status = 'published',
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause for filtering
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    // Only show active books for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      whereClause.isActive = true;
    }
    
    if (category) {
      // If category is a string (category name), find the category ID
      if (isNaN(category)) {
        const BookCategory = require('../models/BookCategory');
        const categoryRecord = await BookCategory.findOne({ where: { name: category } });
        if (categoryRecord) {
          whereClause.categoryId = categoryRecord.id;
        }
      } else {
        // If category is a number (category ID), use it directly
        whereClause.categoryId = parseInt(category);
      }
    }
    
    if (language) {
      whereClause.language = language;
    }
    
    if (format) {
      whereClause.format = format;
    }
    
    // Price range filtering
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }
    
    // Rating filtering
    if (minRating) {
      whereClause.rating = { [Op.gte]: parseFloat(minRating) };
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
      'title', 'category', 'price', 'rating', 
      'publicationYear', 'createdAt'
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
    const BookCategory = require('../models/BookCategory');
    const { count, rows: books } = await Book.findAndCountAll({
      where: whereClause,
      include: [{
        model: BookCategory,
        as: 'category',
        attributes: ['id', 'name'],
        required: false // Left join to include books without categories
      }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    // PERFORMANCE: Fetch all book authors in one query (fixes N+1 problem)
    const bookIds = books.map(b => b.id);
    const allBookAuthors = await BookAuthor.findAll({
      where: { 
        bookId: { [Op.in]: bookIds },
        isActive: true 
      },
      include: [{
        model: Author,
        include: [{
          model: require('../models/User'),
          as: 'user',
          attributes: ['id', 'firstName', 'email']
        }]
      }]
    });

    // Group authors by bookId for efficient lookup
    const authorsByBook = allBookAuthors.reduce((acc, ba) => {
      if (!acc[ba.bookId]) acc[ba.bookId] = [];
      acc[ba.bookId].push(ba);
      return acc;
    }, {});

    // Transform books data (no async operations needed - much faster!)
    const transformedBooks = books.map((book) => {
      const bookData = book.toJSON();
      
      // Add category name if available
      logger.debug('Book category data:', bookData.category, 'CategoryId:', bookData.categoryId);
      
      if (bookData.category && bookData.category.name) {
        bookData.categoryName = bookData.category.name;
        bookData.category = bookData.category.name;
      } else if (bookData.categoryId) {
        // Category should be included in the main query
        bookData.categoryName = 'Uncategorized';
        bookData.category = 'Uncategorized';
      } else {
        bookData.categoryName = 'Uncategorized';
        bookData.category = 'Uncategorized';
      }
      
      // Ensure tags are properly parsed as an array
      if (bookData.tags && typeof bookData.tags === 'string') {
        try {
          bookData.tags = JSON.parse(bookData.tags);
        } catch (parseError) {
          logger.warn('Backend - Failed to parse tags JSON in getAllBooks:', parseError);
          bookData.tags = [];
        }
      } else if (!bookData.tags) {
        bookData.tags = [];
      }
      
      // Add file URLs
      if (bookData.filePath) {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
        const baseUrl = `${protocol}://${req.get('host')}`;
        bookData.fileUrl = `${baseUrl}/api/books/${book.id}/pdf`;
      }
      
      if (bookData.coverImage) {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
        const baseUrl = `${protocol}://${req.get('host')}`;
        const relativePath = bookData.coverImage.replace(path.join(__dirname, '..'), '');
        bookData.coverImageUrl = `${baseUrl}${relativePath.replace(/\\/g, '/')}`;
      }
      
      // Get pre-fetched authors for this book (fast lookup from Map)
      const bookAuthors = authorsByBook[book.id] || [];
      
      bookData.authors = bookAuthors.map(ba => {
        const author = ba.Author;
        const user = author.user;
        
        // Convert profile image to full URL
        let profileImageUrl = null;
        if (author.profileImage) {
          const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
          const baseUrl = `${protocol}://${req.get('host')}`;
          profileImageUrl = `${baseUrl}/uploads/images/${author.profileImage}`;
        }
        
        return {
          id: user.id,
          firstName: user.firstName,
          email: user.email,
          penName: author.penName,
          bio: author.bio,
          profileImage: profileImageUrl
        };
      });
      
      return bookData;
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Build response
    const response = {
      status: 'success',
      data: {
        books: transformedBooks,
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
        language: language || null,
        format: format || null,
        status: status || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        minRating: minRating || null,
        search: search || null
      };
    }

    res.status(200).json(response);

  } catch (error) {
    logger.error('Error in getAllBooks:', error);
    next(createError(500, 'Failed to fetch books'));
  }
};

/**
 * @desc    Get featured books
 * @route   GET /api/books/featured
 * @access  Public
 */
const getFeaturedBooks = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit);

    const BookCategory = require('../models/BookCategory');
    const books = await Book.findAll({
      where: {
        status: 'published',
        featured: true
      },
      include: [{
        model: BookCategory,
        as: 'category',
        attributes: ['id', 'name'],
        required: false
      }],
      order: [['rating', 'DESC'], ['createdAt', 'DESC']],
      limit: limitNum
    });

    // Transform books to include category names
    const transformedBooks = books.map(book => {
      const bookData = book.toJSON();
      if (bookData.category && bookData.category.name) {
        bookData.categoryName = bookData.category.name;
        bookData.category = bookData.category.name;
      } else {
        bookData.categoryName = 'Uncategorized';
        bookData.category = 'Uncategorized';
      }
      return bookData;
    });

    res.status(200).json({
      status: 'success',
      data: { books: transformedBooks }
    });

  } catch (error) {
    logger.error('Error in getFeaturedBooks:', error);
    next(createError(500, 'Failed to fetch featured books'));
  }
};

/**
 * @desc    Get single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const BookCategory = require('../models/BookCategory');
    const book = await Book.findByPk(id, {
      include: [{
        model: BookCategory,
        as: 'category',
        attributes: ['id', 'name'],
        required: false
      }]
    });

    if (!book) {
      return next(createError(404, 'Book not found'));
    }

    // Note: View count functionality has been removed

    // Transform book data and fetch authors using Sequelize ORM
    const bookData = book.toJSON();
    
    // Add category name
    if (bookData.category && bookData.category.name) {
      bookData.categoryName = bookData.category.name;
      bookData.category = bookData.category.name;
    } else if (bookData.categoryId) {
      try {
        const category = await BookCategory.findByPk(bookData.categoryId);
        if (category) {
          bookData.categoryName = category.name;
          bookData.category = category.name;
        } else {
          bookData.categoryName = 'Uncategorized';
          bookData.category = 'Uncategorized';
        }
      } catch (err) {
        logger.error('Error fetching book category:', err);
        bookData.categoryName = 'Uncategorized';
        bookData.category = 'Uncategorized';
      }
    } else {
      bookData.categoryName = 'Uncategorized';
      bookData.category = 'Uncategorized';
    }
    
    // Debug: Log the book data to see if tags are included
    logger.debug('Backend - Book data from database:', bookData);
    logger.debug('Backend - Tags field:', bookData.tags);
    logger.debug('Backend - Tags type:', typeof bookData.tags);
    
    // Ensure tags are properly parsed as an array
    if (bookData.tags && typeof bookData.tags === 'string') {
      try {
        bookData.tags = JSON.parse(bookData.tags);
        console.log('Backend - Parsed tags:', bookData.tags);
      } catch (parseError) {
        console.warn('Backend - Failed to parse tags JSON:', parseError);
        bookData.tags = [];
      }
    } else if (!bookData.tags) {
      bookData.tags = [];
    }
    
    // Add file URLs
    if (bookData.filePath) {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
      const baseUrl = `${protocol}://${req.get('host')}`;
      bookData.fileUrl = `${baseUrl}/api/books/${book.id}/pdf`;
    }
    
    if (bookData.coverImage) {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
      const baseUrl = `${protocol}://${req.get('host')}`;
      const relativePath = bookData.coverImage.replace(path.join(__dirname, '..'), '');
      bookData.coverImageUrl = `${baseUrl}${relativePath.replace(/\\/g, '/')}`;
    }
    
    // Fetch authors for this book using Sequelize ORM
    const bookAuthors = await BookAuthor.findAll({
      where: { bookId: book.id, isActive: true },
      include: [{
        model: Author,
        include: [{
          model: require('../models/User'),
          as: 'user',
          attributes: ['id', 'firstName', 'email']
        }]
      }]
    });
    
    bookData.authors = bookAuthors.map(ba => {
      const author = ba.Author;
      const user = author.user;
      
      // Convert profile image to full URL
      let profileImageUrl = null;
      if (author.profileImage) {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
        const baseUrl = `${protocol}://${req.get('host')}`;
        profileImageUrl = `${baseUrl}/uploads/images/${author.profileImage}`;
      }
      
      return {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        penName: author.penName,
        bio: author.bio,
        profileImage: profileImageUrl
      };
    });

    res.status(200).json({
      status: 'success',
      data: { book: bookData }
    });

  } catch (error) {
    logger.error('Error in getBookById:', error);
    next(createError(500, 'Failed to fetch book'));
  }
};

/**
 * @desc    Create new book
 * @route   POST /api/books
 * @access  Private (Admin/Teacher)
 */
const createBook = async (req, res, next) => {
  try {
    const {
      title,
      description,
      publisher,
      publicationYear,
      edition,
      pages,
      language,
      categoryId,
      format,
      price,
      currency,
      status,
      tags,
      authors
    } = req.body;



    // Process uploaded files
    let coverImagePath = null;
    let bookFilePath = null;
    let fileSize = null;

    // Check if book file was uploaded via chunked upload
    const uploadedBookFile = req.body.uploadedBookFile;
    if (uploadedBookFile) {
      try {
        const parsedUpload = typeof uploadedBookFile === 'string' ? JSON.parse(uploadedBookFile) : uploadedBookFile;
        bookFilePath = parsedUpload.filePath;
        fileSize = parsedUpload.fileSize;
        logger.info(`Using chunked upload result: ${parsedUpload.fileName}`);
      } catch (error) {
        logger.error('Error parsing uploaded book file data:', error);
        return next(createError(400, 'Invalid uploaded book file data'));
      }
    }

    if (req.files) {
      // Handle cover image with compression
      if (req.files.coverImage && req.files.coverImage[0]) {
        const file = req.files.coverImage[0];
        // Compress cover image
        try {
          // Don't await - let compression run in background
          compressImage(file.path, {
            maxWidth: 800,
            maxHeight: 800,
            quality: 75,
            format: 'jpeg',
            progressive: true
          }).then(() => {
            logger.info(`Compressed cover image: ${file.originalname}`);
          }).catch(err => {
            logger.warn('Image compression failed:', err.message);
          });
        } catch (error) {
          logger.error(`Failed to compress cover image: ${error.message}`);
        }
        coverImagePath = file.path;
      }

      // Handle regular book file upload (fallback)
      if (req.files.bookFile && req.files.bookFile[0] && !bookFilePath) {
        bookFilePath = req.files.bookFile[0].path;
        fileSize = req.files.bookFile[0].size;
      }
    }

    // Validate that book file is provided
    if (!bookFilePath) {
      return next(createError(400, 'Book file is required'));
    }

    // Parse tags and authors if they are JSON strings
    let parsedTags = [];
    let parsedAuthors = [];

    try {
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
      if (authors) {
        parsedAuthors = typeof authors === 'string' ? JSON.parse(authors) : authors;
      }
    } catch (parseError) {
      logger.warn('Error parsing tags or authors JSON:', parseError);
    }

    // Create book
    const book = await Book.create({
      title,
      description,
      publisher,
      publicationYear: publicationYear ? parseInt(publicationYear) : null,
      edition,
      pages: pages ? parseInt(pages) : null,
      language,
      categoryId,
      format,
      fileSize,
      filePath: bookFilePath,
      coverImage: coverImagePath,
      price: price ? parseFloat(price) : 0.00,
      currency: currency || 'USD',
      status: status || 'draft',
      tags: parsedTags
    });

    // Handle authors creation through BookAuthor model (async, non-blocking)
    if (parsedAuthors.length > 0) {
      // Create BookAuthor associations in background
      const bookAuthorPromises = parsedAuthors.map(authorId => {
        return BookAuthor.create({
          bookId: book.id,
          authorId: authorId,
          isActive: true
        });
      });
      
      Promise.all(bookAuthorPromises).then(() => {
        logger.info(`Book ${book.title} has ${parsedAuthors.length} authors with IDs: ${parsedAuthors.join(', ')}`);
      }).catch(authorError => {
        logger.error('Error creating book-author associations:', authorError);
      });
    }

    // Return minimal response immediately
    const bookData = {
      id: book.id,
      title: book.title,
      status: book.status,
      category: book.category,
      coverImage: coverImagePath,
      filePath: bookFilePath,
      price: book.price,
      currency: book.currency,
      createdAt: book.createdAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Book created successfully',
      data: { book: bookData }
    });

  } catch (error) {
    logger.error('Error in createBook:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to create book'));
  }
};

/**
 * @desc    Update book
 * @route   PUT /api/books/:id
 * @access  Private (Admin/Teacher - book owner)
 */
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find book
    const book = await Book.findByPk(id);
    if (!book) {
      return next(createError(404, 'Book not found'));
    }

    // Process uploaded files
    let bookFilePath = null;
    let fileSize = null;

    // Check if book file was uploaded via chunked upload
    const uploadedBookFile = req.body.uploadedBookFile;
    if (uploadedBookFile) {
      try {
        const parsedUpload = typeof uploadedBookFile === 'string' ? JSON.parse(uploadedBookFile) : uploadedBookFile;
        bookFilePath = parsedUpload.filePath;
        fileSize = parsedUpload.fileSize;
        logger.info(`Using chunked upload result for update: ${parsedUpload.fileName}`);
      } catch (error) {
        logger.error('Error parsing uploaded book file data in update:', error);
        return next(createError(400, 'Invalid uploaded book file data'));
      }
    }

    if (req.files) {
      // Handle cover image
      if (req.files.coverImage && req.files.coverImage[0]) {
        updateData.coverImage = req.files.coverImage[0].path;
      }

      // Handle regular book file upload (fallback)
      if (req.files.bookFile && req.files.bookFile[0] && !bookFilePath) {
        bookFilePath = req.files.bookFile[0].path;
        fileSize = req.files.bookFile[0].size;
      }
    }

    // Add file path and size to update data if we have them
    if (bookFilePath) {
      updateData.filePath = bookFilePath;
    }
    if (fileSize) {
      updateData.fileSize = fileSize;
    }

    // Parse authors and tags if they are JSON strings
    let parsedAuthors = [];
    let parsedTags = [];
    
    if (updateData.authors) {
      try {
        parsedAuthors = typeof updateData.authors === 'string' 
          ? JSON.parse(updateData.authors) 
          : updateData.authors;
      } catch (parseError) {
        logger.warn('Error parsing authors JSON:', parseError);
        parsedAuthors = [];
      }
    }
    
    if (updateData.tags) {
      try {
        parsedTags = typeof updateData.tags === 'string' 
          ? JSON.parse(updateData.tags) 
          : updateData.tags;
      } catch (parseError) {
        logger.warn('Error parsing tags JSON:', parseError);
        parsedTags = [];
      }
    }

    // Update book (excluding authors and tags from the main update)
    const { authors, tags, ...bookUpdateData } = updateData;
    
    // Add parsed tags to update data
    if (parsedTags.length > 0) {
      bookUpdateData.tags = parsedTags;
    }
    
    await book.update(bookUpdateData);

    // Handle author associations if authors were provided
    if (parsedAuthors.length >= 0) {
      try {
        // Remove existing author associations
        await BookAuthor.destroy({
          where: { bookId: book.id }
        });
        
        // Create new author associations
        if (parsedAuthors.length > 0) {
          const bookAuthorPromises = parsedAuthors.map(authorId => {
            return BookAuthor.create({
              bookId: book.id,
              authorId: authorId,
              isActive: true
            });
          });
          
          await Promise.all(bookAuthorPromises);
          logger.info(`Updated book ${book.title} with ${parsedAuthors.length} authors with IDs: ${parsedAuthors.join(', ')}`);
        }
      } catch (authorError) {
        logger.error('Error updating book-author associations:', authorError);
        // Don't fail the book update if author association fails
      }
    }

    logger.info(`Book updated: ${book.title} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Book updated successfully',
      data: { book }
    });

  } catch (error) {
    logger.error('Error in updateBook:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return next(createError(400, 'Validation failed', validationErrors));
    }
    
    next(createError(500, 'Failed to update book'));
  }
};

/**
 * @desc    Delete book
 * @route   DELETE /api/books/:id
 * @access  Private (Admin/Teacher - book owner)
 */
const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return next(createError(404, 'Book not found'));
    }

    await book.destroy();

    logger.info(`Book deleted: ${book.title} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Book deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteBook:', error);
    next(createError(500, 'Failed to delete book'));
  }
};

/**
 * @desc    Toggle book active status
 * @route   PATCH /api/books/:id/toggle-active
 * @access  Private (Admin only)
 */
const toggleBookActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return next(createError(404, 'Book not found'));
    }

    // Toggle the isActive status
    await book.update({ isActive: !book.isActive });

    logger.info(`Book active status toggled: ${book.title} (${book.isActive ? 'active' : 'inactive'}) by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: `Book ${book.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { 
        book: {
          id: book.id,
          title: book.title,
          isActive: book.isActive
        }
      }
    });

  } catch (error) {
    logger.error('Error in toggleBookActive:', error);
    next(createError(500, 'Failed to toggle book active status'));
  }
};

/**
 * @desc    Get books by category
 * @route   GET /api/books/category/:category
 * @access  Public
 */
const getBooksByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: books } = await Book.findAndCountAll({
      where: { category, status: 'published' },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        books,
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
    logger.error('Error in getBooksByCategory:', error);
    next(createError(500, 'Failed to fetch books by category'));
  }
};

/**
 * @desc    Search books
 * @route   GET /api/books/search
 * @access  Public
 */
const searchBooks = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return next(createError(400, 'Search query is required'));
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const { count, rows: books } = await Book.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } }
        ],
        status: 'published'
      },
      order: [['rating', 'DESC'], ['createdAt', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        books,
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
    logger.error('Error in searchBooks:', error);
    next(createError(500, 'Failed to search books'));
  }
};

/**
 * @desc    Get book statistics
 * @route   GET /api/books/stats
 * @access  Private (Admin)
 */
const getBookStats = async (req, res, next) => {
  try {
    const stats = await Book.findAll({
      attributes: [
        'category',
        'status',
        'format',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('rating')), 'avgRating'],
      ],
      group: ['category', 'status', 'format']
    });

    res.status(200).json({
      status: 'success',
      data: { stats }
    });

  } catch (error) {
    logger.error('Error in getBookStats:', error);
    next(createError(500, 'Failed to fetch book statistics'));
  }
};

/**
 * @desc    Stream PDF file with chunked loading
 * @route   GET /api/books/:id/pdf
 * @access  Public
 */
const streamBookPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, chunk } = req.query;

    const book = await Book.findByPk(id);
    if (!book) {
      return next(createError(404, 'Book not found'));
    }

    if (!book.filePath || !fs.existsSync(book.filePath)) {
      return next(createError(404, 'PDF file not found'));
    }

    // Check if it's a PDF file
    if (path.extname(book.filePath).toLowerCase() !== '.pdf') {
      return next(createError(400, 'File is not a PDF'));
    }

    const filePath = book.filePath;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Set appropriate headers for PDF streaming
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Length, Accept-Ranges');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    res.setHeader('ETag', `"${stat.mtime.getTime()}-${fileSize}"`); // Add ETag for better caching

    // Handle range requests for chunked loading
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1024 * 1024, fileSize - 1); // Default 1MB chunks
      const chunkSize = (end - start) + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunkSize);

      const stream = fs.createReadStream(filePath, { 
        start, 
        end,
        highWaterMark: 64 * 1024 // 64KB buffer for better performance
      });
      
      stream.on('error', (error) => {
        logger.error('Error streaming PDF chunk:', error);
        if (!res.headersSent) {
          next(createError(500, 'Error streaming PDF'));
        }
      });
      
      stream.pipe(res);
    } else {
      // If no range request, stream the entire file with chunked transfer
      res.setHeader('Transfer-Encoding', 'chunked');
      const stream = fs.createReadStream(filePath, {
        highWaterMark: 64 * 1024 // 64KB buffer
      });
      
      stream.on('error', (error) => {
        logger.error('Error streaming PDF:', error);
        if (!res.headersSent) {
          next(createError(500, 'Error streaming PDF'));
        }
      });
      
      stream.pipe(res);
    }

    // Note: View count functionality has been removed

  } catch (error) {
    logger.error('Error in streamBookPDF:', error);
    next(createError(500, 'Failed to stream PDF'));
  }
};

/**
 * @desc    Get PDF metadata (page count, etc.)
 * @route   GET /api/books/:id/pdf/metadata
 * @access  Public
 */
const getPDFMetadata = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return next(createError(404, 'Book not found'));
    }

    if (!book.filePath || !fs.existsSync(book.filePath)) {
      return next(createError(404, 'PDF file not found'));
    }

    // For now, return basic metadata
    // In a production environment, you might want to use a PDF parsing library
    // to get actual page count and other metadata
    const stat = fs.statSync(book.filePath);
    
    res.status(200).json({
      status: 'success',
      data: {
        fileSize: stat.size,
        lastModified: stat.mtime,
        format: book.format,
        // Note: Actual page count would require PDF parsing
        estimatedPages: book.pages || Math.ceil(stat.size / 50000) // Rough estimate
      }
    });

  } catch (error) {
    logger.error('Error in getPDFMetadata:', error);
    next(createError(500, 'Failed to get PDF metadata'));
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  toggleBookActive,
  getFeaturedBooks,
  getBooksByCategory,
  searchBooks,
  getBookStats,
  streamBookPDF,
  getPDFMetadata
};
