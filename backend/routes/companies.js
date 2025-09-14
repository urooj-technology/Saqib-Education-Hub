const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyJobs,
  searchCompanies,
  getCompanyStats
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError, getFileUrl } = require('../middleware/upload');

// Public routes
router.get('/', getAllCompanies);
router.get('/search', searchCompanies);
router.get('/stats', protect, authorize('admin'), getCompanyStats);
router.get('/:id', getCompanyById);
router.get('/:id/jobs', getCompanyJobs);

// Company creation routes
router.post('/', upload.single('companyLogo'), handleMulterError, createCompany); // Public access for job posting
router.put('/:id', protect, authorize('admin'), upload.single('companyLogo'), handleMulterError, updateCompany);
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;
