'use client';

import { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Video, 
  TrendingUp, 
  Settings,
  BarChart3,
  X,
  LogOut,
  User,
  Grid,
  ChevronLeft,
  CreditCard,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const navigationItems = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: Grid,
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
    id: 'authors',
    name: 'Authors',
    icon: User,
    href: '/admin/authors',
    description: 'Manage authors and writers'
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
    icon: CreditCard,
    href: '/admin/subscriptions',
    description: 'View and manage plans'
  },
  {
    id: 'subscription-management',
    name: 'Plan Management',
    icon: Crown,
    href: '/admin/subscription-management',
    description: 'Create and edit plans'
  }
];

export default function Sidebar({ onCollapseChange, onMobileClose, isMobileOpen }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
    if (onCollapseChange) {
      onCollapseChange(collapsed);
    }
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <div className={`bg-white shadow-xl border-r border-gray-100 transition-all duration-300 ease-in-out h-screen flex flex-col ${
      sidebarCollapsed ? 'w-20' : 'w-72'
    } lg:w-72`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Education Hub
                </span>
                <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Mobile Close Button */}
            <button
              onClick={handleLinkClick}
              className="lg:hidden p-2 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            {/* Desktop Collapse Button */}
            <button
              onClick={() => handleCollapseChange(!sidebarCollapsed)}
              className={`hidden lg:block p-2 hover:bg-white/50 rounded-lg transition-all duration-200 ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 sm:p-4 space-y-1 flex-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleLinkClick}
              className={`group flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:shadow-md'
              }`}
            >
              <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover:bg-indigo-100'
              }`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isActive ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'
                }`} />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <div className={`font-semibold text-sm sm:text-base ${
                    isActive ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.name}
                  </div>
                  <div className={`text-xs ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section - Fixed at bottom */}
      <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 flex-shrink-0 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-sm">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                {user?.email || user?.firstName || 'Admin User'}
              </div>
              <button 
                onClick={() => {
                  logout();
                  router.push('/auth/login');
                }}
                className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 mt-1"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
