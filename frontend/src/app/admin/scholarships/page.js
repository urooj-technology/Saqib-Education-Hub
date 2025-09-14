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
  ToggleRight
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';
import useFetchObjects from '../../../api/useFetchObjects';
import { useAuth } from '../../../context/AuthContext';

const categories = ['All', 'academic', 'merit', 'need-based', 'athletic', 'research', 'international', 'minority', 'women'];
const types = ['All', 'full_tuition', 'partial_tuition', 'stipend', 'grant', 'fellowship'];
const statuses = ['All', 'active', 'expired', 'draft', 'inactive'];
const levels = ['All', 'undergraduate', 'graduate', 'postgraduate', 'phd', 'certificate'];
const countries = ['All', 'Afghanistan', 'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'Multiple'];

export default function ScholarshipsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const { token } = useAuth();
  
  // Fetch scholarships data from API
  const { data: fetchedScholarships, isLoading, isError, refetch } = useFetchObjects(
    'scholarships',
    { limit: 100 },
    token
  );

  const scholarships = fetchedScholarships?.data?.scholarships || [];

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scholarship.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || scholarship.category === selectedCategory;
    const matchesType = selectedType === 'All' || scholarship.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || scholarship.status === selectedStatus;
    const matchesLevel = selectedLevel === 'All' || scholarship.level === selectedLevel;
    const matchesCountry = selectedCountry === 'All' || scholarship.country === selectedCountry;

    return matchesSearch && matchesCategory && matchesType && matchesStatus && matchesLevel && matchesCountry;
  });

  const handleDelete = (scholarshipId) => {
    if (confirm('Are you sure you want to delete this scholarship? This action cannot be undone.')) {
      // TODO: Implement delete API call
      console.log('Delete scholarship:', scholarshipId);
      refetch(); // Refresh data after deletion
    }
  };

  const handleStatusChange = (scholarshipId, newStatus) => {
    // TODO: Implement status update API call
    console.log('Update status:', scholarshipId, newStatus);
    refetch(); // Refresh data after status change
  };

  const toggleActive = async (scholarshipId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com'}/api/scholarships/${scholarshipId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh the data to get updated scholarship
        refetch();
      } else {
        console.error('Failed to toggle scholarship active status');
      }
    } catch (error) {
      console.error('Error toggling scholarship active status:', error);
    }
  };

  const getStatusBadge = (status) => {
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
    return (
      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
        {category}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-pink-100 text-pink-800 rounded-full">
        {level}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const getDaysLeft = (deadline) => {
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                    onChange={(e) => setSelectedType(e.target.value)}
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
                    onChange={(e) => setSelectedStatus(e.target.value)}
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
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredScholarships.length} of {scholarships.length} scholarships
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
                  {filteredScholarships.map((scholarship) => (
                    <tr key={scholarship.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {scholarship.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {scholarship.country} • {scholarship.level}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{scholarship.organization}</div>
                        <div className="text-sm text-gray-500">{scholarship.category}</div>
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
                            scholarship.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          title={scholarship.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {scholarship.isActive ? (
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
                            onClick={() => handleDelete(scholarship.id)}
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
        {!isLoading && !isError && filteredScholarships.length === 0 && (
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
      </div>
    </AdminLayout>
  );
}
