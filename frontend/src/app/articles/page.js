'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Calendar, User, Heart, Share2, Clock, Tag, X, Filter, Download } from 'lucide-react';
import Layout from '../../components/Layout';
import useFetchObjects from '../../api/useFetchObjects';



const categories = ["All Categories", "Education", "Technology", "Career", "Scholarships", "Wellness", "Language"];

const sortOptions = [
  { value: 'publishedAt', label: 'Latest First' },
  { value: 'createdAt', label: 'Newest First' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'likes', label: 'Most Liked' }
];

export default function Articles() {
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch articles from backend with pagination and search (no authentication required for public access)
  const {
    data: fetchedArticles,
    isLoading: loading,
    isError: error,
    refetch
  } = useFetchObjects(
    ["articles", searchTerm, selectedCategory, sortBy, sortOrder, page, rowPerPage],
    `articles/?search=${encodeURIComponent(searchTerm)}&category=${selectedCategory !== 'All Categories' ? selectedCategory : ''}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page + 1}&limit=${rowPerPage}`,
    null // No token needed for public access
  );

  // Extract pagination info from API response
  const pagination = fetchedArticles?.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;

  // Use real API data if available, otherwise fall back to mock data
  const articles = fetchedArticles?.data?.articles || fetchedArticles?.data?.results || [];
  
  const filteredArticles = articles.filter(article => {
    if (!article || !article.title) return false;
    
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.authors && article.authors.length > 0 && article.authors[0]?.penName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All Categories' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (!a || !b) return 0;
    
    switch (sortBy) {
      case 'date':
        const dateA = new Date(a.publishedAt || a.publishDate || 0);
        const dateB = new Date(b.publishedAt || b.publishDate || 0);
        return dateB - dateA;
      case 'likes':
        return (b.likeCount || b.likes || 0) - (a.likeCount || a.likes || 0);
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      default:
        return 0;
    }
  });

  const openArticleDetails = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  const handleDownload = async (articleId, event) => {
    try {
      // Show loading state
      const button = event.target;
      const originalText = button.innerHTML;
      button.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>';
      button.disabled = true;

      // Direct download without opening PDF viewer
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

  return (
    <Layout>
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
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
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
                      onChange={(e) => setSortOrder(e.target.value)}
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
                      onChange={(e) => setSortOrder(e.target.value)}
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
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-2 text-gray-600">Loading articles...</p>
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
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedArticles.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">No articles found</div>
                  <p className="text-gray-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                sortedArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                {/* Article Image */}
                <div className="relative">
                  {article.featuredImageUrl ? (
                    <Image
                      src={article.featuredImageUrl}
                      alt={article.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
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
                  
                  <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {article.readTime || '5 min read'}
                  </div>
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
                          ? article.authors[0].penName || 'Unknown Author'
                          : article.author || 'No Author'
                        }
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(article.publishedAt || article.publishDate).toLocaleDateString()}
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
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
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
          {!loading && (
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
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
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
                      ? selectedArticle.authors[0].penName || 'Unknown Author'
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
                      <Image
                        src={selectedArticle.featuredImageUrl}
                        alt={selectedArticle.title}
                        width={800}
                        height={400}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                        onError={(e) => {
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
                        <span className="font-medium">{new Date(selectedArticle.publishedAt || selectedArticle.publishDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Read Time:</span>
                        <span className="font-medium">{selectedArticle.readTime ? `${selectedArticle.readTime} min` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Likes:</span>
                        <span className="font-medium">{selectedArticle.likeCount || selectedArticle.likes || 0}</span>
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
                    <button className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium">
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