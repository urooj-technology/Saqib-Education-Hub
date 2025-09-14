
'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Upload, 
  BookOpen,
  ArrowLeft,
  Plus,
  Trash2,
  User,
  Search,
  ChevronDown
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useAdd from '../../../../api/useAdd';
import useFetchObjects from '../../../../api/useFetchObjects';
import { useRouter } from 'next/navigation';

const categories = [
  'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 
  'Biology', 'Literature', 'History', 'Geography', 'Economics',
  'Psychology', 'Philosophy', 'Art', 'Music', 'Sports',
  'Engineering', 'Medicine', 'Law', 'Business', 'Education'
];

const languages = ['English', 'Arabic', 'Pashto', 'Dari', 'French', 'German', 'Spanish', 'Urdu', 'Persian'];
const formats = ['pdf', 'epub', 'mobi', 'docx', 'txt', 'html'];
const statuses = ['draft', 'published', 'archived', 'pending_review'];
const currencies = ['USD', 'EUR', 'GBP', 'AFN', 'PKR'];

export default function CreateBook() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    publisher: '',
    publicationYear: '',
    edition: '',
    pages: '',
    language: 'English',
    category: '',
    format: 'pdf',
    price: '0.00',
    currency: 'USD',
    status: 'draft',
    tags: []
  });

  const [authors, setAuthors] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [tagInput, setTagInput] = useState('');

  // New state for author management
  const [existingAuthors, setExistingAuthors] = useState([]);
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);



  const auth = useAuth();
  const token = auth.token;
  const { handleAdd, loading, success, responseData, error } = useAdd("books", token);
  
  // Fetch existing authors
  const { data: fetchedAuthors, loading: authorsLoading } = useFetchObjects("authors", "authors", token);

  // Debug logging for authors
  console.log('Create Book - Fetched authors:', fetchedAuthors);
  console.log('Create Book - Authors loading:', authorsLoading);
  console.log('Create Book - Existing authors state:', existingAuthors);

  useEffect(() => {
    console.log('Create Book - Authors data changed:', fetchedAuthors);
    if (fetchedAuthors?.data?.authors && Array.isArray(fetchedAuthors.data.authors)) {
      console.log('Create Book - Setting authors from data.authors:', fetchedAuthors.data.authors);
      setExistingAuthors(fetchedAuthors.data.authors);
    } else if (fetchedAuthors?.data && Array.isArray(fetchedAuthors.data)) {
      console.log('Create Book - Setting authors from data.data:', fetchedAuthors.data);
      setExistingAuthors(fetchedAuthors.data);
    } else if (fetchedAuthors && Array.isArray(fetchedAuthors)) {
      console.log('Create Book - Setting authors from direct array:', fetchedAuthors);
      setExistingAuthors(fetchedAuthors);
    } else {
      console.log('Create Book - No valid authors data found');
    }
  }, [fetchedAuthors]);

  useEffect(() => {
    if (success && responseData) {
      router.push('/admin/books');
    }
  }, [success, responseData, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (field === 'coverImage') {
        setCoverImage(file);
      } else if (field === 'bookFile') {
        setBookFile(file);
      }
    }
  };

  const handleAuthorChange = (index, field, value) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([...authors, { 
      id: null, // null means it's a new author
      penName: '', 
      bio: '', 
      isNew: true 
    }]);
  };

  const removeAuthor = (index) => {
    if (authors.length > 1) {
      const newAuthors = authors.filter((_, i) => i !== index);
      setAuthors(newAuthors);
    }
  };

  // New functions for author management
  const selectExistingAuthor = (author) => {
    setAuthors([...authors, { 
      ...author, 
      id: author.id, 
      isNew: false 
    }]);
    setShowAuthorDropdown(false);
    setAuthorSearchTerm('');
  };

  const createNewAuthorInline = (index) => {
    const newAuthors = [...authors];
    newAuthors[index] = { 
      ...newAuthors[index], 
      isNew: true,
      id: null 
    };
    setAuthors(newAuthors);
  };

  const filteredExistingAuthors = existingAuthors.filter(author => 
    author.penName.toLowerCase().includes(authorSearchTerm.toLowerCase()) &&
    !authors.some(selectedAuthor => selectedAuthor.id === author.id)
  );

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.language) {
      newErrors.language = 'Language is required';
    }

    if (!formData.format) {
      newErrors.format = 'Format is required';
    }

    if (!bookFile) {
      newErrors.bookFile = 'Book file is required';
    }


    if (formData.publicationYear && (formData.publicationYear < 1800 || formData.publicationYear > new Date().getFullYear() + 1)) {
      newErrors.publicationYear = 'Publication year must be between 1800 and next year';
    }

    if (formData.pages && formData.pages < 1) {
      newErrors.pages = 'Pages must be a positive number';
    }

    if (formData.price && formData.price < 0) {
      newErrors.price = 'Price must be non-negative';
    }

    // Validate authors
    if (authors.length === 0 || authors.some(author => !author.penName.trim())) {
      newErrors.authors = 'At least one author with pen name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for multipart upload
      const formDataToSend = new FormData();
      
      // Add book data
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add authors data
      formDataToSend.append('authors', JSON.stringify(authors));

      // Add files
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }
      if (bookFile) {
        formDataToSend.append('bookFile', bookFile);
      }

      // Call the API
      await handleAdd(formDataToSend);
      
    } catch (error) {
      console.error('Error creating book:', error);
      setErrors({ submit: 'Error creating book. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Create New Book">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/admin/books"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Books
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Book</h1>
            <p className="text-sm sm:text-base text-gray-600">Add a new book to your digital library</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter book title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter book description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.category ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.language ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {languages.map(language => (
                          <option key={language} value={language}>{language}</option>
                        ))}
                      </select>
                      {errors.language && (
                        <p className="mt-1 text-sm text-red-600">{errors.language}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter publisher"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
                      <input
                        type="number"
                        name="publicationYear"
                        value={formData.publicationYear}
                        onChange={handleInputChange}
                        min="1800"
                        max={new Date().getFullYear() + 1}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.publicationYear ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="2024"
                      />
                      {errors.publicationYear && (
                        <p className="mt-1 text-sm text-red-600">{errors.publicationYear}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Edition</label>
                      <input
                        type="text"
                        name="edition"
                        value={formData.edition}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="1st"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                      <input
                        type="number"
                        name="pages"
                        value={formData.pages}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.pages ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="300"
                      />
                      {errors.pages && (
                        <p className="mt-1 text-sm text-red-600">{errors.pages}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Technical Details & Authors */}
            <div className="space-y-4">
              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Format <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="format"
                        value={formData.format}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.format ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {formats.map(format => (
                          <option key={format} value={format}>{format.toUpperCase()}</option>
                        ))}
                      </select>
                      {errors.format && (
                        <p className="mt-1 text-sm text-red-600">{errors.format}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Authors */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Authors</h3>
                  <div className="flex space-x-2">
                    {/* Add Existing Author Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAuthorDropdown(!showAuthorDropdown)}
                        className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <User className="w-4 h-4 mr-1" />
                        Select Author
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                      
                      {/* Author Selection Dropdown */}
                      {showAuthorDropdown && (
                        <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                type="text"
                                placeholder="Search authors..."
                                value={authorSearchTerm}
                                onChange={(e) => setAuthorSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {authorsLoading ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                Loading authors...
                              </div>
                            ) : filteredExistingAuthors.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                {authorSearchTerm ? 'No authors found' : 'No authors available'}
                              </div>
                            ) : (
                              filteredExistingAuthors.map((author) => (
                                <button
                                  key={author.id}
                                  type="button"
                                  onClick={() => selectExistingAuthor(author)}
                                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{author.penName}</div>
                                  {author.bio && (
                                    <div className="text-sm text-gray-500 truncate">{author.bio}</div>
                                  )}
                                  <div className="text-xs text-gray-400 mt-1">
                                    ID: {author.id}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Add New Author Button */}
                    <button
                      type="button"
                      onClick={addAuthor}
                      className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Author
                    </button>
                  </div>
                </div>
                
                {errors.authors && (
                  <p className="mb-2 text-sm text-red-600">{errors.authors}</p>
                )}
                
                <div className="space-y-4">
                  {authors.map((author, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">Author {index + 1}</h4>
                          {author.id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Existing
                            </span>
                          )}
                          {author.isNew && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {author.id && (
                            <button
                              type="button"
                              onClick={() => createNewAuthorInline(index)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Edit
                            </button>
                          )}
                          {authors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAuthor(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pen Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={author.penName}
                            onChange={(e) => handleAuthorChange(index, 'penName', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter pen name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                          <textarea
                            value={author.bio}
                            onChange={(e) => handleAuthorChange(index, 'bio', e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter author bio"
                          />
                        </div>
                        
                        {/* Show additional fields for new authors */}
                        {author.isNew && (
                          <div className="text-sm text-gray-500 italic">
                            Additional author details can be added later from the Authors section.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Author Management Tips:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• <strong>Select Author:</strong> Choose from existing authors in your system</li>
                        <li>• <strong>New Author:</strong> Create a new author profile inline</li>
                        <li>• <strong>Edit:</strong> Modify existing author details if needed</li>
                        <li>• New authors will be automatically created when you save the book</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - File Uploads & Preview */}
            <div className="space-y-4">
              {/* Cover Image Upload */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Image</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {coverImage ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-32 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">{coverImage.name}</p>
                      <button
                        type="button"
                        onClick={() => setCoverImage(null)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto w-12 h-12 text-gray-400" />
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Upload cover image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'coverImage')}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Book File Upload */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Book File</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {bookFile ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">{bookFile.name}</p>
                      <p className="text-xs text-gray-500">
                        Size: {(bookFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setBookFile(null)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto w-12 h-12 text-gray-400" />
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Upload book file
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.epub,.mobi,.docx,.txt,.html"
                            onChange={(e) => handleFileChange(e, 'bookFile')}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500">PDF, EPUB, MOBI, DOCX, TXT, HTML up to 100MB</p>
                      </div>
                    </div>
                  )}
                </div>
                {errors.bookFile && (
                  <p className="mt-1 text-sm text-red-600">{errors.bookFile}</p>
                )}
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Title:</strong> {formData.title || 'Not set'}</p>
                  <p><strong>Category:</strong> {formData.category || 'Not set'}</p>
                  <p><strong>Language:</strong> {formData.language || 'Not set'}</p>
                  <p><strong>Format:</strong> {formData.format || 'Not set'}</p>
                  <p><strong>Status:</strong> {formData.status || 'Not set'}</p>
                  <p><strong>Authors:</strong> {authors.filter(a => a.penName.trim()).length || 0}</p>
                  <p><strong>Tags:</strong> {formData.tags.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Link
              href="/admin/books"
              className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="inline-flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting || loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Book
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

