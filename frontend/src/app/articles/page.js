'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Calendar, User, Heart, Share2, Clock, Tag, X, Filter, Download } from 'lucide-react';
import Layout from '../../components/Layout';
import useFetchObjects from '@/api/useFetchObjects';



// Categories will be fetched dynamically from the API

const sortOptions = [
  { value: 'publishedAt', label: 'Latest First' },
  { value: 'createdAt', label: 'Newest First' },
  { value: 'title', label: 'Title A-Z' }
];


export default function Articles() {
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedAuthor, setSelectedAuthor] = useState('All Authors');

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

  // Fetch article categories dynamically
  const { data: categoriesData, loading: categoriesLoading } = useFetchObjects(
    "article-categories",
    "article-categories?limit=1000"
  );
  const articleCategories = categoriesData?.data?.categories || [];
  const categories = ["All Categories", ...articleCategories.map(cat => cat.name)];

  // Fetch authors dynamically
  const { data: authorsData, loading: authorsLoading } = useFetchObjects(
    "article-authors",
    "articles/authors?limit=1000"
  );
  const articleAuthors = authorsData?.data?.authors || [];
  const authors = ["All Authors", ...articleAuthors.map(author => author.penName)];

  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Fetch articles from backend with pagination and search (no authentication required for public access)
  // Uses debouncedSearchTerm to avoid making API calls on every keystroke
  const {
    data: fetchedArticles,
    isLoading: loading,
    isError: error,
    refetch
  } = useFetchObjects(
    ["articles", debouncedSearchTerm, selectedCategory, selectedAuthor, sortBy, sortOrder, page, rowPerPage],
    `articles/?search=${encodeURIComponent(debouncedSearchTerm)}&category=${selectedCategory !== 'All Categories' ? selectedCategory : ''}&author=${selectedAuthor !== 'All Authors' ? selectedAuthor : ''}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page + 1}&limit=${rowPerPage}`,
    null // No token needed for public access
  );

  // Extract pagination info from API response with fallback values
  const pagination = fetchedArticles?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  };
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;

  // Use real API data - backend already handles filtering, sorting, and pagination
  const articles = fetchedArticles?.data?.articles || fetchedArticles?.data?.results || [];

  const openArticleDetails = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  // Handle page changes with loading state
  const handlePageChange = (newPage) => {
    setIsPageLoading(true);
    setPage(newPage);
    // Loading will be cleared when new data arrives
  };

  // Handle row per page changes with loading state
  const handleRowPerPageChange = (newRowPerPage) => {
    setIsPageLoading(true);
    setRowPerPage(newRowPerPage);
    setPage(0); // Reset to first page
    // Loading will be cleared when new data arrives
  };

  // Handle search with loading state
  const handleSearchChange = (newSearchTerm) => {
    setIsPageLoading(true);
    setSearchTerm(newSearchTerm);
    setPage(0); // Reset to first page
    // Loading will be cleared when new data arrives
  };

  // Handle category change with loading state
  const handleCategoryChange = (newCategory) => {
    setIsPageLoading(true);
    setSelectedCategory(newCategory);
    setPage(0); // Reset to first page
    // Loading will be cleared when new data arrives
  };

  // Handle author change with loading state
  const handleAuthorChange = (newAuthor) => {
    setIsPageLoading(true);
    setSelectedAuthor(newAuthor);
    setPage(0); // Reset to first page
    // Loading will be cleared when new data arrives
  };

  // Handle sort change with loading state
  const handleSortChange = (newSortBy) => {
    setIsPageLoading(true);
    setSortBy(newSortBy);
    setPage(0); // Reset to first page
    // Loading will be cleared when new data arrives
  };

  // Handle sort order change with loading state
  const handleSortOrderChange = (newSortOrder) => {
    setIsPageLoading(true);
    setSortOrder(newSortOrder);
    setPage(0); // Reset to first page
    // Loading will be cleared when new data arrives
  };

  // Clear loading state when data changes
  useEffect(() => {
    if (fetchedArticles && !loading) {
      setIsPageLoading(false);
    }
  }, [fetchedArticles, loading]);

  const handleDownload = async (articleId, event) => {
    try {
      // Show loading state
      const button = event.target;
      const originalText = button.innerHTML;
      button.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>';
      button.disabled = true;

      // Direct download without opening PDF viewer
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const downloadUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/articles/${articleId}/download`
        : `${baseUrl}/api/articles/${articleId}/download`;
      
      // Use a more robust download approach
      try {
        // First, try to fetch the file with proper CORS headers
        const response = await fetch(downloadUrl, { 
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/pdf, */*',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Get the blob data
        const blob = await response.blob();
        
        // Create download link with blob URL
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `article-${articleId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(url);
        
      } catch (fetchError) {
        console.warn('Direct fetch failed, trying fallback method:', fetchError);
        
        // Fallback: Direct link download (may trigger browser download)
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `article-${articleId}.pdf`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Reset button state
      button.innerHTML = originalText;
      button.disabled = false;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to download PDF: ${error.message}. Please try again.`);
      
      // Reset button state
      const button = event.target;
      button.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
      button.disabled = false;
    }
  };

  const handleShare = async (article) => {
    const shareData = {
      title: article.title,
      text: article.excerpt || article.description || 'Check out this educational article',
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        // Use native Web Share API if available
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert('Article link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing article:', error);
      // Final fallback: Copy to clipboard
      try {
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert('Article link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  return (
    <Layout>
      {/* Top Loading Bar */}
      {(loading || isPageLoading) && (
        <div className="fixed top-0 left-0 w-full h-1 bg-orange-200 z-50">
          <div className="h-full bg-orange-600 animate-pulse"></div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Educational Articles
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto">
              Stay updated with the latest educational content, tips, and insights
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search articles, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm sm:text-base"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <select
                    value={selectedAuthor}
                    onChange={(e) => handleAuthorChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={authorsLoading}
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
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortOrder"
                      value="DESC"
                      checked={sortOrder === 'DESC'}
                      onChange={(e) => handleSortOrderChange(e.target.value)}
                      className="mr-2"
                    />
                    Newest First
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortOrder"
                      value="ASC"
                      checked={sortOrder === 'ASC'}
                      onChange={(e) => handleSortOrderChange(e.target.value)}
                      className="mr-2"
                    />
                    Oldest First
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Articles ({totalItems})
            </h2>
            <p className="text-gray-600">
              Browse our latest educational articles and insights
            </p>
          </div>

          {/* Loading State */}
          {(loading || isPageLoading) && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-2 text-gray-600">
                {isPageLoading ? 'Loading new articles...' : 'Loading articles...'}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg font-medium mb-2">Failed to load articles</div>
              <p className="text-gray-600 mb-4">Please try again later</p>
              <button 
                onClick={() => refetch()}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Articles Grid - Card Format */}
          {!loading && !isPageLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">No articles found</div>
                  <p className="text-gray-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                articles.map((article) => (
              <div key={article.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                {/* Article Image */}
                <div className="relative">
                  {article.featuredImageUrl ? (
                    <img
                      src={article.featuredImageUrl}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        console.error('Failed to load image:', article.featuredImageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-4xl font-bold mb-2">📚</div>
                        <div className="text-sm opacity-90">Educational Article</div>
                      </div>
                    </div>
                  )}
                  
                  {article.featured && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </div>
                  )}
                  
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {article.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <div className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt || article.description || (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: article.content?.substring(0, 150) + '...' || '' 
                        }}
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">
                        {article.authors && article.authors.length > 0 
                          ? article.authors.map(author => author.penName).join(', ') || 'Unknown Author'
                          : article.author || 'No Author'
                        }
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {article.publishedAt || article.publishDate ? 
                        new Date(article.publishedAt || article.publishDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 
                        new Date(article.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      }
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => openArticleDetails(article)}
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium mr-2"
                    >
                      Read More
                    </button>
                    <div className="flex items-center space-x-2">
                      {article.documentAttachment && (
                        <button
                          onClick={(e) => handleDownload(article.id, e)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleShare(article)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Share article"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && !isPageLoading && articles.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowPerPage}
                  onChange={(e) => handleRowPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                </select>
                <span className="text-sm text-gray-600 ml-4">
                  Showing {page * rowPerPage + 1}-{Math.min((page + 1) * rowPerPage, totalItems)} of {totalItems}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <span className="text-sm font-medium text-gray-700 px-2">
                  Page {page + 1} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Article Details Modal */}
      {showModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h2>
                  <p className="text-lg text-gray-600">
                    {selectedArticle.authors && selectedArticle.authors.length > 0 
                      ? selectedArticle.authors.map(author => author.penName).join(', ') || 'Unknown Author'
                      : selectedArticle.author || 'No Author'
                    }
                  </p>
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
                    {selectedArticle.featuredImageUrl ? (
                      <img
                        src={selectedArticle.featuredImageUrl}
                        alt={selectedArticle.title}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                        onError={(e) => {
                          console.error('Failed to load modal image:', selectedArticle.featuredImageUrl);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center rounded-lg mb-4">
                        <div className="text-white text-center">
                          <div className="text-6xl font-bold mb-2">📚</div>
                          <div className="text-lg opacity-90">Educational Article</div>
                        </div>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Article Content</h3>
                    <div 
                      className="text-gray-600 leading-relaxed prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content || '' }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Article Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedArticle.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published:</span>
                        <span className="font-medium">
                          {selectedArticle.publishedAt || selectedArticle.publishDate ? 
                            new Date(selectedArticle.publishedAt || selectedArticle.publishDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 
                            new Date(selectedArticle.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedArticle.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    
                    {selectedArticle?.documentAttachment && (
                      <button
                        onClick={(e) => handleDownload(selectedArticle.id, e)}
                        className="flex items-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </button>
                    )}
                    <button 
                      onClick={() => handleShare(selectedArticle)}
                      className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Share
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