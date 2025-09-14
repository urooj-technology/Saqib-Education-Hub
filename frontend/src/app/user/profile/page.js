'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  CreditCard,
  Edit,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useFetchObjects from '../../../api/useFetchObjects';
import Link from 'next/link';

export default function UserProfile() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  // Fetch user's jobs to get actual count
  const { data: jobsResponse } = useFetchObjects(
    ['user-jobs-count', user?.id],
    'jobs/my-jobs',
    token
  );

  const userJobs = jobsResponse?.data?.jobs || [];
  const jobsThisMonth = userJobs.filter(job => {
    const jobDate = new Date(job.createdAt);
    const now = new Date();
    return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
  }).length;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Show loading state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const getSubscriptionBadge = (subscription) => {
    const subscriptionConfig = {
      none: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-yellow-100 text-yellow-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${subscriptionConfig[subscription] || 'bg-gray-100 text-gray-800'}`}>
        {subscription ? subscription.charAt(0).toUpperCase() + subscription.slice(1) : 'None'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/user/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your account information and subscription</p>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                  <p className="text-gray-900">{user.firstName || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                  <p className="text-gray-900">{user.lastName || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="text-gray-900">{user.email || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  <p className="text-gray-900">{user.phone || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                  <p className="text-gray-900">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Member Since</label>
                  <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Account Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  {getStatusBadge(user.status)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Email Verified:</span>
                  <span className={`text-sm ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="space-y-6">
            {/* Subscription Plan */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Subscription Plan
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Current Plan:</span>
                  {getSubscriptionBadge(user.subscription)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Job Posting Limit:</span>
                  <span className="text-sm text-gray-900">
                    {user.subscription === 'none' ? '0' : 
                     user.subscription === 'basic' ? '5' :
                     user.subscription === 'premium' ? '20' :
                     user.subscription === 'enterprise' ? 'Unlimited' : '0'} jobs/month
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Jobs Posted This Month:</span>
                  <span className={`text-sm font-medium ${
                    user.subscription === 'none' ? 'text-red-600' :
                    user.subscription === 'basic' && jobsThisMonth >= 5 ? 'text-red-600' :
                    user.subscription === 'premium' && jobsThisMonth >= 20 ? 'text-red-600' :
                    'text-gray-900'
                  }`}>
                    {jobsThisMonth}
                    {user.subscription !== 'enterprise' && (
                      <span className="text-xs text-gray-500 ml-1">
                        /{user.subscription === 'none' ? '0' : 
                          user.subscription === 'basic' ? '5' :
                          user.subscription === 'premium' ? '20' : '0'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link
                  href="/user/jobs/create"
                  className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Post New Job
                </Link>
                
                <Link
                  href="/user/dashboard"
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
