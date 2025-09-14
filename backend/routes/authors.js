const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Import author controller
const {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  searchAuthors
} = require('../controllers/authorController');

// Public routes
// Search authors (public)
router.get('/search', searchAuthors);

// Protected routes - Admin/Teacher only
router.use(protect);
router.use(authorize('admin', 'teacher'));

// GET /api/authors - Get all authors (root endpoint)
router.get('/', getAllAuthors);

// GET /api/authors/all - Get all authors (alternative endpoint)
router.get('/all', getAllAuthors);

// GET /api/authors/:id - Get author by ID
router.get('/:id', getAuthorById);

// POST /api/authors - Create new author
router.post('/', upload.single('profileImage'), createAuthor);

// PUT /api/authors/:id - Update author
router.put('/:id', upload.single('profileImage'), updateAuthor);

// PATCH /api/authors/:id - Update author (partial update)
router.patch('/:id', upload.single('profileImage'), updateAuthor);

// DELETE /api/authors/:id - Delete author
router.delete('/:id', deleteAuthor);

module.exports = router;
