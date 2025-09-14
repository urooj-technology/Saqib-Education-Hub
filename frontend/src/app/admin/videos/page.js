'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Video,
  Calendar,
  User,
  Tag,
  Play,
  Clock,
  Users,
  Eye as EyeIcon,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import Link from 'next/link';
import useFetchObjects from '../../../api/useFetchObjects';
import { useAuth } from '../../../context/AuthContext';

// Mock data for videos
const mockVideos = [
  {
    id: 1,
    title: 'Introduction to Machine Learning',
    author: 'Dr. Sarah Johnson',
    category: 'Computer Science',
    status: 'published',
    uploadDate: '2024-01-15',
    lastModified: '2024-01-20',
    duration: '45:30',
    views: 12500,
    likes: 890,
    comments: 156,
    thumbnail: '/api/placeholder/300/200',
    videoUrl: '/api/videos/ml-intro.mp4',
    description: 'A comprehensive introduction to machine learning concepts, algorithms, and applications for beginners.',
    tags: 'machine learning, AI, algorithms, beginner, computer science',
    quality: '1080p',
    size: '2.5 GB',
    language: 'English',
    subtitles: true,
    featured: true
  },
  {
    id: 2,
    title: 'Advanced Calculus: Integration Techniques',
    author: 'Prof. Ahmed Khan',
    category: 'Mathematics',
    status: 'published',
    uploadDate: '2024-01-10',
    lastModified: '2024-01-10',
    duration: '1:15:45',
    views: 8900,
    likes: 567,
    comments: 89,
    thumbnail: '/api/placeholder/300/200',
    videoUrl: '/api/videos/calculus-integration.mp4',
    description: 'Deep dive into advanced integration techniques including substitution, parts, and trigonometric methods.',
    tags: 'calculus, integration, mathematics, advanced, techniques',
    quality: '720p',
    size: '1.8 GB',
    language: 'English',
    subtitles: false,
    featured: false
  },
  {
    id: 3,
    title: 'Physics Lab: Wave Properties',
    author: 'Dr. Michael Chen',
    category: 'Physics',
    status: 'draft',
    uploadDate: '2024-01-18',
    lastModified: '2024-01-18',
    duration: '32:15',
    views: 0,
    likes: 0,
    comments: 0,
    thumbnail: '/api/placeholder/300/200',
    videoUrl: '/api/videos/physics-waves.mp4',
    description: 'Hands-on laboratory demonstration of wave properties including frequency, amplitude, and interference.',
    tags: 'physics, waves, laboratory, hands-on, demonstration',
    quality: '1080p',
    size: '3.2 GB',
    language: 'English',
    subtitles: true,
    featured: false
  },
  {
    id: 4,
    title: 'Creative Writing Workshop',
    author: 'Prof. Fatima Al-Zahra',
    category: 'Literature',
    status: 'published',
    uploadDate: '2024-01-05',
    lastModified: '2024-01-05',
    duration: '58:20',
    views: 6700,
    likes: 423,
    comments: 67,
    thumbnail: '/api/placeholder/300/200',
    videoUrl: '/api/videos/creative-writing.mp4',
    description: 'Interactive workshop on creative writing techniques, character development, and storytelling.',
    tags: 'creative writing, workshop, literature, storytelling, character development',
    quality: '720p',
    size: '1.5 GB',
    language: 'English',
    subtitles: true,
    featured: false
  },
  {
    id: 5,
    title: 'Chemistry: Organic Compounds',
    author: 'Dr. David Wilson',
    category: 'Chemistry',
    status: 'archived',
    uploadDate: '2023-12-01',
    lastModified: '2023-12-01',
    duration: '42:10',
    views: 4500,
    likes: 234,
    comments: 45,
    thumbnail: '/api/placeholder/300/200',
    videoUrl: '/api/videos/chemistry-organic.mp4',
    description: 'Comprehensive overview of organic compounds, their structures, and chemical properties.',
    tags: 'chemistry, organic compounds, chemical properties, structures',
    quality: '720p',
    size: '2.1 GB',
    language: 'English',
    subtitles: false,
    featured: false
  }
];

const categories = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Literature', 'History', 'Biology', 'Economics', 'Psychology', 'Education Technology', 'Language Learning', 'Art & Design', 'Music', 'Sports', 'Health & Wellness', 'Business', 'Engineering', 'Medicine', 'Law', 'Other'];
const statuses = ['All', 'published', 'draft', 'archived', 'pending_review'];

export default function VideosList() {
  const { token } = useAuth();
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch videos from API
  const {
    data: fetchedVideos,
    isLoading: loading,
    isError: error,
    refetch
  } = useFetchObjects(
    ["videos", searchTerm, selectedCategory, selectedStatus],
    `videos/?search=${searchTerm}&category=${selectedCategory !== 'All' ? selectedCategory : ''}&status=${selectedStatus !== 'All' ? selectedStatus : ''}`,
    token
  );

  const videos = fetchedVideos?.data?.videos || mockVideos;

  useEffect(() => {
    setFilteredVideos(videos);
  }, [videos]);

  const handleDelete = (videoId) => {
    if (confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      // TODO: Implement delete API call
      console.log('Delete video:', videoId);
    }
  };

  const toggleActive = async (videoId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com'}/api/videos/${videoId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh the data to get updated video
        refetch();
      } else {
        console.error('Failed to toggle video active status');
      }
    } catch (error) {
      console.error('Error toggling video active status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : 'Unknown'}
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



  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <AdminLayout title="Videos Management">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Videos</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage educational video content and tutorials</p>
          </div>
          <Link
            href="/admin/videos/create"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Add New Video</span>
            <span className="sm:hidden">Add Video</span>
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
                  placeholder="Search videos by title, author, or description..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading videos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <Video className="mx-auto w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading videos</h3>
            <p className="text-gray-600 mb-6">There was a problem loading the videos. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredVideos.length} of {videos.length} videos
            </p>
          </div>
        )}

        {/* Videos Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Video
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
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
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
                  {filteredVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {video.youtubeId && video.youtubeId.trim() !== '' ? (
                            <div className="flex-shrink-0 h-12 w-20">
                              <img
                                src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                                alt={video.title}
                                className="h-12 w-20 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-12 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Video className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {video.title}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {video.description?.substring(0, 100) + '...'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900 font-medium">
                            {video.author?.firstName || 'Unknown Author'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {video.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(video.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : 'Draft'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatViews(video.viewCount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {video.youtubeUrl ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            YouTube
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleActive(video.id)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            video.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          title={video.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {video.isActive ? (
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
                            href={`/admin/videos/${video.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/videos/${video.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(video.id)}
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
        {!loading && !error && filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Video className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first video'
              }
            </p>
            {!searchTerm && selectedCategory === 'All' && selectedStatus === 'All' && (
              <Link
                href="/admin/videos/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Video
              </Link>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
