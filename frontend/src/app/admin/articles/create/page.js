'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  FileText,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  User,
  Plus,
  Search,
  Users,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Loader2
} from 'lucide-react';
import RichTextarea from '@/components/RichTextarea';
import AdminLayout from '@/components/AdminLayout';
import NextLink from 'next/link';
import { uploadFileInChunks } from '@/utils/chunkedUpload';
import { useAuth } from '@/context/AuthContext';
import useAdd from '@/api/useAdd';
import useFetchObjects from '@/api/useFetchObjects';
import { toast } from 'react-toastify';

const statuses = [
  { value: 'draft', label: 'Draft', description: 'Save as draft for later editing' },
  { value: 'published', label: 'Published', description: 'Make article visible to public' },
  { value: 'pending_review', label: 'Pending Review', description: 'Submit for review' }
];

export default function CreateArticle() {
  const router = useRouter();
  const auth = useAuth();
  const token = auth.token;
  
  // Fetch article categories using useFetchObjects
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError, refetch: refetchArticleCategories } = useFetchObjects(
    "article-categories",
    "article-categories", 
    token
  );
  const articleCategories = categoriesData?.data?.categories || [];
  
  // Create category functionality using useAdd
  const { handleAdd: handleAddCategory, loading: createCategoryLoading } = useAdd(
    "article-categories",
    token,
    null,
    "Category created successfully!",
    "Failed to create category"
  );
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    status: 'published', // Default to published so articles show up immediately
    authorIds: [] // Array of selected author IDs
  });
  
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [documentAttachment, setDocumentAttachment] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAddAuthorModal, setShowAddAuthorModal] = useState(false);
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // Handle content change for rich text editor
  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
    
    // Clear error when user starts typing
    if (errors.content) {
      setErrors(prev => ({
        ...prev,
        content: ''
      }));
    }
  };

  // Use the useAdd hook for creating articles
  const { handleAdd, loading, success, error } = useAdd(
    'articles',
    token,
    '/admin/articles',
    'Article created successfully!',
    'Failed to create article'
  );

  // Use the useAdd hook for creating authors
  const { 
    handleAdd: handleAddAuthor, 
    loading: authorLoading, 
    success: authorSuccess, 
    error: authorError 
  } = useAdd(
    'authors',
    token,
    null,
    'Author created successfully!',
    'Failed to create author'
  );

  // Fetch authors for article creation
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
          categoryId: response.data.category.id
        }));
        
        // Refetch categories to update the dropdown
        refetchArticleCategories();
        
        // Show success message
        toast.success('Category created successfully!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create category');
    }
  };

  // Handle author selection
  const handleAuthorToggle = (authorId) => {
    setFormData(prev => ({
      ...prev,
      authorIds: prev.authorIds.includes(authorId)
        ? prev.authorIds.filter(id => id !== authorId)
        : [...prev.authorIds, authorId]
    }));
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setFeaturedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid document file (PDF, Word, Excel, or Text)');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Document size should be less than 10MB');
        return;
      }
      
      setDocumentAttachment(file);
      setDocumentPreview(file.name);
    }
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = () => {
    setDocumentAttachment(null);
    setDocumentPreview(null);
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const uploadUrl = baseUrl.endsWith('/api') ? `${baseUrl}/upload` : `${baseUrl}/api/upload`;
      
      let uploadedDocumentFile = null;
      
      // Upload document attachment using chunked upload for better performance
      if (documentAttachment) {
        try {
          console.log('Article - Document attachment selected:', documentAttachment.name, documentAttachment.size);
          
          // Use chunked upload for files larger than 5MB
          if (documentAttachment.size > 5 * 1024 * 1024) {
            console.log('Article - Using chunked upload for large document');
            const uploadResult = await uploadFileInChunks(
              documentAttachment,
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
            console.log('Article - Chunked upload completed:', uploadResult);
          } else {
            console.log('Article - Using regular upload for small document');
            // For smaller files, we'll add directly to form data
          }
        } catch (uploadError) {
          console.error('Article - Document upload failed:', uploadError);
          throw new Error('Failed to upload document attachment. Please try again.');
        }
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('categoryId', formData.categoryId);
      submitData.append('status', formData.status);
      
      // Add author IDs as JSON string
      if (formData.authorIds.length > 0) {
        submitData.append('authorIds', JSON.stringify(formData.authorIds));
      }
      
      // Add featured image (smaller file, regular upload)
      if (featuredImage) {
        setUploadProgress(90);
        submitData.append('featuredImage', featuredImage);
      }
      
      // Add document attachment to form data
      if (documentAttachment) {
        setUploadProgress(85);
        console.log('Article - documentAttachment file:', documentAttachment);
        console.log('Article - uploadedDocumentFile result:', uploadedDocumentFile);
        
        // If we used chunked upload, send the result
        if (uploadedDocumentFile) {
          console.log('Article - Using chunked upload result');
          submitData.append('uploadedDocumentFile', JSON.stringify(uploadedDocumentFile));
        } else {
          console.log('Article - Using regular upload');
          // For smaller files, add directly to form data
          submitData.append('documentAttachment', documentAttachment);
        }
      }

      setUploadProgress(95);
      
      // Debug: Log FormData contents
      console.log('Article - FormData contents:');
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }
      
      await handleAdd(submitData);
      
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('Failed to create article');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle success
  useEffect(() => {
    if (success) {
      toast.success('Article created successfully!');
      router.push('/admin/articles');
    }
  }, [success, router]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error('Failed to create article. Please try again.');
    }
  }, [error]);

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };



  return (
    <AdminLayout title="Create New Article">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <NextLink
              href="/admin/articles"
              className="inline-flex items-center text-xs text-gray-600 hover:text-gray-900 mb-1"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back to Articles
            </NextLink>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Create New Article</h1>
            <p className="text-xs sm:text-sm text-gray-500">Add a new article to your content library</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-3 h-3 mr-1" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Title */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label htmlFor="title" className="block text-xs font-medium text-gray-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a compelling title for your article..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label htmlFor="content" className="block text-xs font-medium text-gray-700 mb-1">
                  Article Content *
                </label>
                {isPreviewMode ? (
                  <div className="min-h-[300px] p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="prose max-w-none">
                      <h1 className="text-xl font-bold mb-3">{formData.title || 'Untitled Article'}</h1>
                      <div 
                        className="text-gray-800 text-sm"
                        dangerouslySetInnerHTML={{ __html: formData.content || 'No content yet...' }}
                      />
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
                {errors.content && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.content}
                  </p>
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
                    className="flex items-center px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Author
                  </button>
                </div>

                {/* Author Search */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <input
                      type="text"
                      placeholder="Search authors..."
                      value={authorSearchTerm}
                      onChange={(e) => setAuthorSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                {/* Authors List */}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {authorsLoading ? (
                    <div className="text-center py-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-1">Loading authors...</p>
                    </div>
                  ) : authorsError ? (
                    <div className="text-center py-3">
                      <AlertCircle className="w-4 h-4 text-red-500 mx-auto mb-1" />
                      <p className="text-xs text-red-600">Failed to load authors</p>
                    </div>
                  ) : authorsData?.data?.authors?.length > 0 ? (
                    authorsData.data.authors
                      .filter(author => 
                        author.penName?.toLowerCase().includes(authorSearchTerm.toLowerCase()) ||
                        author.bio?.toLowerCase().includes(authorSearchTerm.toLowerCase())
                      )
                      .map(author => (
                        <div
                          key={author.id}
                          className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id={`author-${author.id}`}
                            checked={formData.authorIds.includes(author.id)}
                            onChange={() => handleAuthorToggle(author.id)}
                            className="w-3 h-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <label
                            htmlFor={`author-${author.id}`}
                            className="ml-2 flex-1 cursor-pointer"
                          >
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                                <User className="w-3 h-3 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900">
                                  {author.penName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {author.bio}
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-3">
                      <Users className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">No authors found</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Click "Add Author" to create a new author
                      </p>
                    </div>
                  )}
                </div>

                {/* Selected Authors Summary */}
                {formData.authorIds.length > 0 && (
                  <div className="mt-3 p-2 bg-indigo-50 rounded-lg">
                    <p className="text-xs font-medium text-indigo-900 mb-1">
                      Selected Authors ({formData.authorIds.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {formData.authorIds.map(authorId => {
                        const author = authorsData?.data?.authors?.find(a => a.id === authorId);
                        return author ? (
                          <span
                            key={authorId}
                            className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                          >
                            {author.penName}
                            <button
                              type="button"
                              onClick={() => handleAuthorToggle(authorId)}
                              className="ml-1 text-indigo-600 hover:text-indigo-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Featured Image */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Featured Image
                </label>
                
                {imagePreview ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      {featuredImage?.name}
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-0.5">PNG, JPG up to 5MB</p>
                  </div>
                )}
                
                                 <input
                   ref={fileInputRef}
                   type="file"
                   accept="image/*"
                   onChange={handleImageChange}
                   className="hidden"
                 />
               </div>

               {/* Document Attachment */}
               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                 <label className="block text-xs font-medium text-gray-700 mb-1">
                   Document Attachment
                 </label>
                 
                 {documentPreview ? (
                   <div className="space-y-2">
                     <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                       <div className="flex items-center">
                         <FileText className="w-4 h-4 text-gray-400 mr-2" />
                         <div>
                           <p className="text-xs font-medium text-gray-900">{documentPreview}</p>
                           <p className="text-xs text-gray-500">
                             {(documentAttachment?.size / 1024 / 1024).toFixed(2)} MB
                           </p>
                         </div>
                       </div>
                       <button
                         type="button"
                         onClick={removeDocument}
                         className="p-1 text-red-500 hover:text-red-700 transition-colors"
                       >
                         <X className="w-3 h-3" />
                       </button>
                     </div>
                   </div>
                 ) : (
                   <div
                     onClick={() => documentInputRef.current?.click()}
                     className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                   >
                     <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                     <p className="text-xs text-gray-600">Click to upload document</p>
                     <p className="text-xs text-gray-500 mt-0.5">PDF, Word, Excel, Text up to 10MB</p>
                   </div>
                 )}
                 
                 <input
                   ref={documentInputRef}
                   type="file"
                   accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                   onChange={handleDocumentChange}
                   className="hidden"
                 />
               </div>

              {/* Article Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Article Settings</h3>
                
                {/* Category */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="categoryId" className="block text-xs font-medium text-gray-700">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Category
                    </button>
                  </div>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    disabled={categoriesLoading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.categoryId ? 'border-red-300' : 'border-gray-300'
                    } ${categoriesLoading ? 'bg-gray-100' : ''}`}
                  >
                        <option value="">{categoriesLoading ? 'Loading categories...' : articleCategories.length === 0 ? 'No categories available - Create one below' : 'Select a category'}</option>
                        {articleCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.categoryId}
                    </p>
                  )}
                </div>


                {/* Status */}
                <div className="mb-3">
                  <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {statuses.find(s => s.value === formData.status)?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-gray-600">
                {formData.content && (
                  <span className="flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {formData.content.trim().split(/\s+/).length} words
                  </span>
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
              
              <div className="flex items-center space-x-2">
                <NextLink
                  href="/admin/articles"
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </NextLink>
                <button
                  type="submit"
                  disabled={loading || isUploading}
                  className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading... ({uploadProgress}%)
                    </>
                  ) : loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Article
                    </>
                  )}
                </button>
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
