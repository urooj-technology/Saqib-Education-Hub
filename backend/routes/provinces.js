const express = require('express');
const router = express.Router();
const {
  getAllProvinces,
  getProvinceById,
  createProvince,
  updateProvince,
  deleteProvince
} = require('../controllers/provinceController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllProvinces);
router.get('/:id', getProvinceById);

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin'));

// POST /api/provinces - Create new province
router.post('/', createProvince);

// PUT /api/provinces/:id - Update province
router.put('/:id', updateProvince);

// DELETE /api/provinces/:id - Delete province
router.delete('/:id', deleteProvince);

module.exports = router;
