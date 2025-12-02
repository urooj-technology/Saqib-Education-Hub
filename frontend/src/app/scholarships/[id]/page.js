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
  Globe,
  Award,
  FileText,
  Tag,
  ChevronDown,
  ChevronUp
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
  // View count removed - no longer supported
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Get token for API calls
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Increment view count function
  const incrementViewCount = useCallback(async (type, id) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
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
      // View count removed - no longer supported
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
            // View count increment removed - no longer supported
            console.log('View count tracking removed');
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
      'full_tuition': 'Full Tuition',
      'partial_tuition': 'Partial Tuition',
      'stipend': 'Stipend',
      'grant': 'Grant',
      'fellowship': 'Fellowship',
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
      'athletic': 'Athletic',
      'arts': 'Arts',
      'community_service': 'Community Service',
      'leadership': 'Leadership',
      'minority': 'Minority',
      'need_based': 'Need-based',
      'merit_based': 'Merit-based',
      'research': 'Research',
      'study_abroad': 'Study Abroad',
      'graduate': 'Graduate',
      'undergraduate': 'Undergraduate',
      'other': 'Other'
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
      {/* Top Loading Bar */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-orange-200 z-50">
          <div className="h-full bg-orange-600 animate-pulse"></div>
        </div>
      )}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Scholarship Info and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Scholarship Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <div className="w-32 h-32 sm:w-40 sm:h-48 md:w-48 md:h-64 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                      <Award className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-4">
                      <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{scholarship.title}</h1>
                        <p className="text-base sm:text-lg text-gray-600 mb-4">
                          by {scholarship.organization || 'Unknown Organization'}
                        </p>
                      </div>
                      {scholarship.featured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-500">Amount:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{formatAmount(scholarship.amount, scholarship.currency)}</span>
                      </div>
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{getTypeLabel(scholarship.type)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{scholarship.country || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-500">Level:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{getLevelLabel(scholarship.level)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                        Apply Now
                      </button>
                      <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors font-semibold">
                        Save for Later
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {scholarship.description && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <div className="text-gray-700 leading-relaxed">
                    <p className={`whitespace-pre-wrap ${!showFullDescription && scholarship.description.length > 300 ? 'line-clamp-6' : ''}`}>
                      {scholarship.description}
                    </p>
                    {scholarship.description.length > 300 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-4 text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                      >
                        <span>{showFullDescription ? 'Show Less' : 'Read More'}</span>
                        {showFullDescription ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {scholarship.requirements && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                  <div className="text-gray-700 leading-relaxed">
                    <p className="whitespace-pre-wrap">{scholarship.requirements}</p>
                  </div>
                </div>
              )}

              {/* Benefits */}
              {scholarship.benefits && scholarship.benefits.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                  <div className="space-y-2">
                    {Array.isArray(scholarship.benefits) ? (
                      scholarship.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-700">{scholarship.benefits}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Scholarship Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scholarship Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Title</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{scholarship.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Building className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Organization</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{scholarship.organization || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-medium text-gray-900">{formatAmount(scholarship.amount, scholarship.currency)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Country</p>
                      <p className="text-sm font-medium text-gray-900">{scholarship.country || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Level</p>
                      <p className="text-sm font-medium text-gray-900">{getLevelLabel(scholarship.level)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Posted</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(scholarship.createdAt)}</p>
                    </div>
                  </div>
                  
                  
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Application Deadline</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(scholarship.deadline)}</p>
                    </div>
                  </div>
                </div>
              </div>


              {/* Contact Information - Only show if contact info exists */}
              {(scholarship.contactEmail || scholarship.contactPhone || scholarship.applicationUrl) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {scholarship.contactEmail && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Email</p>
                          <a 
                            href={`mailto:${scholarship.contactEmail}`}
                            className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            {scholarship.contactEmail}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {scholarship.contactPhone && (
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Phone</p>
                          <a 
                            href={`tel:${scholarship.contactPhone}`}
                            className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            {scholarship.contactPhone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {scholarship.applicationUrl && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Application URL</p>
                          <a 
                            href={scholarship.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            Visit Application Page
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
