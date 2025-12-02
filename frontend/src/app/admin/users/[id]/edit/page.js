'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Save,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Star
} from 'lucide-react';
import AdminLayout from '../../../../../components/AdminLayout';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useFetchObjects from '../../../../../api/useFetchObjects';
import useUpdate from '../../../../../api/useUpdate';
import { useAuth } from '../../../../../context/AuthContext';
import { toast } from 'react-toastify';

const roles = ['student', 'teacher', 'admin', 'moderator', 'hr'];
const statuses = ['active', 'inactive', 'suspended', 'pending'];
const subscriptions = ['none', 'basic', 'premium', 'enterprise'];

export default function EditUser() {
  const params = useParams();
  const router = useRouter();
  const { token, refreshUserData } = useAuth();
  const userId = params.id;

  // Use the custom hooks
  const { data: userData, isLoading, isError, error } = useFetchObjects(
    'user',
    `users/${userId}`,
    token
  );

  const { handleUpdate, loading: isSubmitting } = useUpdate(
    'users',
    token,
    '/admin/users',
    'User updated successfully!',
    'Failed to update user',
    refreshUserData
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    status: 'active',
    subscription: 'none'
  });

  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update form data when user data is loaded
  useEffect(() => {
    if (userData?.data?.user) {
      const user = userData.data.user;
      setFormData({
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
        subscription: user.subscription || 'none'
      });
    }
  }, [userData]);

  // Check for changes
  useEffect(() => {
    if (userData?.data?.user) {
      const user = userData.data.user;
      const hasFormChanges = 
        formData.firstName !== (user.firstName || user.first_name || '') ||
        formData.lastName !== (user.lastName || user.last_name || '') ||
        formData.email !== (user.email || '') ||
        formData.role !== (user.role || 'user') ||
        formData.status !== (user.status || 'active') ||
        formData.subscription !== (user.subscription || 'none');
      
      setHasUnsavedChanges(hasFormChanges);
    }
  }, [formData, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare form data for API
    const dataObject = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      subscription: formData.subscription
    };

    handleUpdate(userId, dataObject);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/users/${userId}` 
        : `${baseUrl}/api/users/${userId}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        toast.success('User deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        router.push('/admin/users');
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/admin/users');
      }
    } else {
      router.push('/admin/users');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading User...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout title="Error">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading User</h2>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Failed to load user data'}
            </p>
            <Link
              href="/admin/users"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit ${formData.firstName} ${formData.lastName}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link 
              href="/admin/users"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-sm sm:text-base text-gray-600">Update user information</p>
          </div>
            
            {hasUnsavedChanges && (
              <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm">You have unsaved changes</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Account Settings & Permissions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
                {formData.status === 'pending' && (
                  <p className="mt-1 text-xs text-yellow-600">
                    ⚠️ User cannot access dashboard until activated
                  </p>
                )}
                {formData.status === 'active' && (
                  <p className="mt-1 text-xs text-green-600">
                    ✅ User can access dashboard and post jobs
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions for HR Users */}
            {formData.role === 'hr' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Quick Actions for HR User</h3>
                <div className="flex flex-wrap gap-3">
                  {formData.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, status: 'active' }));
                        setHasUnsavedChanges(true);
                      }}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate User
                    </button>
                  )}
                  
                  {formData.subscription === 'none' && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, subscription: 'basic' }));
                        setHasUnsavedChanges(true);
                      }}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Assign Basic Plan
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, subscription: 'premium' }));
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Subscription Plan Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Subscription Plan Management
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="subscription" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Subscription Plan
                </label>
                <select
                  id="subscription"
                  name="subscription"
                  value={formData.subscription}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {subscriptions.map(subscription => (
                    <option key={subscription} value={subscription}>
                      {subscription.charAt(0).toUpperCase() + subscription.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subscription Plan Details */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Plan Details</h3>
                {formData.subscription === 'none' && (
                  <div className="text-sm text-gray-600">
                    <p className="text-red-600 font-medium">❌ No subscription - Limited access</p>
                    <ul className="mt-2 space-y-1 text-gray-500">
                      <li>• Cannot post jobs</li>
                      <li>• Limited dashboard access</li>
                      <li>• Basic user features only</li>
                    </ul>
                  </div>
                )}
                {formData.subscription === 'basic' && (
                  <div className="text-sm text-gray-600">
                    <p className="text-blue-600 font-medium">📝 Basic Plan - 5 jobs per month</p>
                    <ul className="mt-2 space-y-1 text-gray-500">
                      <li>• Can post up to 5 jobs per month</li>
                      <li>• Full dashboard access</li>
                      <li>• Basic analytics</li>
                      <li>• Email support</li>
                    </ul>
                  </div>
                )}
                {formData.subscription === 'premium' && (
                  <div className="text-sm text-gray-600">
                    <p className="text-yellow-600 font-medium">⭐ Premium Plan - 20 jobs per month</p>
                    <ul className="mt-2 space-y-1 text-gray-500">
                      <li>• Can post up to 20 jobs per month</li>
                      <li>• Advanced analytics</li>
                      <li>• Priority support</li>
                      <li>• Featured job listings</li>
                    </ul>
                  </div>
                )}
                {formData.subscription === 'enterprise' && (
                  <div className="text-sm text-gray-600">
                    <p className="text-purple-600 font-medium">🏢 Enterprise Plan - Unlimited</p>
                    <ul className="mt-2 space-y-1 text-gray-500">
                      <li>• Unlimited job postings</li>
                      <li>• Advanced analytics & reporting</li>
                      <li>• Dedicated account manager</li>
                      <li>• Custom integrations</li>
                      <li>• White-label options</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Quick Subscription Actions */}
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="text-sm font-medium text-indigo-900 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.subscription !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, subscription: 'basic' }));
                        setHasUnsavedChanges(true);
                      }}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Set Basic Plan
                    </button>
                  )}
                  
                  {formData.subscription !== 'premium' && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, subscription: 'premium' }));
                        setHasUnsavedChanges(true);
                      }}
                      className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Set Premium Plan
                    </button>
                  )}
                  
                  {formData.subscription !== 'enterprise' && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, subscription: 'enterprise' }));
                        setHasUnsavedChanges(true);
                      }}
                      className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Set Enterprise Plan
                    </button>
                  )}
                  
                  {formData.subscription !== 'none' && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, subscription: 'none' }));
                        setHasUnsavedChanges(true);
                      }}
                      className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Remove Subscription
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {showDeleteConfirm ? 'Click again to confirm' : 'Delete User'}
              </button>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
    </AdminLayout>
  );
}
