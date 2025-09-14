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
  Redo
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import { Heading } from '@tiptap/extension-heading';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { Code } from '@tiptap/extension-code';
import { Link } from '@tiptap/extension-link';
import AdminLayout from '../../../../components/AdminLayout';
import NextLink from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useAdd from '../../../../api/useAdd';
import useFetchObjects from '../../../../api/useFetchObjects';
import { toast } from 'react-toastify';

const categories = [
  'Education Technology',
  'Mathematics', 
  'Artificial Intelligence',
  'Sustainability',
  'Digital Skills',
  'Science',
  'Literature',
  'History',
  'Programming',
  'Design',
  'Business',
  'Health'
];

const statuses = [
  { value: 'draft', label: 'Draft', description: 'Save as draft for later editing' },
  { value: 'published', label: 'Published', description: 'Make article visible to public' },
  { value: 'pending_review', label: 'Pending Review', description: 'Submit for review' }
];

export default function CreateArticle() {
  const router = useRouter();
  const auth = useAuth();
  const token = auth.token;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    readTime: '',
    status: 'draft',
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
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // Rich text editor setup
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false, // Disable default bullet list
        orderedList: false, // Disable default ordered list
        listItem: false, // Disable default list item
      }),
      TextStyle,
      Color,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc list-outside ml-4',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal list-outside ml-4',
        },
      }),
      ListItem,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
      Code.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: formData.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({
        ...prev,
        content: html
      }));
      
      // Auto-calculate read time
      const textContent = editor.getText();
      if (textContent.trim()) {
        const readTime = calculateReadTime(textContent);
        setFormData(prev => ({
          ...prev,
          readTime: readTime.toString()
        }));
      }
      
      // Clear error when user starts typing
      if (errors.content) {
        setErrors(prev => ({
          ...prev,
          content: ''
        }));
      }
    },
  });

  // Set mounted state to avoid SSR issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update editor content when formData.content changes
  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content);
    }
  }, [formData.content, editor]);

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
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.readTime && (isNaN(formData.readTime) || formData.readTime < 1)) {
      newErrors.readTime = 'Read time must be a positive number';
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
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('category', formData.category);
      submitData.append('readTime', formData.readTime);
      submitData.append('status', formData.status);
      
      // Add author IDs as JSON string
      if (formData.authorIds.length > 0) {
        submitData.append('authorIds', JSON.stringify(formData.authorIds));
      }
      
      if (featuredImage) {
        submitData.append('featuredImage', featuredImage);
      }
      
      if (documentAttachment) {
        submitData.append('documentAttachment', documentAttachment);
      }
      
      handleAdd(submitData);
      
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('Failed to create article');
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

  // Rich text editor toolbar component
  const RichTextToolbar = () => {
    if (!editor) return null;

    return (
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('bold') ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('italic') ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('bulletList') ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('orderedList') ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive('blockquote') ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
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
                  <div className={`border rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}>
                    {isMounted && editor && (
                      <>
                        <RichTextToolbar />
                        <div className="bg-white">
                          <EditorContent 
                            editor={editor} 
                            className="min-h-[400px] p-4 prose prose-sm max-w-none focus:outline-none"
                            style={{
                              '--tw-prose-headings': '#111827',
                              '--tw-prose-body': '#374151',
                              '--tw-prose-links': '#2563eb',
                              '--tw-prose-bold': '#111827',
                              '--tw-prose-counters': '#6b7280',
                              '--tw-prose-bullets': '#6b7280',
                              '--tw-prose-hr': '#e5e7eb',
                              '--tw-prose-quotes': '#111827',
                              '--tw-prose-quote-borders': '#e5e7eb',
                              '--tw-prose-captions': '#6b7280',
                              '--tw-prose-code': '#111827',
                              '--tw-prose-pre-code': '#e5e7eb',
                              '--tw-prose-pre-bg': '#1f2937',
                              '--tw-prose-th-borders': '#d1d5db',
                              '--tw-prose-td-borders': '#e5e7eb',
                            }}
                          />
                          <style jsx>{`
                            .ProseMirror ul {
                              list-style-type: disc;
                              margin-left: 1.5rem;
                              padding-left: 0;
                            }
                            .ProseMirror ol {
                              list-style-type: decimal;
                              margin-left: 1.5rem;
                              padding-left: 0;
                            }
                            .ProseMirror li {
                              margin: 0.25rem 0;
                              padding-left: 0.5rem;
                            }
                          `}</style>
                        </div>
                      </>
                    )}
                    {!isMounted && (
                      <div className="min-h-[400px] p-4 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <span className="text-gray-500 text-sm">Loading editor...</span>
                        </div>
                      </div>
                    )}
                  </div>
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

              {/* Excerpt */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <label htmlFor="excerpt" className="block text-xs font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief description of the article..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-xs"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.excerpt.length}/500 characters
                </p>
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
                  <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Read Time */}
                <div className="mb-3">
                  <label htmlFor="readTime" className="block text-xs font-medium text-gray-700 mb-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="readTime"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Auto-calculated"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.readTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.readTime && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.readTime}
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
                    {formData.readTime && (
                      <>
                        <span className="mx-2">•</span>
                        <Clock className="w-3 h-3 mr-1" />
                        {formData.readTime} min read
                      </>
                    )}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <NextLink
                  href="/admin/articles"
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </NextLink>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
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
  const [authorErrors, setAuthorErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAuthorData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (authorErrors[name]) {
      setAuthorErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateAuthorForm = () => {
    const newErrors = {};
    
    if (!authorData.penName.trim()) {
      newErrors.penName = 'Pen name is required';
    }
    
    if (!authorData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }
    
    setAuthorErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAuthorForm()) {
      return;
    }
    
    try {
      await onAddAuthor(authorData);
      // Reset form on success
      setAuthorData({ penName: '', bio: '' });
      setAuthorErrors({});
    } catch (error) {
      console.error('Error creating author:', error);
    }
  };

  // Handle success
  useEffect(() => {
    if (success) {
      toast.success('Author created successfully!');
      onClose();
    }
  }, [success, onClose]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error('Failed to create author. Please try again.');
    }
  }, [error]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium text-gray-900">Add New Author</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="penName" className="block text-xs font-medium text-gray-700 mb-1">
                Pen Name *
              </label>
              <input
                type="text"
                id="penName"
                name="penName"
                value={authorData.penName}
                onChange={handleInputChange}
                placeholder="Enter author's pen name..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  authorErrors.penName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {authorErrors.penName && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {authorErrors.penName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="bio" className="block text-xs font-medium text-gray-700 mb-1">
                Bio *
              </label>
              <textarea
                id="bio"
                name="bio"
                value={authorData.bio}
                onChange={handleInputChange}
                placeholder="Enter author's bio..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
                  authorErrors.bio ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {authorErrors.bio && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {authorErrors.bio}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Author
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
