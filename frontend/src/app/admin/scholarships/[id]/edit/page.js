'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  GraduationCap,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Plus,
  X,
  Building,
  DollarSign,
  FileText,
  Award,
  CheckCircle,
  Info
} from 'lucide-react';
import AdminLayout from '../../../../../components/AdminLayout';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useFetchObject from '../../../../../api/useFetchObject';
import useUpdate from '../../../../../api/useUpdate';
import { useAuth } from '../../../../../context/AuthContext';

// Scholarship categories based on backend model
const categories = [
  'academic',
  'athletic', 
  'arts',
  'community_service',
  'leadership',
  'minority',
  'need_based',
  'merit_based',
  'research',
  'study_abroad',
  'graduate',
  'undergraduate',
  'other'
];

// Scholarship types based on backend model
const types = [
  'full_tuition',
  'partial_tuition',
  'room_board',
  'books_supplies',
  'travel',
  'stipend',
  'fellowship',
  'grant',
  'loan',
  'other'
];

// Education levels based on backend model
const levels = [
  'high_school',
  'undergraduate',
  'graduate',
  'phd',
  'postdoc',
  'professional',
  'other'
];

// Common countries
const countries = [
  'Afghanistan', 'United States', 'Canada', 'United Kingdom', 'Australia', 
  'Germany', 'France', 'Japan', 'South Korea', 'Netherlands', 'Sweden', 
  'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium',
  'Italy', 'Spain', 'Portugal', 'Ireland', 'New Zealand', 'Singapore',
  'Malaysia', 'Thailand', 'India', 'Pakistan', 'Bangladesh', 'Sri Lanka',
  'Nepal', 'Bhutan', 'Maldives', 'China', 'Hong Kong', 'Taiwan',
  'Philippines', 'Indonesia', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar',
  'Brazil', 'Argentina', 'Chile', 'Mexico', 'Colombia', 'Peru',
  'South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Morocco', 'Egypt',
  'Turkey', 'Russia', 'Ukraine', 'Poland', 'Czech Republic', 'Hungary',
  'Romania', 'Bulgaria', 'Croatia', 'Slovenia', 'Slovakia', 'Lithuania',
  'Latvia', 'Estonia', 'Iceland', 'Luxembourg', 'Malta', 'Cyprus'
];

// Currencies
const currencies = ['USD', 'EUR', 'GBP', 'AFN', 'PKR', 'CAD', 'AUD', 'JPY', 'KRW', 'SGD', 'HKD', 'CNY', 'INR'];

// Status options
const statuses = ['active', 'inactive', 'expired', 'draft'];

