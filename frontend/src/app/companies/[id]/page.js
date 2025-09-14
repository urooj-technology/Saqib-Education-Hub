'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  MapPin, 
  Clock, 
  Building, 
  Briefcase, 
  Star, 
  Share2, 
  Bookmark,
  ArrowLeft
} from 'lucide-react';
import Layout from '../../../components/Layout';
import useFetchObject from '../../../api/useFetchObject';

export default function CompanyProfile() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id;
  
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Get token for API calls
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch company data
  const { data: companyResponse, isLoading: companyLoading, isError: companyError } = useFetchObject(
    'companies',
    'companies',
    companyId,
    token
  );

  useEffect(() => {
    if (companyResponse?.data?.company) {
      setCompany(companyResponse.data.company);
      setLoading(false);
      // Fetch company jobs after company data is loaded
      fetchCompanyJobs();
    } else if (companyError) {
      setError('Failed to load company details');
      setLoading(false);
    }
  }, [companyResponse, companyError]);

  const fetchCompanyJobs = async () => {
    try {
      setJobsLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/companies/${companyId}/jobs` 
        : `${baseUrl}/api/companies/${companyId}/jobs`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setCompanyJobs(data.data.jobs || []);
      } else {
        throw new Error(data.message || 'Failed to fetch company jobs');
      }
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      setCompanyJobs([]);
    } finally {
      setJobsLoading(false);
    }
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

  const handleJobClick = (jobId) => {
    router.push(`/jobs/${jobId}`);
  };

  if (loading || companyLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || companyError) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <Building className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Failed to load company</p>
              <p className="text-sm text-gray-600">Please try again later</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Building className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-lg font-medium text-gray-600">Company not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Company Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
            
            <div className="flex items-start gap-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <Building className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              
              {/* Company Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
                <div className="flex items-center gap-2 text-blue-100 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span>Kabul, Afghanistan</span>
                </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Company Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* About Company */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About Company</h2>
                {company.description ? (
                  <div 
                    className="prose max-w-none text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: company.description
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
                    {company.name} is a local company operating in Afghanistan and delivers reliable and standard solutions.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Active Jobs */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Jobs</h2>
                
                {jobsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : companyJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-600 mb-2">No active jobs</p>
                    <p className="text-gray-500">This company doesn't have any active job postings at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companyJobs.map((job) => (
                      <div 
                        key={job.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleJobClick(job.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                {job.title}
                              </h3>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <p className="font-medium">{company.name}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{job.province?.name || 'Location not specified'}, Afghanistan</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Application Deadline: {formatDate(job.closing_date || job.deadline)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {getTypeLabel(job.type)}
                              </span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                {getExperienceLabel(job.experience)}
                              </span>
                              {job.category && (
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  {job.category}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle bookmark
                              }}
                              className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                              title="Save Job"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle share
                              }}
                              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                              title="Share Job"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
