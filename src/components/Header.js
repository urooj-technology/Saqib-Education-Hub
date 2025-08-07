'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, Briefcase, GraduationCap, FileText, Video, User, Globe, Home, Building2 } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const navigation = [
  { name: 'navigation.home', href: '/', icon: Home },
  { name: 'navigation.books', href: '/books', icon: BookOpen },
  { name: 'navigation.jobs', href: '/jobs', icon: Briefcase },
  { name: 'navigation.scholarships', href: '/scholarships', icon: GraduationCap },
  { name: 'navigation.articles', href: '/articles', icon: FileText },
  { name: 'navigation.videos', href: '/videos', icon: Video },
  { name: 'navigation.admin', href: '/admin', icon: Building2 },
];

export default function Header({ translations, currentLang, onLanguageChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">نور ساقب</span>
                <span className="text-xs text-gray-500">Education Hub</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{translations[item.name]}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side - Language switcher and auth */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />
            
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/login"
                className="text-gray-700 hover:text-indigo-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 rounded-lg"
              >
                {translations['navigation.login']}
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {translations['navigation.register']}
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
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 block px-4 py-3 text-base font-medium transition-colors rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{translations[item.name]}</span>
                </Link>
              );
            })}
            <div className="pt-4 pb-3 border-t border-gray-200 space-y-2">
              <Link
                href="/login"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {translations['navigation.login']}
              </Link>
              <Link
                href="/register"
                className="block px-4 py-3 text-base font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {translations['navigation.register']}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 