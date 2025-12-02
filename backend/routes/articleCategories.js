const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllArticleCategories,
  getArticleCategoryById,
  createArticleCategory,
  updateArticleCategory,
  deleteArticleCategory,
  getArticlesByCategory
} = require('../controllers/articleCategoryController');

// Import middleware
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllArticleCategories);
router.get('/:id', getArticleCategoryById);
router.get('/:id/articles', getArticlesByCategory);

// Protected routes - Admin only
router.use(protect);

router.post('/', createArticleCategory);
router.put('/:id', updateArticleCategory);
router.delete('/:id', deleteArticleCategory);

module.exports = router;
