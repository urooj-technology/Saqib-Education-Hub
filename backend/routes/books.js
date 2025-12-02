const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {
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
} = require('../controllers/bookController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateBook } = require('../middleware/validation');
const { upload, handleMulterError } = require('../middleware/upload');
const { ultraCompressImages } = require('../middleware/imageCompression');

// Public routes (with optional authentication for admin features)
router.get('/', optionalAuth, getAllBooks);
router.get('/featured', getFeaturedBooks);
router.get('/category/:category', getBooksByCategory);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// PDF streaming routes
router.get('/:id/pdf', streamBookPDF);
router.get('/:id/pdf/metadata', getPDFMetadata);

// Handle CORS preflight for PDF streaming
router.options('/:id/pdf', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Length, Accept-Ranges');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
  res.status(200).end();
});

// Serve book cover images
router.get('/cover/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, '..', 'uploads', 'images', filename);
  
  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  // Set appropriate headers
  res.setHeader('Content-Type', 'image/*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  
  // Stream the file
  const stream = fs.createReadStream(imagePath);
  stream.pipe(res);
});

// Serve book files directly (for downloads)
router.get('/file/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', 'uploads', 'books', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Set appropriate headers for file download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Stream the file
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// Protected routes - Admin/Teacher only
router.use(protect);
router.use(authorize('admin', 'teacher'));

// POST /api/books - Create new book
router.post('/', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'bookFile', maxCount: 1 }
]), handleMulterError, ultraCompressImages(), validateBook, createBook);

// PUT /api/books/:id - Update book
router.put('/:id', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'bookFile', maxCount: 1 }
]), handleMulterError, ultraCompressImages(), validateBook, updateBook);

// DELETE /api/books/:id - Delete book
router.delete('/:id', deleteBook);

// PATCH /api/books/:id/toggle-active - Toggle book active status
router.patch('/:id/toggle-active', toggleBookActive);

// Admin only routes
router.use(authorize('admin'));

// GET /api/books/stats - Get book statistics
router.get('/stats', getBookStats);

module.exports = router;
