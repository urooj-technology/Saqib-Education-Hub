'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  BookOpen,
  ArrowLeft,
  Trash2,
  Eye,
  AlertCircle,
  Plus,
  User,
  Search,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useFetchObject from '@/api/useFetchObject';
import useUpdate from '@/api/useUpdate';
import useAdd from '@/api/useAdd';
import useFetchObjects from '@/api/useFetchObjects';
import { useAuth } from '@/context/AuthContext';
import { uploadFileInChunks } from '@/utils/chunkedUpload';

const languages = ['English', 'Arabic', 'Pashto', 'Dari', 'French', 'German', 'Spanish', 'Urdu', 'Persian'];
const formats = ['pdf', 'epub', 'mobi', 'docx', 'txt', 'html'];
const statuses = ['draft', 'published', 'archived', 'pending_review'];
const currencies = ['USD', 'EUR', 'GBP', 'AFN', 'PKR'];

export default function EditBook() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const bookId = params.id;

  // Use the custom hooks
  const { data: bookData, isLoading, isError, error } = useFetchObject(
    'book',
    'books',
    bookId,
    token
  );

  const { handleUpdate, loading: isSubmitting } = useUpdate(
    'books',
    token,
    '/admin/books',
    'Book updated successfully!',
    'Failed to update book'
  );

  // Fetch book categories dynamically
  const { data: categoriesData, loading: categoriesLoading, refetch: refetchCategories } = useFetchObjects(
    "book-categories",
    "book-categories", 
    token
  );
  const bookCategories = categoriesData?.data?.categories || [];

  // Fetch existing authors for selection
  const { data: authorsData, loading: authorsLoading, refetch: refetchAuthors } = useFetchObjects("authors", "authors?limit=1000", token);

  // Hook for creating new authors
  const { handleAdd: handleAddAuthor, loading: authorCreating } = useAdd('authors', token);
  
  // Hook for creating new categories
  const { handleAdd: handleAddCategory, loading: createCategoryLoading } = useAdd('book-categories', token);

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

  const [selectedAuthorIds, setSelectedAuthorIds] = useState([]); // Array of selected author IDs
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [showAddAuthorModal, setShowAddAuthorModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({ name: '' });
  const [coverImage, setCoverImage] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [existingCoverImage, setExistingCoverImage] = useState(null);
  const [existingBookFile, setExistingBookFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Update form data when book data is loaded
  useEffect(() => {
    if (bookData?.data?.book || bookData?.data) {
      const book = bookData.data.book || bookData.data;
      
      // Debug: Log the book data to see what's being received
      console.log('Edit Book - Book data received:', book);
      console.log('Edit Book - Tags from API:', book.tags);
      console.log('Edit Book - Tags type:', typeof book.tags);
      
      // Ensure tags is always an array
      let tagsArray = [];
      if (book.tags) {
        if (Array.isArray(book.tags)) {
          tagsArray = book.tags;
        } else if (typeof book.tags === 'string') {
          try {
            tagsArray = JSON.parse(book.tags);
          } catch (e) {
            console.warn('Failed to parse tags as JSON:', book.tags);
            tagsArray = [];
          }
        }
      }
      
      setFormData({
        title: book.title || '',
        description: book.description || '',
        publisher: book.publisher || '',
        publicationYear: book.publicationYear || '',
        edition: book.edition || '',
        pages: book.pages || '',
        language: book.language || 'English',
        category: book.category || '',
        format: book.format || 'pdf',
        price: book.price || '0.00',
        currency: book.currency || 'USD',
        status: book.status || 'draft',
        tags: tagsArray
      });

      // Set selected author IDs from the API response
      let bookAuthorsData = null;
      if (bookData.data.authors && Array.isArray(bookData.data.authors)) {
        bookAuthorsData = bookData.data.authors;
      } else if (book.authors && Array.isArray(book.authors)) {
        bookAuthorsData = book.authors;
      }
      
      if (bookAuthorsData) {
        const authorIds = bookAuthorsData.map(author => author.id).filter(id => id);
        setSelectedAuthorIds(authorIds);
      } else {
        setSelectedAuthorIds([]);
      }

      // Set existing files
      if (book.coverImage) {
        setExistingCoverImage(book.coverImage);
      }
      if (book.filePath) {
        setExistingBookFile({
          path: book.filePath,
          size: book.fileSize,
          name: book.filePath.split('/').pop() || 'book.pdf'
        });
      }
    }
  }, [bookData]);


  // Check for changes
  useEffect(() => {
    if (bookData?.data?.book || bookData?.data) {
      const book = bookData.data.book || bookData.data;
      const originalAuthors = bookData.data.authors || [];
      const originalAuthorIds = originalAuthors.map(a => a.id).sort();
      const currentAuthorIds = [...selectedAuthorIds].sort();
      
      const hasFormChanges = 
        formData.title !== (book.title || '') ||
        formData.description !== (book.description || '') ||
        formData.category !== (book.category || '') ||
        formData.language !== (book.language || 'English') ||
        formData.format !== (book.format || 'pdf') ||
        formData.publisher !== (book.publisher || '') ||
        formData.publicationYear !== (book.publicationYear || '') ||
        formData.edition !== (book.edition || '') ||
        formData.pages !== (book.pages || '') ||
        formData.price !== (book.price || '0.00') ||
        formData.currency !== (book.currency || 'USD') ||
        formData.status !== (book.status || 'draft') ||
        JSON.stringify(currentAuthorIds) !== JSON.stringify(originalAuthorIds) ||
        coverImage !== null ||
        bookFile !== null;
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, selectedAuthorIds, coverImage, bookFile, bookData]);

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

  // Handle author selection (toggle checkbox)
  const handleAuthorToggle = (authorId) => {
    setSelectedAuthorIds(prev =>
      prev.includes(authorId)
        ? prev.filter(id => id !== authorId)
        : [...prev, authorId]
    );
  };

  // Handle adding new author via modal
  const handleAddNewAuthor = async (authorData) => {
    try {
      const formData = new FormData();
      formData.append('penName', authorData.penName);
      formData.append('bio', authorData.bio || '');
      
      const response = await handleAddAuthor(formData);
      
      if (response?.data?.author) {
        // Add the new author to selected authors
        setSelectedAuthorIds(prev => [...prev, response.data.author.id]);
        // Refresh authors list
        refetchAuthors();
      }
    } catch (error) {
      console.error('Error creating author:', error);
    }
  };

  // Handle category creation
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      return;
    }

    try {
      const response = await handleAddCategory({
        name: newCategoryData.name.trim()
      });

      if (response?.data) {
        // Refresh categories list
        refetchCategories();
        // Close modal and reset form
        setShowAddCategoryModal(false);
        setNewCategoryData({ name: '' });
        // Optionally set the newly created category as selected
        if (response.data.category) {
          setFormData(prev => ({
            ...prev,
            category: response.data.category.name
          }));
        }
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const addTag = () => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...currentTags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: (Array.isArray(prev.tags) ? prev.tags : []).filter(tag => tag !== tagToRemove)
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
    if (selectedAuthorIds.length === 0) {
      newErrors.authors = 'At least one author is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Use selected author IDs directly (all authors are existing)
      const processedAuthors = selectedAuthorIds;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const uploadUrl = baseUrl.endsWith('/api') ? `${baseUrl}/upload` : `${baseUrl}/api/upload`;
      
      let uploadedBookFile = null;
      
      // Upload book file using chunked upload for better performance
      if (bookFile) {
        try {
          console.log('Edit Book - Book file selected:', bookFile.name, bookFile.size);
          
          // Use chunked upload for files larger than 5MB
          if (bookFile.size > 5 * 1024 * 1024) {
            console.log('Edit Book - Using chunked upload for large file');
            const uploadResult = await uploadFileInChunks(
              bookFile,
              uploadUrl,
              { chunkSize: 1024 * 1024 }, // 1MB chunks
              (progress) => {
                setUploadProgress(Math.round(progress * 0.8)); // 80% for file upload
              },
              {
                'Authorization': `Token ${localStorage.getItem('token')}`
              }
            );
            
            uploadedBookFile = uploadResult;
            console.log('Edit Book - Chunked upload completed:', uploadResult);
          } else {
            console.log('Edit Book - Using regular upload for small file');
            // For smaller files, we'll add directly to form data
          }
        } catch (uploadError) {
          console.error('Edit Book - Book file upload failed:', uploadError);
          throw new Error('Failed to upload book file. Please try again.');
        }
      }

      // Prepare form data for multipart upload
      const formDataToSend = new FormData();
      
      // Add book data
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'category') {
          // Convert category name to categoryId
          const selectedCategory = bookCategories.find(cat => cat.name === formData[key]);
          if (selectedCategory) {
            formDataToSend.append('categoryId', selectedCategory.id);
          } else {
            // Fallback: if category is already an ID (number), use it directly
            formDataToSend.append('categoryId', formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add authors data - use processed author IDs (including newly created ones)
      formDataToSend.append('authors', JSON.stringify(processedAuthors));

      // Add files
      if (coverImage) {
        setUploadProgress(90);
        formDataToSend.append('coverImage', coverImage);
      }
      
      // Add book file to form data
      if (bookFile) {
        setUploadProgress(85);
        
        // If we used chunked upload, send the result
        if (uploadedBookFile) {
          formDataToSend.append('uploadedBookFile', JSON.stringify(uploadedBookFile));
        } else {
          // For smaller files, add directly to form data
          formDataToSend.append('bookFile', bookFile);
        }
      }

      setUploadProgress(95);

      // Debug: Log FormData contents
      console.log('Edit Book - FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      // Debug: Check API URL
      const apiUrl = baseUrl.endsWith('/api') ? `${baseUrl}/books/${bookId}` : `${baseUrl}/api/books/${bookId}`;
      console.log('Edit Book - API URL being used:', apiUrl);
      console.log('Edit Book - Environment API URL:', process.env.NEXT_PUBLIC_API_URL);

      // Send FormData directly (don't convert to object)
      await handleUpdate(bookId, formDataToSend);
      
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Edit Book - Error:', error);
      alert('Failed to update book. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/books/${bookId}` 
          : `${baseUrl}/api/books/${bookId}`;

        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          alert('Book deleted successfully!');
          router.push('/admin/books');
        } else {
          throw new Error('Failed to delete book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Book">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout title="Error">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Book</h2>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Failed to load book data'}
            </p>
            <Link
              href="/admin/books"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Books
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Book">
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Book</h1>
          </div>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Delete Book
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAddCategoryModal(true)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Category
                        </button>
                      </div>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.category ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={categoriesLoading}
                      >
                        <option value="">Select category</option>
                        {bookCategories.map(category => (
                          <option key={category.id} value={category.name}>{category.name}</option>
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="space-y-6">
              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                <div className="space-y-4">
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
                      {(Array.isArray(formData.tags) ? formData.tags : []).map((tag, index) => (
                        <span
                          key={`tag-${tag}-${index}`}
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

              {/* Authors Selection - Clean checkbox design like book create page */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 inline mr-1" />
                    Authors
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddAuthorModal(true)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Author
                  </button>
                </div>

                {/* Author Search */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search authors..."
                      value={authorSearchTerm}
                      onChange={(e) => setAuthorSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Authors List with Checkboxes */}
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {authorsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-2">Loading authors...</p>
                    </div>
                  ) : authorsData?.data?.authors?.length > 0 ? (
                    authorsData.data.authors
                      .filter(author => 
                        author.penName?.toLowerCase().includes(authorSearchTerm.toLowerCase()) ||
                        author.bio?.toLowerCase().includes(authorSearchTerm.toLowerCase())
                      )
                      .map((author, index) => (
                        <div key={`author-${author.id}-${index}`} className="flex items-start space-x-3 py-3 px-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            id={`author-${author.id}`}
                            checked={selectedAuthorIds.includes(author.id)}
                            onChange={() => handleAuthorToggle(author.id)}
                            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`author-${author.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {author.penName}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-2">
                              {author.bio}
                            </div>
                          </label>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-6">
                      <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No authors found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Add Author" to create a new author
                      </p>
                    </div>
                  )}
                </div>

                {/* Selected Authors Summary */}
                {selectedAuthorIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      Selected Authors ({selectedAuthorIds.length})
                    </div>
                    <div className="space-y-1">
                      {selectedAuthorIds.map((authorId, index) => {
                        const author = authorsData?.data?.authors?.find(a => a.id === authorId);
                        return author ? (
                          <div
                            key={`selected-author-${authorId}-${index}`}
                            className="flex items-center justify-between px-2 py-1 bg-indigo-50 rounded text-xs"
                          >
                            <span className="text-indigo-700">{author.penName}</span>
                            <button
                              type="button"
                              onClick={() => handleAuthorToggle(authorId)}
                              className="text-indigo-500 hover:text-indigo-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {errors.authors && (
                  <p className="mt-2 text-sm text-red-600">{errors.authors}</p>
                )}
              </div>
            </div>

            {/* Right Column - File Uploads & Preview */}
            <div className="space-y-6">
              {/* Current Book Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Current Book Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Created:</strong> {bookData?.data?.book?.createdAt ? new Date(bookData.data.book.createdAt).toLocaleDateString() : 'Unknown'}</p>
                  <p><strong>File Size:</strong> {bookData?.data?.book?.fileSize ? `${(bookData.data.book.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Not uploaded'}</p>
                </div>
              </div>

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
                  ) : existingCoverImage ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-32 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL}/uploads/images/${existingCoverImage.split('/').pop()}`}
                          alt="Current cover"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full flex items-center justify-center" style={{display: 'none'}}>
                          <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Current cover image</p>
                      <div className="flex space-x-2 justify-center">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL}/uploads/images/${existingCoverImage.split('/').pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View
                        </a>
                        <label className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700">
                          Update
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'coverImage')}
                            className="hidden"
                          />
                        </label>
                      </div>
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
                  ) : existingBookFile ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">{existingBookFile.name}</p>
                      <p className="text-xs text-gray-500">
                        Size: {existingBookFile.size ? `${(existingBookFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                      </p>
                      <div className="flex space-x-2 justify-center">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL}/uploads/books/${existingBookFile.path.split('/').pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Download
                        </a>
                        <label className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700">
                          Update
                          <input
                            type="file"
                            accept=".pdf,.epub,.mobi,.docx,.txt,.html"
                            onChange={(e) => handleFileChange(e, 'bookFile')}
                            className="hidden"
                          />
                        </label>
                      </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {hasChanges && (
                <span className="text-orange-600">You have unsaved changes</span>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Uploading files...</span>
                  <span className="text-sm text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/admin/books"
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isUploading || !hasChanges}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading... ({uploadProgress}%)
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update Book
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Add Category Modal */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newCategoryData.name}
                    onChange={handleCategoryInputChange}
                    placeholder="Enter category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={createCategoryLoading || !newCategoryData.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
                >
                  {createCategoryLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Author Modal - Professional Design */}
        {showAddAuthorModal && (
          <AddAuthorModal
            onClose={() => setShowAddAuthorModal(false)}
            onAuthorCreated={handleAddNewAuthor}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Add Author Modal Component (separate for clean design)
function AddAuthorModal({ onClose, onAuthorCreated }) {
  const [authorData, setAuthorData] = useState({
    penName: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorData.penName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAuthorCreated(authorData);
      onClose();
    } catch (error) {
      console.error('Error creating author:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add New Author</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pen Name *
              </label>
              <input
                type="text"
                value={authorData.penName}
                onChange={(e) => setAuthorData({ ...authorData, penName: e.target.value })}
                placeholder="Enter author pen name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={authorData.bio}
                onChange={(e) => setAuthorData({ ...authorData, bio: e.target.value })}
                placeholder="Enter author bio (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !authorData.penName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Author
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

