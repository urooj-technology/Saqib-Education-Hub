'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, User, Eye, Heart, Share2, Clock, Tag, X } from 'lucide-react';
import Layout from '../../components/Layout';

const articlesData = [
  {
    id: 1,
    title: "The Future of Education in Afghanistan",
    author: "Dr. Ahmed Khan",
    category: "Education",
    publishDate: "2024-03-15",
    readTime: "5 min read",
    views: 1250,
    likes: 89,
    description: "Exploring the challenges and opportunities in modernizing education systems in Afghanistan and the role of technology in bridging educational gaps.",
    content: "Education in Afghanistan has faced numerous challenges over the past decades, but there are significant opportunities for improvement through technology and innovative approaches...",
    tags: ["Education", "Technology", "Afghanistan", "Innovation"],
    featured: true,
    image: "https://images.unsplash.com/photo-1523240798131-1135add4c4f7?w=800&h=400&fit=crop"
  },
  {
    id: 2,
    title: "Digital Learning: A Guide for Students",
    author: "Prof. Sarah Johnson",
    category: "Technology",
    publishDate: "2024-03-12",
    readTime: "8 min read",
    views: 980,
    likes: 67,
    description: "A comprehensive guide to effective digital learning strategies for students in the modern educational landscape.",
    content: "Digital learning has become an integral part of modern education. This guide provides practical strategies for students to maximize their online learning experience...",
    tags: ["Digital Learning", "Students", "Online Education", "Study Tips"],
    featured: false,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop"
  },
  {
    id: 3,
    title: "Career Development in the Digital Age",
    author: "Mohammad Ali",
    category: "Career",
    publishDate: "2024-03-10",
    readTime: "6 min read",
    views: 750,
    likes: 45,
    description: "How to navigate career development in an increasingly digital and globalized workforce.",
    content: "The digital age has transformed how we work and develop our careers. This article explores the key skills and strategies needed for career success...",
    tags: ["Career", "Digital Skills", "Professional Development", "Workforce"],
    featured: false,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop"
  },
  {
    id: 4,
    title: "Scholarship Application Tips",
    author: "Fatima Zahra",
    category: "Scholarships",
    publishDate: "2024-03-08",
    readTime: "10 min read",
    views: 2100,
    likes: 156,
    description: "Expert tips and strategies for successful scholarship applications and securing educational funding.",
    content: "Applying for scholarships can be overwhelming, but with the right approach, you can significantly increase your chances of success...",
    tags: ["Scholarships", "Applications", "Funding", "Education"],
    featured: true,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop"
  },
  {
    id: 5,
    title: "Mental Health in Academic Life",
    author: "Dr. Lisa Thompson",
    category: "Wellness",
    publishDate: "2024-03-05",
    readTime: "7 min read",
    views: 890,
    likes: 78,
    description: "Understanding and managing mental health challenges in academic and student life.",
    content: "Mental health is crucial for academic success. This article provides insights into common challenges and strategies for maintaining well-being...",
    tags: ["Mental Health", "Wellness", "Students", "Academic Life"],
    featured: false,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop"
  },
  {
    id: 6,
    title: "Language Learning Strategies",
    author: "Prof. David Chen",
    category: "Language",
    publishDate: "2024-03-02",
    readTime: "9 min read",
    views: 650,
    likes: 42,
    description: "Effective strategies for learning new languages and improving language skills for academic and professional success.",
    content: "Language learning is a valuable skill in today's globalized world. This article explores proven strategies for mastering new languages...",
    tags: ["Language Learning", "Education", "Globalization", "Skills"],
    featured: false,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop"
  }
];

const categories = ["All Categories", "Education", "Technology", "Career", "Scholarships", "Wellness", "Language"];

export default function Articles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('date');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredArticles = articlesData.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.publishDate) - new Date(a.publishDate);
      case 'views':
        return b.views - a.views;
      case 'likes':
        return b.likes - a.likes;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const openArticleDetails = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Educational Articles
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto">
              Stay updated with the latest educational content, tips, and insights
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="date">Sort by Date</option>
                <option value="views">Sort by Views</option>
                <option value="likes">Sort by Likes</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Articles ({sortedArticles.length})
            </h2>
            <p className="text-gray-600">
              Browse our latest educational articles and insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  {article.featured && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {article.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(article.publishDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.readTime}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {article.views} views
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openArticleDetails(article)}
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      Read More
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article Details Modal */}
      {showModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h2>
                  <p className="text-lg text-gray-600">{selectedArticle.author}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Article Content</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedArticle.content}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Article Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedArticle.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published:</span>
                        <span className="font-medium">{new Date(selectedArticle.publishDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Read Time:</span>
                        <span className="font-medium">{selectedArticle.readTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-medium">{selectedArticle.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Likes:</span>
                        <span className="font-medium">{selectedArticle.likes}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                      Read Full Article
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                      Share
                    </button>
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