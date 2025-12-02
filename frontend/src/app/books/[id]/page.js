'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Calendar, 
  Tag,
  Star,
  Loader2,
  AlertCircle,
  Globe,
  Building,
  FileText,
  Download,
  Share2,
  Eye,
  Clock,
  Award,
  BookMarked,
  Hash
} from 'lucide-react';
import PDFReader from '@/components/PDFReader';
import useFetchObject from '@/api/useFetchObject';

export default function PublicBookPage() {
  const params = useParams();
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const bookId = params.id;
  
  // Fetch book details
  const { data: bookData, isLoading, isError, error } = useFetchObject(
    ['book', bookId],
    'books',
    bookId,
    null // No token needed for public access
  );

  // Additional debugging
  useEffect(() => {
    console.log('Component mounted with bookId:', bookId);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL);
  }, [bookId]);

  const book = bookData?.data?.book;

  // Debug logging
  console.log('Book ID:', bookId);
  console.log('Book data response:', bookData);
  console.log('Book data:', book);
  console.log('Book fileUrl:', book?.fileUrl);
  console.log('Loading:', isLoading);
  console.log('Error:', error);
  console.log('Is Error:', isError);

  // Show loading state while book data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  // Show error state if book data failed to load
  if (isError || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-4">The book you're looking for could not be loaded.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePDFError = (error) => {
    console.error('PDF Error:', error);
    console.error('Book data:', book);
    console.error('File URL:', book?.fileUrl);
  };



  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-orange-200 z-50">
          <div className="h-full bg-orange-600 animate-pulse"></div>
        </div>
      )}
      {/* Header */}
      <div className={`bg-white shadow-sm border-b border-gray-200 ${isFullscreen ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            {/* First Row: Back button and Title */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <button
                  onClick={() => router.push('/books')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0"
                  title="Back to Books"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {book.title}
                </h1>
              </div>
              
              <div className="flex-shrink-0">
                <button
                  onClick={toggleFullscreen}
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  {isFullscreen ? 'Exit' : 'Fullscreen'}
                </button>
              </div>
            </div>
            
            {/* Second Row: Author and Status */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                by {book.authors?.map(author => author.penName || author.firstName).join(', ') || 'Unknown Author'}
              </span>
              {book.status === 'published' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Published
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile: Cover First - Smaller */}
        <div className={`lg:hidden mb-6 ${isFullscreen ? 'hidden' : ''}`}>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-xs mx-auto">
            {book.coverImageUrl ? (
              <div className="aspect-[3/4] relative">
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <div className="text-white text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-80" />
                  <p className="text-sm font-medium">Digital Book</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          {/* Desktop Sidebar - Book Cover & Details */}
          <div className={`hidden lg:block lg:col-span-4 ${isFullscreen ? 'hidden' : ''}`}>
            <div className="space-y-6">
              {/* Book Cover Card - Desktop Only */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {book.coverImageUrl ? (
                  <div className="aspect-[3/4] relative">
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <div className="text-white text-center">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-medium">Digital Book</p>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {book.rating > 0 && (
                        <>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-1">
                            {book.rating.toFixed(1)} ({book.ratingCount})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Book Details Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Authors</p>
                      <p className="text-sm text-gray-600">
                        {book.authors?.map(author => author.penName || author.firstName).join(', ') || 'Unknown Author'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Building className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Publisher</p>
                      <p className="text-sm text-gray-600">{book.publisher || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Publication Year</p>
                      <p className="text-sm text-gray-600">{book.publicationYear || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Edition</p>
                      <p className="text-sm text-gray-600">{book.edition || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <BookOpen className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pages</p>
                      <p className="text-sm text-gray-600">{book.pages || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Globe className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Language</p>
                      <p className="text-sm text-gray-600">{book.language || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Tag className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Category</p>
                      <p className="text-sm text-gray-600">{book.category || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Award className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Format</p>
                      <p className="text-sm text-gray-600 uppercase">{book.format || 'N/A'}</p>
                    </div>
                  </div>

                  {book.price > 0 && (
                    <div className="flex items-start">
                      <Hash className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Price</p>
                        <p className="text-sm text-gray-600">{book.price} {book.currency}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Card */}
              {book.tags && (
                <div className="bg-white rounded-xl shadow-lg p-6">
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
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      )) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* Description Card */}
              {book.description && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PDF Reader Section - Mobile & Desktop */}
          <div className={`${isFullscreen ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {book.fileUrl ? (
                <div className="relative">
                  <PDFReader
                    pdfUrl={book.fileUrl}
                    bookTitle={book.title}
                    onError={handlePDFError}
                    className="h-[60vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh]"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF Not Available</h3>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                      The PDF file for this book is currently not available for reading. Please check back later or contact support if this issue persists.
                    </p>
                    <button
                      onClick={() => router.push('/books')}
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Browse Other Books
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Only - Book Details Below PDF */}
          <div className={`lg:hidden ${isFullscreen ? 'hidden' : ''}`}>
            <div className="space-y-6">
              {/* Book Details Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Authors</p>
                      <p className="text-sm text-gray-600">
                        {book.authors?.map(author => author.penName || author.firstName).join(', ') || 'Unknown Author'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Building className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Publisher</p>
                      <p className="text-sm text-gray-600">{book.publisher || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Publication Year</p>
                      <p className="text-sm text-gray-600">{book.publicationYear || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <BookOpen className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pages</p>
                      <p className="text-sm text-gray-600">{book.pages || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Globe className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Language</p>
                      <p className="text-sm text-gray-600">{book.language || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Tag className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Category</p>
                      <p className="text-sm text-gray-600">{book.category || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Card - Mobile */}
              {book.tags && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      let tagsArray = [];
                      if (Array.isArray(book.tags)) {
                        tagsArray = book.tags;
                      } else if (typeof book.tags === 'string') {
                        try {
                          tagsArray = JSON.parse(book.tags);
                        } catch (e) {
                          tagsArray = book.tags.split(',').map(tag => tag.trim());
                        }
                      }
                      
                      return tagsArray.length > 0 ? tagsArray.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      )) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* Description Card - Mobile */}
              {book.description && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
