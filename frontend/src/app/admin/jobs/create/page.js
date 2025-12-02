'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Star, 
  Check, 
  AlertCircle,
  Save,
  X,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import RichTextarea from '@/components/RichTextarea';
import useAdd from '@/api/useAdd';
import useUpdate from '@/api/useUpdate';
import useFetchObjects from '@/api/useFetchObjects';
import { useAuth } from '@/context/AuthContext';
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

export default function AdminCreateJob() {
  const router = useRouter();
  const auth = useAuth();
  const token = auth.token;
  
  const { handleAdd, loading: isSubmitting, success } = useAdd(
    'jobs',
    token,
    '/admin/jobs',
    'Job created successfully!',
    'Failed to create job'
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

  // Fetch companies, provinces, and job categories using useFetchObjects
  const { data: companiesData, refetch: refetchCompanies } = useFetchObjects('companies', 'companies', token);
  const { data: provincesData } = useFetchObjects('provinces', 'provinces', token);
  const { data: categoriesData, refetch: refetchJobCategories } = useFetchObjects('job-categories', 'job-categories', token);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_id: '',
    categoryId: '',
    type: 'full-time',
    contract_type: 'permanent',
    province_id: '',
    province_ids: [],
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
    status: 'active',
    featured: false,
    number_of_vacancies: 1
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  
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
  
  // Extract companies and provinces from fetched data
  const companies = companiesData?.data?.companies || [];
  const provinces = provincesData?.data?.provinces || [];

  // State for new company creation
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: ''
  });

  // State for subscription information
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Handle successful job creation - redirect to jobs list
  useEffect(() => {
    if (success) {
      // Redirect to jobs list page after a short delay to allow success message to show
      setTimeout(() => {
        router.push('/admin/jobs');
      }, 1500);
    }
  }, [success, router]);

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

  const handleNewCompanyChange = (e) => {
    const { name, value } = e.target;
    setNewCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
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

    if (!formData.province_id && (!formData.province_ids || formData.province_ids.length === 0)) {
      newErrors.province_id = 'Please select at least one location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (formData.number_of_vacancies && parseInt(formData.number_of_vacancies) < 1) {
      newErrors.number_of_vacancies = 'Number of vacancies must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    if (currentStep === 1) {
      return validateStep1();
    } else if (currentStep === 2) {
      return validateStep2();
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setErrors({}); // Clear all errors when moving to step 2
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setErrors({}); // Clear all errors when going back to step 1
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Transform form data to match backend validation expectations
    const jobData = {
      ...formData,
      // Convert ID fields to integers
      company_id: parseInt(formData.company_id),
      // Handle province selection - use first selected province as primary, or single province_id
      province_id: formData.province_ids && formData.province_ids.length > 0 ? formData.province_ids[0] : parseInt(formData.province_id),
      province_ids: formData.province_ids || [],
      // Ensure numeric fields are properly converted
      number_of_vacancies: parseInt(formData.number_of_vacancies) || 1,
      // Keep salary_range as text (no conversion to number)
      salary_range: formData.salary_range || null
    };

    handleAdd(jobData);
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

  const handleCreateCompany = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/companies` 
        : `${baseUrl}/api/companies`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(newCompany),
      });

      if (response.ok) {
        const companyData = await response.json();
        // Refetch companies to update the list
        await refetchCompanies();
        // Set the newly created company as selected
        setFormData(prev => ({ ...prev, company_id: companyData.data.company.id }));
        setShowNewCompanyForm(false);
        setNewCompany({
          name: '',
          description: '',
          website: '',
          email: '',
          phone: '',
          address: ''
        });
      } else {
        throw new Error('Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Error creating company. Please try again.');
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
          toast.error(`Failed to delete category: ${errorData.message || 'Unknown error'}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
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

  // Cancel edit category
  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  // Cancel delete category
  const cancelDeleteCategory = () => {
    setDeleteConfirmCategory(null);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoryId: categoryId
    }));
    setShowCategoryDropdown(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Job</h1>
            <p className="text-sm sm:text-base text-gray-600">Add a new job posting to the platform</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center w-full max-w-2xl">
              {/* Step 1 */}
              <div className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > 1 ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : '1'}
                </div>
                <div className="ml-2 sm:ml-3 hidden sm:block">
                  <p className={`text-xs font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                    Step 1
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">Basic Information</p>
                </div>
              </div>

              {/* Divider */}
              <div className={`flex-1 h-1 mx-2 sm:mx-4 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`} />

              {/* Step 2 */}
              <div className="flex items-center flex-1 justify-end">
                <div className="mr-2 sm:mr-3 hidden sm:block text-right">
                  <p className={`text-xs font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                    Step 2
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">Job Details</p>
                </div>
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Step Labels */}
          <div className="flex sm:hidden justify-center mt-3 gap-4">
            <div className="text-center">
              <p className={`text-xs font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                Basic Info
              </p>
            </div>
            <div className="text-center">
              <p className={`text-xs font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                Job Details
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
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
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
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
                              Add
                            </button>
                          </div>
                          {/* Custom Category Dropdown */}
                          <div className="relative" ref={dropdownRef}>
                            <button
                              type="button"
                              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between text-sm sm:text-base ${
                                errors.categoryId ? 'border-red-300' : 'border-gray-300'
                              }`}
                            >
                              <span className="text-left truncate">
                                {formData.categoryId 
                                  ? categoriesData?.data?.categories?.find(cat => cat.id == formData.categoryId)?.name || 'Select Category'
                                  : 'Select Category'
                                }
                              </span>
                              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          >
                            {statuses.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <select
                              name="company_id"
                              value={formData.company_id}
                              onChange={handleInputChange}
                              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                                errors.company_id ? 'border-red-300' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Select Company</option>
                              {companies.map(company => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setShowNewCompanyForm(true)}
                              className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm whitespace-nowrap"
                            >
                              <Plus className="w-4 h-4 sm:mr-1" />
                              <span className="hidden sm:inline">New</span>
                            </button>
                          </div>
                          {errors.company_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.company_id}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location(s) <span className="text-red-500">*</span>
                          </label>
                          <div className="border border-gray-300 rounded-lg p-2 sm:p-3 max-h-48 overflow-y-auto">
                            {provinces.map(province => (
                              <label key={province.id} className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded px-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={province.id}
                                  checked={formData.province_ids.includes(province.id)}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (e.target.checked) {
                                      setFormData(prev => ({
                                        ...prev,
                                        province_ids: [...prev.province_ids, value]
                                      }));
                                    } else {
                                      setFormData(prev => ({
                                        ...prev,
                                        province_ids: prev.province_ids.filter(id => id !== value)
                                      }));
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs sm:text-sm text-gray-700">{province.name}</span>
                              </label>
                            ))}
                          </div>
                          {formData.province_ids.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600">Selected locations:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {formData.province_ids.map(provinceId => {
                                  const province = provinces.find(p => p.id === provinceId);
                                  return (
                                    <span
                                      key={provinceId}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                    >
                                      {province?.name}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormData(prev => ({
                                            ...prev,
                                            province_ids: prev.province_ids.filter(id => id !== provinceId)
                                          }));
                                        }}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {errors.province_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.province_id}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Job Details & Requirements */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Job Details & Requirements</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                          <select
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                              placeholder="e.g., 10000 to 40000"
                            />
                            <select
                              name="currency"
                              value={formData.currency}
                              onChange={handleInputChange}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            >
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                              <option value="AFN">AFN</option>
                            </select>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            e.g., "10000 to 40000", "As per company scale", "Negotiable"
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                          <input
                            type="text"
                            name="years_of_experience"
                            value={formData.years_of_experience}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            placeholder="e.g., 5 to 7, 2+ years"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            e.g., "5 to 7", "2+ years"
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
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Submission Guidelines</label>
                        <RichTextarea
                          value={formData.submission_guidelines}
                          onChange={(content) => setFormData(prev => ({ ...prev, submission_guidelines: content }))}
                          placeholder="Enter submission guidelines..."
                          minHeight="150px"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Instructions for applicants on how to apply
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
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
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Detailed Description</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duties and Responsibilities (Optional)</label>
                        <RichTextarea
                          value={formData.duties_and_responsibilities}
                          onChange={(content) => setFormData(prev => ({ ...prev, duties_and_responsibilities: content }))}
                          placeholder="Enter duties and responsibilities..."
                          minHeight="150px"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Requirements (Optional)</label>
                        <RichTextarea
                          value={formData.job_requirements}
                          onChange={(content) => setFormData(prev => ({ ...prev, job_requirements: content }))}
                          placeholder="Enter job requirements..."
                          minHeight="150px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/jobs')}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  {currentStep === 2 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </button>
                  )}
                  
                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Create Job
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* New Company Modal */}
        {showNewCompanyForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Create New Company</h3>
                  <button
                    onClick={() => setShowNewCompanyForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newCompany.name}
                      onChange={handleNewCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <RichTextarea
                      value={newCompany.description}
                      onChange={(content) => setNewCompany(prev => ({ ...prev, description: content }))}
                      placeholder="Enter company description..."
                      minHeight="150px"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        name="website"
                        value={newCompany.website}
                        onChange={handleNewCompanyChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newCompany.email}
                        onChange={handleNewCompanyChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={newCompany.phone}
                        onChange={handleNewCompanyChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={newCompany.address}
                        onChange={handleNewCompanyChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowNewCompanyForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCompany}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Create Company
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Add New Job Category</h3>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCategoryLoading || !newCategoryData.name.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Edit Job Category</h3>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEditCategory}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateCategoryLoading || !editCategoryName.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center mb-4 p-4 border-b border-gray-200">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mr-3" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Delete Category</h3>
              </div>
              <div className="p-4">
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Are you sure you want to delete "{deleteConfirmCategory.name}"? This action cannot be undone.
                  If there are jobs using this category, you'll need to reassign them first.
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={cancelDeleteCategory}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteCategory}
                    disabled={deleteCategoryLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
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
