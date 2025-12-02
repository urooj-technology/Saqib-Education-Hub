'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Building,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Code,
  Edit,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import useAdd from '@/api/useAdd';
import useUpdate from '@/api/useUpdate';
import useFetchObjects from '@/api/useFetchObjects';
import { toast } from 'react-toastify';
import RichTextarea from '@/components/RichTextarea';

const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const contractTypes = ['permanent', 'contract', 'temporary', 'internship'];
const experienceLevels = ['entry', 'junior', 'mid-level', 'senior', 'lead', 'executive'];
const educationLevels = ['high-school', 'associate', 'bachelor', 'master', 'phd', 'any'];
const genderOptions = ['any', 'male', 'female'];


// Map old experience values to new ones for backward compatibility
const mapExperienceValue = (value) => {
  const mapping = {
    'mid': 'mid-level',
    'entry': 'entry',
    'junior': 'junior',
    'senior': 'senior',
    'lead': 'lead',
    'executive': 'executive'
  };
  return mapping[value] || 'entry';
};

// Get display value for experience dropdown
const getExperienceDisplayValue = (value) => {
  const displayMapping = {
    'mid': 'Mid Level',
    'entry': 'Entry',
    'junior': 'Junior',
    'mid-level': 'Mid Level',
    'senior': 'Senior',
    'lead': 'Lead',
    'executive': 'Executive'
  };
  return displayMapping[value] || 'Entry';
};

