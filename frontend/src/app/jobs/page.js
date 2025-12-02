'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Clock, DollarSign, Building, Users, Calendar, Briefcase, Star, X, Check, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight, GraduationCap, Eye, Printer } from 'lucide-react';
import Layout from '../../components/Layout';
import useFetchObjects from '@/api/useFetchObjects';

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term
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
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeFilter, setActiveFilter] = useState('latest');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(12);

  // Debounce search term - only update after user stops typing for 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to first page when search term changes
      if (searchTerm !== debouncedSearchTerm) {
        setPage(0);
      }
    }, 500); // Wait 500ms after user stops typing

    // Cleanup function - cancel the timer if user types again
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Ensure all state variables are properly initialized before using them
  const safeSearchTerm = debouncedSearchTerm || ''; // Use debounced search term for API calls
  const safeSelectedType = selectedType || 'All Types';
  const safeSelectedExperience = selectedExperience || 'All Levels';
  const safeSelectedCategory = selectedCategory || 'All Categories';
  const safeSelectedCompany = selectedCompany || 'All Companies';
  const safeMinSalary = minSalary || '';
  const safeMaxSalary = maxSalary || '';
  const safeSelectedProvince = selectedProvince || 'All Locations';
  const safeSortBy = sortBy || 'newest';

  // Build company filter - use company ID if a company is selected
  const companyFilter = safeSelectedCompany !== 'All Companies' 
    ? companies.find(c => c.name === safeSelectedCompany)?.id || ''
    : '';

  // Fetch categories data (no authentication required for public access)
  // Request all categories with high limit
  const { data: categoriesData } = useFetchObjects('job-categories', 'job-categories?limit=1000', null);

  // Create dynamic categories array with 'All Categories' plus fetched categories
  const jobCategories = ['All Categories', ...(categoriesData?.data?.categories?.map(cat => cat.name) || [])];

  // Build category filter - use category name for backend lookup
  const categoryFilter = safeSelectedCategory !== 'All Categories' ? encodeURIComponent(safeSelectedCategory) : '';
  
  // Build the API query string
  const jobsQueryString = `jobs/?search=${encodeURIComponent(safeSearchTerm)}&type=${safeSelectedType !== 'All Types' ? safeSelectedType : ''}&experience=${safeSelectedExperience !== 'All Levels' ? safeSelectedExperience : ''}&category=${categoryFilter}&company=${companyFilter}&minSalary=${safeMinSalary}&maxSalary=${safeMaxSalary}&province=${safeSelectedProvince !== 'All Locations' ? safeSelectedProvince : ''}&sortBy=${safeSortBy}&page=${page + 1}&limit=${rowPerPage}`;

  // Fetch jobs data (no authentication required for public access)
  // Uses debouncedSearchTerm to avoid making API calls on every keystroke
  const { data: jobsResponse, isLoading: jobsLoading, isError: jobsError, refetch: refetchJobs } = useFetchObjects(
    ['jobs', safeSearchTerm, safeSelectedType, safeSelectedExperience, safeSelectedCategory, companyFilter, safeMinSalary, safeMaxSalary, safeSelectedProvince, safeSortBy, page, rowPerPage],
    jobsQueryString,
    null // No token needed for public access
  );

  // Extract pagination info from API response
  const pagination = jobsResponse?.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;

  // Use real API data - backend already handles filtering, sorting, and pagination
  const jobs = jobsResponse?.data?.jobs || [];

  useEffect(() => {
    // Set hydrated to true after component mounts
    setIsHydrated(true);
    
    const savedLang = localStorage.getItem('language') || 'en';
    setCurrentLang(savedLang);
    setCurrentTranslations(translations[savedLang] || translations.en);
    
    // Fetch provinces and companies for filters
    fetchProvinces();
    fetchCompanies();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [selectedCategory, selectedCompany, selectedType, selectedExperience, selectedProvince, minSalary, maxSalary]);

  const fetchProvinces = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // Request all provinces with a high limit for the filter dropdown
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/provinces?limit=1000` 
        : `${baseUrl}/api/provinces?limit=1000`;
      
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

  const fetchCompanies = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // Request all companies with a high limit for the filter dropdown
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/companies?limit=1000` 
        : `${baseUrl}/api/companies?limit=1000`;
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCompanies(data.data?.companies || []);
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
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
      {/* Top Loading Bar */}
      {jobsLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-orange-200 z-50">
          <div className="h-full bg-orange-600 animate-pulse"></div>
        </div>
      )}
      {/* Hero Section - Professional Style */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Find your <span className="text-yellow-300">next Job, Now!</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto">
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
                  className="w-full pl-4 sm:pl-6 pr-20 sm:pr-24 py-3 sm:py-4 text-base sm:text-lg rounded-full text-gray-900 focus:ring-4 focus:ring-blue-300 focus:outline-none shadow-lg"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base shadow-md">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Available Jobs Section - Jobs.af Style */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Job Count and Filter Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {totalItems} Available Jobs
            </h2>
            
            {/* Filter and Reset Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All Types');
                  setSelectedExperience('All Levels');
                  setSelectedCategory('All Categories');
                  setSelectedCompany('All Companies');
                  setMinSalary('');
                  setMaxSalary('');
                  setSelectedProvince('All Locations');
                  setSortBy('newest');
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>

          {/* Filter Section - Professional Style */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 mb-6 sm:mb-8 shadow-sm">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Jobs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="All Categories">All Categories</option>
                      {Array.isArray(categoriesData?.data?.categories) && categoriesData.data.categories.length > 0 ? (
                        categoriesData.data.categories.map(category => (
                          <option key={category.id} value={category.name}>{category.name}</option>
                        ))
                      ) : (
                        <option disabled>Loading categories...</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="All Locations">Select Locations</option>
                      {provinces.map(province => (
                        <option key={province.id} value={province.name}>{province.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="All Companies">All Companies</option>
                      {Array.isArray(companies) && companies.length > 0 ? (
                        companies.map(company => (
                          <option key={company.id} value={company.name}>{company.name}</option>
                        ))
                      ) : (
                        <option disabled>Loading companies...</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="All Types">Select Job Type</option>
                      {jobTypes.slice(1).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Levels</label>
                    <select
                      value={selectedExperience}
                      onChange={(e) => setSelectedExperience(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="All Levels">Select Experience Levels</option>
                      {experienceLevels.slice(1).map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salary Range */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Briefcase className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">No jobs found</p>
                <p className="text-sm text-gray-600">Try adjusting your search criteria</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const isNew = new Date(job.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // New if created within last 7 days
                return (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => openJobDetails(job)}>
                    <div className="flex items-center justify-between">
                      {/* Left side - Company logo and job info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Company Logo */}
                        <div className="flex-shrink-0">
                          {job.company?.logo ? (
                            <img 
                              src={job.company.logo} 
                              alt={job.company.name} 
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs sm:text-sm">
                                {job.company?.name?.charAt(0).toUpperCase() || 'C'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Job Details */}
                        <div className="flex-1 min-w-0">
                          {/* Job Title and New Tag - Same line as logo */}
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                              {job.title}
                            </h3>
                            {isNew && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0">
                                New
                              </span>
                            )}
                          </div>
                          
                          {/* Company Name */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (job.company?.id) {
                                router.push(`/companies/${job.company.id}`);
                              }
                            }}
                            className="text-gray-600 text-sm mb-2 hover:text-blue-600 transition-colors text-left block"
                          >
                            {job.company?.name || 'Company not specified'}
                          </button>
                          
                          {/* Location - Mobile: Only location, Desktop: Location + Experience */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
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
                            
                            {/* Desktop only - Experience details */}
                            <div className="hidden sm:flex items-center">
                              <Briefcase className="w-3 h-3 mr-1" />
                              <span className="capitalize">{job.experience?.replace('-', ' ')} Level</span>
                            </div>
                            {job.years_of_experience && (
                              <div className="hidden sm:flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{job.years_of_experience}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Mobile only - Vacancy count if available */}
                          {job.number_of_vacancies && job.number_of_vacancies > 1 && (
                            <div className="sm:hidden mt-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                {job.number_of_vacancies} Vacancies
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side - Date and Action icons */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {formatDate(job.deadline || job.closing_date || job.createdAt)}
                          </div>
                          {/* Desktop only - Views */}
                          <div className="hidden sm:flex items-center justify-end mt-1">
                            <Eye className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="text-xs text-gray-400">{job.viewCount || 0} views</span>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination - Jobs.af Style */}
          {!jobsLoading && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select
                  value={rowPerPage}
                  onChange={(e) => {
                    setRowPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700 px-2">
                  Page {page + 1} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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