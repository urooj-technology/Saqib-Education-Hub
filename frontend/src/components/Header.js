'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, LogOut, Briefcase, CheckCircle, Clock, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'navigation.home', href: '/' },
  { name: 'navigation.books', href: '/books' },
  { name: 'navigation.jobs', href: '/jobs' },
  { name: 'navigation.scholarships', href: '/scholarships' },
  { name: 'navigation.articles', href: '/articles' },
  { name: 'navigation.videos', href: '/videos' },
  { name: 'navigation.about', href: '/about' },
  { name: 'navigation.contact', href: '/contact' },
  // { name: 'navigation.admin', href: '/admin' },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ps', name: 'پښتو', flag: '🇦🇫' },
  { code: 'dr', name: 'دری', flag: '🇦🇫' }
];

export default function Header({ translations, currentLang, onLanguageChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showLanguageMenu && !event.target.closest('.language-menu-container')) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showLanguageMenu]);

  const handleLanguageChange = (langCode) => {
    onLanguageChange?.(langCode);
    setShowLanguageMenu(false);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];
  


  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 lg:space-x-3 group">
              <div className="w-8 h-8 lg:w-10 lg:h-10 relative group-hover:scale-110 transition-transform duration-200">
                <Image
                  src="/logo/Logo Designe.png"
                  alt="Saqib Education Hub Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 1024px) 32px, 40px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg lg:text-xl font-bold text-gray-900">Saqib</span>
                <span className="text-xs text-gray-500 hidden sm:block">Education Hub</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 border border-transparent hover:border-indigo-200"
              >
                {translations[item.name] || item.name.replace('navigation.', '') || 'Navigation'}
              </Link>
            ))}
          </nav>

          {/* Right side - Language icon and profile */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Language Icon */}
            <div className="relative language-menu-container">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
                title={`Current language: ${currentLanguage.name}`}
              >
                <Globe className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 text-xs bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {currentLanguage.flag}
                </span>
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3 ${
                          currentLang === language.code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center space-x-3">
                {/* User Status */}
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.status === 'active' ? 'bg-green-100 text-green-800' : 
                    user?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {user?.status === 'active' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : user?.status === 'pending' ? (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {user?.status}
                      </>
                    )}
                  </span>
                </div>

                {/* User Menu */}
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden xl:block">{user?.firstName}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      {user?.role === 'hr' && (
                        <>
                          <Link
                            href="/user/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Briefcase className="w-4 h-4 mr-3" />
                            Dashboard
                          </Link>
                          <Link
                            href="/user/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4 mr-3" />
                            My Profile
                          </Link>
                        </>
                      )}
                      
                      {user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Post Jobs
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {translations[item.name] || item.name.replace('navigation.', '') || 'Navigation'}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      user?.status === 'active' ? 'bg-green-100 text-green-800' : 
                      user?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {user?.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : user?.status === 'pending' ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {user?.status}
                        </>
                      )}
                    </span>
                  </div>
                  
                  {user?.role === 'hr' && (
                    <>
                      <Link
                        href="/user/dashboard"
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      <Link
                        href="/user/profile"
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        My Profile
                      </Link>
                    </>
                  )}
                  
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Admin Panel
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 rounded-lg"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex items-center px-4 py-3 text-base font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="w-4 h-4 mr-3" />
                    Post Jobs
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 