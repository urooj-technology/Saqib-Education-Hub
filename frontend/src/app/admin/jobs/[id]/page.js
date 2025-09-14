'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Building, 
  User, 
  Briefcase,
  Tag,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Star
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import useFetchObject from '../../../../api/useFetchObject';
import Link from 'next/link';

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Fetch job details
  const { data: jobData, isLoading, isError, error } = useFetchObject(
    ['job', jobId],
    'jobs',
    jobId,
    token
  );

  const job = jobData?.data?.job;

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800',
      filled: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-purple-100 text-purple-800',
      'contract': 'bg-orange-100 text-orange-800',
      'internship': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${typeConfig[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return 'No deadline';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/jobs/${jobId}` 
          : `${baseUrl}/api/jobs/${jobId}`;
        
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          alert('Job deleted successfully!');
          router.push('/admin/jobs');
        } else {
          const errorData = await response.json();
          alert(`Failed to delete job: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <AdminLayout title="Job Details">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading job details...</span>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (isError || !job) {
    return (
      <AdminLayout title="Job Details">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
            <p className="text-gray-600 mb-4">
              {error?.message || 'The job you are looking for does not exist or has been deleted.'}
            </p>
            <button
              onClick={() => router.push('/admin/jobs')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Job Details">
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/jobs')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Back to Jobs"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{job.title}</h1>
                <p className="text-sm lg:text-base text-gray-600 truncate">{job.company?.name || 'No company'}</p>
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
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {getStatusBadge(job.status)}
            {getTypeBadge(job.type)}
            {job.featured && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 p-6">
            {/* Main Information - Scrollable */}
            <div className="xl:col-span-2 space-y-4 overflow-y-auto">
              {/* Job Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
                <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                  <div 
                    className="prose prose-sm max-w-none"
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
                        : 'No description provided.' 
                    }}
                  />
                </div>
              </div>

              {/* Duties & Resposnsibilities */}
              {job.duties_and_responsibilities && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Duties & Responsibilities</h2>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                    <div 
                      className="prose prose-sm max-w-none"
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
                          : 'No duties and responsibilities provided.' 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Requirements */}
              {job.job_requirements && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Requirements</h2>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                    <div 
                      className="prose prose-sm max-w-none"
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
                          : 'No job requirements provided.' 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Submission Guidelines */}
              {job.submission_guidelines && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">How to Apply</h2>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                    <div 
                      className="prose prose-sm max-w-none"
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
                          : 'No submission guidelines provided.' 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Fixed Height */}
            <div className="space-y-4 overflow-y-auto">
              {/* Job Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Information</h3>
                <div className="space-y-3">
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
                        {job.remote ? 'Remote' : job.province?.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{job.category || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Salary</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {job.salary_range || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="text-sm font-medium text-gray-900 capitalize truncate">
                        {job.experience || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Vacancies</p>
                      <p className="text-sm font-medium text-gray-900">
                        {job.number_of_vacancies || 1}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posted By */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Posted By</h3>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {job.postedBy?.avatar ? (
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={job.postedBy.avatar} 
                        alt={job.postedBy.firstName}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {job.postedBy?.firstName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {job.postedBy ? `${job.postedBy.firstName} ${job.postedBy.lastName || ''}`.trim() : 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{job.postedBy?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Dates</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Posted</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(job.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Deadline</p>
                      <p className={`text-sm font-medium ${isExpired(job.deadline) ? 'text-red-600' : 'text-gray-900'}`}>
                        {getDaysLeft(job.deadline)}
                      </p>
                      {job.deadline && (
                        <p className="text-xs text-gray-500">{formatDate(job.deadline)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(job.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Views</span>
                    <span className="text-sm font-medium text-gray-900">{job.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Applications</span>
                    <span className="text-sm font-medium text-gray-900">{job.applicationCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
