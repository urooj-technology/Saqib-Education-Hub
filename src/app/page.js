'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Briefcase, GraduationCap, FileText, Video, Search, Users, Award, Star, Clock, MapPin, TrendingUp, Globe, Shield, Zap } from 'lucide-react';
import Layout from '../components/Layout';

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

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setCurrentLang(savedLang);
    setCurrentTranslations(translations[savedLang] || translations.en);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: currentTranslations['home.features.books.title'] || 'Digital Library',
      description: currentTranslations['home.features.books.description'] || 'Access thousands of PDF books across various subjects',
      href: '/books',
      color: 'from-blue-500 to-blue-600',
      stats: '10,000+ Books'
    },
    {
      icon: Briefcase,
      title: currentTranslations['home.features.jobs.title'] || 'Career Opportunities',
      description: currentTranslations['home.features.jobs.description'] || 'Find your dream job with our comprehensive job board',
      href: '/jobs',
      color: 'from-green-500 to-green-600',
      stats: '5,000+ Jobs'
    },
    {
      icon: GraduationCap,
      title: currentTranslations['home.features.scholarships.title'] || 'Scholarships',
      description: currentTranslations['home.features.scholarships.description'] || 'Discover funding opportunities for your education',
      href: '/scholarships',
      color: 'from-purple-500 to-purple-600',
      stats: '2,000+ Scholarships'
    },
    {
      icon: FileText,
      title: currentTranslations['home.features.articles.title'] || 'Educational Articles',
      description: currentTranslations['home.features.articles.description'] || 'Stay updated with the latest educational content',
      href: '/articles',
      color: 'from-orange-500 to-orange-600',
      stats: '1,500+ Articles'
    },
    {
      icon: Video,
      title: currentTranslations['home.features.videos.title'] || 'Video Learning',
      description: currentTranslations['home.features.videos.description'] || 'Learn through curated educational video content',
      href: '/videos',
      color: 'from-red-500 to-red-600',
      stats: '3,000+ Videos'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Books Available', icon: BookOpen, color: 'text-blue-600' },
    { number: '5,000+', label: 'Job Opportunities', icon: Briefcase, color: 'text-green-600' },
    { number: '2,000+', label: 'Scholarships', icon: GraduationCap, color: 'text-purple-600' },
    { number: '50,000+', label: 'Active Users', icon: Users, color: 'text-indigo-600' },
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2 text-yellow-400" />
                Trusted by 50,000+ users worldwide
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {currentTranslations['home.hero.title'] || 'Welcome to Noor Saqib Education Hub'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto leading-relaxed">
              {currentTranslations['home.hero.subtitle'] || 'Your gateway to knowledge, opportunities, and growth'}
            </p>
            <p className="text-lg mb-12 text-indigo-200 max-w-4xl mx-auto leading-relaxed">
              {currentTranslations['home.hero.description'] || 'Discover books, find jobs, explore scholarships, read articles, and watch educational videos all in one place.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for your educational journey in one place
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  href={feature.href}
                  className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">
                      {feature.stats}
                    </div>
                    <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700">
                      Learn more
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
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
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who have found success through our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
