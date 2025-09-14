'use client';

import { useState, useEffect } from 'react';
import { Mail, Globe, MapPin, Phone, Shield, FileText, Users, Lightbulb, CheckCircle, ExternalLink } from 'lucide-react';
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

export default function About() {
  const [currentLang, setCurrentLang] = useState('en');
  const [currentTranslations, setCurrentTranslations] = useState(translations.en);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setCurrentLang(savedLang);
    setCurrentTranslations(translations[savedLang] || translations.en);
  }, []);

  const coreValues = [
    {
      icon: Shield,
      title: "Integrity",
      description: "Providing accurate and verified content"
    },
    {
      icon: Globe,
      title: "Accessibility", 
      description: "Ensuring free and easy access to learning materials"
    },
    {
      icon: Users,
      title: "Empowerment",
      description: "Supporting students, professionals, and researchers through opportunities"
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Using technology to deliver engaging and diverse resources"
    }
  ];

  const services = [
    "Scholarly Articles & Research Content",
    "Downloadable PDF Books and Academic Materials", 
    "Job and Scholarship Announcements",
    "Short Educational Video Clips"
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Saqib Education Hub
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-4xl mx-auto">
              Your gateway to knowledge, opportunities, and growth
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              About Us
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Welcome to <strong>saqibeduhub.com</strong> – a comprehensive platform dedicated to providing educational resources, research materials, career opportunities, and knowledge-sharing tools for learners, professionals, and researchers worldwide.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our platform is designed to make quality information and opportunities accessible to everyone. We aim to bridge the gap between knowledge seekers and resources by offering:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-lg text-gray-600">
                {services.map((service, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    {service}
                  </li>
                ))}
              </ul>
              <p className="text-lg text-gray-600 leading-relaxed">
                At <strong>saqibeduhub.com</strong>, we believe that knowledge transforms societies. Therefore, we are committed to delivering authentic, reliable, and value-driven content to empower individuals in their academic and professional journeys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Who We Are
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We are a group of educators, researchers, writers, and digital innovators working to create a platform where knowledge, opportunity, and accessibility come together.
              </p>
              
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Our Core Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {coreValues.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h4>
                          <p className="text-gray-600">{value.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                We are not just a website – we are a community of learners and contributors striving for academic and professional excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Learn More About Us
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Explore our policies, terms, and get in touch with our team
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <a 
                href="/contact"
                className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
                <p className="text-gray-600 mb-4">
                  Get in touch with our team for questions, suggestions, and collaboration opportunities.
                </p>
                <span className="text-indigo-600 font-medium group-hover:text-indigo-700">
                  Get in Touch →
                </span>
              </a>
              
              <a 
                href="/privacy"
                className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Policy</h3>
                <p className="text-gray-600 mb-4">
                  Learn how we collect, use, and protect your personal information.
                </p>
                <span className="text-green-600 font-medium group-hover:text-green-700">
                  Read Policy →
                </span>
              </a>
              
              <a 
                href="/terms"
                className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
                <p className="text-gray-600 mb-4">
                  Review our terms of service and user responsibilities.
                </p>
                <span className="text-purple-600 font-medium group-hover:text-purple-700">
                  View Terms →
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
