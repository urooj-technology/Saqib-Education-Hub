'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Upload, 
  Briefcase,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Plus,
  X,
  Edit,
  ChevronDown
} from 'lucide-react';
import AdminLayout from '../../../../../components/AdminLayout';
import RichTextarea from '../../../../../components/RichTextarea';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useFetchObject from '../../../../../api/useFetchObject';
import useFetchObjects from '../../../../../api/useFetchObjects';
import useUpdate from '../../../../../api/useUpdate';
import useAdd from '../../../../../api/useAdd';
import { useAuth } from '../../../../../context/AuthContext';
import { toast } from 'react-toastify';

const jobTypes = [
  'full-time',
  'part-time', 
  'contract',
  'internship',
  'freelance'
];

const contractTypes = [
  'permanent',
  'temporary',
  'contract',
  'internship'
];

const experienceLevels = [
  'entry',
  'junior',
  'mid-level',
  'senior',
  'lead',
  'executive'
];

// Categories will be fetched from API

const statuses = [
  'active',
  'inactive',
  'expired',
  'filled',
  'draft'
];

export default function EditJob() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const jobId = params.id;

  // Use the custom hooks
  const { data: jobData, isLoading, isError, error } = useFetchObject(
    'job',
    'jobs',
    jobId,
    token
  );

  // Fetch job categories
  const { data: categoriesData, refetch: refetchJobCategories } = useFetchObjects('job-categories', 'job-categories', token);
  
  // Debug categories data
  // console.log('Categories data:', categoriesData);

  const { handleUpdate, loading: isSubmitting } = useUpdate(
    'jobs',
    token,
    '/admin/jobs',
    'Job updated successfully!',
    'Failed to update job'
  );

  // Hook for creating new job categories
  const { handleAdd: handleAddCategory, loading: createCategoryLoading } = useAdd(
    'job-categories',
    token,
    null,
    'Category created successfully!',
    'Failed to create category'
  );

  // Hook for updating job categories
  const { handleUpdate: handleUpdateCategory, loading: updateCategoryLoading } = useUpdate(
    'job-categories',
    token,
    null,
    'Category updated successfully!',
    'Failed to update category',
    () => {
      setEditingCategory(null);
      setEditCategoryName('');
      refetchJobCategories();
    }
  );

  // State for delete category loading
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_id: '',
    categoryId: '',
    type: 'full-time',
    contract_type: 'permanent',
    province_id: '',
    remote: false,
    salary_range: '',
    currency: 'USD',
    experience: 'entry',
    years_of_experience: '',
    submission_guidelines: '',
    education: '',
    gender: 'any',
    duties_and_responsibilities: '',
    job_requirements: '',
    closing_date: '',
    status: 'draft',
    featured: false,
    number_of_vacancies: 1
  });

  const [companies, setCompanies] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // State for adding new job categories
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: ''
  });

  // State for custom category dropdown
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState(null);
  
  // Ref for dropdown click outside detection
  const dropdownRef = useRef(null);


  // Fetch companies and provinces
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
        
        // Fetch companies
        const companiesUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/companies` 
          : `${baseUrl}/api/companies`;
        
        const companiesResponse = await fetch(companiesUrl, {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          setCompanies(companiesData.data?.companies || []);
        }

        // Fetch provinces
        const provincesUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/provinces` 
          : `${baseUrl}/api/provinces`;
        
        const provincesResponse = await fetch(provincesUrl, {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (provincesResponse.ok) {
          const provincesData = await provincesResponse.json();
          setProvinces(provincesData.data?.provinces || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  // Helper function to decode HTML entities
  const decodeHtmlEntities = (html) => {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Update form data when job data is loaded
  useEffect(() => {
    if (jobData?.data?.job || jobData?.data) {
      const job = jobData.data.job || jobData.data;
      
      // Use the first description field (the one with proper HTML) and decode HTML entities
      const description = job.description || '';
      const submissionGuidelines = job.submission_guidelines || '';
      const dutiesAndResponsibilities = job.duties_and_responsibilities || '';
      const jobRequirements = job.job_requirements || '';
      
      
      const newFormData = {
        title: job.title || '',
        description: decodeHtmlEntities(description),
        company_id: job.company_id || '',
        categoryId: job.categoryId || job.category || '',
        type: job.type || 'full-time',
        contract_type: job.contract_type || 'permanent',
        province_id: job.province_id || '',
        remote: job.remote || false,
        salary_range: job.salary_range || '',
        currency: job.currency || 'USD',
        experience: job.experience || 'entry',
        years_of_experience: job.years_of_experience || '',
        submission_guidelines: decodeHtmlEntities(submissionGuidelines),
        education: job.education || '',
        gender: job.gender || 'any',
        duties_and_responsibilities: decodeHtmlEntities(dutiesAndResponsibilities),
        job_requirements: decodeHtmlEntities(jobRequirements),
        closing_date: job.closing_date ? job.closing_date.split('T')[0] : '',
        status: job.status || 'draft',
        featured: job.featured || false,
        number_of_vacancies: job.number_of_vacancies || 1
      };
      
      
      setFormData(newFormData);
    }
  }, [jobData]);

  // Check for changes
  useEffect(() => {
    if (jobData?.data?.job || jobData?.data) {
      const job = jobData.data.job || jobData.data;
      const hasFormChanges = 
        formData.title !== (job.title || '') ||
        formData.description !== (job.description || '') ||
        formData.company_id !== (job.company_id || '') ||
        formData.categoryId !== (job.categoryId || job.category || '') ||
        formData.type !== (job.type || 'full-time') ||
        formData.contract_type !== (job.contract_type || 'permanent') ||
        formData.province_id !== (job.province_id || '') ||
        formData.remote !== (job.remote || false) ||
        formData.salary_range !== (job.salary_range || '') ||
        formData.currency !== (job.currency || 'USD') ||
        formData.experience !== (job.experience || 'entry') ||
        formData.years_of_experience !== (job.years_of_experience || '') ||
        formData.education !== (job.education || '') ||
        formData.gender !== (job.gender || 'any') ||
        formData.requirements !== (job.requirements || '') ||
        formData.job_requirements !== (job.job_requirements || '') ||
        formData.closing_date !== (job.closing_date || '') ||
        formData.status !== (job.status || 'draft') ||
        formData.featured !== (job.featured || false) ||
        formData.number_of_vacancies !== (job.number_of_vacancies || 1);
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, jobData]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (!formData.company_id) {
      newErrors.company_id = 'Please select a company';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.province_id) {
      newErrors.province_id = 'Please select a location';
    }

    if (formData.number_of_vacancies && parseInt(formData.number_of_vacancies) < 1) {
      newErrors.number_of_vacancies = 'Number of vacancies must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Transform form data to match backend validation expectations
    const updateData = {
      ...formData,
      // Convert ID fields to integers
      company_id: parseInt(formData.company_id),
      categoryId: parseInt(formData.categoryId), // Ensure categoryId is converted to integer
      province_id: formData.province_id ? parseInt(formData.province_id) : null,
      province_ids: formData.province_ids || [],
      // Keep requirements and benefits as HTML strings
      duties_and_responsibilities: formData.duties_and_responsibilities || '',
      job_requirements: formData.job_requirements || '',
      // Ensure numeric fields are properly converted
      number_of_vacancies: parseInt(formData.number_of_vacancies) || 1,
      years_of_experience: formData.years_of_experience || '',
      submission_guidelines: formData.submission_guidelines || '',
      // Keep salary_range as text (no conversion to number)
      salary_range: formData.salary_range || null
    };

    try {
      await handleUpdate(jobId, updateData);
    } catch (error) {
      console.error('Error in handleUpdate:', error);
    }
  };

  // Handle creating new job category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategoryData.name.trim()) {
      return;
    }

    try {
      const response = await handleAddCategory(newCategoryData);
      
      if (response && response.data && response.data.category) {
        // Close modal and reset form
        setShowAddCategoryModal(false);
        setNewCategoryData({ name: '' });
        
        // Set the new category as selected
        setFormData(prev => ({
          ...prev,
          categoryId: response.data.category.id
        }));
        
        // Refetch categories to update the dropdown
        refetchJobCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  // Handle editing category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
  };

  // Handle updating category
  const handleUpdateCategorySubmit = (e) => {
    e.preventDefault();
    if (editCategoryName.trim() && editingCategory) {
      handleUpdateCategory(editingCategory.id, { name: editCategoryName.trim() });
    }
  };

  // Cancel edit category
  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  // Cancel delete category
  const cancelDeleteCategory = () => {
    setDeleteConfirmCategory(null);
  };

  // Handle deleting category
  const handleDeleteCategoryClick = (category) => {
    setDeleteConfirmCategory(category);
  };

  // Confirm delete category
  const confirmDeleteCategory = async () => {
    if (deleteConfirmCategory) {
      setDeleteCategoryLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/job-categories/${deleteConfirmCategory.id}` 
          : `${baseUrl}/api/job-categories/${deleteConfirmCategory.id}`;
        
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setDeleteConfirmCategory(null);
          refetchJobCategories();
          // Show success toast message
          toast.success('Category deleted successfully!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          const errorData = await response.json();
          // Handle specific error cases
          if (response.status === 400 && errorData.message && errorData.message.includes('job(s) are using this category')) {
            toast.error('Cannot delete category - it\'s being used by jobs. Please reassign those jobs to another category first.', {
              position: "top-right",
              autoClose: 7000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          } else {
            toast.error(`Failed to delete category: ${errorData.message || 'Unknown error'}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Error deleting category. Please try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setDeleteCategoryLoading(false);
      }
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoryId: categoryId
    }));
    setShowCategoryDropdown(false);
  };

  // Debug dropdown state
  // console.log('Show category dropdown:', showCategoryDropdown);
  // console.log('Categories available:', categoriesData?.data?.categories?.length || 0);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/jobs/${jobId}` 
          : `${baseUrl}/api/jobs/${jobId}`;

        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          toast.success('Job deleted successfully!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          router.push('/admin/jobs');
        } else {
          throw new Error('Failed to delete job');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Error deleting job. Please try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Job">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout title="Error">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job</h2>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Failed to load job data'}
            </p>
            <Link
              href="/admin/jobs"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/admin/jobs"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Edit Job
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Update job information and requirements
            </p>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Job
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter job title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <RichTextarea
                    value={formData.description}
                    onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                    placeholder="Enter job description..."
                    minHeight="200px"
                    error={!!errors.description}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryModal(true)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Category
                      </button>
                    </div>
                    {/* Custom Category Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between ${
                          errors.categoryId ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <span className="text-left">
                          {formData.categoryId 
                            ? categoriesData?.data?.categories?.find(cat => cat.id == formData.categoryId)?.name || 'Select Category'
                            : 'Select Category'
                          }
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      {showCategoryDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {categoriesData?.data?.categories?.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No categories available - Create one above
                            </div>
                          ) : (
                            categoriesData?.data?.categories?.map(category => (
                              <div key={category.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelect(category.id)}
                                  className="flex-1 text-left text-sm text-gray-900 hover:text-indigo-600"
                                >
                                  {category.name}
                                </button>
                                <div className="flex items-center space-x-1 ml-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditCategory(category);
                                    }}
                                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                    title="Edit category"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCategoryClick(category);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete category"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Type
                    </label>
                    <select
                      name="contract_type"
                      value={formData.contract_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {contractTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.company_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                    {errors.company_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.company_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province_id"
                      value={formData.province_id}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.province_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Location</option>
                      {provinces.map(province => (
                        <option key={province.id} value={province.id}>{province.name}</option>
                      ))}
                    </select>
                    {errors.province_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.province_id}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details & Requirements</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="salary_range"
                        value={formData.salary_range}
                        onChange={handleInputChange}
                        className={`flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.salary_range ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 10000 to 40000, As per company scale, Negotiable"
                      />
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="AFN">AFN</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter salary range as text (e.g., "10000 to 40000", "As per company scale", "Negotiable")
                    </p>
                    {errors.salary_range && (
                      <p className="mt-1 text-sm text-red-600">{errors.salary_range}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="text"
                      name="years_of_experience"
                      value={formData.years_of_experience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 5 to 7, 5-7, 2+ years, 3-5 years"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter experience range (e.g., "5 to 7", "5-7", "2+ years")
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submission Guidelines</label>
                    <RichTextarea
                      value={formData.submission_guidelines}
                      onChange={(content) => setFormData(prev => ({ ...prev, submission_guidelines: content }))}
                      placeholder="Enter submission guidelines..."
                      minHeight="150px"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Instructions for applicants on how to apply
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Vacancies</label>
                    <input
                      type="number"
                      name="number_of_vacancies"
                      value={formData.number_of_vacancies}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.number_of_vacancies ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 1"
                    />
                    {errors.number_of_vacancies && (
                      <p className="mt-1 text-sm text-red-600">{errors.number_of_vacancies}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Education Level</option>
                      <option value="high-school">High School</option>
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="any">Any Gender</option>
                      <option value="male">Male Only</option>
                      <option value="female">Female Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline (Optional)</label>
                    <input
                      type="date"
                      name="closing_date"
                      value={formData.closing_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="remote"
                      id="remote"
                      checked={formData.remote}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remote" className="ml-2 block text-sm text-gray-900">
                      Remote work available
                    </label>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      id="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Featured job listing
                    </label>
                  </label>
                </div>
              </div>
            </div>

            {/* Requirements and Benefits */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements and Benefits</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duties and Responsibilities (Optional)</label>
                  <RichTextarea
                    key={`duties-${formData.duties_and_responsibilities}`}
                    value={formData.duties_and_responsibilities}
                    onChange={(content) => setFormData(prev => ({ ...prev, duties_and_responsibilities: content }))}
                    placeholder="Enter duties and responsibilities..."
                    minHeight="150px"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Requirements (Optional)</label>
                  <RichTextarea
                    key={`requirements-${formData.job_requirements}`}
                    value={formData.job_requirements}
                    onChange={(content) => setFormData(prev => ({ ...prev, job_requirements: content }))}
                    placeholder="Enter job requirements..."
                    minHeight="150px"
                  />
                </div>

              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {hasChanges && (
                  <span className="text-orange-600">You have unsaved changes</span>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/jobs"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !hasChanges}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Update Job
                    </>
                  )}
                </button>
              </div>
            </div>
            </form>
          </div>
        </div>

        {/* Add Category Modal */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add New Job Category</h3>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateCategory} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newCategoryData.name}
                    onChange={(e) => setNewCategoryData({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCategoryLoading || !newCategoryData.name.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {createCategoryLoading ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Edit Job Category</h3>
                <button
                  onClick={cancelEditCategory}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateCategorySubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEditCategory}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateCategoryLoading || !editCategoryName.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updateCategoryLoading ? 'Updating...' : 'Update Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Category Confirmation Modal */}
        {deleteConfirmCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center mb-4 p-4 border-b border-gray-200">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{deleteConfirmCategory.name}"? This action cannot be undone.
                  If there are jobs using this category, you'll need to reassign them first.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDeleteCategory}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteCategory}
                    disabled={deleteCategoryLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleteCategoryLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
