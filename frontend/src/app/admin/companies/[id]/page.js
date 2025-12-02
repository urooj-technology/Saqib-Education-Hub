'use client';

import { useState, use } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Calendar,
  Clock,
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

export default function CompanyDetails({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const auth = useAuth();
  const token = auth.token;
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const { data: response, loading, error } = useFetchObject("companies", "companies", id, token);
  const { handleDelete: deleteCompany, loading: isDeleting } = useDelete("companies", token);
  
  // Extract company data from the response
  const company = response?.data?.company || response?.company;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteCompany(id);
        router.push('/admin/companies');
      } catch (error) {
        console.error('Error deleting company:', error);
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

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
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

  if (error || !company) {
    return (
      <AdminLayout title="Company Not Found">
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">The company you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/admin/companies')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Companies
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Company Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/companies')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {company.industry || 'Unknown Industry'}
            </p>
            <div className="mt-2">
              {getStatusBadge(company.isActive)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/admin/companies/${company.id}/edit`}
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
          {/* Left Column - Company Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-48 h-48 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Building className="w-24 h-24 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h2>
                  <p className="text-lg text-gray-600 mb-4">
                    {company.industry || 'Unknown Industry'}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Location:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{company.location || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Phone:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{company.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{company.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Website:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{company.website || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Description */}
            {company.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Company</h3>
                <div className="text-gray-700 leading-relaxed">
                  <div className={`whitespace-pre-wrap ${!showFullDescription && company.description.length > 500 ? 'line-clamp-6' : ''}`}>
                    {company.description}
                  </div>
                  {company.description.length > 500 && (
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

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Industry:</span>
                  <p className="text-sm font-medium text-gray-900">{company.industry || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Size:</span>
                  <p className="text-sm font-medium text-gray-900">{company.size || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Founded:</span>
                  <p className="text-sm font-medium text-gray-900">{company.foundedYear || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Type:</span>
                  <p className="text-sm font-medium text-gray-900">{company.type || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{company.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{company.location || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{company.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{company.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Website</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{company.website || 'N/A'}</p>
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
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(company.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDateTime(company.updatedAt)}</p>
                  </div>
                </div>

                {company.foundedYear && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Founded</p>
                      <p className="text-sm font-medium text-gray-900">{company.foundedYear}</p>
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
                    <span className="text-sm text-gray-500">Employees</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{company.employeeCount || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Jobs Posted</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{company.jobsCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
