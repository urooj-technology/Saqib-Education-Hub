const express = require('express');
const router = express.Router();
const {
  getAllScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  toggleScholarshipActive,
  getFeaturedScholarships,
  getScholarshipsByCategory,
  searchScholarships,
  getScholarshipStats
} = require('../controllers/scholarshipController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
// Validation middleware removed - no validation for scholarships
const { upload } = require('../middleware/upload');

// Public routes (with optional authentication for admin features)
router.get('/', optionalAuth, getAllScholarships);
router.get('/featured', getFeaturedScholarships);
router.get('/category/:category', getScholarshipsByCategory);
router.get('/search', searchScholarships);
router.get('/:id', getScholarshipById);
// View increment route removed - viewCount field no longer exists

// Protected routes (Admin/Moderator)
router.post('/', 
  protect, 
  authorize('admin', 'moderator'),
  upload.none(), // Parse FormData fields without files
  createScholarship
);

router.put('/:id', 
  protect, 
  authorize('admin', 'moderator'),
  upload.none(), // Parse FormData fields without files
  updateScholarship
);

router.delete('/:id', 
  protect, 
  authorize('admin', 'moderator'), 
  deleteScholarship
);

router.patch('/:id/toggle-active', 
  protect, 
  authorize('admin'), 
  toggleScholarshipActive
);

// Admin only routes
router.get('/stats/overview', 
  protect, 
  authorize('admin'), 
  getScholarshipStats
);

module.exports = router;
