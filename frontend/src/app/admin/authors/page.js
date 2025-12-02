'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  User,
  Eye,
  Filter
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import useFetchObjects from '@/api/useFetchObjects';
import useDelete from '@/api/useDelete';
import { getAuthorProfileUrl } from '@/utils/imageUtils';

export default function AuthorsPage() {
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showFilters, setShowFilters] = useState(false);
  
  const auth = useAuth();
  const token = auth.token;

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
  
  // Fetch authors from backend with pagination, search, and sorting
  // Uses debouncedSearchTerm to avoid making API calls on every keystroke
  const {
    data: authors,
    isLoading: loading,
    isError: error,
    refetch
  } = useFetchObjects(
    ["authors", debouncedSearchTerm, sortBy, sortOrder, page, rowPerPage],
    `authors/?search=${encodeURIComponent(debouncedSearchTerm)}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page + 1}&limit=${rowPerPage}`,
    token
  );

  // Delete functionality
  const { handleDelete, ConfirmDialog } = useDelete("authors", token);
  
  console.log('Authors page - Data:', authors);
  console.log('Authors page - Data type:', typeof authors);
  console.log('Authors page - Data keys:', authors ? Object.keys(authors) : 'No data');
  console.log('Authors page - Data.data:', authors?.data);
  console.log('Authors page - Data.data.authors:', authors?.data?.authors);
  console.log('Authors page - Loading:', loading);
  console.log('Authors page - Error:', error);
  
  // Debug author profile images
  if (authors?.data && Array.isArray(authors.data)) {
    authors.data.forEach((author, index) => {
      console.log(`Author ${index + 1}:`, {
        id: author.id,
        penName: author.penName,
        profileImage: author.profileImage,
        imageUrl: author.profileImage ? getAuthorProfileUrl(author.profileImage) : 'No image'
      });
    });
  }

  // Extract pagination info from API response
  const pagination = authors?.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;

  // Extract the actual authors array from the response
  const authorsArray = authors?.data?.authors || authors?.data || authors || [];
  console.log('Authors page - Authors array:', authorsArray);
  console.log('Authors page - Is array:', Array.isArray(authorsArray));
  console.log('Authors pagination debug:', {
    authors,
    pagination,
    totalPages,
    totalItems,
    hasData: !!authors?.data
  });

  const filteredAuthors = Array.isArray(authorsArray) ? authorsArray.filter(author => {
    const matchesSearch = author.penName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) : [];

  return (
    <AdminLayout title="Authors">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Authors</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage authors and writers for books and articles</p>
          </div>
          <Link
            href="/admin/authors/create"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Add Author</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search authors by name or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="sm:hidden">Filter</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="created_at">Created Date</option>
                    <option value="updated_at">Updated Date</option>
                    <option value="penName">Name</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="DESC">Descending</option>
                    <option value="ASC">Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Authors List - Mobile Cards / Desktop Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Loading authors...</p>
            </div>
          ) : error ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-red-600">Error loading authors: {error}</p>
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="block lg:hidden p-4 space-y-4">
                {filteredAuthors.map((author) => (
                  <div key={author.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 h-12 w-12">
                        {author.profileImage ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={getAuthorProfileUrl(author.profileImage)}
                            alt={author.penName}
                            onLoad={() => console.log(`✅ Author image loaded: ${author.penName} - ${getAuthorProfileUrl(author.profileImage)}`)}
                            onError={(e) => {
                              console.log(`❌ Author image failed to load: ${author.penName} - ${e.target.src}`);
                              console.log(`Original profileImage: ${author.profileImage}`);
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-indigo-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">{author.penName}</h3>
                        <p className="text-xs text-gray-400 mt-1">ID: {author.id}</p>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {author.bio || 'No bio provided'}
                        </p>
                        <div className="mt-3 flex items-center space-x-2">
                          <Link
                            href={`/admin/authors/${author.id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/authors/${author.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 p-1"
                            onClick={() => handleDelete(author.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAuthors.map((author) => (
                      <tr key={author.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {author.profileImage ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={getAuthorProfileUrl(author.profileImage)}
                                  alt={author.penName}
                                  onLoad={() => console.log(`✅ Author image loaded: ${author.penName} - ${getAuthorProfileUrl(author.profileImage)}`)}
                                  onError={(e) => {
                                    console.log(`❌ Author image failed to load: ${author.penName} - ${e.target.src}`);
                                    console.log(`Original profileImage: ${author.profileImage}`);
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-indigo-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {author.penName}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {author.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {author.bio ? (
                              <p className="truncate">{author.bio}</p>
                            ) : (
                              <span className="text-gray-400 italic">No bio provided</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/admin/authors/${author.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/authors/${author.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDelete(author.id)}
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
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
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
                    disabled={page === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
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
                    disabled={page >= totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAuthors.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No authors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search.'
                : 'Get started by creating your first author.'
              }
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  href="/admin/authors/create"
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Add Author</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog message="Are you sure you want to delete this author? This action cannot be undone." />
    </AdminLayout>
  );
}
