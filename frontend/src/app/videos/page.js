'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Play, Clock, Eye, Calendar, User, X, Filter } from 'lucide-react';
import Layout from '../../components/Layout';
import useFetchObjects from '@/api/useFetchObjects';

const videosData = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    author: "Prof. Sarah Johnson",
    category: "Computer Science",
    duration: "45:30",
    views: 12500,
    likes: 890,
    publishDate: "2024-03-15",
    description: "A comprehensive introduction to computer science fundamentals for beginners.",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    featured: true
  },
  {
    id: 2,
    title: "Advanced Mathematics for Engineering",
    author: "Dr. Ahmed Khan",
    category: "Mathematics",
    duration: "1:15:20",
    views: 8900,
    likes: 567,
    publishDate: "2024-03-12",
    description: "Advanced mathematical concepts essential for engineering students.",
    youtubeId: "9bZkp7q19f0",
    thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
    featured: false
  },
  {
    id: 3,
    title: "English Language Learning",
    author: "Ms. Fatima Zahra",
    category: "Language",
    duration: "32:15",
    views: 15600,
    likes: 1200,
    publishDate: "2024-03-10",
    description: "Essential English language skills for academic and professional success.",
    youtubeId: "jNQXAC9IVRw",
    thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
    featured: true
  },
  {
    id: 4,
    title: "Physics Fundamentals",
    author: "Dr. Maria Rodriguez",
    category: "Physics",
    duration: "58:45",
    views: 7200,
    likes: 445,
    publishDate: "2024-03-08",
    description: "Understanding the fundamental principles of physics through practical examples.",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    featured: false
  },
  {
    id: 5,
    title: "Business Management Strategies",
    author: "Prof. David Chen",
    category: "Business",
    duration: "41:20",
    views: 9800,
    likes: 678,
    publishDate: "2024-03-05",
    description: "Strategic approaches to modern business management and organizational leadership.",
    youtubeId: "9bZkp7q19f0",
    thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
    featured: false
  },
  {
    id: 6,
    title: "Chemistry Lab Techniques",
    author: "Dr. Lisa Thompson",
    category: "Chemistry",
    duration: "28:30",
    views: 6400,
    likes: 389,
    publishDate: "2024-03-02",
    description: "Essential laboratory techniques and safety procedures for chemistry students.",
    youtubeId: "jNQXAC9IVRw",
    thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
    featured: false
  }
];

const categories = ["All Categories", "Computer Science", "Mathematics", "Language", "Physics", "Business", "Chemistry"];

const sortOptions = [
  { value: 'createdAt', label: 'Latest First' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'viewCount', label: 'Most Popular' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'duration', label: 'Duration' }
];

export default function Videos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(9);

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

  // Fetch videos from backend (no authentication required for public access)
  // Uses debouncedSearchTerm to avoid making API calls on every keystroke
  const {
    data: fetchedVideos,
    isLoading: loading,
    isError: error,
    refetch
  } = useFetchObjects(
    ["videos", debouncedSearchTerm, selectedCategory, sortBy, sortOrder, page, rowPerPage],
    `videos/?search=${encodeURIComponent(debouncedSearchTerm)}&category=${selectedCategory === 'All Categories' ? '' : selectedCategory}&status=published&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page + 1}&limit=${rowPerPage}`,
    null // No token needed for public access
  );

  // Extract pagination info from API response
  const pagination = fetchedVideos?.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;

  // Use real API data - backend already handles filtering, sorting, and pagination
  const videos = fetchedVideos?.data?.videos || [];

  const openVideoDetails = (video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  return (
    <Layout>
      {/* Top Loading Bar */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-orange-200 z-50">
          <div className="h-full bg-orange-600 animate-pulse"></div>
        </div>
      )}
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Educational Videos
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Learn through curated educational video content from expert instructors
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
                  placeholder="Search videos, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

      {/* Videos Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Videos ({totalItems})
            </h2>
            <p className="text-gray-600">
              Browse our educational video collection
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading videos...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error loading videos: {error}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Videos Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="relative">
                  {video.youtubeId && video.youtubeId.trim() !== '' ? (
                    <Image
                      src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      width={800}
                      height={400}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Play className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <button
                      onClick={() => openVideoDetails(video)}
                      className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Play className="w-6 h-6 ml-1" />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                  {video.featured && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      {video.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {video.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {video.author?.firstName || video.author || 'Unknown Author'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(video.publishedAt || video.publishDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {(video.viewCount || video.views || 0).toLocaleString()} views
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openVideoDetails(video)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Watch Now
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

          {/* Empty State */}
          {!loading && !error && videos.length === 0 && (
            <div className="text-center py-12">
              <Play className="mx-auto w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'All Categories'
                  ? 'Try adjusting your search or filters'
                  : 'No videos are available at the moment'
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Video Details Modal */}
      {showModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
                  <p className="text-lg text-gray-600">{selectedVideo.author?.firstName || selectedVideo.author || 'Unknown Author'}</p>
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
                    <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
                      {selectedVideo.youtubeId && selectedVideo.youtubeId.trim() !== '' ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=0`}
                          title={selectedVideo.title}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-white">
                            <Play className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-lg">Video player not available</p>
                            <p className="text-sm text-gray-300">This video may require a different player</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedVideo.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Video Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedVideo.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedVideo.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published:</span>
                        <span className="font-medium">{new Date(selectedVideo.publishedAt || selectedVideo.publishDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-medium">{(selectedVideo.viewCount || selectedVideo.views || 0).toLocaleString()}</span>
                      </div>

                    </div>
                  </div>

                  <div className="flex gap-3">
                    {selectedVideo.youtubeId && selectedVideo.youtubeId.trim() !== '' ? (
                      <a
                        href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium text-center"
                      >
                        Watch on YouTube
                      </a>
                    ) : (
                      <button className="flex-1 bg-gray-400 text-white py-3 px-6 rounded-lg cursor-not-allowed font-medium">
                        Video Not Available
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