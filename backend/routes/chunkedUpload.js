const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { handleMulterError } = require('../middleware/upload');
const {
  initializeUpload,
  uploadChunk,
  completeUpload,
  cleanupUpload,
  getUploadStatus
} = require('../controllers/chunkedUploadController');

// All routes require authentication
router.use(protect);

// Initialize chunked upload session
router.post('/init', initializeUpload);

// Upload a single chunk
router.post('/chunk', upload.single('chunk'), handleMulterError, uploadChunk);

// Complete chunked upload
router.post('/complete', completeUpload);

// Clean up failed upload
router.post('/cleanup', cleanupUpload);

// Get upload status
router.get('/status/:sessionId', getUploadStatus);

module.exports = router;
