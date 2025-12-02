'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Upload, 
  GraduationCap,
  ArrowLeft,
  Plus,
  Building,
  DollarSign,
  FileText,
  Award,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../../../../../components/AdminLayout';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useFetchObject from '../../../../../api/useFetchObject';
import useUpdate from '../../../../../api/useUpdate';
import { useAuth } from '../../../../../context/AuthContext';

// Scholarship categories
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

// Scholarship types (must match backend ENUM values)
const types = [
  'full_tuition',
  'partial_tuition',
  'stipend',
  'grant',
  'fellowship'
];

// Education level examples (now free text field)
const levelExamples = 'e.g., Undergraduate, Graduate, Masters, PhD, Certificate, Diploma, etc.';

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
  // Logo field removed - no longer supported
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
        deadline: scholarship.deadline ? new Date(scholarship.deadline).toISOString().slice(0, 16) : ''
      });
      
      // Set requirements and benefits arrays
      if (scholarship.requirements) {
        if (Array.isArray(scholarship.requirements)) {
          setRequirements(scholarship.requirements);
        } else if (typeof scholarship.requirements === 'string') {
          // Split comma-separated string into array
          setRequirements(scholarship.requirements.split(',').map(req => req.trim()).filter(req => req));
        }
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
        false; // Logo field removed
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, scholarshipData]); // Logo dependency removed

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

  // Logo file handling removed - no longer supported

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

    if (formData.amount && (isNaN(formData.amount) || parseFloat(formData.amount) < 0)) {
      newErrors.amount = 'Amount must be a valid positive number';
    }

    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
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

    // Add requirements as string and benefits as JSON string
    updateData.append('requirements', requirements.join(', '));
    updateData.append('benefits', JSON.stringify(benefits));

    // Logo upload removed - no longer supported

    // Send FormData directly (don't convert to object)
    handleUpdate(scholarshipId, updateData);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/admin/scholarships"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scholarships
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Scholarship</h1>
            <p className="text-sm sm:text-base text-gray-600">Update scholarship information and details</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Education Level <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        placeholder={levelExamples}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.level ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.level && (
                        <p className="mt-1 text-sm text-red-600">{errors.level}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Financial Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Financial Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
            </div>

            {/* Right Column - Requirements & Benefits */}
            <div className="space-y-6 pt-6">
              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700">{requirement}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(requirement)}
                          className="text-red-600 hover:text-red-700 transition-colors"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => removeBenefit(benefit)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo Upload removed - no longer supported */}
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
            <Link
              href="/admin/scholarships"
              className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Scholarship
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
