'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Users, 
  Calendar, 
  GraduationCap, 
  Star, 
  X, 
  Eye, 
  Printer, 
  ArrowLeft, 
  Check, 
  Globe 
} from 'lucide-react';
import Layout from '../../../components/Layout';
import useFetchObject from '../../../api/useFetchObject';
import axios from 'axios';

export default function ScholarshipDetail() {
  const router = useRouter();
  const params = useParams();
  const scholarshipId = params.id;
  
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewCount, setViewCount] = useState(0);

  // Get token for API calls
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Increment view count function
  const incrementViewCount = useCallback(async (type, id) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/${type}/${id}/view` 
        : `${baseUrl}/api/${type}/${id}/view`;

      const response = await axios.post(apiUrl);
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to increment view count');
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to increment view count');
    }
  }, []);

  // Fetch scholarship data
  const { data: scholarshipResponse, isLoading: scholarshipLoading, isError: scholarshipError } = useFetchObject(
    'scholarships',
    'scholarships',
    scholarshipId,
    token
  );

  useEffect(() => {
    if (scholarshipResponse?.data?.scholarship) {
      setScholarship(scholarshipResponse.data.scholarship);
      setViewCount(scholarshipResponse.data.scholarship.viewCount || 0);
      setLoading(false);
    } else if (scholarshipError) {
      setError('Failed to load scholarship details');
      setLoading(false);
    }
  }, [scholarshipResponse, scholarshipError]);

  // Increment view count when scholarship loads (only once per session)
  useEffect(() => {
    if (scholarship && scholarshipId) {
      // Check if we've already incremented for this scholarship in this session
      const sessionKey = `scholarship_viewed_${scholarshipId}`;
      const hasViewedInSession = sessionStorage.getItem(sessionKey);
      
      if (!hasViewedInSession) {
        // Mark as viewed in this session IMMEDIATELY
        sessionStorage.setItem(sessionKey, 'true');
        
        const handleIncrementView = async () => {
          try {
            console.log('Incrementing view count for scholarship:', scholarshipId);
            const result = await incrementViewCount('scholarships', scholarshipId);
            if (result && result.viewCount) {
              setViewCount(result.viewCount);
              console.log('View count updated to:', result.viewCount);
            }
          } catch (error) {
            console.error('Failed to increment view count:', error);
            // Don't show error to user, just log it
          }
        };

        handleIncrementView();
      } else {
        console.log('Scholarship already viewed in this session, not incrementing');
      }
    }
  }, [scholarship, scholarshipId]);

  const formatAmount = (amount, currency) => {
    if (!amount) return 'Amount not specified';
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLevelLabel = (level) => {
    const levels = {
      'undergraduate': 'Undergraduate',
      'graduate': 'Graduate',
      'postgraduate': 'Postgraduate',
      'phd': 'PhD',
      'diploma': 'Diploma',
      'certificate': 'Certificate'
    };
    return levels[level] || level;
  };

  const getTypeLabel = (type) => {
    const types = {
      'merit': 'Merit-based',
      'need': 'Need-based',
      'athletic': 'Athletic',
      'academic': 'Academic',
      'research': 'Research',
      'international': 'International'
    };
    return types[type] || type;
  };

  const getCategoryLabel = (category) => {
    const categories = {
      'academic': 'Academic',
      'merit': 'Merit',
      'need-based': 'Need-based',
      'athletic': 'Athletic',
      'research': 'Research',
      'international': 'International',
      'minority': 'Minority',
      'women': 'Women'
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !scholarship) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Scholarship Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The scholarship you are looking for does not exist.'}</p>
            <button
              onClick={() => router.back()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Scholarships
              </button>
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  <Printer className="w-5 h-5 mr-2" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Scholarship Header */}
              <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{scholarship.title}</h1>
                    <p className="text-lg text-gray-600 mb-4">{scholarship.description}</p>
                  </div>
                  {scholarship.featured && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  )}
                </div>

                {/* Scholarship Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>{formatAmount(scholarship.amount, scholarship.currency)}</span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <span>{getLevelLabel(scholarship.level)}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    <span>{scholarship.provider}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>{viewCount}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                    Apply Now
                  </button>
                  <button className="border border-purple-600 text-purple-600 px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors font-semibold">
                    Save for Later
                  </button>
                </div>
              </div>

              {/* Scholarship Details */}
              <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Scholarship Details</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{scholarship.description}</p>
                  </div>

                  {scholarship.eligibility && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Requirements</h3>
                      <p className="text-gray-700 leading-relaxed">{scholarship.eligibility}</p>
                    </div>
                  )}

                  {scholarship.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Requirements</h3>
                      <p className="text-gray-700 leading-relaxed">{scholarship.requirements}</p>
                    </div>
                  )}

                  {scholarship.benefits && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                      <p className="text-gray-700 leading-relaxed">{scholarship.benefits}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{getCategoryLabel(scholarship.category)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">{getTypeLabel(scholarship.type)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Level</span>
                    <span className="font-medium">{getLevelLabel(scholarship.level)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Country</span>
                    <span className="font-medium">{scholarship.country}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">{formatAmount(scholarship.amount, scholarship.currency)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Deadline</span>
                    <span className="font-medium">{formatDate(scholarship.deadline)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      scholarship.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {scholarship.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">{scholarship.provider}</span>
                  </div>
                  
                  {scholarship.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-3 text-gray-400" />
                      <a 
                        href={scholarship.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
