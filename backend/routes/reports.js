const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// All report routes require authentication and admin access
router.use(protect);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Reports API is working',
    timestamp: new Date()
  });
});

// Dashboard statistics
router.get('/dashboard-stats', reportController.getDashboardStats);

// Monthly data for charts
router.get('/monthly-data', reportController.getMonthlyData);

// Category distribution
router.get('/category-distribution', reportController.getCategoryDistribution);

// Recent activities
router.get('/recent-activities', reportController.getRecentActivities);

// Top performing content
router.get('/top-content', reportController.getTopContent);

module.exports = router;
