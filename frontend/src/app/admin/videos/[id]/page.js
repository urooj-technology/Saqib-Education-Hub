'use client';

import { useState, use } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Play, 
  Clock, 
  Calendar, 
  Eye, 
  User,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useFetchObject from '../../../../api/useFetchObject';
import useDelete from '../../../../api/useDelete';
import { useRouter } from 'next/navigation';

export default function VideoDetails({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const auth = useAuth();
  const token = auth.token;
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const { data: response, loading, error } = useFetchObject("videos", "videos", id, token);
  const { handleDelete: deleteVideo, loading: isDeleting } = useDelete("videos", token);
  
  // Extract video data from the response
  const video = response?.data?.video || response?.video;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteVideo(id);
        router.push('/admin/videos');
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };


  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { bg: 'bg-green-100', text: 'text-green-800', label: 'Published' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Archived' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !video) {
    return (
      <AdminLayout title="Video Not Found">
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Video Not Found</h2>
          <p className="text-gray-600 mb-4">The video you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/admin/videos')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Videos
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Video Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/videos')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Videos
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{video.title}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              by {video.author?.name || video.author?.penName || 'Unknown Author'}
            </p>
            <div className="mt-2">
              {getStatusBadge(video.status)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/admin/videos/${video.id}/edit`}
              className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {video.youtubeId ? (
                <div className="relative w-full h-64 sm:h-96 bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={video.title}
                  />
                </div>
              ) : (
                <div className="w-full h-64 sm:h-96 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Play className="w-24 h-24 text-white" />
                </div>
              )}
            </div>

            {/* Video Description */}
            {video.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <div className="text-gray-700 leading-relaxed">
                  <div className={`whitespace-pre-wrap ${!showFullDescription && video.description.length > 500 ? 'line-clamp-6' : ''}`}>
                    {video.description}
                  </div>
                  {video.description.length > 500 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
                    >
                      <span>{showFullDescription ? 'Show Less' : 'Read More'}</span>
                      {showFullDescription ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Video Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Play className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Title</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Author</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {video.author?.name || video.author?.penName || 'N/A'}
                    </p>
                  </div>
                </div>


                <div className="flex items-center">
                  <Tag className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{video.category || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(video.created_at || video.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDateTime(video.updated_at || video.updatedAt)}</p>
                  </div>
                </div>

                {video.published_at && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Published</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(video.published_at || video.publishedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Views</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{video.viewCount || video.view_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}