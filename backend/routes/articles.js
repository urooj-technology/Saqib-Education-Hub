const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/articleController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateArticle } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// Public routes (with optional authentication for admin features)
router.get('/', optionalAuth, getAllArticles);
router.get('/featured', getFeaturedArticles);
router.get('/category/:category', getArticlesByCategory);
router.get('/search', searchArticles);

// Document download routes
router.get('/:id/download', streamArticleDocument);
router.get('/:id/download/metadata', getArticleDocumentMetadata);

// Protected routes - Admin/Teacher only
router.use(protect);
router.use(authorize('admin', 'teacher'));

// GET /api/articles/authors - Get all authors for article creation
router.get('/authors', getAuthorsForArticle);

// GET /api/articles/:id - Get article by ID (must be after /authors to avoid conflict)
router.get('/:id', getArticleById);

// POST /api/articles - Create new article
router.post('/', upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'documentAttachment', maxCount: 1 }
]), validateArticle, createArticle);

// PUT /api/articles/:id - Update article
router.put('/:id', upload.fields([
  { name: 'featured_image', maxCount: 1 },
  { name: 'documentAttachment', maxCount: 1 }
]), validateArticle, updateArticle);

// DELETE /api/articles/:id - Delete article
router.delete('/:id', deleteArticle);

// PATCH /api/articles/:id/toggle-active - Toggle article active status
router.patch('/:id/toggle-active', toggleArticleActive);

// Admin only routes
router.use(authorize('admin'));

// GET /api/articles/stats - Get article statistics
router.get('/stats', getArticleStats);

module.exports = router;
