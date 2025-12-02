'use client';

import { useState, useEffect } from 'react';
import { 
  Save, Upload, FileText, ArrowLeft, Trash2, AlertCircle, Eye,
  Bold, Italic, List, ListOrdered, Quote, Undo, Redo, User, Plus, Search, Users, X
} from 'lucide-react';
import RichTextarea from '@/components/RichTextarea';
import AdminLayout from '@/components/AdminLayout';
import NextLink from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useFetchObject from '@/api/useFetchObject';
import useUpdate from '@/api/useUpdate';
import useAdd from '@/api/useAdd';
import useFetchObjects from '@/api/useFetchObjects';
import { useAuth } from '@/context/AuthContext';
import { uploadFileInChunks } from '@/utils/chunkedUpload';
import { toast } from 'react-toastify';

// Categories will be fetched dynamically from the API
const statuses = ['draft', 'published', 'archived'];

export default function EditArticle() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const articleId = params.id;

  const { data: articleData, isLoading, isError, error, refetch } = useFetchObject('articles', 'articles', articleId, token);
  const { handleUpdate, loading: isSubmitting } = useUpdate('articles', token, '/admin/articles', 'Article updated successfully!', 'Failed to update article');

  // Fetch article categories dynamically
  const { data: categoriesData, loading: categoriesLoading, refetch: refetchArticleCategories } = useFetchObjects(
    "article-categories",
    "article-categories?limit=1000", 
    token
  );
  const articleCategories = categoriesData?.data?.categories || [];
  const categories = ['Select Category', ...articleCategories.map(cat => cat.name)];

  // Hook for creating new article categories
  const { handleAdd: handleAddCategory, loading: createCategoryLoading } = useAdd(
    'article-categories',
    token,
    null,
    'Category created successfully!',
    'Failed to create category'
  );

  const [formData, setFormData] = useState({
    title: '', content: '', category: '', status: 'draft', featured_image: null, documentAttachment: null, authorIds: []
  });
  const [existingFeaturedImage, setExistingFeaturedImage] = useState(null);
  const [existingDocumentAttachment, setExistingDocumentAttachment] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Author selection state
  const [showAddAuthorModal, setShowAddAuthorModal] = useState(false);
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');

  // Category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: ''
  });

  // Use the useAdd hook for creating authors
  const { 
    handleAdd: handleAddAuthor, 
    loading: authorLoading, 
    success: authorSuccess, 
    error: authorError 
  } = useAdd(
    'authors',
    token,
    '/admin/articles',
    'Author created successfully!',
    'Failed to create author'
  );

  // Fetch authors for article editing
  const {
    data: authorsData,
    isLoading: authorsLoading,
    isError: authorsError,
    refetch: refetchAuthors
  } = useFetchObjects(
    ["authors"],
    "articles/authors",
    token
  );

  // Handle author selection
  const handleAuthorToggle = (authorId) => {
    setFormData(prev => ({
      ...prev,
      authorIds: prev.authorIds.includes(authorId)
        ? prev.authorIds.filter(id => id !== authorId)
        : [...prev.authorIds, authorId]
    }));
    setHasChanges(true);
  };

  // Handle adding new author
  const handleAddNewAuthor = async (authorData) => {
    try {
      await handleAddAuthor(authorData);
      // Refresh authors list after successful creation
      refetchAuthors();
    } catch (error) {
      console.error('Error creating author:', error);
    }
  };

  // Handle content change for rich text editor
  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
    setHasChanges(true);
    
    // Clear error when user starts typing
    if (errors.content) {
      setErrors(prev => ({
        ...prev,
        content: ''
      }));
    }
  };

  // Load article data
  useEffect(() => {
    if (articleData?.data?.article || articleData?.data) {
      const article = articleData.data.article || articleData.data;
      setFormData({
        title: article.title || '', 
        content: article.content || '', 
        category: article.category || '',
        status: article.status || 'draft', 
        featured_image: null, 
        documentAttachment: null,
        authorIds: article.authors ? article.authors.map(author => author.id) : []
      });
      if (article.featuredImage) setExistingFeaturedImage(article.featuredImage);
      if (article.documentAttachment) setExistingDocumentAttachment(article.documentAttachment);
    }
  }, [articleData]);

  // Check for changes
  useEffect(() => {
    if (articleData?.data?.article || articleData?.data) {
      const article = articleData.data.article || articleData.data;
      const currentAuthorIds = article.authors ? article.authors.map(author => author.id) : [];
      const hasFormChanges = 
        formData.title !== (article.title || '') || formData.content !== (article.content || '') ||
        formData.category !== (article.category || '') || formData.status !== (article.status || 'draft') ||
        formData.featured_image !== null || formData.documentAttachment !== null ||
        JSON.stringify(formData.authorIds.sort()) !== JSON.stringify(currentAuthorIds.sort());
      setHasChanges(hasFormChanges);
    }
  }, [formData, articleData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await handleAddCategory(newCategoryData);
      
      if (response) {
        // Reset form
        setNewCategoryData({
          name: ''
        });
        
        // Close modal
        setShowAddCategoryModal(false);
        
        // Set the new category as selected
        setFormData(prev => ({
          ...prev,
          category: response.data?.category?.name || newCategoryData.name
        }));
        
        // Refresh categories list
        refetchArticleCategories();
        
        toast.success('Category created successfully!');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, [fieldName]: file }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const uploadUrl = baseUrl.endsWith('/api') ? `${baseUrl}/upload` : `${baseUrl}/api/upload`;
      
      let uploadedDocumentFile = null;
      
      // Upload document attachment using chunked upload for better performance
      if (formData.documentAttachment) {
        try {
          console.log('Edit Article - Document attachment selected:', formData.documentAttachment.name, formData.documentAttachment.size);
          
          // Use chunked upload for files larger than 5MB
          if (formData.documentAttachment.size > 5 * 1024 * 1024) {
            console.log('Edit Article - Using chunked upload for large document');
            const uploadResult = await uploadFileInChunks(
              formData.documentAttachment,
              uploadUrl,
              { chunkSize: 1024 * 1024 }, // 1MB chunks
              (progress) => {
                setUploadProgress(Math.round(progress * 0.8)); // 80% for file upload
              },
              {
                'Authorization': `Token ${localStorage.getItem('token')}`
              }
            );
            
            uploadedDocumentFile = uploadResult;
            console.log('Edit Article - Chunked upload completed:', uploadResult);
          } else {
            console.log('Edit Article - Using regular upload for small document');
            // For smaller files, we'll add directly to form data
          }
        } catch (uploadError) {
          console.error('Edit Article - Document upload failed:', uploadError);
          throw new Error('Failed to upload document attachment. Please try again.');
        }
      }

      const updateData = new FormData();
      updateData.append('title', formData.title);
      updateData.append('content', formData.content);
      
      // Find categoryId from category name
      const selectedCategory = articleCategories.find(cat => cat.name === formData.category);
      if (selectedCategory) {
        updateData.append('categoryId', selectedCategory.id);
      } else {
        // Fallback: if category is already an ID (number), use it directly
        updateData.append('categoryId', formData.category);
      }
      
      updateData.append('status', formData.status);
      
      // Add author IDs as JSON string
      if (formData.authorIds.length > 0) {
        updateData.append('authorIds', JSON.stringify(formData.authorIds));
      }
      
      // Add featured image (smaller file, regular upload)
      if (formData.featured_image) {
        setUploadProgress(90);
        updateData.append('featuredImage', formData.featured_image);
      }
      
      // Add document attachment to form data
      if (formData.documentAttachment) {
        setUploadProgress(85);
        
        // If we used chunked upload, send the result
        if (uploadedDocumentFile) {
          updateData.append('uploadedDocumentFile', JSON.stringify(uploadedDocumentFile));
        } else {
          // For smaller files, add directly to form data
          updateData.append('documentAttachment', formData.documentAttachment);
        }
      }

      setUploadProgress(95);

      // Debug: Log FormData contents
      console.log('Edit Article - FormData contents:');
      for (let [key, value] of updateData.entries()) {
        console.log(`${key}:`, value);
      }

      await handleUpdate(articleId, updateData);
      
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Error updating article:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      console.log('Delete article:', articleId);
    }
  };


  if (isLoading) {
    return (
      <AdminLayout title="Edit Article">
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Article</h2>
            <p className="text-gray-600 mb-4">{error?.message || 'Failed to load article data'}</p>
            <NextLink href="/admin/articles" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Articles
            </NextLink>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Article">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <NextLink href="/admin/articles" className="inline-flex items-center text-xs text-gray-600 hover:text-gray-900 mb-1">
              <ArrowLeft className="w-3 h-3 mr-1" />Back to Articles
            </NextLink>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Article</h1>
            <p className="text-xs sm:text-sm text-gray-500">Update your article content and settings</p>
          </div>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => setIsPreviewMode(!isPreviewMode)} className="flex items-center px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              <Eye className="w-3 h-3 mr-1" />{isPreviewMode ? 'Edit' : 'Preview'}
            </button>
            <button onClick={handleDelete} className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs">
              <Trash2 className="w-3 h-3 mr-1" />Delete
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Title */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label htmlFor="title" className="block text-xs font-medium text-gray-700 mb-1">Article Title *</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter a compelling title for your article..." className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`} />
                {errors.title && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.title}</p>}
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="category" className="block text-xs font-medium text-gray-700">Category *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Category
                    </button>
                  </div>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.category ? 'border-red-300' : 'border-gray-300'}`}>
                    <option value="">Select a category</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.category}</p>}
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">Status *</label>
                  <select id="status" name="status" value={formData.status} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.status ? 'border-red-300' : 'border-gray-300'}`}>
                    {statuses.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                  </select>
                  {errors.status && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.status}</p>}
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label htmlFor="content" className="block text-xs font-medium text-gray-700 mb-1">Article Content *</label>
                {isPreviewMode ? (
                  <div className="min-h-[300px] p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="prose max-w-none">
                      <h1 className="text-xl font-bold mb-3">{formData.title || 'Untitled Article'}</h1>
                      <div className="text-gray-800 text-sm" dangerouslySetInnerHTML={{ __html: formData.content || 'No content yet...' }} />
                    </div>
                  </div>
                ) : (
                  <RichTextarea
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your article content here..."
                    minHeight="400px"
                    className={errors.content ? 'border-red-300' : 'border-gray-300'}
                    error={!!errors.content}
                  />
                )}
                {errors.content && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.content}</p>}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Featured Image */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">Featured Image</label>
                {existingFeaturedImage ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={existingFeaturedImage.startsWith('http') ? existingFeaturedImage : `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL}${existingFeaturedImage}`} alt="Featured" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      <div className="w-full h-full flex items-center justify-center" style={{display: 'none'}}><FileText className="w-8 h-8 text-gray-400" /></div>
                    </div>
                    <div className="flex space-x-2">
                      <a href={existingFeaturedImage.startsWith('http') ? existingFeaturedImage : `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL}${existingFeaturedImage}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700">View</a>
                      <label className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-700">Update<input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'featured_image')} className="hidden" /></label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center"><FileText className="w-8 h-8 text-gray-400" /></div>
                    <label className="cursor-pointer">
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-xs text-gray-600 hover:bg-gray-50 transition-colors">Choose Image</div>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'featured_image')} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {/* Authors Selection */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-medium text-gray-700">
                    <Users className="w-3 h-3 inline mr-1" />
                    Authors
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddAuthorModal(true)}
                    className="inline-flex items-center px-2 py-1 text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-300 rounded hover:bg-indigo-50"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Author
                  </button>
                </div>

                {/* Author Search */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search authors..."
                      value={authorSearchTerm}
                      onChange={(e) => setAuthorSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Authors List */}
                <div className="max-h-40 overflow-y-auto">
                  {authorsLoading ? (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500 mt-1">Loading authors...</p>
                    </div>
                  ) : authorsError ? (
                    <div className="text-center py-2">
                      <p className="text-xs text-red-600">Failed to load authors</p>
                    </div>
                  ) : authorsData?.data?.authors?.length > 0 ? (
                    authorsData.data.authors
                      .filter(author => 
                        author.penName?.toLowerCase().includes(authorSearchTerm.toLowerCase()) ||
                        author.bio?.toLowerCase().includes(authorSearchTerm.toLowerCase())
                      )
                      .map(author => (
                        <div key={author.id} className="flex items-start space-x-2 py-2 border-b border-gray-100 last:border-b-0">
                          <input
                            type="checkbox"
                            id={`author-${author.id}`}
                            checked={formData.authorIds.includes(author.id)}
                            onChange={() => handleAuthorToggle(author.id)}
                            className="mt-1 h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`author-${author.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="text-xs font-medium text-gray-900">
                              {author.penName}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-2">
                              {author.bio}
                            </div>
                          </label>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-500">No authors found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Add Author" to create a new author
                      </p>
                    </div>
                  )}
                </div>

                {/* Selected Authors Summary */}
                {formData.authorIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      Selected Authors ({formData.authorIds.length})
                    </div>
                    <div className="space-y-1">
                      {formData.authorIds.map(authorId => {
                        const author = authorsData?.data?.authors?.find(a => a.id === authorId);
                        return author ? (
                          <div
                            key={authorId}
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
              </div>

              {/* Document Attachment */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">Document Attachment</label>
                {existingDocumentAttachment ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-700 truncate">{existingDocumentAttachment.split('/').pop()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <a href={existingDocumentAttachment.startsWith('http') ? existingDocumentAttachment : `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL}${existingDocumentAttachment}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700">View</a>
                      <label className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-700">Update<input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleFileChange(e, 'documentAttachment')} className="hidden" /></label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-gray-400" /></div>
                    <label className="cursor-pointer">
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-xs text-gray-600 hover:bg-gray-50 transition-colors">Choose Document</div>
                      <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleFileChange(e, 'documentAttachment')} className="hidden" />
                    </label>
                  </div>
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

              {/* Form Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="space-y-3">
                  <button type="submit" disabled={isSubmitting || isUploading || !hasChanges} className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isSubmitting || isUploading || !hasChanges ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
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
                        <Save className="w-4 h-4 mr-2" />Update Article
                      </>
                    )}
                  </button>
                  <NextLink href="/admin/articles" className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">Cancel</NextLink>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Add Author Modal */}
        {showAddAuthorModal && (
          <AddAuthorModal
            onClose={() => setShowAddAuthorModal(false)}
            onAddAuthor={handleAddNewAuthor}
            loading={authorLoading}
            success={authorSuccess}
            error={authorError}
          />
        )}

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
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={createCategoryLoading || !newCategoryData.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
                >
                  {createCategoryLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                  Create Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Add Author Modal Component
function AddAuthorModal({ onClose, onAddAuthor, loading, success, error }) {
  const [authorData, setAuthorData] = useState({
    penName: '',
    bio: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAuthorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!authorData.penName.trim()) {
      toast.error('Pen name is required');
      return;
    }
    
    if (!authorData.bio.trim()) {
      toast.error('Bio is required');
      return;
    }
    
    try {
      await onAddAuthor(authorData);
      // Reset form on success
      setAuthorData({ penName: '', bio: '' });
      onClose();
    } catch (error) {
      console.error('Error creating author:', error);
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
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pen Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="penName"
              value={authorData.penName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter author's pen name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              name="bio"
              rows={3}
              value={authorData.bio}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter author's bio"
              required
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !authorData.penName.trim() || !authorData.bio.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Author'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}