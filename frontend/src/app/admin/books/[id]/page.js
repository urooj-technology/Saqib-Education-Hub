'use client';

import { useState, useEffect, use } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  BookOpen, 
  Download, 
  Tag, 
  Calendar, 
  FileText, 
  Globe, 
  User, 
  Eye, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useFetchObject from '../../../../api/useFetchObject';
import useDelete from '../../../../api/useDelete';
import { useRouter } from 'next/navigation';

export default function BookDetails({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const auth = useAuth();
  const token = auth.token;
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const { data: response, loading, error } = useFetchObject("books", "books", id, token);
  
  // Extract book data from the response
  const book = response?.data?.book || response?.book;
  const { handleDelete: deleteBook, loading: isDeleting } = useDelete("books", token);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(id);
        router.push('/admin/books');
      } catch (error) {
        console.error('Error deleting book:', error);
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

  if (error || !book) {
    return (
      <AdminLayout title="Book Not Found">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-4">The book you're looking for doesn't exist or has been removed.</p>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/books')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Books
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-sm sm:text-base text-gray-600">
              by {book.authors?.map(author => author.penName).join(', ') || 'Unknown Author'}
            </p>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Book Cover and Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book Cover and Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  {book.coverImageUrl ? (
                    <img 
                      src={book.coverImageUrl} 
                      alt={book.title}
                      className="w-48 h-64 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-48 h-64 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h2>
                  <p className="text-lg text-gray-600 mb-4">
                    by {book.authors?.map(author => author.penName).join(', ') || 'Unknown Author'}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Published:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{book.publicationYear || book.publication_year || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Pages:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{book.pages || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Language:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{book.language || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-500">Format:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{book.format || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Download Button */}
                  {book.fileUrl && (
                    <a
                      href={book.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Book
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <div className="text-gray-700 leading-relaxed">
                  <p className={`whitespace-pre-wrap ${!showFullDescription && book.description.length > 300 ? 'line-clamp-6' : ''}`}>
                    {book.description}
                  </p>
                  {book.description.length > 300 && (
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

            {/* Additional Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Publisher:</span>
                  <p className="text-sm font-medium text-gray-900">{book.publisher || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Edition:</span>
                  <p className="text-sm font-medium text-gray-900">{book.edition || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Category:</span>
                  <p className="text-sm font-medium text-gray-900">{book.category || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Format:</span>
                  <p className="text-sm font-medium text-gray-900">{book.format || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p className="text-sm font-medium text-gray-900 capitalize">{book.status || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Price:</span>
                  <p className="text-sm font-medium text-gray-900">
                    {book.price ? `${book.currency || 'USD'} ${book.price}` : 'Free'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Book Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Information</h3>
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
                      {book.authors?.map(author => author.penName).join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Publication Year</p>
                    <p className="text-sm font-medium text-gray-900">{book.publicationYear || book.publication_year || 'N/A'}</p>
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
                  <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Language</p>
                    <p className="text-sm font-medium text-gray-900">{book.language || 'N/A'}</p>
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


            {/* Tags */}
            {book.tags && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Handle tags whether they come as array or JSON string
                    let tagsArray = [];
                    if (Array.isArray(book.tags)) {
                      tagsArray = book.tags;
                    } else if (typeof book.tags === 'string') {
                      try {
                        tagsArray = JSON.parse(book.tags);
                      } catch (e) {
                        console.warn('Failed to parse tags as JSON:', book.tags);
                        tagsArray = book.tags.split(',').map(tag => tag.trim());
                      }
                    }
                    
                    return tagsArray.length > 0 ? tagsArray.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                      </span>
                    )) : null;
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}