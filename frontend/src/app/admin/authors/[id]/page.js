'use client';

import { useState, use } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  BookOpen,
  FileText,
  Award
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useFetchObject from '../../../../api/useFetchObject';
import useDelete from '../../../../api/useDelete';
import { useRouter } from 'next/navigation';

export default function AuthorDetails({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const auth = useAuth();
  const token = auth.token;
  
  const { data: response, loading, error } = useFetchObject("authors", "authors", id, token);
  const { handleDelete: deleteAuthor, loading: isDeleting } = useDelete("authors", token);
  
  // Extract author data from the response
  const author = response?.data?.author || response?.author;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await deleteAuthor(id);
        router.push('/admin/authors');
      } catch (error) {
        console.error('Error deleting author:', error);
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

  if (loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !author) {
    return (
      <AdminLayout title="Author Not Found">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Author Not Found</h2>
          <p className="text-gray-600 mb-4">The author you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/admin/authors')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Authors
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Author Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/authors')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Authors
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{author.penName || author.firstName}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {author.firstName} {author.lastName}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/admin/authors/${author.id}/edit`}
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
          {/* Left Column - Author Info and Bio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Author Profile */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  {author.profileImage ? (
                    <img 
                      src={author.profileImage} 
                      alt={author.penName || author.firstName}
                      className="w-48 h-48 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <User className="w-24 h-24 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{author.penName || author.firstName}</h2>
                  <p className="text-lg text-gray-600 mb-4">
                    {author.firstName} {author.lastName}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{author.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Pen Name:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{author.penName || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {author.bio && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Biography</h3>
                <div className="text-gray-700 leading-relaxed">
                  <p className="whitespace-pre-wrap">{author.bio}</p>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">First Name:</span>
                  <p className="text-sm font-medium text-gray-900">{author.firstName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Last Name:</span>
                  <p className="text-sm font-medium text-gray-900">{author.lastName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="text-sm font-medium text-gray-900">{author.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Pen Name:</span>
                  <p className="text-sm font-medium text-gray-900">{author.penName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Author Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Author Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Pen Name</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{author.penName || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{author.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {author.firstName} {author.lastName}
                    </p>
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
                    <p className="text-sm font-medium text-gray-900">{formatDate(author.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDateTime(author.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Books</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{author.booksCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Articles</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{author.articlesCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Total Works</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {(author.booksCount || 0) + (author.articlesCount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
