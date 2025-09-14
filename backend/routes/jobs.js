const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getFeaturedJobs,
  getJobsByCategory,
  searchJobs,
  getJobStats,
  getMyJobs,
  getJobsByProvince,
  getSimilarJobs,
  bulkUpdateJobStatus,
  bulkDeleteJobs,
  getJobAnalytics,
  checkAndUpdateExpiredJobs,
  toggleJobFeatured,
  incrementJobView
} = require('../controllers/jobController');

const { protect, authorize } = require('../middleware/auth');
const { validateJob, validateJobUpdate } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', getAllJobs);
router.get('/featured', getFeaturedJobs);
router.get('/category/:category', getJobsByCategory);
router.get('/province/:provinceId', getJobsByProvince);
router.get('/search', searchJobs);
router.post('/:id/view', incrementJobView);

// Protected routes - Admin/HR only
router.use(protect);
router.use(authorize('admin', 'hr'));

// GET /api/jobs/my-jobs - Get user's own jobs (must be before /:id route)
router.get('/my-jobs', getMyJobs);

// POST /api/jobs - Create new job
router.post('/', upload.single('companyLogo'), validateJob, createJob);

// PUT /api/jobs/:id - Update job
router.put('/:id', upload.single('companyLogo'), validateJobUpdate, updateJob);

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', deleteJob);

// Bulk operations
router.put('/bulk/status', bulkUpdateJobStatus);
router.delete('/bulk', bulkDeleteJobs);

// GET /api/jobs/analytics - Get job analytics
router.get('/analytics', getJobAnalytics);

// Admin only routes
router.use(authorize('admin'));

// GET /api/jobs/stats - Get job statistics
router.get('/stats', getJobStats);

// POST /api/jobs/check-expired - Check and update expired jobs
router.post('/check-expired', checkAndUpdateExpiredJobs);

// PUT /api/jobs/:id/feature - Toggle job featured status
router.put('/:id/feature', toggleJobFeatured);

// Public job details route (moved to end to avoid conflicts with specific routes)
router.get('/:id', getJobById);

// Public routes (moved after protected routes to avoid conflicts)
router.get('/:id/similar', getSimilarJobs);

module.exports = router;