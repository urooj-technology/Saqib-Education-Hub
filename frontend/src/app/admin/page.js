'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Video, 
  Loader2,
  MessageCircle,
  Building,
  RefreshCw,
  AlertCircle,
  Activity,
  Plus,
  Tag
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import useFetchObjects from '@/api/useFetchObjects';

// Professional stat card component
const StatCard = ({ title, value, icon: Icon, gradient }) => {
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full -translate-y-12 translate-x-12"></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ href, icon: Icon, title, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
  };

  return (
    <Link
      href={href}
      className={`group block p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className="w-6 h-6" />
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <Plus className="w-5 h-5 opacity-75" />
      </div>
    </Link>
  );
};

export default function AdminDashboard() {
  const { token, user, isAuthenticated } = useAuth();
  
  // Simple hook usage - just like your example
  const { 
    data: dashboardData, 
    isLoading, 
    isError,
    refetch 
  } = useFetchObjects(
    ['dashboard-stats'],
    'reports/dashboard-stats',
    token
  );
  
  // Simple authentication check - no redirects, just show message
  if (!isAuthenticated || !user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600">Please log in to access the admin dashboard</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  // Simple role check
  if (user.role !== 'admin') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You need admin privileges to access this page</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  // Loading state - clean and simple
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading dashboard data...</span>
        </div>
      </AdminLayout>
    );
  }
  
  // If there's an error, we'll still show the dashboard with static data
  // and display a small warning banner instead of blocking the whole page
  
  // No data state
  if (!dashboardData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-600">Dashboard data is not available at the moment</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Extract real data from API response
  const stats = dashboardData?.data?.overview || {
    totalUsers: 0,
    totalArticles: 0,
    totalBooks: 0,
    totalVideos: 0,
    totalJobs: 0,
    totalScholarships: 0,
    totalCompanies: 0,
    totalContacts: 0
  };


  return (
    <AdminLayout>
      <div className="space-y-6">

      

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-orange-100">Welcome back, {user?.firstName || 'Admin'}!</p>
              </div>
            </div>
            
            <button
              onClick={refetch}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>


        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Articles"
            value={stats.totalArticles}
            icon={FileText}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Books"
            value={stats.totalBooks}
            icon={BookOpen}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Videos"
            value={stats.totalVideos}
            icon={Video}
            gradient="from-red-500 to-red-600"
          />
          <StatCard
            title="Jobs"
            value={stats.totalJobs}
            icon={Briefcase}
            gradient="from-yellow-500 to-yellow-600"
          />
          <StatCard
            title="Scholarships"
            value={stats.totalScholarships}
            icon={GraduationCap}
            gradient="from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Companies"
            value={stats.totalCompanies}
            icon={Building}
            gradient="from-gray-500 to-gray-600"
          />
          <StatCard
            title="Messages"
            value={stats.totalContacts}
            icon={MessageCircle}
            gradient="from-pink-500 to-pink-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              href="/admin/articles/create"
              icon={FileText}
              title="New Article"
              color="blue"
            />
            <QuickActionCard
              href="/admin/books/create"
              icon={BookOpen}
              title="Add Book"
              color="purple"
            />
            <QuickActionCard
              href="/admin/videos/create"
              icon={Video}
              title="Upload Video"
              color="red"
            />
            <QuickActionCard
              href="/admin/jobs/create"
              icon={Briefcase}
              title="Post Job"
              color="yellow"
            />
          </div>
        </div>

        {/* Management Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Management</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              href="/admin/job-categories"
              icon={Tag}
              title="Job Categories"
              color="indigo"
            />
            <QuickActionCard
              href="/admin/companies"
              icon={Building}
              title="Companies"
              color="gray"
            />
            <QuickActionCard
              href="/admin/users"
              icon={Users}
              title="Users"
              color="blue"
            />
            <QuickActionCard
              href="/admin/contacts"
              icon={MessageCircle}
              title="Messages"
              color="pink"
            />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}