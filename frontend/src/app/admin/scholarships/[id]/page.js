'use client';

import { useState, use } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye,
  GraduationCap, 
  DollarSign, 
  Calendar, 
  Clock, 
  MapPin,
  Building,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useFetchObject from '../../../../api/useFetchObject';
import useDelete from '../../../../api/useDelete';
import { useRouter } from 'next/navigation';

export default function ScholarshipDetails({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const auth = useAuth();
  const token = auth.token;
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const { data: response, loading, error } = useFetchObject("scholarships", "scholarships", id, token);
  const { handleDelete: deleteScholarship, loading: isDeleting } = useDelete("scholarships", token);
  
  // Extract scholarship data from the response
  const scholarship = response?.data?.scholarship || response?.scholarship;
  
  // Debug: Log the scholarship data to see what fields are available
  console.log('Scholarship data:', scholarship);
  console.log('Date fields:', {
    created_at: scholarship?.created_at,
    createdAt: scholarship?.createdAt,
    updated_at: scholarship?.updated_at,
    updatedAt: scholarship?.updatedAt
  });

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this scholarship?')) {
      try {
        await deleteScholarship(id);
        router.push('/admin/scholarships');
      } catch (error) {
        console.error('Error deleting scholarship:', error);
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

  if (error || !scholarship) {
    return (
      <AdminLayout title="Scholarship Not Found">
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Scholarship Not Found</h2>
          <p className="text-gray-600 mb-4">The scholarship you're looking for doesn't exist or has been removed.</p>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/scholarships')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scholarships
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{scholarship.title}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              by {scholarship.organization || 'Unknown Organization'}
            </p>
            <div className="mt-2">
              {getStatusBadge(scholarship.status)}
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Scholarship Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scholarship Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  {scholarship.image ? (
                    <img 
                      src={scholarship.image} 
                      alt={scholarship.title}
                      className="w-48 h-48 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-24 h-24 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{scholarship.title}</h2>
                  <p className="text-lg text-gray-600 mb-4">
                    by {scholarship.organization || 'Unknown Organization'}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {scholarship.amount ? `${scholarship.currency || 'USD'} ${scholarship.amount}` : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Location:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{scholarship.country || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Type:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{scholarship.type || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Level:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{scholarship.level || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scholarship Description */}
            {scholarship.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <div className="text-gray-700 leading-relaxed">
                  <div className={`whitespace-pre-wrap ${!showFullDescription && scholarship.description.length > 500 ? 'line-clamp-6' : ''}`}>
                    {scholarship.description}
                  </div>
                  {scholarship.description.length > 500 && (
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

            {/* Requirements */}
            {scholarship.requirements && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                <div className="text-gray-700 leading-relaxed">
                  <p className="whitespace-pre-wrap">{scholarship.requirements}</p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {scholarship.benefits && scholarship.benefits.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                <div className="text-gray-700 leading-relaxed">
                  {Array.isArray(scholarship.benefits) ? (
                    <ul className="list-disc list-inside space-y-2">
                      {scholarship.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="whitespace-pre-wrap">{scholarship.benefits}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Scholarship Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scholarship Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <GraduationCap className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Title</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{scholarship.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Organization</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{scholarship.organization || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-medium text-gray-900">
                      {scholarship.amount ? `${scholarship.currency || 'USD'} ${scholarship.amount}` : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{scholarship.country || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Level</p>
                    <p className="text-sm font-medium text-gray-900">{scholarship.level || 'N/A'}</p>
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
                    <p className="text-sm font-medium text-gray-900">{formatDate(scholarship.created_at || scholarship.createdAt)}</p>
                  </div>
                </div>

                {scholarship.applicationDeadline && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Application Deadline</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(scholarship.applicationDeadline)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}