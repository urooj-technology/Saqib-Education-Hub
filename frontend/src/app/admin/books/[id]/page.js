'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Download,
  Tag,
  Globe
} from 'lucide-react';
import AdminLayout from '../../layout';
import useFetchObject from '@/api/useFetchObject';

export default function BookDetailPage({ params }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const bookId = params.id;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Fetch book details
  const { data: bookData, isLoading, isError, error } = useFetchObject(
    ['book', bookId],
    'books',
    bookId,
    token
  );

  const book = bookData?.data?.book;

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
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/admin/books');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete book'}`);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('An error occurred while deleting the book');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Book Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !book) {
    return (
      <AdminLayout title="Book Details">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Book Not Found</h2>
            <p className="text-gray-600 mt-2">
              {error?.message || 'The book you are looking for does not exist or has been deleted.'}
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/books')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Books
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Book Details">
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/books')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Back to Books"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{book.title}</h1>
                <p className="text-sm lg:text-base text-gray-600 truncate">by {book.authors?.map(author => author.name).join(', ') || 'Unknown Author'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/admin/books/${book.id}/edit`}
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
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 p-6">
            {/* Main Information - Scrollable */}
            <div className="xl:col-span-2 space-y-4 overflow-y-auto">
              {/* Book Cover and Basic Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0">
                    {book.cover_image ? (
                      <img 
                        src={book.cover_image} 
                        alt={book.title}
                        className="w-32 h-40 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-32 h-40 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 truncate">{book.title}</h2>
                    <p className="text-gray-600 mb-3 truncate">by {book.authors?.map(author => author.name).join(', ') || 'Unknown Author'}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-500">ISBN:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900 truncate">{book.isbn || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-500">Published:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{book.publication_year || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-500">Pages:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{book.pages || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-500">Language:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{book.language || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{book.description}</p>
                  </div>
                </div>
              )}

              {/* Download Link */}
              {book.file_url && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Download</h2>
                  <a
                    href={book.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Book
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar - Fixed Height */}
            <div className="space-y-4 overflow-y-auto">
              {/* Book Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Book Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Title</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Authors</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {book.authors?.map(author => author.name).join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">ISBN</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{book.isbn || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Publication Year</p>
                      <p className="text-sm font-medium text-gray-900">{book.publication_year || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Pages</p>
                      <p className="text-sm font-medium text-gray-900">{book.pages || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Language</p>
                      <p className="text-sm font-medium text-gray-900">{book.language || 'N/A'}</p>
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
                      <p className="text-xs text-gray-500">Added</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(book.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(book.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Views</span>
                    <span className="text-sm font-medium text-gray-900">{book.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Downloads</span>
                    <span className="text-sm font-medium text-gray-900">{book.downloadCount || 0}</span>
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