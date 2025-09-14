'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Video, 
  TrendingUp, 
  Eye,
  Plus,
  Settings,
  BarChart3,
  BookMarked,
  Award,
  PlayCircle,
  ArrowUp,
  UserPlus,
  BookOpenCheck,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import useFetchObjects from '../../api/useFetchObjects';

export default function AdminDashboard() {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Fetch real data from APIs
  const { data: usersData, isLoading: usersLoading } = useFetchObjects(
    ['admin-users-stats'],
    'users/stats',
    token
  );
  
  const { data: jobsData, isLoading: jobsLoading } = useFetchObjects(
    ['admin-jobs-analytics'],
    'jobs/analytics',
    token
  );
  
  const { data: booksData, isLoading: booksLoading } = useFetchObjects(
    ['admin-books-stats'],
    'books/stats',
    token
  );
  
  const { data: articlesData, isLoading: articlesLoading } = useFetchObjects(
    ['admin-articles-stats'],
    'articles/stats',
    token
  );
  
  const { data: videosData, isLoading: videosLoading } = useFetchObjects(
    ['admin-videos-stats'],
    'videos/stats',
    token
  );
  
  const { data: scholarshipsData, isLoading: scholarshipsLoading } = useFetchObjects(
    ['admin-scholarships-stats'],
    'scholarships/stats/overview',
    token
  );

  // Calculate stats from API data
  const stats = {
    totalUsers: usersData?.data?.totalUsers || 0,
    totalBooks: booksData?.data?.totalBooks || 0,
    totalArticles: articlesData?.data?.totalArticles || 0,
    totalVideos: videosData?.data?.totalVideos || 0,
    totalScholarships: scholarshipsData?.data?.totalScholarships || 0,
    totalJobs: jobsData?.data?.analytics?.totalJobs || 0
  };

  // Mock data for recent activities and pending approvals (these would need separate endpoints)
  const [recentActivities] = useState([
    {
      id: 1,
      title: 'New book added: "Advanced Mathematics"',
      user: 'Dr. Sarah Johnson',
      time: '2 hours ago',
      type: 'book'
    },
    {
      id: 2,
      title: 'Article published: "Study Tips for Students"',
      user: 'Prof. Michael Chen',
      time: '4 hours ago',
      type: 'article'
    },
    {
      id: 3,
      title: 'Video uploaded: "Physics Lab Tutorial"',
      user: 'Dr. Emily Davis',
      time: '6 hours ago',
      type: 'video'
    }
  ]);

  const [pendingApprovals] = useState([
    {
      id: 1,
      name: 'Introduction to Computer Science',
      type: 'Book',
      time: '1 hour ago',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Summer Internship Program',
      type: 'Job',
      time: '3 hours ago',
      priority: 'medium'
    }
  ]);

  const isLoading = usersLoading || jobsLoading || booksLoading || articlesLoading || videosLoading || scholarshipsLoading;

  const quickActions = [
    {
      id: 'add-book',
      name: 'Add Book',
      icon: BookOpen,
      href: '/admin/books/create',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'from-blue-600 to-blue-700'
    },
    {
      id: 'add-article',
      name: 'Add Article',
      icon: FileText,
      href: '/admin/articles/create',
      color: 'from-green-500 to-green-600',
      hoverColor: 'from-green-600 to-green-700'
    },
    {
      id: 'add-video',
      name: 'Add Video',
      icon: Video,
      href: '/admin/videos/create',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'from-purple-600 to-purple-700'
    },
    {
      id: 'add-scholarship',
      name: 'Add Scholarship',
      icon: Award,
      href: '/admin/scholarships/create',
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'from-orange-600 to-orange-700'
    },
    {
      id: 'add-job',
      name: 'Add Job',
      icon: Briefcase,
      href: '/admin/jobs/create',
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'from-indigo-600 to-indigo-700'
    },
    {
      id: 'add-user',
      name: 'Add User',
      icon: UserPlus,
      href: '/admin/users/create',
      color: 'from-teal-500 to-teal-600',
      hoverColor: 'from-teal-600 to-teal-700'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <AdminLayout title="Education Hub Dashboard">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading dashboard data...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Education Hub Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, Admin! 👋</h1>
              <p className="text-indigo-100 text-lg">Here's what's happening with your education platform today.</p>
            </div>
            <div className="hidden lg:block">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Activity className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Users */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  +12%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.totalUsers.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Total Registered Users</p>
            </div>
          </div>

          {/* Total Books */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  +8%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.totalBooks.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Digital Library Books</p>
            </div>
          </div>

          {/* Total Articles */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  +15%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.totalArticles.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Educational Articles</p>
            </div>
          </div>

          {/* Total Videos */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  +23%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.totalVideos.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Video Tutorials</p>
            </div>
          </div>

          {/* Total Scholarships */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  +5%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.totalScholarships.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Available Scholarships</p>
            </div>
          </div>

          {/* Total Jobs */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  +18%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.totalJobs.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Job Opportunities</p>
            </div>
          </div>
        </div>

        {/* Recent Activities and Pending Approvals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
                </div>
                <button className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                  <Eye className="w-4 h-4" />
                  <span>View All</span>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <BookOpenCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">{activity.title}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No recent activities found</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Pending Approvals</h3>
                </div>
                <button className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>Review All</span>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {pendingApprovals.length > 0 ? (
                <div className="space-y-4">
                  {pendingApprovals.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <BookMarked className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">{item.name}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-gray-200 rounded-full">{item.type}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <p className="text-gray-600 mt-1">Quickly add new content to your platform</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a
                    key={action.id}
                    href={action.href}
                    className={`group flex items-center space-x-3 px-6 py-4 bg-gradient-to-r ${action.color} hover:${action.hoverColor} text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-semibold text-lg">{action.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 