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
  Crown,
  MessageCircle,
  Shield,
  BookMarked,
  Calendar,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

// Organized navigation groups for better UX
const navigationGroups = [
  {
    id: 'main',
    title: 'Main',
    items: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: Grid,
        href: '/admin',
        description: 'Overview and analytics',
        badge: null
      }
    ]
  },
  {
    id: 'content',
    title: 'Content Management',
    items: [
      {
        id: 'books',
        name: 'Books',
        icon: BookOpen,
        href: '/admin/books',
        description: 'Digital library',
        badge: null
      },
      {
        id: 'articles',
        name: 'Articles',
        icon: FileText,
        href: '/admin/articles',
        description: 'Educational content',
        badge: null
      },
      {
        id: 'videos',
        name: 'Videos',
        icon: Video,
        href: '/admin/videos',
        description: 'Video content',
        badge: null
      }
    ]
  },
  {
    id: 'opportunities',
    title: 'Opportunities',
    items: [
      {
        id: 'jobs',
        name: 'Jobs',
        icon: Briefcase,
        href: '/admin/jobs',
        description: 'Job postings',
        badge: null
      },
      {
        id: 'scholarships',
        name: 'Scholarships',
        icon: GraduationCap,
        href: '/admin/scholarships',
        description: 'Educational funding',
        badge: null
      }
    ]
  },
  {
    id: 'people',
    title: 'People',
    items: [
      {
        id: 'users',
        name: 'Users',
        icon: Users,
        href: '/admin/users',
        description: 'User accounts',
        badge: null
      },
      {
        id: 'authors',
        name: 'Authors',
        icon: User,
        href: '/admin/authors',
        description: 'Content creators',
        badge: null
      }
    ]
  },
  {
    id: 'business',
    title: 'Business',
    items: [
      {
        id: 'subscriptions',
        name: 'Subscriptions',
        icon: CreditCard,
        href: '/admin/subscriptions',
        description: 'View plans',
        badge: null
      },
      {
        id: 'subscription-management',
        name: 'Plan Management',
        icon: Crown,
        href: '/admin/subscription-management',
        description: 'Create plans',
        badge: null
      },
      {
        id: 'contacts',
        name: 'Contacts',
        icon: MessageCircle,
        href: '/admin/contacts',
        description: 'Messages',
        badge: null
      }
    ]
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
    <div className={`bg-white shadow-2xl border-r border-gray-200/50 transition-all duration-300 ease-in-out h-screen flex flex-col ${
      sidebarCollapsed ? 'w-16' : 'w-56'
    } lg:w-56 backdrop-blur-sm`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200/60 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex-shrink-0 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white shadow-sm"></div>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-sm font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Education Hub
                </h1>
                <p className="text-xs text-gray-600 font-medium">Admin</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mobile Close Button */}
            <button
              onClick={handleLinkClick}
              className="lg:hidden p-1 hover:bg-white/60 rounded-lg transition-all duration-200 hover:shadow-sm"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
            {/* Desktop Collapse Button */}
            <button
              onClick={() => handleCollapseChange(!sidebarCollapsed)}
              className={`hidden lg:flex items-center justify-center p-1.5 hover:bg-white/60 rounded-lg transition-all duration-200 hover:shadow-sm ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            >
              <ChevronLeft className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="p-3 space-y-1">
          {navigationGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              {/* Group Title */}
              {!sidebarCollapsed && (
                <div className="px-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
              )}
              
              {/* Group Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`group relative flex items-center space-x-2 px-2 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:shadow-sm hover:scale-[1.01]'
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm"></div>
                      )}
                      
                      <div className={`flex-shrink-0 p-1.5 rounded-md transition-all duration-200 ${
                        isActive 
                          ? 'bg-white/20 shadow-sm' 
                          : 'bg-gray-100 group-hover:bg-blue-100 group-hover:shadow-sm'
                      }`}>
                        <Icon className={`w-4 h-4 transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                        }`} />
                      </div>
                      
                      {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm transition-colors duration-200 ${
                            isActive ? 'text-white' : 'text-gray-900 group-hover:text-blue-700'
                          }`}>
                            {item.name}
                          </div>
                        </div>
                      )}
                      
                      {/* Badge */}
                      {item.badge && (
                        <div className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.badge}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User Section - Fixed at bottom */}
      <div className="border-t border-gray-200/60 bg-gradient-to-r from-slate-50/80 to-gray-50/80 backdrop-blur-sm p-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="p-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-sm">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white shadow-sm"></div>
          </div>
          
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName || 'Admin'}
              </div>
              
              <button 
                onClick={() => {
                  logout();
                  router.push('/auth/login');
                }}
                className="flex items-center space-x-2 text-xs text-gray-600 hover:text-red-600 transition-colors duration-200 mt-2 group"
              >
                <LogOut className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
