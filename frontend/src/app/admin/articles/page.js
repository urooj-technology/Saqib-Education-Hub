'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
  MessageCircle,
  ToggleLeft,
  ToggleRight,
  Download
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import useFetchObjects from '../../../api/useFetchObjects';
import { getImageUrl } from '../../../utils/imageUtils';


const categories = ['All', 'Education Technology', 'Mathematics', 'Artificial Intelligence', 'Sustainability', 'Digital Skills', 'Science', 'Literature', 'History'];
const statuses = ['All', 'published', 'draft', 'archived'];
const authors = ['All', 'Dr. Sarah Johnson', 'Prof. Ahmed Khan', 'Dr. Michael Chen', 'Dr. Fatima Al-Zahra', 'Prof. David Wilson'];

export default function ArticlesList() {
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [showFilters, setShowFilters] = useState(false);
  
  const auth = useAuth();
  const token = auth.token;
  
  // Fetch articles from backend with pagination, search, and filters
  const {
    data: fetchedArticles,
    isLoading: loading,
    isError: error,
    refetch
  } = useFetchObjects(
    ["articles", searchTerm, selectedCategory, selectedStatus, selectedAuthor, sortBy, page, rowPerPage],
    `articles/?search=${encodeURIComponent(searchTerm)}&category=${selectedCategory !== 'All' ? selectedCategory : ''}&status=${selectedStatus !== 'All' ? selectedStatus : ''}&author=${selectedAuthor !== 'All' ? selectedAuthor : ''}&sortBy=${sortBy}&page=${page + 1}&limit=${rowPerPage}`,
    token
  );

  // Extract pagination info from API response
  const pagination = fetchedArticles?.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;
  

  // Use backend paginated data directly - no client-side filtering needed
  const articles = fetchedArticles?.data?.articles || [];
  
  // Debug pagination info
  console.log('Articles pagination debug:', {
    fetchedArticles,
    articles,
    totalPages,
    totalItems,
    currentPage: page + 1,
    rowPerPage
  });

  const handleDelete = (articleId) => {
    if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      setArticles(articles.filter(article => article.id !== articleId));
    }
  };

  const handleStatusChange = (articleId, newStatus) => {
    setArticles(articles.map(article => 
      article.id === articleId ? { ...article, status: newStatus } : article
    ));
  };

  const toggleFeatured = (articleId) => {
    setArticles(articles.map(article => 
      article.id === articleId ? { ...article, featured: !article.featured } : article
    ));
  };

  const toggleActive = async (articleId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com'}/api/articles/${articleId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Update the article in the local state
        setArticles(articles.map(article => 
          article.id === articleId ? { ...article, isActive: result.data.article.isActive } : article
        ));
        setFilteredArticles(articles.map(article => 
          article.id === articleId ? { ...article, isActive: result.data.article.isActive } : article
        ));
      } else {
        console.error('Failed to toggle article active status');
      }
    } catch (error) {
      console.error('Error toggling article active status:', error);
    }
  };

  const handleDownload = async (articleId, event) => {
    try {
      // Show loading state
      const button = event.target;
      const originalText = button.innerHTML;
      button.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>';
      button.disabled = true;

      // Direct download
      const downloadUrl = `https://api.saqibeduhub.com/api/articles/${articleId}/download`;
      
      // Test if the URL is accessible first
      const response = await fetch(downloadUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('PDF not available for download');
      }

      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `article-${articleId}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Reset button state
      button.innerHTML = originalText;
      button.disabled = false;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
      
      // Reset button state
      const button = event.target;
      button.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
      button.disabled = false;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    return (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
        {category}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastModified = (dateString) => {
    const now = new Date();
    const lastModified = new Date(dateString);
    const diffTime = Math.abs(now - lastModified);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  return (
    <AdminLayout title="Articles Management">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Articles</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage educational articles and content</p>
          </div>
          <Link
            href="/admin/articles/create"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Add New Article</span>
            <span className="sm:hidden">Add Article</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-3 lg:space-y-0">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles by title, content, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm sm:text-base"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {authors.map(author => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="publishedAt">Published Date</option>
                    <option value="createdAt">Created Date</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {articles.length} of {totalItems} articles
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading articles: {error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Articles List - Mobile Cards / Desktop Table */}
        {!loading && !error && (
          <>
            {/* Mobile Cards View */}
            <div className="block lg:hidden space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      {article.featuredImageUrl || article.featuredImage ? (
                        <img
                          src={article.featuredImageUrl || `${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com'}${article.featuredImage}`}
                          alt={article.title}
                          className="h-16 w-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="hidden text-xs text-gray-500 text-center p-2">
                        No Image
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{article.title}</h3>
                      <div className="flex items-center mt-1">
                        <User className="w-3 h-3 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500 font-medium">
                          {article.authors && article.authors.length > 0 
                            ? article.authors[0].penName || 'Unknown Author'
                            : 'No Author'
                          }
                        </p>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {article.excerpt || (
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: article.content?.substring(0, 100) + '...' || '' 
                            }}
                          />
                        )}
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.category}
                        </span>
                        {getStatusBadge(article.status)}
                        <button
                          onClick={() => toggleActive(article.id)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            article.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          title={article.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {article.isActive ? (
                            <>
                              <ToggleRight className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <div>Published: {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Draft'}</div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-2">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-900 p-1"
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
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published
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
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              {article.featuredImageUrl || article.featuredImage ? (
                                <img
                                  src={article.featuredImageUrl || `${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com'}${article.featuredImage}`}
                                  alt={article.title}
                                  className="h-12 w-12 rounded-lg object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="hidden text-xs text-gray-500 text-center p-1">
                                No Image
                              </div>
                            </div>
                            <div className={`${(article.featuredImageUrl || article.featuredImage) ? 'ml-4' : ''}`}>
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {article.title}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {article.excerpt || (
                                  <div 
                                    dangerouslySetInnerHTML={{ 
                                      __html: article.content?.substring(0, 100) + '...' || '' 
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900 font-medium">
                              {article.authors && article.authors.length > 0 
                                ? article.authors[0].penName || 'Unknown Author'
                                : 'No Author'
                              }
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(article.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Draft'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleActive(article.id)}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                              article.isActive 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            title={article.isActive ? 'Click to deactivate' : 'Click to activate'}
                          >
                            {article.isActive ? (
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
                            {article.documentAttachment && (
                              <button
                                onClick={(e) => handleDownload(article.id, e)}
                                className="text-green-600 hover:text-green-900"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(article.id)}
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
          </>
        )}

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
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedAuthor !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first article'
              }
            </p>
            {!searchTerm && selectedCategory === 'All' && selectedStatus === 'All' && selectedAuthor === 'All' && (
              <Link
                href="/admin/articles/create"
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Add New Article</span>
                <span className="sm:hidden">Add Article</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
