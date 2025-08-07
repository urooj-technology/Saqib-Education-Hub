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
  BarChart3
} from 'lucide-react';
import Layout from '../../components/Layout';

// Import translations
import enTranslations from '../../locales/en.json';
import psTranslations from '../../locales/ps.json';
import drTranslations from '../../locales/dr.json';

const translations = {
  en: enTranslations,
  ps: psTranslations,
  dr: drTranslations,
};

// Mock data for admin dashboard
const mockStats = {
  users: 15420,
  books: 1250,
  jobs: 890,
  scholarships: 450,
  articles: 320,
  videos: 180,
  totalViews: 1250000,
  totalDownloads: 89000
};

const mockRecentActivity = [
  {
    id: 1,
    type: 'book',
    action: 'uploaded',
    title: 'Advanced Mathematics',
    user: 'Dr. Ahmed Khan',
    time: '2 hours ago'
  },
  {
    id: 2,
    type: 'job',
    action: 'posted',
    title: 'Senior Software Engineer',
    user: 'Tech Solutions Inc.',
    time: '4 hours ago'
  },
  {
    id: 3,
    type: 'scholarship',
    action: 'added',
    title: 'Fulbright Scholarship',
    user: 'Admin',
    time: '6 hours ago'
  },
  {
    id: 4,
    type: 'article',
    action: 'published',
    title: 'Future of Education',
    user: 'Dr. Sarah Johnson',
    time: '1 day ago'
  },
  {
    id: 5,
    type: 'video',
    action: 'uploaded',
    title: 'Computer Science Tutorial',
    user: 'Prof. Michael Chen',
    time: '2 days ago'
  }
];

const adminSections = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: BarChart3,
    href: '/admin',
    description: 'Overview and analytics'
  },
  {
    id: 'users',
    name: 'Users',
    icon: Users,
    href: '/admin/users',
    description: 'Manage user accounts'
  },
  {
    id: 'books',
    name: 'Books',
    icon: BookOpen,
    href: '/admin/books',
    description: 'Manage digital library'
  },
  {
    id: 'jobs',
    name: 'Jobs',
    icon: Briefcase,
    href: '/admin/jobs',
    description: 'Manage job postings'
  },
  {
    id: 'scholarships',
    name: 'Scholarships',
    icon: GraduationCap,
    href: '/admin/scholarships',
    description: 'Manage scholarships'
  },
  {
    id: 'articles',
    name: 'Articles',
    icon: FileText,
    href: '/admin/articles',
    description: 'Manage educational articles'
  },
  {
    id: 'videos',
    name: 'Videos',
    icon: Video,
    href: '/admin/videos',
    description: 'Manage video content'
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: TrendingUp,
    href: '/admin/subscriptions',
    description: 'Manage subscription plans'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    href: '/admin/settings',
    description: 'System configuration'
  }
];

export default function AdminDashboard() {
  const [currentLang, setCurrentLang] = useState('en');
  const [currentTranslations, setCurrentTranslations] = useState(translations.en);
  const [stats, setStats] = useState(mockStats);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setCurrentLang(savedLang);
    setCurrentTranslations(translations[savedLang] || translations.en);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'book':
        return BookOpen;
      case 'job':
        return Briefcase;
      case 'scholarship':
        return GraduationCap;
      case 'article':
        return FileText;
      case 'video':
        return Video;
      default:
        return Eye;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'book':
        return 'text-blue-600 bg-blue-100';
      case 'job':
        return 'text-green-600 bg-green-100';
      case 'scholarship':
        return 'text-purple-600 bg-purple-100';
      case 'article':
        return 'text-orange-600 bg-orange-100';
      case 'video':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentTranslations['admin.dashboard']}
          </h1>
          <p className="text-gray-600">
            Manage your educational platform and monitor performance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.users)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Books</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.books)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.jobs)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalViews)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Sections */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">{section.name}</h3>
                          <p className="text-sm text-gray-500">{section.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Scholarships</span>
                <span className="font-medium">{stats.scholarships}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Articles</span>
                <span className="font-medium">{stats.articles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Videos</span>
                <span className="font-medium">{stats.videos}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Downloads</span>
                <span className="font-medium">{formatNumber(stats.totalDownloads)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Views per Item</span>
                <span className="font-medium">1,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-medium">8,420</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add New Content
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 