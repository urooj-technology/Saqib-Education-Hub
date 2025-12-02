const { ArticleCategory } = require('../models');
const logger = require('../config/logger');
const { createError } = require('../utils/errorHandler');

/**
 * @desc    Get all article categories
 * @route   GET /api/article-categories
 * @access  Public
 */
const getAllArticleCategories = async (req, res, next) => {
  try {
    const categories = await ArticleCategory.findAll({
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: { categories }
    });
  } catch (error) {
    logger.error('Error in getAllArticleCategories:', error);
    next(createError(500, 'Failed to fetch article categories'));
  }
};

/**
 * @desc    Get single article category by ID
 * @route   GET /api/article-categories/:id
 * @access  Public
 */
const getArticleCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await ArticleCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Article category not found'));
    }

    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    logger.error('Error in getArticleCategoryById:', error);
    next(createError(500, 'Failed to fetch article category'));
  }
};

/**
 * @desc    Create new article category
 * @route   POST /api/article-categories
 * @access  Private (Admin only)
 */
const createArticleCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return next(createError(400, 'Category name is required'));
    }

    // Check if category with same name already exists
    const existingCategory = await ArticleCategory.findOne({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return next(createError(400, 'Category with this name already exists'));
    }

    const category = await ArticleCategory.create({
      name: name.trim()
    });

    logger.info(`Article category created: ${category.name} by ${req.user?.email || 'unknown'}`);

    res.status(201).json({
      status: 'success',
      message: 'Article category created successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Error in createArticleCategory:', error);
    next(createError(500, 'Failed to create article category'));
  }
};

/**
 * @desc    Update article category
 * @route   PUT /api/article-categories/:id
 * @access  Private (Admin only)
 */
const updateArticleCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await ArticleCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Article category not found'));
    }

    // If name is being updated, check for duplicates
    if (name && name.trim() !== category.name) {
      const existingCategory = await ArticleCategory.findOne({
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

    logger.info(`Article category updated: ${category.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Article category updated successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Error in updateArticleCategory:', error);
    next(createError(500, 'Failed to update article category'));
  }
};

/**
 * @desc    Delete article category
 * @route   DELETE /api/article-categories/:id
 * @access  Private (Admin only)
 */
const deleteArticleCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await ArticleCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Article category not found'));
    }

    // Check if category has associated articles
    const { Article } = require('../models');
    const articleCount = await Article.count({ where: { categoryId: id } });

    if (articleCount > 0) {
      return next(createError(400, `Cannot delete category. ${articleCount} article(s) are using this category. Please reassign them first.`));
    }

    await category.destroy();

    logger.info(`Article category deleted: ${category.name} by ${req.user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Article category deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteArticleCategory:', error);
    next(createError(500, 'Failed to delete article category'));
  }
};

/**
 * @desc    Get articles by category
 * @route   GET /api/article-categories/:id/articles
 * @access  Public
 */
const getArticlesByCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const category = await ArticleCategory.findByPk(id);

    if (!category) {
      return next(createError(404, 'Article category not found'));
    }

    const { Article } = require('../models');
    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    const { count, rows: articles } = await Article.findAndCountAll({
      where: { categoryId: id, status: 'published', isActive: true },
      limit: limitNum,
      offset: offset,
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      status: 'success',
      data: {
        category,
        articles,
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
    logger.error('Error in getArticlesByCategory:', error);
    next(createError(500, 'Failed to fetch articles by category'));
  }
};

module.exports = {
  getAllArticleCategories,
  getArticleCategoryById,
  createArticleCategory,
  updateArticleCategory,
  deleteArticleCategory,
  getArticlesByCategory
};