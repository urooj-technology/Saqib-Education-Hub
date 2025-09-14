'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Briefcase, GraduationCap, FileText, Video, Search, Users, Award, Star, Clock, MapPin, TrendingUp, Globe, Shield, Zap, DollarSign, Building, Calendar, Bookmark, FileText as FileIcon } from 'lucide-react';
import Layout from '../components/Layout';
import useFetchObjects from '../api/useFetchObjects';

// Import translations
import enTranslations from '../locales/en.json';
import psTranslations from '../locales/ps.json';
import drTranslations from '../locales/dr.json';

const translations = {
  en: enTranslations,
  ps: psTranslations,
  dr: drTranslations,
};

export default function Home() {
  const [currentLang, setCurrentLang] = useState('en');
  const [currentTranslations, setCurrentTranslations] = useState(translations.en);
  const [activeFilter, setActiveFilter] = useState('latest');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setCurrentLang(savedLang);
    setCurrentTranslations(translations[savedLang] || translations.en);
  }, []);

  // Fetch all jobs for the home page
  const { data: jobsResponse, isLoading: jobsLoading, isError: jobsError } = useFetchObjects(
    ['all-jobs'],
    'jobs/?sortBy=newest&page=1&limit=50',
    null // No token needed for public access
  );

  // Fetch statistics for hero section
  const { data: booksResponse } = useFetchObjects(
    ['books-stats'],
    'books/?page=1&limit=1',
    null
  );

  const { data: scholarshipsResponse } = useFetchObjects(
    ['scholarships-stats'],
    'scholarships/?page=1&limit=1',
    null
  );

  const { data: articlesResponse } = useFetchObjects(
    ['articles-stats'],
    'articles/?page=1&limit=1',
    null
  );

  const allJobs = jobsResponse?.data?.jobs || [];
  
  // Extract real statistics
  const realStats = {
    books: booksResponse?.data?.pagination?.totalItems || 0,
    jobs: jobsResponse?.data?.pagination?.totalItems || 0,
    scholarships: scholarshipsResponse?.data?.pagination?.totalItems || 0,
    articles: articlesResponse?.data?.pagination?.totalItems || 0,
  };

  // Debug: Log articles API response
  console.log('Articles API Response:', articlesResponse);
  console.log('Articles pagination:', articlesResponse?.data?.pagination);
  console.log('Real Stats Articles:', realStats.articles);
  
  // Filter jobs based on active filter
  const filteredJobs = allJobs.filter(job => {
    if (activeFilter === 'female') {
      return job.gender === 'female' || job.gender === 'any';
    } else if (activeFilter === 'expiring') {
      const today = new Date();
      const deadline = new Date(job.deadline || job.closingDate);
      return deadline.toDateString() === today.toDateString();
    }
    return true;
  });

  // Format numbers with proper formatting
  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K+`;
    }
    return num.toString();
  };

  const features = [
    {
      icon: BookOpen,
      title: currentTranslations['home.features.books.title'] || 'Digital Library',
      description: currentTranslations['home.features.books.description'] || 'Access thousands of PDF books across various subjects',
      href: '/books',
      color: 'from-blue-500 to-blue-600',
      stats: `${formatNumber(realStats.books)} Books`
    },
    {
      icon: Briefcase,
      title: currentTranslations['home.features.jobs.title'] || 'Career Opportunities',
      description: currentTranslations['home.features.jobs.description'] || 'Find your dream job with our comprehensive job board',
      href: '/jobs',
      color: 'from-green-500 to-green-600',
      stats: `${formatNumber(realStats.jobs)} Jobs`
    },
    {
      icon: GraduationCap,
      title: currentTranslations['home.features.scholarships.title'] || 'Scholarships',
      description: currentTranslations['home.features.scholarships.description'] || 'Discover funding opportunities for your education',
      href: '/scholarships',
      color: 'from-purple-500 to-purple-600',
      stats: `${formatNumber(realStats.scholarships)} Scholarships`
    },
    {
      icon: FileText,
      title: currentTranslations['home.features.articles.title'] || 'Educational Articles',
      description: currentTranslations['home.features.articles.description'] || 'Stay updated with the latest educational content',
      href: '/articles',
      color: 'from-orange-500 to-orange-600',
      stats: `${formatNumber(realStats.articles)} Articles`
    },
    {
      icon: Video,
      title: currentTranslations['home.features.videos.title'] || 'Video Learning',
      description: currentTranslations['home.features.videos.description'] || 'Learn through curated educational video content',
      href: '/videos',
      color: 'from-red-500 to-red-600',
      stats: '3,000+ Videos' // Keep static for now as we don't have videos API
    }
  ];

  const stats = [
    { number: formatNumber(realStats.books), label: 'Books Available', icon: BookOpen, color: 'text-blue-600' },
    { number: formatNumber(realStats.jobs), label: 'Job Opportunities', icon: Briefcase, color: 'text-green-600' },
    { number: formatNumber(realStats.scholarships), label: 'Scholarships', icon: GraduationCap, color: 'text-purple-600' },
    { number: formatNumber(realStats.articles), label: 'Articles', icon: FileText, color: 'text-orange-600' },
  ];

  const testimonials = [
    {
      name: "Ahmed Khan",
      role: "Software Engineer",
      content: "This platform helped me find the perfect job opportunity. The resources are excellent!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Fatima Zahra",
      role: "Student",
      content: "The scholarship section is amazing. I found several opportunities that matched my profile perfectly.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Mohammad Ali",
      role: "Teacher",
      content: "The educational resources and articles have been invaluable for my teaching career.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const benefits = [
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Available in English, Pashto, and Dari for everyone"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with industry-standard security"
    },
    {
      icon: Zap,
      title: "Fast & Reliable",
      description: "Optimized for speed and performance across all devices"
    },
    {
      icon: TrendingUp,
      title: "Regular Updates",
      description: "New content and features added regularly"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4 mr-2 text-yellow-400" />
                Trusted by 50,000+ users worldwide
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {currentTranslations['home.hero.title'] || 'Welcome to Noor Saqib Education Hub'}
            </h1>
            <p className="text-lg md:text-xl mb-6 text-indigo-100 max-w-3xl mx-auto leading-relaxed">
              {currentTranslations['home.hero.subtitle'] || 'Your gateway to knowledge, opportunities, and growth'}
            </p>
            <p className="text-base mb-8 text-indigo-200 max-w-4xl mx-auto leading-relaxed">
              {currentTranslations['home.hero.description'] || 'Discover books, find jobs, explore scholarships, read articles, and watch educational videos all in one place.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/books"
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {currentTranslations['home.hero.cta'] || 'Get Started'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-900 transition-all duration-200"
              >
                {currentTranslations['navigation.jobs'] || 'Browse Jobs'}
              </Link>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className={`text-2xl md:text-3xl font-bold mb-1 ${stat.color}`}>
                      {stat.number}
                    </div>
                    <div className="text-indigo-200 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="text-center mb-12">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for jobs"
                  className="w-full px-6 py-4 pr-32 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg"
                />
                <button className="absolute right-2 top-2 bg-indigo-600 text-white px-8 py-2 rounded-full hover:bg-indigo-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>


          {/* All Jobs */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                All Jobs ({filteredJobs.length})
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveFilter('latest')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === 'latest' 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Latest Jobs
                </button>
                <button
                  onClick={() => setActiveFilter('female')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === 'female' 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Female Only
                </button>
                <button
                  onClick={() => setActiveFilter('expiring')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === 'expiring' 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Expiring Today
                </button>
              </div>
            </div>

            {jobsLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobsError ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-4">Failed to load jobs</div>
                <p className="text-gray-600">Please try again later</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 text-lg mb-2">No jobs available</div>
                <p className="text-gray-400">Check back later for new opportunities</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job, index) => (
                  <Link
                    key={job.id || index}
                    href={`/jobs/${job.id}`}
                    className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left side - Company logo and job info */}
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Company Logo */}
                        <div className="flex-shrink-0">
                          {job.company?.logo ? (
                            <img 
                              src={job.company.logo} 
                              alt={job.company.name} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Building className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Job Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-base font-semibold text-gray-900 truncate">{job.title}</h4>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                              New
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{job.company?.name || 'Company'}</p>
                          <div className="flex items-center text-xs text-gray-500 space-x-3">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{job.location || 'Location not specified'}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              }) : 'No deadline'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right side - Vacancies and actions */}
                      <div className="flex items-center space-x-3">
                        {job.number_of_vacancies && job.number_of_vacancies > 1 && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            {job.number_of_vacancies} Vacancies
                          </span>
                        )}
                        <div className="flex space-x-1">
                          <button 
                            onClick={(e) => e.preventDefault()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <FileIcon className="w-4 h-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={(e) => e.preventDefault()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Bookmark className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link
                href="/jobs"
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View All Jobs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {/* <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Noor Saqib?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the best educational resources and opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

      

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
            Join thousands of students and professionals who are already using our platform to advance their education and careers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-900 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