export default function EditScholarship() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const scholarshipId = params.id;

  // Use the custom hooks
  const { data: scholarshipData, isLoading, isError, error } = useFetchObject(
    'scholarship',
    'scholarships',
    scholarshipId,
    token
  );

  const { handleUpdate, loading: isSubmitting } = useUpdate(
    'scholarships',
    token,
    '/admin/scholarships',
    'Scholarship updated successfully!',
    'Failed to update scholarship'
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organization: '',
    category: 'academic',
    type: 'partial_tuition',
    level: 'undergraduate',
    country: 'Afghanistan',
    amount: '',
    currency: 'USD',
    status: 'active',
    deadline: ''
  });

  const [requirements, setRequirements] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [logo, setLogo] = useState(null);
  const [requirementInput, setRequirementInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');


  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when scholarship data is loaded
  useEffect(() => {
    if (scholarshipData?.data?.scholarship || scholarshipData?.data) {
      const scholarship = scholarshipData.data.scholarship || scholarshipData.data;
      setFormData({
        title: scholarship.title || '',
        description: scholarship.description || '',
        organization: scholarship.organization || '',
        category: scholarship.category || 'academic',
        type: scholarship.type || 'partial_tuition',
        level: scholarship.level || 'undergraduate',
        country: scholarship.country || 'Afghanistan',
        amount: scholarship.amount || '',
        currency: scholarship.currency || 'USD',
        status: scholarship.status || 'active',
        deadline: scholarship.deadline || ''
      });
      
      // Set requirements and benefits arrays
      if (scholarship.requirements && Array.isArray(scholarship.requirements)) {
        setRequirements(scholarship.requirements);
      }
      if (scholarship.benefits && Array.isArray(scholarship.benefits)) {
        setBenefits(scholarship.benefits);
      }
    }
  }, [scholarshipData]);

  // Check for changes
  useEffect(() => {
    if (scholarshipData?.data?.scholarship || scholarshipData?.data) {
      const scholarship = scholarshipData.data.scholarship || scholarshipData.data;
      const hasFormChanges = 
        formData.title !== (scholarship.title || '') ||
        formData.description !== (scholarship.description || '') ||
        formData.organization !== (scholarship.organization || '') ||
        formData.category !== (scholarship.category || 'academic') ||
        formData.type !== (scholarship.type || 'partial_tuition') ||
        formData.level !== (scholarship.level || 'undergraduate') ||
        formData.country !== (scholarship.country || 'Afghanistan') ||
        formData.amount !== (scholarship.amount || '') ||
        formData.currency !== (scholarship.currency || 'USD') ||
        formData.status !== (scholarship.status || 'active') ||
        formData.deadline !== (scholarship.deadline || '') ||
        logo !== null;
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, scholarshipData, logo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
    }
  };

  const addRequirement = () => {
    if (requirementInput.trim() && !requirements.includes(requirementInput.trim())) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (requirementToRemove) => {
    setRequirements(requirements.filter(req => req !== requirementToRemove));
  };

  const addBenefit = () => {
    if (benefitInput.trim() && !benefits.includes(benefitInput.trim())) {
      setBenefits([...benefits, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  const removeBenefit = (benefitToRemove) => {
    setBenefits(benefits.filter(benefit => benefit !== benefitToRemove));
  };

  const formatCategoryLabel = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTypeLabel = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatLevelLabel = (level) => {
    return level.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!formData.level) {
      newErrors.level = 'Level is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (formData.amount && (isNaN(formData.amount) || parseFloat(formData.amount) < 0)) {
      newErrors.amount = 'Amount must be a valid positive number';
    }

    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    if (requirements.length === 0) {
      newErrors.requirements = 'At least one requirement is required';
    }

    if (benefits.length === 0) {
      newErrors.benefits = 'At least one benefit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare form data for multipart upload
    const updateData = new FormData();
    
    // Add scholarship data
    Object.keys(formData).forEach(key => {
      updateData.append(key, formData[key]);
    });

    // Add requirements and benefits as JSON strings
    updateData.append('requirements', JSON.stringify(requirements));
    updateData.append('benefits', JSON.stringify(benefits));

    // Add logo file if selected
    if (logo) {
      updateData.append('logo', logo);
    }

    // Send FormData directly (don't convert to object)
    handleUpdate(scholarshipId, updateData);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this scholarship? This action cannot be undone.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/scholarships/${scholarshipId}` 
          : `${baseUrl}/api/scholarships/${scholarshipId}`;

        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          alert('Scholarship deleted successfully!');
          router.push('/admin/scholarships');
        } else {
          throw new Error('Failed to delete scholarship');
        }
      } catch (error) {
        console.error('Error deleting scholarship:', error);
        alert('Error deleting scholarship. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Scholarship">
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Scholarship</h2>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Failed to load scholarship data'}
            </p>
            <Link
              href="/admin/scholarships"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scholarships
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Scholarship">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/scholarships"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Scholarships
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Scholarship</h1>
              <p className="text-gray-600">Update scholarship information and details</p>
            </div>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Scholarship
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scholarship Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Fulbright Scholarship Program"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Provide a detailed description of the scholarship opportunity..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.organization ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Fulbright Commission"
                    />
                    {errors.organization && (
                      <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.category ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {formatCategoryLabel(category)}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.type ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {types.map(type => (
                          <option key={type} value={type}>
                            {formatTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Education Level <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.level ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {levels.map(level => (
                          <option key={level} value={level}>
                            {formatLevelLabel(level)}
                          </option>
                        ))}
                      </select>
                      {errors.level && (
                        <p className="mt-1 text-sm text-red-600">{errors.level}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.country ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Financial Details & Requirements */}
            <div className="space-y-6">
              {/* Financial Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Financial Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.amount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="50000"
                      />
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                    <input
                      type="datetime-local"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.deadline ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.deadline && (
                      <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Requirements
                </h3>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Minimum 3.5 GPA"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {errors.requirements && (
                    <p className="text-sm text-red-600">{errors.requirements}</p>
                  )}
                  
                  <div className="space-y-2">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700">{requirement}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(requirement)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                  Benefits
                </h3>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Full tuition coverage"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    />
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {errors.benefits && (
                    <p className="text-sm text-red-600">{errors.benefits}</p>
                  )}
                  
                  <div className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => removeBenefit(benefit)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Logo Upload & Preview */}
            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-purple-600" />
                  Organization Logo
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {logo ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">{logo.name}</p>
                      <button
                        type="button"
                        onClick={() => setLogo(null)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto w-12 h-12 text-gray-400" />
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Upload organization logo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Preview
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Title:</strong> {formData.title || 'Not set'}</p>
                  <p><strong>Organization:</strong> {formData.organization || 'Not set'}</p>
                  <p><strong>Category:</strong> {formData.category ? formatCategoryLabel(formData.category) : 'Not set'}</p>
                  <p><strong>Type:</strong> {formData.type ? formatTypeLabel(formData.type) : 'Not set'}</p>
                  <p><strong>Level:</strong> {formData.level ? formatLevelLabel(formData.level) : 'Not set'}</p>
                  <p><strong>Country:</strong> {formData.country || 'Not set'}</p>
                  <p><strong>Amount:</strong> {formData.amount ? `${formData.currency} ${parseFloat(formData.amount).toLocaleString()}` : 'Not specified'}</p>
                  <p><strong>Status:</strong> {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Not set'}</p>
                  <p><strong>Requirements:</strong> {requirements.length}</p>
                  <p><strong>Benefits:</strong> {benefits.length}</p>
                  <p><strong>Deadline:</strong> {formData.deadline ? new Date(formData.deadline).toLocaleDateString() : 'Not set'}</p>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Tips for Success
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Be specific and clear in your description</li>
                  <li>• Include all important requirements</li>
                  <li>• Highlight key benefits and opportunities</li>
                  <li>• Set realistic deadlines</li>
                  <li>• Use an attractive organization logo</li>
                </ul>
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
                href="/admin/scholarships"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !hasChanges}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update Scholarship
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
