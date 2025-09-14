'use client';

import { useState, useEffect } from 'react';
import { Shield, Eye, Lock, Database, ExternalLink, AlertCircle } from 'lucide-react';
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

export default function Privacy() {
  const [currentLang, setCurrentLang] = useState('en');
  const [currentTranslations, setCurrentTranslations] = useState(translations.en);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setCurrentLang(savedLang);
    setCurrentTranslations(translations[savedLang] || translations.en);
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-4xl mx-auto">
              Your privacy is important to us. Learn how we protect your information.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.
              </p>
              
              <div className="space-y-12">
                {/* Information We Collect */}
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <Database className="w-8 h-8 text-indigo-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                      <p className="text-gray-600 mb-3">
                        We collect personal details when you subscribe, register, or contact us:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                        <li>Name and contact information</li>
                        <li>Email address</li>
                        <li>Phone number (if provided)</li>
                        <li>Professional information (if applicable)</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Non-Personal Data</h3>
                      <p className="text-gray-600 mb-3">
                        We automatically collect certain information through cookies and analytics:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                        <li>Browser type and version</li>
                        <li>IP address and location data</li>
                        <li>Device information</li>
                        <li>Website usage patterns and preferences</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How We Use Your Information */}
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <Eye className="w-8 h-8 text-green-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-3 text-gray-600">
                    <li>To improve website functionality and user experience</li>
                    <li>To provide relevant updates, newsletters, and notifications (if you opt-in)</li>
                    <li>To monitor traffic and prevent unauthorized activities</li>
                    <li>To personalize content and recommendations</li>
                    <li>To respond to your inquiries and provide customer support</li>
                    <li>To analyze usage patterns and improve our services</li>
                  </ul>
                </div>

                {/* Data Sharing & Security */}
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <Lock className="w-8 h-8 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Data Sharing & Security</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">We Do Not Sell Your Data</h3>
                      <p className="text-gray-600">
                        We do not sell, rent, or trade your personal data with third parties for commercial purposes.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted Third-Party Services</h3>
                      <p className="text-gray-600 mb-3">
                        We may use trusted third-party services under strict confidentiality agreements:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                        <li>Analytics providers (Google Analytics)</li>
                        <li>Email service providers</li>
                        <li>Cloud hosting services</li>
                        <li>Security and monitoring tools</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Measures</h3>
                      <p className="text-gray-600">
                        While we apply industry-standard security measures, we cannot guarantee absolute protection against cyber risks. 
                        We continuously work to improve our security practices.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Third-Party Links */}
                <div className="bg-yellow-50 p-8 rounded-xl border border-yellow-200">
                  <div className="flex items-center mb-6">
                    <ExternalLink className="w-8 h-8 text-yellow-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Third-Party Links</h2>
                  </div>
                  <p className="text-gray-600">
                    Our website may contain links to external sites (e.g., scholarship providers, job boards). 
                    We are not responsible for the privacy practices of these third parties. 
                    We encourage you to review their privacy policies before providing any personal information.
                  </p>
                </div>

                {/* Your Rights */}
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <Shield className="w-8 h-8 text-purple-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
                  </div>
                  <p className="text-gray-600 mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Access your personal data we hold about you</li>
                    <li>Request correction of inaccurate or incomplete data</li>
                    <li>Request deletion of your personal data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Withdraw consent for data processing</li>
                    <li>Request data portability</li>
                  </ul>
                </div>

                {/* Policy Updates */}
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <AlertCircle className="w-8 h-8 text-orange-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Policy Updates</h2>
                  </div>
                  <p className="text-gray-600">
                    We reserve the right to update this Privacy Policy at any time. We will notify you of any significant changes 
                    by posting the new Privacy Policy on this page and updating the "Last Updated" date. 
                    Continued use of our website implies acceptance of any modifications.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-12 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions About This Privacy Policy?</h3>
                <p className="text-sm text-indigo-700 mb-2">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="text-sm text-indigo-600 space-y-1">
                  <p><strong>Email:</strong> noorsaqib@saqibeduhub.com</p>
                  <p><strong>Website:</strong> saqibeduhub.com</p>
                  <p><strong>Last Updated:</strong> January 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