export default function UserCreateJob() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', description: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [addCompanyLoading, setAddCompanyLoading] = useState(false);
  const [canPostJob, setCanPostJob] = useState(true); // Start optimistic, will be updated when data loads
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Use your existing useAdd hook
  const { handleAdd, loading, success, error: addError } = useAdd(
    'jobs',
    token,
    null, // No automatic redirect, handle it manually
    '/user/dashboard',
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
    'Failed to update category'
  );

  // Fetch job categories using useFetchObjects
  const { data: categoriesData, refetch: refetchJobCategories } = useFetchObjects('job-categories', 'job-categories', token);

  // State for subscription info
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    plan: 'none',
    jobLimit: 0
  });

  // State for job category management
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({ name: '' });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);

  // Ref for dropdown click outside detection
  const dropdownRef = useRef(null);
  

  // Fetch subscription information
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!token) {
        setSubscriptionLoading(false);
        return;
      }
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/subscriptions/my-subscription` 
          : `${baseUrl}/api/subscriptions/my-subscription`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const subscriptionData = data.data;
          
          if (subscriptionData && subscriptionData.subscription) {
            const plan = subscriptionData.subscription.plan?.name || 'none';
            const jobLimit = subscriptionData.subscription.plan?.jobLimit || 0;
            
            setSubscriptionInfo({ plan, jobLimit });
            
            // Also use the canPostJob from API response if available
            if (typeof subscriptionData.canPostJob === 'boolean') {
              setCanPostJob(subscriptionData.canPostJob);
            }
          } else {
            setSubscriptionInfo({ plan: 'none', jobLimit: 0 });
            setCanPostJob(false);
          }
        } else {
          setSubscriptionInfo({ plan: 'none', jobLimit: 0 });
          setCanPostJob(false);
        }
      } catch (error) {
        console.error('Error fetching subscription info:', error);
        setSubscriptionInfo({ plan: 'none', jobLimit: 0 });
        setCanPostJob(false);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, [token]);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const provincesUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/provinces` 
          : `${baseUrl}/api/provinces`;
        const response = await fetch(provincesUrl);
        if (response.ok) {
          const data = await response.json();
          setProvinces(data.data?.provinces || []);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setProvincesLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch companies function
  const fetchCompanies = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const companiesUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/companies` 
        : `${baseUrl}/api/companies`;
      const response = await fetch(companiesUrl);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.data?.companies || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Note: Job limits checking is now handled in the subscription fetching useEffect above

  // Handle successful job creation
  useEffect(() => {
    if (success) {
      // Show success message
      toast.success('Job created successfully!');
      
      // Redirect to job list page after a short delay
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 1500);
    }
  }, [success, router]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_id: '',
    categoryId: '',
    type: 'full-time',
    contract_type: 'permanent',
    contract_duration: '',
    probation_period: '',
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
    deadline: '',
    status: 'draft',
    featured: false,
    number_of_vacancies: 1
  });

  // Handle content changes for rich text editors
  const handleDescriptionChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
    
    // Clear error when user starts typing
    if (errors.description) {
      setErrors(prev => ({
        ...prev,
        description: ''
      }));
    }
  };

  const handleSubmissionGuidelinesChange = (content) => {
    setFormData(prev => ({
      ...prev,
      submission_guidelines: content
    }));
  };

  const handleDutiesAndResponsibilitiesChange = (content) => {
    setFormData(prev => ({
      ...prev,
      duties_and_responsibilities: content
    }));
    
    // Clear error when user starts typing
    if (errors.duties_and_responsibilities) {
      setErrors(prev => ({
        ...prev,
        duties_and_responsibilities: ''
      }));
    }
  };

  const handleJobRequirementsChange = (content) => {
    setFormData(prev => ({
      ...prev,
      job_requirements: content
    }));
    
    // Clear error when user starts typing
    if (errors.job_requirements) {
      setErrors(prev => ({
        ...prev,
        job_requirements: ''
      }));
    }
  };

  const handleCompanyDescriptionChange = (content) => {
    setNewCompany(prev => ({
      ...prev,
      description: content
    }));
  };

  const [errors, setErrors] = useState({});


  // Fix any old experience values on component mount
  useEffect(() => {
    if (formData.experience === 'mid') {
      setFormData(prev => ({
        ...prev,
        experience: 'mid-level'
      }));
    }
  }, []); // Run only once on mount

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Redirect if user status is not active
  useEffect(() => {
    if (user && user.status !== 'active') {
      toast.error('Your account must be approved by admin to post jobs');
      router.push('/user/dashboard');
    }
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle experience value conversion
    let processedValue = value;
    if (name === 'experience') {
      processedValue = mapExperienceValue(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (showErrors = false) => {
    const newErrors = {};

    // Basic Information validation
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (!formData.company_id) newErrors.company_id = 'Company is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.province_id && (!formData.province_ids || formData.province_ids.length === 0)) {
      newErrors.province_id = 'Please select at least one location';
    }
    
    // Job Details validation
    if (!formData.salary_range.trim()) newErrors.salary_range = 'Salary range is required';
    if (!formData.duties_and_responsibilities.trim()) newErrors.duties_and_responsibilities = 'Duties and Responsibilities are required';
    if (!formData.job_requirements.trim()) newErrors.job_requirements = 'Job Requirements are required';
    if (!formData.education.trim()) newErrors.education = 'Education level is required';

    // Only set errors if explicitly requested (for submission)
    if (showErrors) {
      setErrors(newErrors);
    }
    
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canPostJob) {
      toast.error('You have reached your job posting limit for your subscription plan');
      return;
    }

    // Validate all fields before submission and show errors
    if (!validateForm(true)) {
      toast.error('Please fill in all required fields before submitting');
      return;
    }

    // Prepare data for API
    const jobData = {
      ...formData,
      authorId: user.id,
      status: 'draft', // User jobs start as draft
      // Convert ID fields to integers
      company_id: parseInt(formData.company_id),
      // Handle province selection - use first selected province as primary, or single province_id
      province_id: formData.province_ids && formData.province_ids.length > 0 ? formData.province_ids[0] : parseInt(formData.province_id),
      province_ids: formData.province_ids || [],
      // Ensure numeric fields are properly converted
      number_of_vacancies: parseInt(formData.number_of_vacancies) || 1,
      // Map old experience values to new ones
      experience: mapExperienceValue(formData.experience)
    };

    handleAdd(jobData);
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    setAddCompanyLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/companies` 
        : `${baseUrl}/api/companies`;
      
      // Create FormData for file upload - using same field name as admin
      const formData = new FormData();
      formData.append('name', newCompany.name);
      formData.append('description', newCompany.description || '');
      if (logoFile) {
        formData.append('companyLogo', logoFile); // Changed from 'logo' to 'companyLogo'
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}` // Changed from Bearer to Token
          // Don't set Content-Type, let browser set it for FormData
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Company creation response:', data);
        
        if (data.status === 'success') {
          // Refresh companies list
          await fetchCompanies();
          
          // Auto-select the new company
          const companyId = data.data?.company?.id || data.data?.id;
          if (companyId) {
            setFormData(prev => ({ 
              ...prev, 
              company_id: companyId 
            }));
          }
          
          // Reset form and close modal
          setShowAddCompanyModal(false);
          setNewCompany({ name: '', description: '' });
          setLogoFile(null);
          toast.success('Company added successfully!');
        } else {
          console.error('API returned error status:', data);
          toast.error(data.message || 'Failed to add company');
        }
      } else {
        const error = await response.json();
        console.error('HTTP error response:', error);
        toast.error(error.message || 'Failed to add company');
      }
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Failed to add company. Please try again.');
    } finally {
      setAddCompanyLoading(false);
    }
  };

  // Click outside detection for category dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle creating new job category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategoryData.name.trim()) {
      return;
    }

    try {
      const response = await handleAddCategory(newCategoryData);
      
      if (response && response.data && response.data.category) {
        // Auto-select the new category
        setFormData(prev => ({
          ...prev,
          categoryId: response.data.category.id
        }));
        
        // Reset form and close modal
        setShowAddCategoryModal(false);
        setNewCategoryData({ name: '' });
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
      setEditingCategory(null);
      setEditCategoryName('');
      refetchJobCategories();
    }
  };

  // Cancel edit category
  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
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
          // Handle specific error cases
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

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Not Approved</h1>
          <p className="text-gray-600 mb-4">Your account must be approved by admin to post jobs.</p>
          <button
            onClick={() => router.push('/user/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while subscription data is being fetched
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  // Show no subscription message only if we're sure user can't post jobs
  if (!canPostJob && !subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Briefcase className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Subscription Plan</h1>
          <p className="text-gray-600 mb-4">
            You need an active subscription plan to post jobs. Contact admin to get assigned a subscription plan.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Current plan: {subscriptionInfo.plan || 'None'}
          </p>
          <button
            onClick={() => router.push('/user/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/user/dashboard')}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Post New Job</h1>
                <p className="text-gray-600">Create a new job listing</p>
              </div>
            </div>
            
            {/* Subscription Info */}
            <div className="text-right">
              <p className="text-sm text-gray-500">Subscription Plan</p>
              <p className="text-lg font-semibold text-gray-900">
                {subscriptionInfo.plan ? subscriptionInfo.plan.charAt(0).toUpperCase() + subscriptionInfo.plan.slice(1) : 'None'}
              </p>
              <p className="text-xs text-gray-500">
                {subscriptionInfo.plan === 'none' ? 'No job posting allowed' :
                 subscriptionInfo.plan === 'basic' ? '5 jobs per month' :
                 subscriptionInfo.plan === 'premium' ? '20 jobs per month' :
                 subscriptionInfo.plan === 'enterprise' ? 'Unlimited jobs' : 'Contact admin'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning if user can't post jobs */}
        {!canPostJob && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Cannot Create Job</h3>
                <p className="text-sm text-red-700 mt-1">
                  {subscriptionInfo.plan === 'none' 
                    ? 'You need a subscription to post jobs. Please upgrade your account.'
                    : 'You have reached your job posting limit for your current subscription plan.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 space-y-8">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Software Engineer"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <RichTextarea
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Describe the job responsibilities and requirements..."
                minHeight="150px"
                className={errors.description ? 'border-red-300' : 'border-gray-300'}
                error={!!errors.description}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <div className="flex space-x-2">
                  <select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.company_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCompanyModal(true)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {errors.company_id && <p className="mt-1 text-sm text-red-600">{errors.company_id}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between ${
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
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Type
                </label>
                <select
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {contractTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contract Duration - Only show for contract type */}
              {(formData.contract_type === 'contract' || formData.type === 'contract') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Duration (Optional)
                  </label>
                  <input
                    type="text"
                    name="contract_duration"
                    value={formData.contract_duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 6 months, 1 year, 2 years"
                  />
                </div>
              )}

              {/* Probation Period - Only show for contract type */}
              {(formData.contract_type === 'contract' || formData.type === 'contract') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Probation Period (Optional)
                  </label>
                  <input
                    type="text"
                    name="probation_period"
                    value={formData.probation_period}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 3 months, 6 months"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Job Details & Requirements Section */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-indigo-600" />
              Job Details & Requirements
            </h2>

            {/* Salary and Experience Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
                Compensation & Experience
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="salary_range"
                    value={formData.salary_range}
                    onChange={handleInputChange}
                    placeholder="e.g., $50,000 - $70,000"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${
                      errors.salary_range ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.salary_range && <p className="mt-1 text-sm text-red-600">{errors.salary_range}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>
                        {getExperienceDisplayValue(level)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 3-5 years, 2+ years"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${
                      errors.education ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Education Level</option>
                    {educationLevels.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
                </div>
              </div>
            </div>

            {/* Job Requirements Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                Job Requirements
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duties & Responsibilities <span className="text-red-500">*</span>
                  </label>
                  <RichTextarea
                    value={formData.duties_and_responsibilities}
                    onChange={handleDutiesAndResponsibilitiesChange}
                    placeholder="List the main duties and responsibilities for this position..."
                    minHeight="200px"
                    className={errors.duties_and_responsibilities ? 'border-red-300' : 'border-gray-300'}
                    error={!!errors.duties_and_responsibilities}
                  />
                  {errors.duties_and_responsibilities && <p className="mt-1 text-sm text-red-600">{errors.duties_and_responsibilities}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Requirements <span className="text-red-500">*</span>
                  </label>
                  <RichTextarea
                    value={formData.job_requirements}
                    onChange={handleJobRequirementsChange}
                    placeholder="List the required skills, qualifications, and experience..."
                    minHeight="200px"
                    className={errors.job_requirements ? 'border-red-300' : 'border-gray-300'}
                    error={!!errors.job_requirements}
                  />
                  {errors.job_requirements && <p className="mt-1 text-sm text-red-600">{errors.job_requirements}</p>}
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                Additional Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Guidelines
                  </label>
                  <RichTextarea
                    value={formData.submission_guidelines}
                    onChange={handleSubmissionGuidelinesChange}
                    placeholder="Instructions for applicants on how to apply..."
                    minHeight="150px"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Vacancies
                    </label>
                    <input
                      type="number"
                      name="number_of_vacancies"
                      value={formData.number_of_vacancies}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      name="closing_date"
                      value={formData.closing_date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender Preference
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    {genderOptions.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-6 pt-8">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="remote"
                      checked={formData.remote}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Remote work available</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Feature this job</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Job...
                </div>
              ) : (
                'Create Job'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Add Company Modal - Matching Admin Design */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Company</h3>
              <button
                onClick={() => setShowAddCompanyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCompany} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter company name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <RichTextarea
                  value={newCompany.description}
                  onChange={handleCompanyDescriptionChange}
                  placeholder="Brief description of the company..."
                  minHeight="120px"
                  className="border-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
                </p>
                {logoFile && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">Selected: {logoFile.name}</p>
                    <div className="mt-1">
                      <img
                        src={URL.createObjectURL(logoFile)}
                        alt="Logo preview"
                        className="w-16 h-16 object-cover rounded border"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCompanyLoading || !newCompany.name.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {addCompanyLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Company'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Job Category</h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategoryData.name}
                  onChange={(e) => setNewCategoryData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
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
                  {createCategoryLoading ? 'Adding...' : 'Add Category'}
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
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateCategorySubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
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
  );
}