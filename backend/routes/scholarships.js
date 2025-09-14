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
  getScholarshipStats,
  incrementScholarshipView
} = require('../controllers/scholarshipController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateScholarship } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// Public routes (with optional authentication for admin features)
router.get('/', optionalAuth, getAllScholarships);
router.get('/featured', getFeaturedScholarships);
router.get('/category/:category', getScholarshipsByCategory);
router.get('/search', searchScholarships);
router.get('/:id', getScholarshipById);
router.post('/:id/view', incrementScholarshipView);

// Protected routes (Admin/Moderator)
router.post('/', 
  protect, 
  authorize('admin', 'moderator'), 
  upload.single('logo'), 
  validateScholarship, 
  createScholarship
);

router.put('/:id', 
  protect, 
  authorize('admin', 'moderator'), 
  upload.single('logo'), 
  validateScholarship, 
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
