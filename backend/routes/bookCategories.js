const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllBookCategories,
  getBookCategoryById,
  createBookCategory,
  updateBookCategory,
  deleteBookCategory,
  getBooksByCategory
} = require('../controllers/bookCategoryController');

// Import middleware
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllBookCategories);
router.get('/:id', getBookCategoryById);
router.get('/:id/books', getBooksByCategory);

// Protected routes - Admin only
router.use(protect);

router.post('/', createBookCategory);
router.put('/:id', updateBookCategory);
router.delete('/:id', deleteBookCategory);

module.exports = router;
