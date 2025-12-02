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
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useAdd from '../../../../api/useAdd';
import { useRouter } from 'next/navigation';

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

export default function CreateScholarship() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organization: '',
    category: 'academic',
    type: 'full_tuition',
    level: '',
    country: 'Afghanistan',
    amount: '',
    currency: 'USD',
    status: 'active',
    deadline: ''
  });

  const [requirements, setRequirements] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Logo field removed - no longer supported
  const [requirementInput, setRequirementInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const auth = useAuth();
  const token = auth.token;
  const { handleAdd, loading, success, responseData, error } = useAdd("scholarships", token);

  useEffect(() => {
    if (success && responseData) {
      router.push('/admin/scholarships');
    }
  }, [success, responseData, router]);

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

    setIsSubmitting(true);

    try {
      // Prepare form data for multipart upload
      const formDataToSend = new FormData();
      
      // Add scholarship data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add requirements as string and benefits as JSON string
      formDataToSend.append('requirements', requirements.join(', '));
      formDataToSend.append('benefits', JSON.stringify(benefits));

      // Logo upload removed - no longer supported

      // Call the API
      await handleAdd(formDataToSend);
      
    } catch (error) {
      console.error('Error creating scholarship:', error);
      setErrors({ submit: 'Error creating scholarship. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <AdminLayout title="Create New Scholarship">
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Scholarship</h1>
            <p className="text-sm sm:text-base text-gray-600">Add a new scholarship opportunity to help students achieve their educational goals</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 mr-3">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  </div>
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

              {/* Financial Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 mr-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
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
            <div className="space-y-6">
              {/* Requirements Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 mr-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
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
                  
                  {requirements.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                      {requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-gray-200 hover:border-indigo-300 transition-colors">
                          <span className="text-sm text-gray-700 flex-1 pr-2">{requirement}</span>
                          <button
                            type="button"
                            onClick={() => removeRequirement(requirement)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md p-1 transition-colors flex-shrink-0"
                            title="Remove requirement"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No requirements added yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add requirements using the input above</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100 mr-3">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
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
                  
                  {benefits.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-gray-200 hover:border-yellow-300 transition-colors">
                          <span className="text-sm text-gray-700 flex-1 pr-2">{benefit}</span>
                          <button
                            type="button"
                            onClick={() => removeBenefit(benefit)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md p-1 transition-colors flex-shrink-0"
                            title="Remove benefit"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No benefits added yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add benefits using the input above</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Upload removed - no longer supported */}
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">Error Creating Scholarship</h4>
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions - Sticky Footer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky bottom-4 z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">Ready to publish?</span>
                <p className="text-xs mt-1">Make sure all required fields are filled out correctly.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <Link
                  href="/admin/scholarships"
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:shadow-none"
                >
                  {isSubmitting || loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Scholarship...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Scholarship
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}