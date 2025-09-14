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
  AlertCircle
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
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com/api');
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
    <div className={`min-h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className={`bg-white border-b border-gray-200 ${isFullscreen ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/books')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Back to Books"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">
                  {book.title}
                </h1>
                <p className="text-sm text-gray-600 truncate max-w-md">
                  by {book.authors?.map(author => author.penName || author.firstName).join(', ') || 'Unknown Author'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFullscreen}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Book Info Sidebar */}
          <div className={`lg:col-span-1 ${isFullscreen ? 'hidden' : ''}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              {/* Book Cover */}
              {book.coverImageUrl && (
                <div className="mb-6">
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* Book Details */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Authors</p>
                    <p className="text-sm font-medium text-gray-900">
                      {book.authors?.map(author => author.penName || author.firstName).join(', ') || 'Unknown Author'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Published</p>
                    <p className="text-sm font-medium text-gray-900">
                      {book.publicationYear || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Tag className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-900">
                      {book.category || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Pages</p>
                    <p className="text-sm font-medium text-gray-900">
                      {book.pages || 'N/A'}
                    </p>
                  </div>
                </div>


                {book.rating > 0 && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="text-sm font-medium text-gray-900">
                        {book.rating.toFixed(1)} ({book.ratingCount} reviews)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {book.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PDF Reader */}
          <div className={`${isFullscreen ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
            {book.fileUrl ? (
              <PDFReader
                pdfUrl={book.fileUrl}
                bookTitle={book.title}
                onError={handlePDFError}
                className="h-[calc(100vh-8rem)]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border border-gray-200">
                <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Not Available</h3>
                <p className="text-gray-600 text-center max-w-md">
                  The PDF file for this book is not available for reading at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
