'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MapPin, Clock, DollarSign, Building, Users, Calendar, Briefcase, Star, X, GraduationCap, Eye, Printer, ArrowLeft, Check } from 'lucide-react';
import Layout from '../../../components/Layout';
import useFetchObject from '../../../api/useFetchObject';
import axios from 'axios';

export default function JobDetail() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewCount, setViewCount] = useState(0);

  // Get token for API calls
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Increment view count function
  const incrementViewCount = useCallback(async (type, id) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/${type}/${id}/view` 
        : `${baseUrl}/api/${type}/${id}/view`;

      const response = await axios.post(apiUrl);
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to increment view count');
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to increment view count');
    }
  }, []);

  // Fetch job data
  const { data: jobResponse, isLoading: jobLoading, isError: jobError } = useFetchObject(
    'jobs',
    'jobs',
    jobId,
    token
  );

  useEffect(() => {
    if (jobResponse?.data?.job) {
      setJob(jobResponse.data.job);
      setViewCount(jobResponse.data.job.viewCount || 0);
      setLoading(false);
    } else if (jobError) {
      setError('Failed to load job details');
      setLoading(false);
    }
  }, [jobResponse, jobError]);

  // Increment view count when job loads (only once per session)
  useEffect(() => {
    if (job && jobId) {
      // Check if we've already incremented for this job in this session
      const sessionKey = `job_viewed_${jobId}`;
      const hasViewedInSession = sessionStorage.getItem(sessionKey);
      
      if (!hasViewedInSession) {
        // Mark as viewed in this session IMMEDIATELY
        sessionStorage.setItem(sessionKey, 'true');
        
        const handleIncrementView = async () => {
          try {
            console.log('Incrementing view count for job:', jobId);
            const result = await incrementViewCount('jobs', jobId);
            if (result && result.viewCount) {
              setViewCount(result.viewCount);
              console.log('View count updated to:', result.viewCount);
            }
          } catch (error) {
            console.error('Failed to increment view count:', error);
            // Don't show error to user, just log it
          }
        };

        handleIncrementView();
      } else {
        console.log('Job already viewed in this session, not incrementing');
      }
    }
  }, [job, jobId]);

  const formatSalary = (salary, currency) => {
    if (!salary) return 'Salary not specified';
    return `${currency} ${parseFloat(salary).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExperienceLabel = (experience) => {
    const labels = {
      'entry': 'Entry Level',
      'junior': 'Junior',
      'mid-level': 'Mid Level',
      'senior': 'Senior',
      'lead': 'Lead',
      'executive': 'Executive'
    };
    return labels[experience] || experience;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance'
    };
    return labels[type] || type;
  };

  const getGenderLabel = (gender) => {
    const labels = {
      'any': 'Any',
      'male': 'Male',
      'female': 'Female'
    };
    return labels[gender] || 'Any';
  };

  const getContractTypeLabel = (contractType) => {
    const labels = {
      'permanent': 'Permanent',
      'temporary': 'Temporary',
      'contract': 'Contract',
      'internship': 'Internship'
    };
    return labels[contractType] || contractType;
  };

  // Helper function to safely convert to array
  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'string') return [value];
    return [];
  };

  if (loading || jobLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || jobError || !job) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <X className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push('/jobs')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header Navigation */}
      <div className=" ">
        <div className="bg-blue-600 text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/jobs')}
                className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Jobs
              </button>
          
            </div>
           
          </div>
        </div>
      </div>

      {/* Main Job Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="text-center mb-8">
                {job.company?.logo ? (
                  <img src={job.company.logo} alt={job.company.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Building className="w-10 h-10 text-gray-500" />
                  </div>
                )}
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="text-lg text-gray-600 mb-4">
                  <button 
                    onClick={() => {
                      if (job.company?.id) {
                        router.push(`/companies/${job.company.id}`);
                      }
                    }}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {job.company?.name || 'Company not specified'}
                  </button>
                  <span>, {
                    (() => {
                      // Use province_names if available (from backend), otherwise fallback to lookup
                      if (job.province_names && Array.isArray(job.province_names) && job.province_names.length > 0) {
                        return job.province_names.join(', ');
                      }
                      
                      try {
                        const provinceIds = typeof job.province_ids === 'string' 
                          ? JSON.parse(job.province_ids) 
                          : job.province_ids;
                        
                        if (provinceIds && Array.isArray(provinceIds) && provinceIds.length > 0) {
                          return provinceIds.join(', ');
                        } else {
                          return job.province?.name || 'Location not specified';
                        }
                      } catch (e) {
                        return job.province?.name || 'Location not specified';
                      }
                    })()
                  }, Afghanistan</span>
                </div>

                {/* Job Attributes Bar */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-6">
                  {job.education && (
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      <span>{job.education}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{
                      (() => {
                        // Use province_names if available (from backend), otherwise fallback to lookup
                        if (job.province_names && Array.isArray(job.province_names) && job.province_names.length > 0) {
                          return job.province_names.join(', ');
                        }
                        
                        try {
                          const provinceIds = typeof job.province_ids === 'string' 
                            ? JSON.parse(job.province_ids) 
                            : job.province_ids;
                          
                          if (provinceIds && Array.isArray(provinceIds) && provinceIds.length > 0) {
                            return provinceIds.join(', ');
                          } else {
                            return job.province?.name || 'Location not specified';
                          }
                        } catch (e) {
                          return job.province?.name || 'Location not specified';
                        }
                      })()
                    }, Afghanistan</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{getTypeLabel(job.type)}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>{viewCount}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Apply Now
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Job Description Content */}
            <div className="space-y-8">
              {/* About Company */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {job.company?.name || 'Company'}</h2>
                {job.company?.description ? (
                  <div 
                    className="prose max-w-none text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: job.company.description
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#x27;/g, "'")
                        .replace(/&#x2F;/g, '/')
                    }}
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    No company description available.
                  </p>
                )}
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-600 leading-relaxed mb-6 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: job.description ? 
                        (typeof job.description === 'string' ? 
                          job.description
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&amp;/g, '&')
                            .replace(/&quot;/g, '"')
                            .replace(/&#x27;/g, "'")
                            .replace(/&#x2F;/g, '/')
                          : JSON.stringify(job.description)) 
                        : '' 
                    }}
                  />
                </div>

                {job.duties_and_responsibilities && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Duties & Responsibilities</h3>
                    <div 
                      className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: job.duties_and_responsibilities ? 
                          (typeof job.duties_and_responsibilities === 'string' ? 
                            job.duties_and_responsibilities
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>')
                              .replace(/&amp;/g, '&')
                              .replace(/&quot;/g, '"')
                              .replace(/&#x27;/g, "'")
                              .replace(/&#x2F;/g, '/')
                            : JSON.stringify(job.duties_and_responsibilities)) 
                          : '' 
                      }}
                    />
                  </div>
                )}

                {job.job_requirements && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Requirements</h3>
                    <div 
                      className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: job.job_requirements ? 
                          (typeof job.job_requirements === 'string' ? 
                            job.job_requirements
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>')
                              .replace(/&amp;/g, '&')
                              .replace(/&quot;/g, '"')
                              .replace(/&#x27;/g, "'")
                              .replace(/&#x2F;/g, '/')
                            : JSON.stringify(job.job_requirements)) 
                          : '' 
                      }}
                    />
                  </div>
                )}

                {job.submission_guidelines && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Submission Guideline</h3>
                    <div 
                      className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: job.submission_guidelines ? 
                          (typeof job.submission_guidelines === 'string' ? 
                            job.submission_guidelines
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>')
                              .replace(/&amp;/g, '&')
                              .replace(/&quot;/g, '"')
                              .replace(/&#x27;/g, "'")
                              .replace(/&#x2F;/g, '/')
                            : JSON.stringify(job.submission_guidelines)) 
                          : '' 
                      }}
                    />
                  </div>
                )}


                {/* Functional Areas */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Functional Area</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">IT - Software</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Software developer and data base development</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Software developer</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Afghanistan</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Provinces</h4>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      // Use province_names if available (from backend), otherwise fallback to lookup
                      if (job.province_names && Array.isArray(job.province_names) && job.province_names.length > 0) {
                        return job.province_names.map((provinceName, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {provinceName}
                          </span>
                        ));
                      }
                      
                      try {
                        const provinceIds = typeof job.province_ids === 'string' 
                          ? JSON.parse(job.province_ids) 
                          : job.province_ids;
                        
                        if (provinceIds && Array.isArray(provinceIds) && provinceIds.length > 0) {
                          return provinceIds.map((provinceId, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              Province {provinceId}
                            </span>
                          ));
                        } else {
                          return (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {job.province?.name || 'Kabul'}
                            </span>
                          );
                        }
                      } catch (e) {
                        return (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {job.province?.name || 'Kabul'}
                          </span>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Overview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Post Date:</span>
                  <span className="font-medium">{formatDate(job.post_date || job.createdAt)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Closing Date:</span>
                  <span className="font-medium">{formatDate(job.closing_date || job.deadline)}</span>
                </div>
                {job.reference_number && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">#{job.reference_number}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Number of Vacancies:</span>
                  <span className="font-medium">{job.number_of_vacancies || 1}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Salary Range:</span>
                  <span className="font-medium">{job.salary_range || formatSalary(job.salary, job.currency)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Years of Experience:</span>
                  <span className="font-medium">{job.years_of_experience || 'Not specified'}</span>
                </div>
                {job.probation_period && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Probation Period:</span>
                    <span className="font-medium">{job.probation_period}</span>
                  </div>
                )}
                {job.contract_type && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Contract Type:</span>
                    <span className="font-medium">{getContractTypeLabel(job.contract_type)}</span>
                  </div>
                )}
                {job.contract_duration && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">Contract Duration:</span>
                    <span className="font-medium">{job.contract_duration}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Contract Extensible:</span>
                  <span className="font-medium">{job.contract_extensible ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Minimum Education:</span>
                  <span className="font-medium">{job.education || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{getGenderLabel(job.gender)}</span>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-4">
                Apply Now
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                Save Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
