const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), (req, res) => {
  res.json({
    status: 'success',
    message: 'Dashboard stats endpoint',
    data: {
      users: 0,
      articles: 0,
      books: 0,
      videos: 0,
      jobs: 0,
      scholarships: 0
    }
  });
});

module.exports = router;