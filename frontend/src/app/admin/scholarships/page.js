'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  GraduationCap,
  Calendar,
  DollarSign,
  Users,
  Tag,
  MapPin,
  Clock,
  Award,
  Building,
  Globe,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import useFetchObjects from '@/api/useFetchObjects';
import useDelete from '@/api/useDelete';
import { useAuth } from '@/context/AuthContext';
import { countries, filterCountries } from '@/utils/countries';

const categories = ['All', 'academic', 'merit', 'need-based', 'athletic', 'research', 'international', 'minority', 'women'];
const types = ['All', 'full_tuition', 'partial_tuition', 'stipend', 'grant', 'fellowship'];
const statuses = ['All', 'active', 'expired', 'draft', 'inactive'];
// Common level values for filtering (level is now a free text field)
const levels = ['All', 'Undergraduate', 'Graduate', 'Postgraduate', 'Masters', 'PhD', 'Certificate', 'Diploma'];

export default function ScholarshipsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(10);
  
  // Country autocomplete state
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(countries);

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
    setPage(0); // Reset to first page
  };

  const handleCountryClear = () => {
    setSelectedCountry('All');
    setShowCountryDropdown(false);
    setCountrySearchTerm('');
    setPage(0); // Reset to first page
  };

  // Reset page when filters change
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  // Use the useDelete hook for clean delete functionality
  const { handleDelete, ConfirmDialog } = useDelete('scholarships', token);
  
  // Fetch scholarships data from API with backend filtering and pagination
  // Fetch scholarships from backend with pagination, search, and filters
  // Uses debouncedSearchTerm to avoid making API calls on every keystroke
  const { data: fetchedScholarships, isLoading, isError, refetch } = useFetchObjects(
    ['scholarships', debouncedSearchTerm, selectedCategory, selectedType, selectedStatus, selectedLevel, selectedCountry, page, rowPerPage],
    `scholarships/?search=${encodeURIComponent(debouncedSearchTerm)}&category=${selectedCategory !== 'All' ? selectedCategory : ''}&type=${selectedType !== 'All' ? selectedType : ''}&status=${selectedStatus !== 'All' ? selectedStatus : ''}&level=${selectedLevel !== 'All' ? selectedLevel : ''}&country=${selectedCountry !== 'All' ? selectedCountry : ''}&page=${page + 1}&limit=${rowPerPage}`,
    token
  );

  const scholarships = fetchedScholarships?.data?.scholarships || [];
  const pagination = fetchedScholarships?.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;
  const currentPage = pagination.currentPage || 1;

  // Handle delete with the clean delete hook
  const handleDeleteScholarship = (scholarshipId) => {
    handleDelete(scholarshipId);
    // The useDelete hook handles everything: confirmation, API call, and query invalidation
  };

  const handleStatusChange = (scholarshipId, newStatus) => {
    // TODO: Implement status update API call
    console.log('Update status:', scholarshipId, newStatus);
    refetch(); // Refresh data after status change
  };

  const toggleActive = async (scholarshipId) => {
    try {
      // Properly construct API URL - check if baseUrl already ends with /api
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/scholarships/${scholarshipId}/toggle-active`
        : `${baseUrl}/api/scholarships/${scholarshipId}/toggle-active`;
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh the data to get updated scholarship
        refetch();
      } else {
        const errorData = await response.json();
        console.error('Failed to toggle scholarship active status:', errorData);
      }
    } catch (error) {
      console.error('Error toggling scholarship active status:', error);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">N/A</span>;
    
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (!type) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">N/A</span>;
    
    const typeConfig = {
      'full_tuition': 'bg-green-100 text-green-800',
      'partial_tuition': 'bg-blue-100 text-blue-800',
      'stipend': 'bg-purple-100 text-purple-800',
      'grant': 'bg-orange-100 text-orange-800',
      'fellowship': 'bg-indigo-100 text-indigo-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeConfig[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    if (!category) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">N/A</span>;
    
    return (
      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
        {category}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    if (!level) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">N/A</span>;
    
    return (
      <span className="px-2 py-1 text-xs font-medium bg-pink-100 text-pink-800 rounded-full">
        {level}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return 'N/A';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  const formatAmount = (amount, currency = 'USD') => {
    if (!amount) return 'N/A';
    if (typeof amount === 'string' && amount.includes('$')) {
      return amount;
    }
    return `${currency} ${amount}`;
  };

  return (
    <AdminLayout title="Scholarships Management">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Scholarships</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage educational scholarships and funding opportunities</p>
          </div>
          <Link
            href="/admin/scholarships/create"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Add New Scholarship</span>
            <span className="sm:hidden">Add Scholarship</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search scholarships by title, organization, or description..."
                  value={searchTerm}
                  onChange={handleFilterChange(setSearchTerm)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={handleFilterChange(setSelectedCategory)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    onChange={handleFilterChange(setSelectedType)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={handleFilterChange(setSelectedStatus)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={selectedLevel}
                    onChange={handleFilterChange(setSelectedLevel)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer flex items-center justify-between bg-white hover:border-gray-400 focus:border-indigo-500"
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
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
                                  selectedCountry === country ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
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
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * rowPerPage) + 1} to {Math.min(currentPage * rowPerPage, totalItems)} of {totalItems} scholarships
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
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

        {/* Scholarships Table */}
        {!isLoading && !isError && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scholarship
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scholarships.map((scholarship) => (
                    <tr key={scholarship.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {scholarship.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {scholarship.country || 'N/A'} • {scholarship.level || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{scholarship.organization || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{scholarship.category || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatAmount(scholarship.amount, scholarship.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(scholarship.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(scholarship.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(scholarship.deadline)}
                        </div>
                        <div className={`text-sm ${isExpired(scholarship.deadline) ? 'text-red-600' : 'text-gray-500'}`}>
                          {getDaysLeft(scholarship.deadline)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleActive(scholarship.id)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            scholarship.isActive === true
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          title={scholarship.isActive === true ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {scholarship.isActive === true ? (
                            <>
                              <ToggleRight className="w-4 h-4 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/scholarships/${scholarship.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/scholarships/${scholarship.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteScholarship(scholarship.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && scholarships.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'All' || selectedType !== 'All' || selectedStatus !== 'All' || selectedLevel !== 'All' || selectedCountry !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first scholarship'
              }
            </p>
            {!searchTerm && selectedCategory === 'All' && selectedType === 'All' && selectedStatus === 'All' && selectedLevel === 'All' && selectedCountry === 'All' && (
              <Link
                href="/admin/scholarships/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Scholarship
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && scholarships.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || totalPages <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1 || totalPages <= 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{page * rowPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min((page + 1) * rowPerPage, totalItems)}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select
                  value={rowPerPage}
                  onChange={(e) => {
                    setRowPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0 || totalPages <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum - 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === page + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1 || totalPages <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog />
    </AdminLayout>
  );
}
