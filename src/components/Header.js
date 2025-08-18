'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const navigation = [
  { name: 'navigation.home', href: '/' },
  { name: 'navigation.books', href: '/books' },
  { name: 'navigation.jobs', href: '/jobs' },
  { name: 'navigation.scholarships', href: '/scholarships' },
  { name: 'navigation.articles', href: '/articles' },
  { name: 'navigation.videos', href: '/videos' },
  // { name: 'navigation.admin', href: '/admin' },
];

export default function Header({ translations, currentLang, onLanguageChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  


  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 lg:space-x-3 group">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-lg lg:text-xl font-bold">ن</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg lg:text-xl font-bold text-gray-900">نور ساقب</span>
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

          {/* Right side - Language switcher and auth */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />
            
            <div className="hidden lg:flex items-center space-x-3">
              <Link
                href="/login"
                className="text-gray-700 hover:text-indigo-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 rounded-lg"
              >
                {translations['navigation.login'] || 'Login'}
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {translations['navigation.register'] || 'Register'}
              </Link>
            </div>

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
              <Link
                href="/login"
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-200 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {translations['navigation.login'] || 'Login'}
              </Link>
              <Link
                href="/register"
                className="flex items-center px-4 py-3 text-base font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {translations['navigation.register'] || 'Register'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 