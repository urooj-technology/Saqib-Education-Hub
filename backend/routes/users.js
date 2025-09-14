const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  bulkUpdateUsers
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');
const { validateUser, validateUserUpdate } = require('../middleware/validation');

// Public routes (if any)
// router.get('/profile/:id', getUserProfile);

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin'));

// GET /api/users - Get all users with pagination, filtering, search
router.get('/', getAllUsers);

// GET /api/users/stats - Get user statistics
router.get('/stats', getUserStats);

// POST /api/users - Create new user
router.post('/', validateUser, createUser);

// PATCH /api/users/bulk - Bulk update users
router.patch('/bulk', bulkUpdateUsers);

// GET /api/users/:id - Get single user
router.get('/:id', getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', validateUserUpdate, updateUser);

// PATCH /api/users/:id - Update user (partial update)
router.patch('/:id', validateUserUpdate, updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;
