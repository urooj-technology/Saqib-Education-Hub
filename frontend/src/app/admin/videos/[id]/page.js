'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Play, 
  User, 
  Calendar, 
  Clock, 
  ExternalLink,
  Tag,
  BookOpen,
  Target
} from 'lucide-react';
import AdminLayout from '../../layout';
import useFetchObject from '@/api/useFetchObject';

export default function VideoDetailPage({ params }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const videoId = params.id;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Fetch video details
  const { data: videoData, isLoading, isError, error } = useFetchObject(
    ['video', videoId],
    'videos',
    videoId,
    token
  );

  const video = videoData?.data?.video;

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/admin/videos');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete video'}`);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('An error occurred while deleting the video');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Video Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !video) {
    return (
      <AdminLayout title="Video Details">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Play className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Video Not Found</h2>
            <p className="text-gray-600 mt-2">
              {error?.message || 'The video you are looking for does not exist or has been deleted.'}
            </p>
          </div>
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
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/videos')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Back to Videos"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{video.title}</h1>
                <p className="text-sm lg:text-base text-gray-600 truncate">by {video.instructor?.name || 'Unknown Instructor'}</p>
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
          
          {/* Status Badge */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {getStatusBadge(video.status)}
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 p-6">
            {/* Main Information - Scrollable */}
            <div className="xl:col-span-2 space-y-4 overflow-y-auto">
              {/* Video Player */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Video</h2>
                {video.video_url ? (
                  <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full object-contain"
                      poster={video.thumbnail_url}
                    >
                      <source src={video.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No video available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{video.description || 'No description provided.'}</p>
                </div>
              </div>

              {/* Learning Objectives */}
              {video.learning_objectives && video.learning_objectives.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Learning Objectives</h2>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                    <ul className="list-disc list-inside space-y-1">
                      {video.learning_objectives.map((objective, index) => (
                        <li key={index} className="whitespace-pre-wrap">{objective}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* External Links */}
              {video.external_links && video.external_links.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">External Resources</h2>
                  <div className="space-y-2">
                    {video.external_links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm mr-2 mb-2"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {link.title || `Link ${index + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Fixed Height */}
            <div className="space-y-4 overflow-y-auto">
              {/* Video Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Video Information</h3>
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
                      <p className="text-xs text-gray-500">Instructor</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{video.instructor?.name || 'Unknown Instructor'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{video.category || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium text-gray-900">{formatDuration(video.duration)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Level</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{video.level || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Dates</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(video.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(video.updatedAt)}</p>
                    </div>
                  </div>

                  {video.published_at && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Published</p>
                        <p className="text-sm font-medium text-gray-900">{formatDateTime(video.published_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Views</span>
                    <span className="text-sm font-medium text-gray-900">{video.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Likes</span>
                    <span className="text-sm font-medium text-gray-900">{video.likeCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Comments</span>
                    <span className="text-sm font-medium text-gray-900">{video.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}