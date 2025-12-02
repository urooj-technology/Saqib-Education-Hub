'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Briefcase, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Play,
  Pause
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useFetchObjects from '../../../api/useFetchObjects';
import { toast } from 'react-toastify';

export default function UserDashboard() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [userStats, setUserStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    expiredJobs: 0,
    draftJobs: 0
  });

  const [userSubscription, setUserSubscription] = useState({
    plan: 'none',
    jobLimit: 0
  });

  // Ref to track previous jobs length to prevent unnecessary updates
  const prevJobsLengthRef = useRef(0);
  const prevSubscriptionRef = useRef({ plan: 'none', jobLimit: 0 });

  // Fetch user's jobs
  const { data: jobsResponse, isLoading: jobsLoading, refetch: refetchJobs } = useFetchObjects(
    ['user-jobs', user?.id],
    'jobs/my-jobs',
    token
  );

  const jobs = jobsResponse?.data?.jobs || [];

  // Calculate subscription info with useMemo to prevent infinite loops
  const subscriptionInfo = useMemo(() => ({
    plan: userSubscription.plan,
    jobLimit: userSubscription.jobLimit,
    jobsPosted: jobs.length,
    remainingJobs: Math.max(0, userSubscription.jobLimit - jobs.length)
  }), [userSubscription.plan, userSubscription.jobLimit, jobs.length]);

  // Fetch subscription information
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!token) return;
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/subscriptions/my-subscription` 
          : `${baseUrl}/api/subscriptions/my-subscription`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const subscriptionData = data.data;
          
          if (subscriptionData && subscriptionData.subscription) {
            const plan = subscriptionData.subscription.plan?.name || 'none';
            const jobLimit = subscriptionData.subscription.plan?.jobLimit || 0;
            
            // Only update if values have actually changed
            if (prevSubscriptionRef.current.plan !== plan || prevSubscriptionRef.current.jobLimit !== jobLimit) {
              prevSubscriptionRef.current = { plan, jobLimit };
              setUserSubscription({ plan, jobLimit });
            }
          } else {
            // No active subscription found
            if (prevSubscriptionRef.current.plan !== 'none' || prevSubscriptionRef.current.jobLimit !== 0) {
              prevSubscriptionRef.current = { plan: 'none', jobLimit: 0 };
              setUserSubscription({ plan: 'none', jobLimit: 0 });
            }
          }
        } else {
          // If no subscription found, set default values
          if (prevSubscriptionRef.current.plan !== 'none' || prevSubscriptionRef.current.jobLimit !== 0) {
            prevSubscriptionRef.current = { plan: 'none', jobLimit: 0 };
            setUserSubscription({ plan: 'none', jobLimit: 0 });
          }
        }
      } catch (error) {
        console.error('Error fetching subscription info:', error);
        // Set default values on error
        if (prevSubscriptionRef.current.plan !== 'none' || prevSubscriptionRef.current.jobLimit !== 0) {
          prevSubscriptionRef.current = { plan: 'none', jobLimit: 0 };
          setUserSubscription({ plan: 'none', jobLimit: 0 });
        }
      }
    };

    fetchSubscriptionInfo();
  }, [token]);


  // Calculate stats directly in useEffect to prevent infinite loops
  useEffect(() => {
    const currentJobsLength = jobs?.length || 0;
    
    // Only update if jobs length has actually changed
    if (prevJobsLengthRef.current !== currentJobsLength) {
      prevJobsLengthRef.current = currentJobsLength;
      
      if (jobs && Array.isArray(jobs) && jobs.length > 0) {
        const stats = {
          totalJobs: jobs.length,
          activeJobs: jobs.filter(job => job.status === 'active').length,
          pendingJobs: jobs.filter(job => job.status === 'pending').length,
          expiredJobs: jobs.filter(job => job.status === 'expired').length,
          draftJobs: jobs.filter(job => job.status === 'draft').length
        };
        setUserStats(stats);
      } else {
        setUserStats({
          totalJobs: 0,
          activeJobs: 0,
          pendingJobs: 0,
          expiredJobs: 0,
          draftJobs: 0
        });
      }
    }
  }, [jobs]); // Depend on jobs array

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

  const handleCreateJob = () => {
    router.push('/user/jobs/create');
  };

  const handleEditJob = (jobId) => {
    router.push(`/user/jobs/${jobId}/edit`);
  };

  const handleViewJob = (jobId) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleActivateJob = async (jobId) => {
    if (confirm('Are you sure you want to activate this job? It will be visible to the public.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/jobs/${jobId}` 
          : `${baseUrl}/api/jobs/${jobId}`;
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'active' })
        });
        
        if (response.ok) {
          toast.success('Job activated successfully!');
          refetchJobs(); // Refresh the job list
        } else {
          const errorData = await response.json();
          toast.error(`Failed to activate job: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error activating job:', error);
        toast.error('Failed to activate job. Please try again.');
      }
    }
  };

  const handleDeactivateJob = async (jobId) => {
    if (confirm('Are you sure you want to deactivate this job? It will no longer be visible to the public.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/jobs/${jobId}` 
          : `${baseUrl}/api/jobs/${jobId}`;
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'draft' })
        });
        
        if (response.ok) {
          toast.success('Job deactivated successfully!');
          refetchJobs(); // Refresh the job list
        } else {
          const errorData = await response.json();
          toast.error(`Failed to deactivate job: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deactivating job:', error);
        toast.error('Failed to deactivate job. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Account Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 
                  user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {user.status === 'active' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : user.status === 'pending' ? (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Approval
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {user.status}
                    </>
                  )}
                </span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/auth/login';
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.activeJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.pendingJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.expiredJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.draftJobs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status Alert */}
        {user.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Account Pending Approval
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Your account is currently pending admin approval. Once approved, you'll be able to post jobs according to your subscription plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Star className="w-5 h-5 mr-2 text-indigo-600" />
              Subscription Information
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscriptionInfo.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
              subscriptionInfo.plan === 'premium' ? 'bg-blue-100 text-blue-800' :
              subscriptionInfo.plan === 'basic' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {subscriptionInfo.plan.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-2">Current Plan</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {subscriptionInfo.plan}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {subscriptionInfo.plan === 'enterprise' ? 'Unlimited job postings' :
                 subscriptionInfo.plan === 'premium' ? 'Up to 50 job postings' :
                 subscriptionInfo.plan === 'basic' ? 'Up to 10 job postings' :
                 'No active plan'}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-2">Jobs Posted</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptionInfo.jobsPosted}
                </p>
                <p className="text-sm text-gray-500 ml-1">
                  / {subscriptionInfo.jobLimit === 999 ? '∞' : subscriptionInfo.jobLimit}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    subscriptionInfo.remainingJobs > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${subscriptionInfo.jobLimit === 999 ? 100 : 
                           Math.min(100, (subscriptionInfo.jobsPosted / subscriptionInfo.jobLimit) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-2">Remaining Jobs</p>
              <p className={`text-2xl font-bold ${
                subscriptionInfo.remainingJobs > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {subscriptionInfo.jobLimit === 999 ? '∞' : subscriptionInfo.remainingJobs}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {subscriptionInfo.remainingJobs > 0 ? 'Available to post' : 'Limit reached'}
              </p>
            </div>
          </div>
          
          {subscriptionInfo.remainingJobs <= 0 && subscriptionInfo.plan !== 'enterprise' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    You've reached your job posting limit for the {subscriptionInfo.plan} plan.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Consider upgrading your plan to post more jobs or contact support for assistance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCreateJob}
              disabled={user.status !== 'active' || subscriptionInfo.remainingJobs <= 0}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={`User status: ${user?.status}, Remaining jobs: ${subscriptionInfo.remainingJobs}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
              {subscriptionInfo.remainingJobs > 0 && (
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  {subscriptionInfo.remainingJobs} left
                </span>
              )}
            </button>
            <button
              onClick={() => router.push('/user/profile')}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              Update Profile
            </button>
          </div>
          {subscriptionInfo.remainingJobs <= 0 && subscriptionInfo.plan !== 'enterprise' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ You've reached your job posting limit for the {subscriptionInfo.plan} plan. 
                Consider upgrading to post more jobs.
              </p>
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
              <button
                onClick={() => router.push('/user/jobs')}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {jobsLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-6 text-center">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
                <p className="text-gray-500 mb-4">Get started by posting your first job.</p>
                <button
                  onClick={handleCreateJob}
                  disabled={user.status !== 'active'}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={`User status: ${user?.status}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </button>
              </div>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{job.company?.name || 'No company'}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Posted {formatDate(job.createdAt)}
                        </span>
                        {job.closingDate && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Closes {formatDate(job.closingDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.status === 'draft' && (
                        <button
                          onClick={() => handleActivateJob(job.id)}
                          className="p-2 text-green-400 hover:text-green-600 transition-colors"
                          title="Activate Job"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {job.status === 'active' && (
                        <button
                          onClick={() => handleDeactivateJob(job.id)}
                          className="p-2 text-orange-400 hover:text-orange-600 transition-colors"
                          title="Deactivate Job"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewJob(job.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Job"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditJob(job.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit Job"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
