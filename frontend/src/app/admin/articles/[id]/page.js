'use client';

import { useState, use } from 'react';
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
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useFetchObject from '../../../../api/useFetchObject';
import useDelete from '../../../../api/useDelete';
import { useRouter } from 'next/navigation';

export default function ArticleDetails({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const auth = useAuth();
  const token = auth.token;
  
  const [showFullContent, setShowFullContent] = useState(false);
  
  const { data: response, loading, error } = useFetchObject("articles", "articles", id, token);
  const { handleDelete: deleteArticle, loading: isDeleting } = useDelete("articles", token);
  
  // Extract article data from the response
  const article = response?.data?.article || response?.article;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id);
        router.push('/admin/articles');
      } catch (error) {
        console.error('Error deleting article:', error);
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

  if (loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !article) {
    return (
      <AdminLayout title="Article Not Found">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist or has been removed.</p>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/articles')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{article.title}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              by {article.author?.name || article.author?.penName || 'Unknown Author'}
            </p>
            <div className="mt-2">
              {getStatusBadge(article.status)}
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Article Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Article Cover Image */}
            {article.coverImage && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <img 
                  src={article.coverImage} 
                  alt={article.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
              <div className="text-gray-700 leading-relaxed">
                <div className={`whitespace-pre-wrap ${!showFullContent && article.content && article.content.length > 500 ? 'line-clamp-6' : ''}`}>
                  {article.content || 'No content available.'}
                </div>
                {article.content && article.content.length > 500 && (
                  <button
                    onClick={() => setShowFullContent(!showFullContent)}
                    className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
                  >
                    <span>{showFullContent ? 'Show Less' : 'Read More'}</span>
                    {showFullContent ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Article Summary */}
            {article.summary && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                <div className="text-gray-700 leading-relaxed">
                  <p className="whitespace-pre-wrap">{article.summary}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Article Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Information</h3>
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
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {article.author?.name || article.author?.penName || 'N/A'}
                    </p>
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
                    <p className="text-sm font-medium text-gray-900">{article.readingTime || 'N/A'}</p>
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

                {article.publishedAt && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Published</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(article.publishedAt)}</p>
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
                  <span className="text-sm font-medium text-gray-900">{article.viewCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Likes</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{article.likeCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Comments</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{article.commentCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}