const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/', createContact); // Create contact message

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllContacts); // Get all contact messages
router.get('/:id', getContactById); // Get single contact message
router.delete('/:id', deleteContact); // Delete contact message

module.exports = router;
