const express = require('express');
const router = express.Router();
const {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleVideoActive,
  getFeaturedVideos,
  getVideosByCategory,
  searchVideos,
  getVideoStats
} = require('../controllers/videoController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateVideo } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// Public routes (with optional authentication for admin features)
router.get('/', optionalAuth, getAllVideos);
router.get('/featured', getFeaturedVideos);
router.get('/category/:category', getVideosByCategory);
router.get('/search', searchVideos);
router.get('/:id', getVideoById);

// Protected routes - Admin/Teacher only
router.use(protect);
router.use(authorize('admin', 'teacher'));

// POST /api/videos - Create new video
router.post('/', upload.fields([
  { name: 'video_file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), validateVideo, createVideo);

// PUT /api/videos/:id - Update video
router.put('/:id', upload.fields([
  { name: 'video_file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), validateVideo, updateVideo);

// DELETE /api/videos/:id - Delete video
router.delete('/:id', deleteVideo);

// PATCH /api/videos/:id/toggle-active - Toggle video active status
router.patch('/:id/toggle-active', toggleVideoActive);

// Admin only routes
router.use(authorize('admin'));

// GET /api/videos/stats - Get video statistics
router.get('/stats', getVideoStats);

module.exports = router;
