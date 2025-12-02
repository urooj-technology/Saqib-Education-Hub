const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  toggleJobStatus,
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
router.get('/my-jobs', protect, authorize('admin', 'hr'), getMyJobs); // Protected route for user's own jobs
router.get('/:id', getJobById); // Job details - public route
router.post('/:id/view', incrementJobView);
router.get('/:id/similar', getSimilarJobs);

// Protected routes - Admin/HR only
router.use(protect);
router.use(authorize('admin', 'hr'));

// POST /api/jobs - Create new job
router.post('/', upload.single('companyLogo'), validateJob, createJob);

// PUT /api/jobs/:id - Update job
router.put('/:id', upload.single('companyLogo'), validateJobUpdate, updateJob);

// PATCH /api/jobs/:id/toggle-status - Toggle job status
router.patch('/:id/toggle-status', toggleJobStatus);

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

module.exports = router;