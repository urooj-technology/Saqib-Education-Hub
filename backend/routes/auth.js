const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  changePassword,
  logout
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

// Public routes
router.post('/register', validateUser, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-me', protect, validateUser, updateMe);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
