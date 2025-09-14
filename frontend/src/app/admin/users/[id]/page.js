'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  Mail, 
  Phone,
  MapPin,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Eye,
  Star,
  Briefcase,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import useFetchObject from '../../../../api/useFetchObject';
import Link from 'next/link';

export default function UserDetail() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  const [showActionMenu, setShowActionMenu] = useState(false);
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Fetch user details
  const { data: userData, isLoading, isError, error } = useFetchObject(
    ['user', userId],
    'users',
    userId,
    token
  );

  const user = userData?.data?.user;

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
      suspended: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
      inactive: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${config.dot}`}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'bg-purple-50', text: 'text-purple-700' },
      hr: { bg: 'bg-blue-50', text: 'text-blue-700' },
      user: { bg: 'bg-green-50', text: 'text-green-700' }
    };

    const config = roleConfig[role] || { bg: 'bg-gray-50', text: 'text-gray-700' };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/users/${userId}` 
          : `${baseUrl}/api/users/${userId}`;
        
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          alert('User deleted successfully!');
          router.push('/admin/users');
        } else {
          const errorData = await response.json();
          alert(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <AdminLayout title="User Details">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-gray-600">Loading user details...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (isError || !user) {
    return (
      <AdminLayout title="User Details">
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <div className="text-center bg-white rounded-lg shadow-sm p-6 max-w-md w-full">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User not found</h3>
            <p className="text-gray-600 mb-4 text-sm">
              {error?.message || 'The user you are looking for does not exist or has been deleted.'}
            </p>
            <button
              onClick={() => router.push('/admin/users')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Details">
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                title="Back to Users"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative md:hidden">
                <button 
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {showActionMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </button>
                  </div>
                )}
              </div>
              
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {getStatusBadge(user.status)}
            {getRoleBadge(user.role)}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-24 h-24 object-cover rounded-xl shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-2xl">
                          {user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-gray-600 mb-4">{user.email}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                          <Mail className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-50 rounded-lg mr-3">
                            <Phone className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {user.address && (
                        <div className="flex items-center sm:col-span-2">
                          <div className="p-2 bg-green-50 rounded-lg mr-3">
                            <MapPin className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm font-medium text-gray-900">{user.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {user.bio && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-500" />
                    Bio
                  </h2>
                  <div className="text-gray-700 bg-gray-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{user.bio}</p>
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {user.skills && user.skills.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-gray-500" />
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar Information */}
            <div className="space-y-6">
              {/* User Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Full Name</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{user.email}</span>
                  </div>

                  {user.phone && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Phone</span>
                      <span className="text-sm font-medium text-gray-900">{user.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Role</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{user.role}</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{user.status}</span>
                  </div>
                </div>
              </div>

              {/* Important Dates Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Joined</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <span className="text-sm font-medium text-gray-900">{formatDateTime(user.updatedAt)}</span>
                  </div>

                  {user.lastLoginAt && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-500">Last Login</span>
                      <span className="text-sm font-medium text-gray-900">{formatDateTime(user.lastLoginAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Profile Views</span>
                    <span className="text-sm font-medium text-gray-900">{user.profileViews || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Jobs Posted</span>
                    <span className="text-sm font-medium text-gray-900">{user.jobsPosted || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500">Articles Written</span>
                    <span className="text-sm font-medium text-gray-900">{user.articlesWritten || 0}</span>
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