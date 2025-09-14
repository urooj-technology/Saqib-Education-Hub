'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  GraduationCap, 
  Calendar, 
  Clock, 
  DollarSign, 
  ExternalLink,
  MapPin,
  Users,
  Award
} from 'lucide-react';
import AdminLayout from '../../layout';
import useFetchObject from '@/api/useFetchObject';

export default function ScholarshipDetailPage({ params }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const scholarshipId = params.id;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Fetch scholarship details
  const { data: scholarshipData, isLoading, isError, error } = useFetchObject(
    ['scholarship', scholarshipId],
    'scholarships',
    scholarshipId,
    token
  );

  const scholarship = scholarshipData?.data?.scholarship;

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
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
      month: 'short',
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
    if (!confirm('Are you sure you want to delete this scholarship? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/scholarships/${scholarshipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/admin/scholarships');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete scholarship'}`);
      }
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      alert('An error occurred while deleting the scholarship');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Scholarship Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !scholarship) {
    return (
      <AdminLayout title="Scholarship Details">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <GraduationCap className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Scholarship Not Found</h2>
            <p className="text-gray-600 mt-2">
              {error?.message || 'The scholarship you are looking for does not exist or has been deleted.'}
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/scholarships')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scholarships
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Scholarship Details">
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/scholarships')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Back to Scholarships"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{scholarship.title}</h1>
                <p className="text-sm lg:text-base text-gray-600 truncate">{scholarship.organization}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/admin/scholarships/${scholarship.id}/edit`}
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
          
          {/* Status Badge */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {getStatusBadge(scholarship.status)}
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 p-6">
            {/* Main Information - Scrollable */}
            <div className="xl:col-span-2 space-y-4 overflow-y-auto">
              {/* Scholarship Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{scholarship.description || 'No description provided.'}</p>
                </div>
              </div>

              {/* Eligibility Requirements */}
              {scholarship.eligibility && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Requirements</h2>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{scholarship.eligibility}</p>
                  </div>
                </div>
              )}

              {/* Application Process */}
              {scholarship.application_process && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Application Process</h2>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{scholarship.application_process}</p>
                  </div>
                </div>
              )}

              {/* External Link */}
              {scholarship.external_link && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Apply Now</h2>
                  <a
                    href={scholarship.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Application Page
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar - Fixed Height */}
            <div className="space-y-4 overflow-y-auto">
              {/* Scholarship Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Scholarship Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Title</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{scholarship.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Organization</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{scholarship.organization}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-medium text-gray-900">{scholarship.amount || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{scholarship.category || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{scholarship.location || 'N/A'}</p>
                    </div>
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
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(scholarship.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Deadline</p>
                      <p className={`text-sm font-medium ${isExpired(scholarship.deadline) ? 'text-red-600' : 'text-gray-900'}`}>
                        {getDaysLeft(scholarship.deadline)}
                      </p>
                      {scholarship.deadline && (
                        <p className="text-xs text-gray-500">{formatDate(scholarship.deadline)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(scholarship.updatedAt)}</p>
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
                    <span className="text-sm font-medium text-gray-900">{scholarship.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Applications</span>
                    <span className="text-sm font-medium text-gray-900">{scholarship.applicationCount || 0}</span>
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