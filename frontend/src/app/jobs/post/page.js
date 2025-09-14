'use client';

import { useState, useEffect } from 'react';
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
  CreditCard,
  Lock
} from 'lucide-react';
import Layout from '../../../components/Layout';
import useAdd from '../../../api/useAdd';

// Import translations
import enTranslations from '../../../locales/en.json';
import psTranslations from '../../../locales/ps.json';
import drTranslations from '../../../locales/dr.json';

const translations = {
  en: enTranslations,
  ps: psTranslations,
  dr: drTranslations,
};

const jobTypes = [
  'full-time',
  'part-time', 
  'contract',
  'internship',
  'freelance'
];

const experienceLevels = [
  'entry',
  'junior',
  'mid-level',
  'senior',
  'lead',
  'executive'
];

const categories = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Marketing',
  'Sales',
  'Engineering',
  'Design',
  'Administration',
  'Customer Service',
  'Other'
];

export default function PostJob() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState('en');
  const [currentTranslations, setCurrentTranslations] = useState(translations.en);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [canPostJob, setCanPostJob] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    category: '',
    type: 'full-time',
    provinceId: '',
    remote: false,
    salary: '',
    currency: 'USD',
    experience: 'entry',
    requirements: '',
    benefits: '',
    deadline: ''
  });

  // Form validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setCurrentLang(savedLang);
    setCurrentTranslations(translations[savedLang] || translations.en);
    
    // Check if backend is running before fetching data
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      console.log('Checking backend health...');
      const response = await fetch('https://api.saqibeduhub.com/health');
      console.log('Health check response:', response.status, response.ok);
      
      if (response.ok) {
        console.log('Backend is healthy, fetching data...');
        // Backend is running, fetch data
        fetchSubscriptionPlans();
        fetchUserSubscription();
      } else {
        console.log('Backend health check failed');
        setSubscriptionError('Backend server is not responding. Please ensure the server is running.');
        setSubscriptionLoading(false);
      }
    } catch (error) {
      console.error('Backend health check error:', error);
      setSubscriptionError('Cannot connect to backend server. Please ensure the server is running on port 5000.');
      setSubscriptionLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError(null);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/subscriptions/plans` 
        : `${baseUrl}/api/subscriptions/plans`;
      
      console.log('Fetching subscription plans from:', apiUrl);
      const response = await fetch(apiUrl);
      console.log('Subscription plans response:', response.status, response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Subscription plans data:', data);
      
      if (data.status === 'success') {
        setSubscriptionPlans(data.data.plans);
      } else {
        throw new Error(data.message || 'Failed to fetch subscription plans');
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      setSubscriptionError(error.message);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/subscriptions/my-subscription` 
        : `${baseUrl}/api/subscriptions/my-subscription`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUserSubscription(data.data.subscription);
        setCanPostJob(data.data.canPostJob);
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

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
    
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.provinceId) newErrors.provinceId = 'Please select a location';
    if (formData.salary && parseFloat(formData.salary) < 0) newErrors.salary = 'Salary must be positive';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateForm()) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!canPostJob) {
      setShowSubscriptionModal(true);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/jobs` 
        : `${baseUrl}/api/jobs`;
      
      // Transform form data to match backend validation expectations
      const transformedData = {
        ...formData,
        // Convert requirements and benefits to arrays
        requirements: formData.requirements ? [formData.requirements] : [],
        benefits: formData.benefits ? [formData.benefits] : []
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transformedData)
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('Job posted successfully!');
        router.push('/jobs');
      } else {
        alert(data.message || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    setShowSubscriptionModal(false);
    // Here you would typically redirect to payment gateway
    alert(`Selected ${plan.name}. Redirecting to payment...`);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Job Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Senior Software Engineer"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.company ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Tech Corp"
            />
            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {jobTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the role, responsibilities, and requirements..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details & Requirements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {experienceLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.salary ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 50000"
              />
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AFN">AFN</option>
              </select>
            </div>
            {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              name="provinceId"
              value={formData.provinceId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.provinceId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Location</option>
              <option value="1">Kabul</option>
              <option value="2">Herat</option>
              <option value="3">Mazar-e-Sharif</option>
              <option value="4">Kandahar</option>
            </select>
            {errors.provinceId && <p className="text-red-500 text-sm mt-1">{errors.provinceId}</p>}
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="remote"
              id="remote"
              checked={formData.remote}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="remote" className="ml-2 block text-sm text-gray-900">
              Remote work available
            </label>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements (Optional)
          </label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="List key requirements, skills, and qualifications..."
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Requirements (Optional)
          </label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="List benefits and perks..."
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Deadline (Optional)
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Submit</h3>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-lg text-gray-900 mb-4">{formData.title}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Company:</span>
              <span className="ml-2 font-medium">{formData.company}</span>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <span className="ml-2 font-medium">{formData.category}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium capitalize">{formData.type.replace('-', ' ')}</span>
            </div>
            <div>
              <span className="text-gray-600">Experience:</span>
              <span className="ml-2 font-medium capitalize">{formData.experience.replace('-', ' ')}</span>
            </div>
            {formData.salary && (
              <div>
                <span className="text-gray-600">Salary:</span>
                <span className="ml-2 font-medium">{formData.salary} {formData.currency}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Remote:</span>
              <span className="ml-2 font-medium">{formData.remote ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-gray-600">Description:</span>
            <p className="mt-2 text-gray-700">{formData.description}</p>
          </div>
        </div>

        {!canPostJob && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-yellow-800">
                You need an active subscription to post jobs. Please choose a plan below.
              </span>
            </div>
          </div>
        )}

        {userSubscription && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-green-800 font-medium">
                  Current Plan: {userSubscription.plan?.name}
                </span>
                <p className="text-green-700 text-sm mt-1">
                  Jobs posted: {userSubscription.jobsPosted} / {userSubscription.plan?.jobLimit === 0 ? 'Unlimited' : userSubscription.plan?.jobLimit}
                </p>
              </div>
              <Check className="h-5 w-5 text-green-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Post a New Job
            </h1>
            <p className="text-gray-600">
              Reach qualified candidates and find the perfect fit for your team
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2 text-sm text-gray-600">
              <span className={currentStep >= 1 ? 'text-green-600' : ''}>Basic Info</span>
              <span className={`mx-4 ${currentStep >= 2 ? 'text-green-600' : ''}`}>Details</span>
              <span className={currentStep >= 3 ? 'text-green-600' : ''}>Review</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg font-medium ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Post Job'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
                  <p className="text-gray-600">Select the perfect plan for your hiring needs</p>
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Loading State */}
              {subscriptionLoading && (
                <div className="col-span-full text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="mt-2 text-gray-600">Loading subscription plans...</p>
                </div>
              )}

              {/* Error State */}
              {subscriptionError && (
                <div className="col-span-full text-center py-12">
                  <div className="text-red-600 text-lg font-medium mb-2">Failed to load plans</div>
                  <p className="text-gray-600 mb-4">{subscriptionError}</p>
                  <button 
                    onClick={fetchSubscriptionPlans}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Plans Grid */}
              {!subscriptionLoading && !subscriptionError && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan, index) => (
                  <div key={plan.id} className={`p-6 rounded-xl border-2 ${
                    plan.name === 'Enterprise Plan' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}>
                    {plan.name === 'Enterprise Plan' && (
                      <div className="text-center mb-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => handlePlanSelection(plan)}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        plan.name === 'Enterprise Plan'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Choose Plan
                                         </button>
                   </div>
                 ))}
                </div>
              )}

              <div className="mt-6 text-center text-sm text-gray-500">
                <div className="flex items-center justify-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Secure payment processing
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
