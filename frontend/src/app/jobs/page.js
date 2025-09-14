'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Clock, DollarSign, Building, Users, Calendar, Briefcase, Star, X, Check, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight, GraduationCap, Eye, Printer } from 'lucide-react';
import Layout from '../../components/Layout';
import useFetchObjects from '../../api/useFetchObjects';

// Import translations
import enTranslations from '../../locales/en.json';
import psTranslations from '../../locales/ps.json';
import drTranslations from '../../locales/dr.json';

const translations = {
  en: enTranslations,
  ps: psTranslations,
  dr: drTranslations,
};

const jobTypes = ["All Types", "full-time", "part-time", "contract", "internship", "freelance"];
const experienceLevels = ["All Levels", "entry", "junior", "mid-level", "senior", "lead", "executive"];
const jobCategories = ["All Categories", "Technology", "Education", "Data Science", "Marketing", "Research", "Healthcare", "Finance", "Sales"];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "salary-high", label: "Salary: High to Low" },
  { value: "salary-low", label: "Salary: Low to High" },
  { value: "title", label: "Title A-Z" }
];

export default function Jobs() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState('en');
  const [currentTranslations, setCurrentTranslations] = useState(translations.en);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedExperience, setSelectedExperience] = useState('All Levels');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('All Locations');
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeFilter, setActiveFilter] = useState('latest');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(12);

  // Ensure all state variables are properly initialized before using them
  const safeSearchTerm = searchTerm || '';
  const safeSelectedType = selectedType || 'All Types';
  const safeSelectedExperience = selectedExperience || 'All Levels';
  const safeSelectedCategory = selectedCategory || 'All Categories';
  const safeMinSalary = minSalary || '';
  const safeMaxSalary = maxSalary || '';
  const safeSelectedProvince = selectedProvince || 'All Locations';
  const safeSortBy = sortBy || 'newest';

  // Fetch jobs data (no authentication required for public access)
  const { data: jobsResponse, isLoading: jobsLoading, isError: jobsError, refetch: refetchJobs } = useFetchObjects(
    ['jobs', safeSearchTerm, safeSelectedType, safeSelectedExperience, safeSelectedCategory, safeMinSalary, safeMaxSalary, safeSelectedProvince, safeSortBy, page, rowPerPage],
    `jobs/?search=${encodeURIComponent(safeSearchTerm)}&type=${safeSelectedType !== 'All Types' ? safeSelectedType : ''}&experience=${safeSelectedExperience !== 'All Levels' ? safeSelectedExperience : ''}&category=${safeSelectedCategory !== 'All Categories' ? safeSelectedCategory : ''}&minSalary=${safeMinSalary}&maxSalary=${safeMaxSalary}&province=${safeSelectedProvince !== 'All Locations' ? safeSelectedProvince : ''}&sortBy=${safeSortBy}&page=${page + 1}&limit=${rowPerPage}`,
    null // No token needed for public access
  );

  // Extract pagination info from API response
  const pagination = jobsResponse?.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;
  
  // Debug pagination info
  console.log('Jobs pagination debug:', {
    jobsResponse,
    pagination,
    totalPages,
    totalItems,
    hasData: !!jobsResponse?.data,
    jobsLoading,
    jobsError
  });

  const jobs = jobsResponse?.data?.jobs || [];
  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'female') {
      return job.gender === 'female' || job.gender === 'any';
    } else if (activeFilter === 'expiring') {
      const today = new Date();
      const deadline = new Date(job.deadline || job.closingDate);
      return deadline.toDateString() === today.toDateString();
    }
    return true;
  });

  useEffect(() => {
    // Set hydrated to true after component mounts
    setIsHydrated(true);
    
    const savedLang = localStorage.getItem('language') || 'en';
    setCurrentLang(savedLang);
    setCurrentTranslations(translations[savedLang] || translations.en);
    
    // Fetch provinces for location filter
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/provinces` 
        : `${baseUrl}/api/provinces`;
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setProvinces(data.data.provinces || []);
        }
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const openJobDetails = (job) => {
    router.push(`/jobs/${job.id}`);
  };

  const formatSalary = (salary, currency) => {
    if (!salary) return 'Salary not specified';
    return `${currency} ${parseFloat(salary).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExperienceLabel = (experience) => {
    const labels = {
      'entry': 'Entry Level',
      'junior': 'Junior',
      'mid-level': 'Mid Level',
      'senior': 'Senior',
      'lead': 'Lead',
      'executive': 'Executive'
    };
    return labels[experience] || experience;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance'
    };
    return labels[type] || type;
  };


  return (
    <Layout>
      {/* Hero Section - Jobs.af Style */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find your <span className="text-yellow-300">next Job, Now!</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8">
              Search by categories, companies, locations, and job types
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Vacancy title or keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-6 pr-32 py-4 text-lg rounded-lg text-gray-900 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Search
              </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Available Jobs Section - Jobs.af Style */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Job Count and Filter Buttons */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Available Jobs ({totalItems})
            </h2>
            
            {/* Filter Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveFilter('latest')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeFilter === 'latest'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Latest Jobs
              </button>
              <button
                onClick={() => setActiveFilter('female')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeFilter === 'female'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Female Only
              </button>
              <button
                onClick={() => setActiveFilter('expiring')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeFilter === 'expiring'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Expiring Today
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 rounded-lg font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Advance Filters
              </button>
            </div>
          </div>

          {/* Filter Section */}
          {showFilters && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {jobCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All Locations">All Locations</option>
                    {provinces.map(province => (
                      <option key={province.id} value={province.name}>{province.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary</label>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary</label>
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    placeholder="100000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

      {/* Jobs Grid */}
          {!isHydrated || jobsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : jobsError ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <X className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Failed to load jobs</p>
                <p className="text-sm text-gray-600">Please try again later</p>
              </div>
              <button
                onClick={() => refetchJobs()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Briefcase className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">No jobs found</p>
                <p className="text-sm text-gray-600">Try adjusting your search criteria</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const isNew = new Date(job.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // New if created within last 7 days
                return (
                  <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => openJobDetails(job)}>
                    <div className="flex items-start justify-between">
                      {/* Left side - Company logo and job info */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Company Logo */}
                        <div className="flex-shrink-0">
                          {job.company?.logo ? (
                            <img 
                              src={job.company.logo} 
                              alt={job.company.name} 
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xl">
                                {job.company?.name?.charAt(0).toUpperCase() || 'C'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Job Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {job.title}
                            </h3>
                            {isNew && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (job.company?.id) {
                                router.push(`/companies/${job.company.id}`);
                              }
                            }}
                            className="text-gray-600 text-lg mb-2 hover:text-blue-600 transition-colors text-left"
                          >
                            {job.company?.name || 'Company not specified'}
                          </button>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>
                                {(() => {
                                  // Use province_names if available (from backend), otherwise fallback to lookup
                                  if (job.province_names && Array.isArray(job.province_names) && job.province_names.length > 0) {
                                    return job.province_names.join(', ') + ', Afghanistan';
                                  }
                                  
                                  try {
                                    const provinceIds = typeof job.province_ids === 'string' 
                                      ? JSON.parse(job.province_ids) 
                                      : job.province_ids;
                                    
                                    if (provinceIds && Array.isArray(provinceIds) && provinceIds.length > 0) {
                                      return provinceIds.map(provinceId => {
                                        const province = provinces.find(p => p.id === provinceId);
                                        return province?.name;
                                      }).filter(Boolean).join(', ') + ', Afghanistan';
                                    } else {
                                      return (job.province?.name || 'Location not specified') + ', Afghanistan';
                                    }
                                  } catch (e) {
                                    return (job.province?.name || 'Location not specified') + ', Afghanistan';
                                  }
                                })()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{formatDate(job.deadline || job.closing_date || job.createdAt)}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              <span>{job.viewCount || 0} views</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              <span className="capitalize">{job.experience?.replace('-', ' ')} Level</span>
                            </div>
                            {job.years_of_experience && (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{job.years_of_experience}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side - Vacancy count and Action icons */}
                      <div className="flex items-center gap-3">
                        {job.number_of_vacancies && job.number_of_vacancies > 1 && (
                          <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {job.number_of_vacancies} Vacancies
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle view details
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle bookmark
                            }}
                            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                            title="Bookmark"
                          >
                            <Star className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!jobsLoading && (
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowPerPage}
                  onChange={(e) => {
                    setRowPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {page + 1} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
} 