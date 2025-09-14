'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  FileText,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Plus,
  X,
  User,
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
import AdminLayout from '../../../../../components/AdminLayout';
import NextLink from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useFetchObject from '../../../../../api/useFetchObject';
import useFetchObjects from '../../../../../api/useFetchObjects';
import useUpdate from '../../../../../api/useUpdate';
import { useAuth } from '../../../../../context/AuthContext';

const categories = [
  'Technology', 'Education', 'Science', 'Health', 'Business',
  'Arts', 'Sports', 'Politics', 'Entertainment', 'Lifestyle'
];

const statuses = ['draft', 'published', 'archived'];

export default function EditArticle() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const articleId = params.id;

  // Use the custom hooks
  const { data: articleData, isLoading, isError, error } = useFetchObject(
    'article',
    'articles',
    articleId,
    token
  );

  const { handleUpdate, loading: isSubmitting } = useUpdate(
    'articles',
    token,
    '/admin/articles',
    'Article updated successfully!',
    'Failed to update article'
  );

  // Fetch existing authors for selection
  const { data: fetchedAuthors } = useFetchObjects(
    'authors',
    'authors',
    token
  );

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    status: 'draft',
    excerpt: '',
    featured_image: null,
    documentAttachment: null
  });

  const [existingFeaturedImage, setExistingFeaturedImage] = useState(null);
  const [existingDocumentAttachment, setExistingDocumentAttachment] = useState(null);

  // Authors management
  const [authors, setAuthors] = useState([]);
  const [existingAuthors, setExistingAuthors] = useState([]);
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

  // Update form data when article data is loaded
  useEffect(() => {
    if (articleData?.data?.article || articleData?.data) {
      const article = articleData.data.article || articleData.data;
      setFormData({
        title: article.title || '',
        content: article.content || '',
        category: article.category || '',
        status: article.status || 'draft',
        excerpt: article.excerpt || '',
        featured_image: null, // Don't pre-populate file inputs
        documentAttachment: null // Don't pre-populate file inputs
      });
      
      // Set existing featured image path
      if (article.featuredImage) {
        setExistingFeaturedImage(article.featuredImage);
      }

      // Set existing document attachment path
      if (article.documentAttachment) {
        setExistingDocumentAttachment(article.documentAttachment);
      }

      // Set authors from the API response
      let authorsData = null;
      if (articleData.data.authors && Array.isArray(articleData.data.authors)) {
        authorsData = articleData.data.authors;
      } else if (article.authors && Array.isArray(article.authors)) {
        authorsData = article.authors;
      }
      
      if (authorsData) {
        const mappedAuthors = authorsData.map(author => ({
          id: author.id,
          penName: author.penName || author.firstName || '',
          bio: author.bio || '',
          isNew: false
        }));
        setAuthors(mappedAuthors);
      } else {
        setAuthors([]);
      }
    }
  }, [articleData]);

  // Populate existing authors from fetched data
  useEffect(() => {
    if (fetchedAuthors?.data?.authors) {
      setExistingAuthors(fetchedAuthors.data.authors);
    }
  }, [fetchedAuthors]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAuthorDropdown && !event.target.closest('.author-dropdown')) {
        setShowAuthorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAuthorDropdown]);

  // Clear file inputs after successful update
  useEffect(() => {
    if (isSubmitting === false && hasChanges === false) {
      // Clear file inputs after successful update
      setFormData(prev => ({
        ...prev,
        featured_image: null,
        documentAttachment: null
      }));
    }
  }, [isSubmitting, hasChanges]);

  // Check for changes
  useEffect(() => {
    if (articleData?.data?.article || articleData?.data) {
      const article = articleData.data.article || articleData.data;
      const hasFormChanges = 
        formData.title !== (article.title || '') ||
        formData.content !== (article.content || '') ||
        formData.category !== (article.category || '') ||
        formData.status !== (article.status || 'draft') ||
        formData.excerpt !== (article.excerpt || '') ||
        formData.featured_image !== null ||
        formData.documentAttachment !== null ||
        JSON.stringify(authors) !== JSON.stringify(articleData.data.authors || []);
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, articleData]);

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
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  // Author management functions
  const handleAuthorChange = (e) => {
    setAuthorSearchTerm(e.target.value);
    setShowAuthorDropdown(true);
  };

  const addAuthor = (author) => {
    if (!authors.find(a => a.id === author.id)) {
      setAuthors(prev => [...prev, {
        id: author.id,
        penName: author.penName,
        bio: author.bio,
        isNew: false
      }]);
    }
    setAuthorSearchTerm('');
    setShowAuthorDropdown(false);
  };

  const removeAuthor = (authorId) => {
    setAuthors(prev => prev.filter(a => a.id !== authorId));
  };

  const selectExistingAuthor = (author) => {
    addAuthor(author);
  };

  const createNewAuthorInline = () => {
    if (authorSearchTerm.trim()) {
      const newAuthor = {
        id: `new-${Date.now()}`,
        penName: authorSearchTerm.trim(),
        bio: '',
        isNew: true
      };
      setAuthors(prev => [...prev, newAuthor]);
      setAuthorSearchTerm('');
      setShowAuthorDropdown(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare form data for API
    const updateData = new FormData();
    updateData.append('title', formData.title);
    updateData.append('content', formData.content);
    updateData.append('category', formData.category);
    updateData.append('status', formData.status);
    updateData.append('excerpt', formData.excerpt);
    
    // Add authors as JSON string
    updateData.append('authors', JSON.stringify(authors));
    
    if (formData.featured_image) {
      updateData.append('featured_image', formData.featured_image);
    }

    if (formData.documentAttachment) {
      updateData.append('documentAttachment', formData.documentAttachment);
    }

    // Send FormData directly (don't convert to object)
    handleUpdate(articleId, updateData);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/articles/${articleId}` 
          : `${baseUrl}/api/articles/${articleId}`;

        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          alert('Article deleted successfully!');
          router.push('/admin/articles');
        } else {
          throw new Error('Failed to delete article');
        }
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Error deleting article. Please try again.');
      }
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
            <p className="text-gray-600 mb-4">
              {error?.message || 'Failed to load article data'}
            </p>
            <NextLink
              href="/admin/articles"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </NextLink>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Rich text editor toolbar component
  const RichTextToolbar = () => {
    if (!editor) return null;

    return (
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        {/* Heading and Text Formatting */}
        <div className="flex flex-wrap items-center gap-1 mb-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-2 py-1 text-xs font-semibold rounded hover:bg-gray-200 ${
                editor.isActive('heading', { level: 1 }) ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
              }`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2 py-1 text-xs font-semibold rounded hover:bg-gray-200 ${
                editor.isActive('heading', { level: 2 }) ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
              }`}
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-2 py-1 text-xs font-semibold rounded hover:bg-gray-200 ${
                editor.isActive('heading', { level: 3 }) ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
              }`}
              title="Heading 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`px-2 py-1 text-xs rounded hover:bg-gray-200 ${
                editor.isActive('paragraph') ? 'bg-gray-200' : 'text-gray-700'
              }`}
              title="Paragraph"
            >
              <Type className="w-3 h-3" />
            </button>
          </div>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* Text Styling */}
          <div className="flex items-center gap-1">
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
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${
                editor.isActive('underline') ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${
                editor.isActive('strike') ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
              }`}
              title="Strikethrough"
            >
              <StrikethroughIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${
                editor.isActive('code') ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
              }`}
              title="Code"
            >
              <CodeIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lists and Alignment */}
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-1">
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
          </div>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* Text Alignment */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
              }`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-1.5 rounded hover:bg-gray-200 ${
                editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
              }`}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* History */}
          <div className="flex items-center gap-1">
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
      </div>
    );
  };

  return (
    <AdminLayout title="Edit Article">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <NextLink
              href="/admin/articles"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Articles
            </NextLink>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
              <p className="text-gray-600">Update article information and content</p>
            </div>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Article
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Basic Information */}
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
                    placeholder="Enter article title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.status ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter article excerpt"
                  />
                  <p className="mt-1 text-sm text-gray-500">Brief summary of the article</p>
                </div>
              </div>
            </div>

            {/* Authors */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Authors</h3>
              <div className="space-y-4">
                {/* Current Authors */}
                {authors.length > 0 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Current Authors</label>
                    <div className="space-y-3">
                      {authors.map((author, index) => {
                        // Find the full author data from API response
                        const fullAuthorData = articleData?.data?.authors?.find(a => a.id === author.id);
                        return (
                          <div key={author.id || index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              {/* Author Profile Image */}
                              <div className="flex-shrink-0">
                                {fullAuthorData?.profileImage ? (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com'}/uploads/images/${fullAuthorData.profileImage}`}
                                    alt={author.penName}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center"
                                  style={{display: fullAuthorData?.profileImage ? 'none' : 'flex'}}
                                >
                                  <User className="w-6 h-6 text-gray-400" />
                                </div>
                              </div>
                              
                              {/* Author Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{author.penName}</h4>
                                    {fullAuthorData?.user && (
                                      <p className="text-sm text-gray-500">
                                        {fullAuthorData.user.firstName} ({fullAuthorData.user.email})
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
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
                                    <button
                                      type="button"
                                      onClick={() => removeAuthor(author.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                {author.bio && (
                                  <p className="mt-2 text-sm text-gray-600">{author.bio}</p>
                                )}
                                
                                {fullAuthorData?.bio && fullAuthorData.bio !== author.bio && (
                                  <p className="mt-1 text-sm text-gray-500 italic">
                                    Full bio: {fullAuthorData.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add Author */}
                <div className="relative author-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Author
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={authorSearchTerm}
                        onChange={handleAuthorChange}
                        onFocus={() => setShowAuthorDropdown(true)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Search for existing author or type new name"
                      />
                      
                      {/* Author Dropdown */}
                      {showAuthorDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {/* Existing Authors */}
                          {existingAuthors
                            .filter(author => 
                              author.penName.toLowerCase().includes(authorSearchTerm.toLowerCase()) &&
                              !authors.find(a => a.id === author.id)
                            )
                            .map((author) => (
                              <button
                                key={author.id}
                                type="button"
                                onClick={() => selectExistingAuthor(author)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center space-x-3">
                                  {/* Author Profile Image */}
                                  <div className="flex-shrink-0">
                                    {author.profileImage ? (
                                      <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com'}/uploads/images/${author.profileImage}`}
                                        alt={author.penName}
                                        className="w-8 h-8 rounded-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div 
                                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                                      style={{display: author.profileImage ? 'none' : 'flex'}}
                                    >
                                      <User className="w-4 h-4 text-gray-400" />
                                    </div>
                                  </div>
                                  
                                  {/* Author Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900">{author.penName}</div>
                                    {author.bio && (
                                      <div className="text-sm text-gray-500 truncate">{author.bio}</div>
                                    )}
                                    {author.user && (
                                      <div className="text-xs text-gray-400">
                                        {author.user.firstName} • {author.user.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          
                          {/* Create New Author Option */}
                          {authorSearchTerm.trim() && 
                           !existingAuthors.find(author => 
                             author.penName.toLowerCase() === authorSearchTerm.toLowerCase()
                           ) && (
                            <button
                              type="button"
                              onClick={createNewAuthorInline}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-indigo-600 font-medium"
                            >
                              <Plus className="w-4 h-4 inline mr-2" />
                              Create "{authorSearchTerm}"
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Article Content <span className="text-red-500">*</span>
                </label>
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
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {formData.featured_image ? (
                  <div className="space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">{formData.featured_image.name}</p>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featured_image: null }))}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : existingFeaturedImage ? (
                  <div className="space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={existingFeaturedImage.startsWith('http') ? existingFeaturedImage : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com'}${existingFeaturedImage}`}
                        alt="Current featured image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center" style={{display: 'none'}}>
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Current featured image</p>
                    <div className="flex space-x-2 justify-center">
                      <a
                        href={existingFeaturedImage.startsWith('http') ? existingFeaturedImage : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com'}${existingFeaturedImage}`}
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
                          onChange={(e) => handleFileChange(e, 'featured_image')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                          Upload featured image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'featured_image')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Document Attachment */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Document Attachment</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {formData.documentAttachment ? (
                  <div className="space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">{formData.documentAttachment.name}</p>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, documentAttachment: null }))}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : existingDocumentAttachment ? (
                  <div className="space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">Current document attachment</p>
                    <div className="flex space-x-2 justify-center">
                      <a
                        href={existingDocumentAttachment.startsWith('http') ? existingDocumentAttachment : `${process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com'}${existingDocumentAttachment}`}
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
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(e, 'documentAttachment')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                          Upload document
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(e, 'documentAttachment')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {hasChanges && (
                <span className="text-orange-600">You have unsaved changes</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <NextLink
                href="/admin/articles"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </NextLink>
              <button
                type="submit"
                disabled={isSubmitting || !hasChanges}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update Article
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
