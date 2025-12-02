'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Briefcase,
  ArrowLeft,
  Trash2,
  AlertCircle
} from 'lucide-react';
import RichTextarea from '../../../../../components/RichTextarea';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useFetchObject from '../../../../../api/useFetchObject';
import useFetchObjects from '../../../../../api/useFetchObjects';
import useUpdate from '../../../../../api/useUpdate';
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

const statuses = [
  'active',
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
  const { data: categoriesData } = useFetchObjects('job-categories', 'job-categories', token);

  const { handleUpdate, loading: isSubmitting } = useUpdate(
    'jobs',
    token,
    '/user/dashboard',
    'Job updated successfully!',
    'Failed to update job'
  );

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

  // Fetch companies and provinces
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
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
        formData.closing_date !== (job.closing_date || '') ||
        formData.status !== (job.status || 'draft') ||
        formData.number_of_vacancies !== (job.number_of_vacancies || 1);
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, jobData]);

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
      categoryId: parseInt(formData.categoryId),
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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
          toast.success('Job deleted successfully!');
          router.push('/user/dashboard');
        } else {
          throw new Error('Failed to delete job');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Error deleting job. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Failed to load job data'}
          </p>
          <Link
            href="/user/dashboard"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link
                href="/user/dashboard"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Briefcase className="w-6 h-6 mr-2" />
                Edit Job
              </h1>
              <p className="text-gray-600">Update your job posting details</p>
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
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.categoryId ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Category</option>
                        {categoriesData?.data?.categories?.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
                          placeholder="e.g., 10000 to 40000, Negotiable"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 5 to 7, 2+ years"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Vacancies</label>
                      <input
                        type="number"
                        name="number_of_vacancies"
                        value={formData.number_of_vacancies}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.number_of_vacancies ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                      <select
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="remote"
                        checked={formData.remote}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900">Remote work available</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Requirements and Benefits */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submission Guidelines (Optional)</label>
                    <RichTextarea
                      value={formData.submission_guidelines}
                      onChange={(content) => setFormData(prev => ({ ...prev, submission_guidelines: content }))}
                      placeholder="Enter submission guidelines..."
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
                    href="/user/dashboard"
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
                        Update Job
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

