'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Download, Eye, Star, Clock, User, Calendar, BookOpen, ChevronRight, ChevronLeft, X } from 'lucide-react';
import Layout from '../../components/Layout';

// Import translations
import enTranslations from '../../locales/en.json';
import psTranslations from '../../locales/ps.json';
import drTranslations from '../../locales/dr.json';

const translations = {
  en: enTranslations,
  ps: psTranslations,
  dr: drTranslations,
};

// Mock data for books
const booksData = [
  {
    id: 1,
    title: "Advanced Mathematics for Engineering",
    author: "Dr. Ahmed Khan",
    category: "Mathematics",
    language: "English",
    pages: 450,
    rating: 4.8,
    downloads: 1250,
    views: 3200,
    description: "Comprehensive guide to advanced mathematical concepts essential for engineering students.",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    pdfUrl: "#",
    publishDate: "2024-01-15",
    fileSize: "15.2 MB",
    tags: ["Engineering", "Mathematics", "Advanced", "University"]
  },
  {
    id: 2,
    title: "Computer Science Fundamentals",
    author: "Prof. Sarah Johnson",
    category: "Computer Science",
    language: "English",
    pages: 380,
    rating: 4.9,
    downloads: 2100,
    views: 5400,
    description: "Essential concepts in computer science for beginners and intermediate learners.",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
    pdfUrl: "#",
    publishDate: "2024-02-20",
    fileSize: "12.8 MB",
    tags: ["Programming", "Algorithms", "Data Structures", "Beginner"]
  },
  {
    id: 3,
    title: "Modern Physics Principles",
    author: "Dr. Maria Rodriguez",
    category: "Physics",
    language: "English",
    pages: 520,
    rating: 4.7,
    downloads: 890,
    views: 2100,
    description: "Exploring the fundamental principles of modern physics with practical applications.",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop",
    pdfUrl: "#",
    publishDate: "2024-01-08",
    fileSize: "18.5 MB",
    tags: ["Physics", "Quantum Mechanics", "Relativity", "Advanced"]
  },
  {
    id: 4,
    title: "Business Management Strategies",
    author: "Prof. David Chen",
    category: "Business",
    language: "English",
    pages: 320,
    rating: 4.6,
    downloads: 1560,
    views: 3800,
    description: "Strategic approaches to modern business management and organizational leadership.",
    cover: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=400&fit=crop",
    pdfUrl: "#",
    publishDate: "2024-03-10",
    fileSize: "11.3 MB",
    tags: ["Management", "Strategy", "Leadership", "Business"]
  },
  {
    id: 5,
    title: "Medical Biochemistry",
    author: "Dr. Lisa Thompson",
    category: "Medicine",
    language: "English",
    pages: 680,
    rating: 4.9,
    downloads: 980,
    views: 2400,
    description: "Comprehensive study of biochemical processes in human health and disease.",
    cover: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=400&fit=crop",
    pdfUrl: "#",
    publishDate: "2024-02-05",
    fileSize: "22.1 MB",
    tags: ["Medicine", "Biochemistry", "Health", "Advanced"]
  },
  {
    id: 6,
    title: "Environmental Science",
    author: "Dr. James Wilson",
    category: "Environmental Science",
    language: "English",
    pages: 410,
    rating: 4.5,
    downloads: 720,
    views: 1800,
    description: "Understanding environmental challenges and sustainable solutions for the future.",
    cover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=400&fit=crop",
    pdfUrl: "#",
    publishDate: "2024-01-25",
    fileSize: "14.7 MB",
    tags: ["Environment", "Sustainability", "Climate", "Science"]
  }
];

const categories = [
  "All Categories",
  "Mathematics",
  "Computer Science", 
  "Physics",
  "Business",
  "Medicine",
  "Environmental Science",
  "Literature",
  "History",
  "Chemistry"
];

export default function Books() {
  const [currentLang, setCurrentLang] = useState('en');
  const [currentTranslations, setCurrentTranslations] = useState(translations.en);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('title');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setCurrentLang(savedLang);
    setCurrentTranslations(translations[savedLang] || translations.en);
  }, []);

  const filteredBooks = booksData.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      case 'date':
        return new Date(b.publishDate) - new Date(a.publishDate);
      default:
        return 0;
    }
  });

  const openBookDetails = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  return (
    <Layout>
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
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={currentTranslations['books.search.placeholder'] || 'Search books, authors, or subjects...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="rating">Sort by Rating</option>
                <option value="downloads">Sort by Downloads</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentTranslations['books.results'] || 'Books'} ({sortedBooks.length})
            </h2>
            <p className="text-gray-600">
              {currentTranslations['books.results.description'] || 'Browse our collection of educational books'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Book Cover */}
                <div className="relative h-64 bg-gray-200 overflow-hidden">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {book.category}
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    by <span className="font-medium">{book.author}</span>
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{book.rating}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {book.downloads}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {book.views}
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {book.pages}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openBookDetails(book)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  <img
                    src={selectedBook.cover}
                    alt={selectedBook.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedBook.category}
                  </div>
                </div>

                {/* Book Details */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Author</h3>
                      <p className="text-gray-600">{selectedBook.author}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedBook.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Pages</h4>
                        <p className="text-gray-600">{selectedBook.pages}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Language</h4>
                        <p className="text-gray-600">{selectedBook.language}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">File Size</h4>
                        <p className="text-gray-600">{selectedBook.fileSize}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Published</h4>
                        <p className="text-gray-600">{new Date(selectedBook.publishDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedBook.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Download PDF
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                        Preview
                      </button>
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