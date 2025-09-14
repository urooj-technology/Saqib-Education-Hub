'use client';

import { useState, useEffect } from 'react';
import { FileText, Shield, AlertTriangle, Scale } from 'lucide-react';
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

export default function Terms() {
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
              Terms and Conditions
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-4xl mx-auto">
              Please read these terms carefully before using our platform
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                By accessing and using <strong>saqibeduhub.com</strong>, you agree to the following terms:
              </p>
              
              <div className="space-y-12">
                {/* Intellectual Property */}
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <FileText className="w-8 h-8 text-indigo-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Intellectual Property</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-3 text-gray-600">
                    <li>All articles, PDFs, and media available on our website are protected by copyright laws.</li>
                    <li>You may not reproduce, distribute, or modify our content without prior written consent, except for personal, educational, and non-commercial purposes with proper attribution.</li>
                  </ul>
                </div>

                {/* Accuracy of Information */}
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Accuracy of Information</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-3 text-gray-600">
                    <li>While we strive for accuracy, we do not guarantee that all content (including job/scholarship announcements) is error-free or up-to-date.</li>
                    <li>Users are advised to verify information directly with official sources before making decisions.</li>
                  </ul>
                </div>

                {/* Disclaimer for Jobs & Scholarships */}
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <Scale className="w-8 h-8 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Disclaimer for Jobs & Scholarships</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-3 text-gray-600">
                    <li>Job postings, scholarships, and opportunities are informational only.</li>
                    <li>We are not responsible for application outcomes, eligibility decisions, or the credibility of external organizations.</li>
                  </ul>
                </div>

                {/* User Responsibilities */}
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <Shield className="w-8 h-8 text-green-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">User Responsibilities</h2>
                  </div>
                  <ul className="list-disc list-inside space-y-3 text-gray-600">
                    <li>You agree not to use this platform for unlawful purposes, including spreading harmful content, plagiarism, or unauthorized data extraction.</li>
                    <li>You are responsible for ensuring that your use of the website complies with local, national, and international laws.</li>
                  </ul>
                </div>

                {/* Limitation of Liability */}
                <div className="bg-red-50 p-8 rounded-xl border border-red-200">
                  <div className="flex items-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
                  </div>
                  <p className="text-gray-600">
                    Saqibeduhub.com and its team shall not be held liable for any direct, indirect, or incidental damages arising from the use or inability to use our content and services.
                  </p>
                </div>

                {/* Modifications to Terms */}
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <FileText className="w-8 h-8 text-indigo-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Modifications to Terms</h2>
                  </div>
                  <p className="text-gray-600">
                    We reserve the right to modify or update these Terms and Conditions at any time. Continued use of the website constitutes acceptance of such changes.
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="mt-12 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-700">
                  <strong>Last Updated:</strong> January 2025
                </p>
                <p className="text-sm text-indigo-600 mt-2">
                  If you have any questions about these Terms and Conditions, please contact us at noorsaqib@saqibeduhub.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
