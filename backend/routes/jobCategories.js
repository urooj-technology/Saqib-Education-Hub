const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllJobCategories,
  getJobCategoryById,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
  getJobsByCategory
} = require('../controllers/jobCategoryController');

// Import middleware
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllJobCategories);
router.get('/:id', getJobCategoryById);
router.get('/:id/jobs', getJobsByCategory);

// Protected routes - Admin only
router.use(protect);

router.post('/', createJobCategory);
router.put('/:id', updateJobCategory);
router.delete('/:id', deleteJobCategory);

module.exports = router;
