'use client';

import { useState, use } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Shield,
  MapPin,
  Building
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useFetchObject from '../../../../api/useFetchObject';
import useDelete from '../../../../api/useDelete';
import { useRouter } from 'next/navigation';

export default function UserDetails({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const auth = useAuth();
  const token = auth.token;
  
  const { data: response, loading, error } = useFetchObject("users", "users", id, token);
  const { handleDelete: deleteUser, loading: isDeleting } = useDelete("users", token);
  
  // Extract user data from the response
  const user = response?.data?.user || response?.user;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        router.push('/admin/users');
      } catch (error) {
        console.error('Error deleting user:', error);
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

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'bg-red-100', text: 'text-red-800', label: 'Admin' },
      teacher: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Teacher' },
      student: { bg: 'bg-green-100', text: 'text-green-800', label: 'Student' },
      user: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'User' }
    };
    
    const config = roleConfig[role] || roleConfig.user;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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

  if (error || !user) {
    return (
      <AdminLayout title="User Not Found">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/users')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {user.email}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              {getRoleBadge(user.role)}
              {getStatusBadge(user.isActive)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/admin/users/${user.id}/edit`}
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
          {/* Left Column - User Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-48 h-48 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <User className="w-24 h-24 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">
                    {user.email}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{user.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Phone:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{user.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Role:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900 capitalize">{user.role || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Location:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{user.location || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">First Name:</span>
                  <p className="text-sm font-medium text-gray-900">{user.firstName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Last Name:</span>
                  <p className="text-sm font-medium text-gray-900">{user.lastName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="text-sm font-medium text-gray-900">{user.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Phone:</span>
                  <p className="text-sm font-medium text-gray-900">{user.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Role:</span>
                  <p className="text-sm font-medium text-gray-900 capitalize">{user.role || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p className="text-sm font-medium text-gray-900">{user.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Location:</span>
                  <p className="text-sm font-medium text-gray-900">{user.location || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Bio:</span>
                  <p className="text-sm font-medium text-gray-900">{user.bio || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{user.role || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{user.phone || 'N/A'}</p>
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
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDateTime(user.updatedAt)}</p>
                  </div>
                </div>

                {user.lastLoginAt && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Last Login</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(user.lastLoginAt)}</p>
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
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Profile Views</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user.profileViews || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Login Count</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user.loginCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}