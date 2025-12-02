'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, DollarSign, GraduationCap, Calendar, Users, X, Filter, Eye, ChevronDown, Building } from 'lucide-react';
import Layout from '../../components/Layout';
import useFetchObjects from '@/api/useFetchObjects';
import { useAuth } from '../../context/AuthContext';
import { countries, filterCountries } from '../../utils/countries';

export default function Scholarships() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Country autocomplete state
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(countries);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(12);

  const { token } = useAuth();

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

  // Filter countries based on search term
  useEffect(() => {
    setFilteredCountries(filterCountries(countrySearchTerm));
  }, [countrySearchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.country-autocomplete')) {
        setShowCountryDropdown(false);
        setCountrySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setCountrySearchTerm('');
  };

  const handleCountryClear = () => {
    setSelectedCountry('All');
    setShowCountryDropdown(false);
    setCountrySearchTerm('');
  };
  
  // Fetch scholarships data from API
  // Uses debouncedSearchTerm to avoid making API calls on every keystroke
  const { data: fetchedScholarships, isLoading, isError   } = useFetchObjects(
    ['scholarships', debouncedSearchTerm, selectedCategory, selectedType, selectedLevel, selectedCountry, minAmount, maxAmount, page, rowPerPage],
    `scholarships/?search=${encodeURIComponent(debouncedSearchTerm)}&category=${selectedCategory !== 'All' ? selectedCategory : ''}&type=${selectedType !== 'All' ? selectedType : ''}&level=${selectedLevel !== 'All' ? selectedLevel : ''}&country=${selectedCountry !== 'All' ? selectedCountry : ''}&minAmount=${minAmount}&maxAmount=${maxAmount}&status=active&page=${page + 1}&limit=${rowPerPage}`,
    token
  );

  // Extract pagination info from API response
  const pagination = fetchedScholarships?.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;
  
  // Debug pagination info
  console.log('Scholarships pagination debug:', {
    fetchedScholarships,
    pagination,
    totalPages,
    totalItems,
    hasData: !!fetchedScholarships?.data,
    isLoading,
    isError
  });

  // Use real API data - backend already handles filtering, sorting, and pagination
  const scholarships = fetchedScholarships?.data?.scholarships || [];

  const categories = ['All', 'academic', 'merit', 'need-based', 'athletic', 'research', 'international', 'minority', 'women'];
  const types = ['All', 'full_tuition', 'partial_tuition', 'stipend', 'grant', 'fellowship'];
  // Common level values for filtering (level is now a free text field)
  const levels = ['All', 'Undergraduate', 'Graduate', 'Postgraduate', 'Masters', 'PhD', 'Certificate', 'Diploma'];

  const openScholarshipDetails = (scholarship) => {
    // Navigate to scholarship detail page
    window.location.href = `/scholarships/${scholarship.id}`;
  };

  return (
    <Layout>
      {/* Top Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-orange-200 z-50">
          <div className="h-full bg-orange-600 animate-pulse"></div>
        </div>
      )}
      {/* Hero Section - Classic Design */}
      <section className="bg-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Scholarship Opportunities
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Discover funding opportunities for your education worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search scholarships, organizations, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm sm:text-base"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <div className="relative country-autocomplete">
                      <div
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer flex items-center justify-between bg-white hover:border-gray-400 focus:border-purple-500"
                      >
                        <span className={selectedCountry === 'All' ? 'text-gray-500' : 'text-gray-900'}>
                          {selectedCountry === 'All' ? 'All Countries' : selectedCountry}
                        </span>
                        <div className="flex items-center space-x-1">
                          {selectedCountry !== 'All' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCountryClear();
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {showCountryDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                          <div className="p-2 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={countrySearchTerm}
                                onChange={(e) => setCountrySearchTerm(e.target.value)}
                                placeholder="Search countries..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCountries.length > 0 ? (
                              filteredCountries.map((country) => (
                                <button
                                  key={country}
                                  onClick={() => handleCountrySelect(country)}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                    selectedCountry === country ? 'bg-purple-50 text-purple-700' : 'text-gray-900'
                                  }`}
                                >
                                  {country}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">No countries found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                    <input
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                    <input
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="100000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scholarships Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Available Scholarships ({totalItems})
            </h2>
            <p className="text-gray-600">
              Browse and apply to scholarship opportunities
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading scholarships...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <GraduationCap className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Scholarships</h3>
                <p className="text-gray-600">Unable to load scholarships. Please try again later.</p>
              </div>
            </div>
          )}

          {/* Scholarships List - Compact Row Layout (Like Jobs) */}
          {!isLoading && !isError && (
            <div className="space-y-4">
              {scholarships.map((scholarship) => (
                <div 
                  key={scholarship.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => openScholarshipDetails(scholarship)}
                >
                  <div className="flex items-center gap-4">
                    {/* Logo/Icon Column */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                        </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        {/* Left: Title and Organization */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                          {scholarship.title}
                        </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              scholarship.status === 'active' ? 'bg-green-100 text-green-700' :
                              scholarship.status === 'expired' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
                            </span>
                        </div>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <Building className="w-3.5 h-3.5 mr-1.5" />
                            <span className="font-medium">{scholarship.organization}</span>
                      </div>
                          <p className="text-gray-600 text-sm line-clamp-1 mb-2">
                            {scholarship.description}
                          </p>
                    </div>

                        {/* Right: Quick Info */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <span className="font-medium">{scholarship.country}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <GraduationCap className="w-4 h-4 text-indigo-600" />
                            <span className="font-medium">{scholarship.level}</span>
                      </div>
                          <div className="flex items-center gap-1.5 text-green-700 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            <span>{scholarship.currency} {scholarship.amount?.toLocaleString() || 'Varies'}</span>
                      </div>
                          <div className="flex items-center gap-1.5 text-orange-600 font-medium">
                            <Calendar className="w-4 h-4" />
                            <span className="whitespace-nowrap">
                              {new Date(scholarship.deadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                      </div>
                      </div>
                    </div>

                      {/* Bottom Row: Category and Type */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                            <Users className="w-3 h-3 mr-1" />
                            {scholarship.category.charAt(0).toUpperCase() + scholarship.category.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scholarship.type === 'full_tuition' ? 'bg-blue-50 text-blue-700' :
                            scholarship.type === 'partial_tuition' ? 'bg-indigo-50 text-indigo-700' :
                            'bg-purple-50 text-purple-700'
                          }`}>
                            {scholarship.type.replace('_', ' ').charAt(0).toUpperCase() + scholarship.type.replace('_', ' ').slice(1)}
                          </span>
                    </div>
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openScholarshipDetails(scholarship);
                          }}
                          className="hidden sm:inline-flex items-center px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-semibold"
                      >
                        View Details
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination - Classic Style */}
          {!isLoading && scholarships.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowPerPage}
                  onChange={(e) => {
                    setRowPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                </select>
                <span className="text-sm text-gray-500">
                  ({page * rowPerPage + 1}-{Math.min((page + 1) * rowPerPage, totalItems)} of {totalItems})
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {page + 1} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}

          {/* Empty State - Classic */}
          {!isLoading && !isError && scholarships.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
              <GraduationCap className="mx-auto w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Scholarships Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'All' || selectedType !== 'All' || selectedLevel !== 'All' || selectedCountry !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'No scholarships are currently available'}
              </p>
              {(searchTerm || selectedCategory !== 'All' || selectedType !== 'All' || selectedLevel !== 'All' || selectedCountry !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedType('All');
                    setSelectedLevel('All');
                    setSelectedCountry('All');
                    setMinAmount('');
                    setMaxAmount('');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Scholarship Details Modal */}
      {showModal && selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedScholarship.title}</h2>
                  <p className="text-lg text-gray-600">{selectedScholarship.organization}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedScholarship.description}</p>
                  </div>

                  {/* Requirements */}
                  {selectedScholarship.requirements && selectedScholarship.requirements.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {selectedScholarship.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {selectedScholarship.benefits && selectedScholarship.benefits.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {selectedScholarship.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Scholarship Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{selectedScholarship.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedScholarship.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedScholarship.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">{selectedScholarship.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{selectedScholarship.currency} {selectedScholarship.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          selectedScholarship.status === 'active' ? 'text-green-600' :
                          selectedScholarship.status === 'expired' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {selectedScholarship.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium">{new Date(selectedScholarship.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                      Apply Now
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 