'use client';

import { useState, use } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign,
  Building,
  Users,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useFetchObject from '../../../../api/useFetchObject';
import useDelete from '../../../../api/useDelete';
import { useRouter } from 'next/navigation';

export default function JobDetails({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const auth = useAuth();
  const token = auth.token;
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const { data: response, loading, error } = useFetchObject("jobs", "jobs", id, token);
  const { handleDelete: deleteJob, loading: isDeleting } = useDelete("jobs", token);
  
  // Extract job data from the response
  const job = response?.data?.job || response?.job;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        router.push('/admin/jobs');
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      closed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Closed' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !job) {
    return (
      <AdminLayout title="Job Not Found">
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/admin/jobs')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Job Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/jobs')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              at {job.company?.name || 'Unknown Company'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {job.type || 'N/A'}
              </span>
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {job.experience || 'N/A'}
              </span>
            </div>
            <div className="mt-2">
              {getStatusBadge(job.status)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/admin/jobs/${job.id}/edit`}
              className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  {job.company?.logo ? (
                    <img 
                      src={job.company.logo} 
                      alt={job.company.name}
                      className="w-24 h-24 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Building className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                  <p className="text-lg text-gray-600 mb-4">
                    at {job.company?.name || 'Unknown Company'}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Location:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {job.province_names?.join(', ') || job.province?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Salary:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {job.salary_range ? `${job.currency || 'USD'} ${job.salary_range}` : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Type:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{job.type || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Experience:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{job.experience || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            {job.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
                <div className="text-gray-700 leading-relaxed">
                  <div 
                    className={`${!showFullDescription && job.description.length > 500 ? 'line-clamp-6' : ''}`}
                    dangerouslySetInnerHTML={{ 
                      __html: job.description
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#x27;/g, "'")
                    }}
                    style={{
                      lineHeight: '1.6',
                      fontSize: '14px'
                    }}
                  />
                  {job.description.length > 500 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
                    >
                      <span>{showFullDescription ? 'Show Less' : 'Read More'}</span>
                      {showFullDescription ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Job Requirements */}
            {job.job_requirements && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Requirements</h3>
                <div className="text-gray-700 leading-relaxed">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: job.job_requirements
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#x27;/g, "'")
                    }}
                    style={{
                      lineHeight: '1.6',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Duties and Responsibilities */}
            {job.duties_and_responsibilities && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Duties and Responsibilities</h3>
                <div className="text-gray-700 leading-relaxed">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: job.duties_and_responsibilities
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#x27;/g, "'")
                    }}
                    style={{
                      lineHeight: '1.6',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submission Guidelines */}
            {job.submission_guidelines && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Guidelines</h3>
                <div className="text-gray-700 leading-relaxed">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: job.submission_guidelines
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#x27;/g, "'")
                    }}
                    style={{
                      lineHeight: '1.6',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Job Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Title</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{job.company?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {job.province_names?.join(', ') || job.province?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Salary</p>
                    <p className="text-sm font-medium text-gray-900">
                      {job.salary_range ? `${job.currency || 'USD'} ${job.salary_range}` : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm font-medium text-gray-900">{job.experience || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Education</p>
                    <p className="text-sm font-medium text-gray-900">{job.education || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Years of Experience</p>
                    <p className="text-sm font-medium text-gray-900">{job.years_of_experience || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Vacancies</p>
                    <p className="text-sm font-medium text-gray-900">{job.number_of_vacancies || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Posted</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(job.createdAt)}</p>
                  </div>
                </div>

                

                {job.deadline && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Application Deadline</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(job.deadline)}</p>
                    </div>
                  </div>
                )}

                {job.closing_date && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Closing Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(job.closing_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Applications</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{job.applicationCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Views</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{job.viewCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Contract Type</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{job.contract_type || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Gender</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{job.gender || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}