'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Eye,
  Tag,
  BookOpen
} from 'lucide-react';
import AdminLayout from '../../layout';
import useFetchObject from '@/api/useFetchObject';

export default function ArticleDetailPage({ params }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const articleId = params.id;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Fetch article details
  const { data: articleData, isLoading, isError, error } = useFetchObject(
    ['article', articleId],
    'articles',
    articleId,
    token
  );

  const article = articleData?.data?.article;

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { bg: 'bg-green-100', text: 'text-green-800', label: 'Published' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Archived' },
      pending: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pending Review' }
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/admin/articles');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete article'}`);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('An error occurred while deleting the article');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Article Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !article) {
    return (
      <AdminLayout title="Article Details">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Article Not Found</h2>
            <p className="text-gray-600 mt-2">
              {error?.message || 'The article you are looking for does not exist or has been deleted.'}
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/articles')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Article Details">
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/articles')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Back to Articles"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{article.title}</h1>
                <p className="text-sm lg:text-base text-gray-600 truncate">by {article.author?.name || 'Unknown Author'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/admin/articles/${article.id}/edit`}
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
            {getStatusBadge(article.status)}
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 p-6">
            {/* Main Information - Scrollable */}
            <div className="xl:col-span-2 space-y-4 overflow-y-auto">
              {/* Article Cover Image */}
              {article.cover_image && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <img 
                    src={article.cover_image} 
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Content</h2>
                <div className="text-sm text-gray-700 max-h-96 overflow-y-auto">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{article.content || 'No content available.'}</p>
                  </div>
                </div>
              </div>

              {/* Article Summary */}
              {article.summary && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Summary</h2>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{article.summary}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Fixed Height */}
            <div className="space-y-4 overflow-y-auto">
              {/* Article Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Article Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Title</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Author</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{article.author?.name || 'Unknown Author'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{article.category || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Reading Time</p>
                      <p className="text-sm font-medium text-gray-900">{article.reading_time || 'N/A'}</p>
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
                      <p className="text-sm font-medium text-gray-900">{formatDate(article.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(article.updatedAt)}</p>
                    </div>
                  </div>

                  {article.published_at && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Published</p>
                        <p className="text-sm font-medium text-gray-900">{formatDateTime(article.published_at)}</p>
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
                    <span className="text-sm font-medium text-gray-900">{article.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Likes</span>
                    <span className="text-sm font-medium text-gray-900">{article.likeCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Comments</span>
                    <span className="text-sm font-medium text-gray-900">{article.commentCount || 0}</span>
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