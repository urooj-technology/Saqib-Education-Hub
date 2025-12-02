'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Clock, User, Calendar, BookOpen, ChevronRight, ChevronLeft, X } from 'lucide-react';
import Layout from '../../components/Layout';
import useFetchObjects from '@/api/useFetchObjects';
import { getBookCoverUrl } from '../../utils/imageUtils';

// Import translations
import enTranslations from '../../locales/en.json';
import psTranslations from '../../locales/ps.json';
import drTranslations from '../../locales/dr.json';

const translations = {
  en: enTranslations,
  ps: psTranslations,
  dr: drTranslations,
};


// Categories will be fetched dynamically from the API

const languages = [
  "All Languages",
  "English",
  "Dari",
  "Pashto",
  "Arabic",
  "French",
  "German",
  "Spanish",
  "Chinese",
  "Japanese"
];

const formats = [
  "All Formats",
  "PDF",
  "EPUB",
  "MOBI",
  "Audiobook",
  "Hardcover",
  "Paperback",
  "E-book"
];

const sortOptions = [
  { value: 'title', label: 'Title A-Z' },
  { value: 'createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price Low to High' },
  { value: 'publishedAt', label: 'Publication Date' }
];

export default function Books() {
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(12);
  const [currentLang, setCurrentLang] = useState('en');
  const [currentTranslations, setCurrentTranslations] = useState(translations.en);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced search term
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Debounce search term - only update after user stops typing for 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to first page when search term changes
      if (searchTerm !== debouncedSearchTerm) {
        setPage(0);
      }
    }, 500); // Wait 500ms after user stops typing

    // Cleanup function - cancel the timer if user types again
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Fetch book categories dynamically
  const { data: categoriesData, loading: categoriesLoading } = useFetchObjects(
    "book-categories",
    "book-categories?limit=1000"
  );
  const bookCategories = categoriesData?.data?.categories || [];
  const categories = ["All Categories", ...bookCategories.map(cat => cat.name)];
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [selectedFormat, setSelectedFormat] = useState('All Formats');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch books from backend with pagination and search (no authentication required for public access)
  // Uses debouncedSearchTerm to avoid making API calls on every keystroke
  const {
    data: fetchedBooks,
    isLoading: loading,
    isError: error,
    refetch
  } = useFetchObjects(
    ["books", debouncedSearchTerm, selectedCategory, selectedLanguage, selectedFormat, minPrice, maxPrice, sortBy, sortOrder, page, rowPerPage],
    `books/?search=${encodeURIComponent(debouncedSearchTerm)}&category=${selectedCategory !== 'All Categories' ? selectedCategory : ''}&language=${selectedLanguage !== 'All Languages' ? selectedLanguage : ''}&format=${selectedFormat !== 'All Formats' ? selectedFormat : ''}&minPrice=${minPrice}&maxPrice=${maxPrice}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page + 1}&limit=${rowPerPage}`,
    null // No token needed for public access
  );

  // Extract pagination info from API response
  const pagination = fetchedBooks?.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setCurrentLang(savedLang);
    setCurrentTranslations(translations[savedLang] || translations.en);
  }, []);

  // Use real API data - backend already handles filtering, sorting, and pagination
  const books = fetchedBooks?.data?.books || [];

  const openBookDetails = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  return (
    <Layout>
      {/* Top Loading Bar */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-orange-200 z-50">
          <div className="h-full bg-orange-600 animate-pulse"></div>
        </div>
      )}
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {currentTranslations['books.title'] || 'Digital Library'}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {currentTranslations['books.subtitle'] || 'Discover thousands of educational books across various subjects'}
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder={currentTranslations['books.search.placeholder'] || 'Search books, authors, or subjects...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm sm:text-base"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {languages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {formats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentTranslations['books.results'] || 'Books'} ({totalItems})
            </h2>
            <p className="text-gray-600">
              {currentTranslations['books.results.description'] || 'Browse our collection of educational books'}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error loading books. Please try again.</p>
              <button 
                onClick={() => refetch()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Books Grid - Card Format */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {books.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group">
                {/* Book Cover */}
                <div className="relative aspect-[3/4]">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load book cover:', book.coverImageUrl);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 ${book.coverImageUrl ? 'hidden' : 'flex'}`}>
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold mb-1">📖</div>
                      <div className="text-xs opacity-90">Digital Book</div>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-1 left-1 bg-white text-gray-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                    {book.category || 'Book'}
                  </div>
                  
                  {/* Page Count Badge */}
                  <div className="absolute top-1 right-1 bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                    {book.pages || 'N/A'} pages
                  </div>
                </div>

                {/* Book Content */}
                <div className="p-3">
                  <div className="flex items-center justify-start mb-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {book.format || 'PDF'}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  
                  <div className="flex items-center mb-2">
                    <User className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-700 truncate">
                      {book.authors && book.authors.length > 0 
                        ? book.authors.map(author => author.penName || author.firstName).join(', ') || 'Unknown Author'
                        : 'No Author'
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-start">
                    <button
                      onClick={() => openBookDetails(book)}
                      className="flex-1 bg-gray-100 text-gray-700 py-1.5 px-2 rounded text-xs font-medium mr-1 hover:bg-gray-200 transition-colors"
                    >
                      Details
                    </button>
                    <div className="flex items-center space-x-1">
                      {book.fileUrl && (
                        <Link
                          href={`/books/${book.id}`}
                          className="inline-flex items-center px-2 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                          title="Read Book"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          Read
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* No Books Found */}
          {!loading && !error && books.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse different categories.</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowPerPage}
                  onChange={(e) => {
                    setRowPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {page + 1} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Book Details Modal */}
      {showModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedBook.title}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Book Cover */}
                <div className="relative">
                  {selectedBook.coverImageUrl ? (
                    <img
                      src={selectedBook.coverImageUrl}
                      alt={selectedBook.title}
                      className="w-full h-96 object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Failed to load modal book cover:', selectedBook.coverImageUrl);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-96 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg ${selectedBook.coverImageUrl ? 'hidden' : 'flex'}`}>
                    <div className="text-white text-center">
                      <div className="text-6xl font-bold mb-2">📖</div>
                      <div className="text-lg opacity-90">Digital Book</div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedBook.category}
                  </div>
                </div>

                {/* Book Details */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Author</h3>
                      <p className="text-gray-600">
                        {selectedBook.authors && selectedBook.authors.length > 0 
                          ? selectedBook.authors[0].penName || selectedBook.authors[0].firstName || 'Unknown Author'
                          : 'No Author'
                        }
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedBook.description || 'No description available'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Pages</h4>
                        <p className="text-gray-600">{selectedBook.pages || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Language</h4>
                        <p className="text-gray-600">{selectedBook.language || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">File Size</h4>
                        <p className="text-gray-600">{selectedBook.fileSize ? `${(selectedBook.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Published</h4>
                        <p className="text-gray-600">{selectedBook.publicationYear || 'N/A'}</p>
                      </div>
                    </div>

                    {selectedBook.tags && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            // Handle tags whether they come as array or JSON string
                            let tagsArray = [];
                            if (Array.isArray(selectedBook.tags)) {
                              tagsArray = selectedBook.tags;
                            } else if (typeof selectedBook.tags === 'string') {
                              try {
                                tagsArray = JSON.parse(selectedBook.tags);
                              } catch (e) {
                                console.warn('Failed to parse tags as JSON:', selectedBook.tags);
                                tagsArray = selectedBook.tags.split(',').map(tag => tag.trim());
                              }
                            }
                            
                            return tagsArray.length > 0 ? tagsArray.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            )) : null;
                          })()}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      {selectedBook.fileUrl && (
                        <Link
                          href={`/books/${selectedBook.id}`}
                          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                        >
                          Read Book
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 