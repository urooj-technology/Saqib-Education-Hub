const { BookCategory } = require('../models');
const logger = require('../config/logger');
const { createError } = require('../utils/errorHandler');

/**
 * @desc    Get all book categories
 * @route   GET /api/book-categories
 * @access  Public
 */
const getAllBookCategories = async (req, res, next) => {
  try {
    const categories = await BookCategory.findAll({
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: { categories }
    });
  } catch (error) {
    logger.error('Error in getAllBookCategories:', error);
    next(createError(500, 'Failed to fetch book categories'));
  }
};

/**
 * @desc    Get single book category by ID
 * @route   GET /api/book-categories/:id
 * @access  Public
 */
const getBookCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await BookCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Book category not found'));
    }

    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    logger.error('Error in getBookCategoryById:', error);
    next(createError(500, 'Failed to fetch book category'));
  }
};

/**
 * @desc    Create new book category
 * @route   POST /api/book-categories
 * @access  Private (Admin only)
 */
const createBookCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return next(createError(400, 'Category name is required'));
    }

    // Check if category with same name already exists
    const existingCategory = await BookCategory.findOne({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return next(createError(400, 'Category with this name already exists'));
    }

    const category = await BookCategory.create({
      name: name.trim()
    });

    logger.info(`Book category created: ${category.name} by ${req.user.email}`);

    res.status(201).json({
      status: 'success',
      message: 'Book category created successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Error in createBookCategory:', error);
    next(createError(500, 'Failed to create book category'));
  }
};

/**
 * @desc    Update book category
 * @route   PUT /api/book-categories/:id
 * @access  Private (Admin only)
 */
const updateBookCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await BookCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Book category not found'));
    }

    // If name is being updated, check for duplicates
    if (name && name.trim() !== category.name) {
      const existingCategory = await BookCategory.findOne({
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

    logger.info(`Book category updated: ${category.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Book category updated successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Error in updateBookCategory:', error);
    next(createError(500, 'Failed to update book category'));
  }
};

/**
 * @desc    Delete book category
 * @route   DELETE /api/book-categories/:id
 * @access  Private (Admin only)
 */
const deleteBookCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await BookCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Book category not found'));
    }

    // Check if category has associated books
    const { Book } = require('../models');
    const bookCount = await Book.count({ where: { categoryId: id } });

    if (bookCount > 0) {
      return next(createError(400, `Cannot delete category. ${bookCount} book(s) are using this category. Please reassign them first.`));
    }

    await category.destroy();

    logger.info(`Book category deleted: ${category.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Book category deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteBookCategory:', error);
    next(createError(500, 'Failed to delete book category'));
  }
};

/**
 * @desc    Get books by category
 * @route   GET /api/book-categories/:id/books
 * @access  Public
 */
const getBooksByCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const category = await BookCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Book category not found'));
    }

    const { Book } = require('../models');
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    const { count, rows: books } = await Book.findAndCountAll({
      where: { categoryId: id, status: 'published', isActive: true },
      limit: limitNum,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        category,
        books,
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
    logger.error('Error in getBooksByCategory:', error);
    next(createError(500, 'Failed to fetch books by category'));
  }
};

module.exports = {
  getAllBookCategories,
  getBookCategoryById,
  createBookCategory,
  updateBookCategory,
  deleteBookCategory,
  getBooksByCategory
};