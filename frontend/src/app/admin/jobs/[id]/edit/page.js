'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Briefcase,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline as UnderlineIcon,
  Strikethrough as StrikethroughIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3
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
import { Underline as UnderlineExtension } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { Code as CodeExtension } from '@tiptap/extension-code';
import { Link as LinkExtension } from '@tiptap/extension-link';
import AdminLayout from '../../../../../components/AdminLayout';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useFetchObject from '../../../../../api/useFetchObject';
import useUpdate from '../../../../../api/useUpdate';
import { useAuth } from '../../../../../context/AuthContext';

const jobTypes = [
  'full-time',
  'part-time', 
  'contract',
  'internship',
  'freelance'
];

const contractTypes = [
  'permanent',
  'temporary',
  'contract',
  'internship'
];

const experienceLevels = [
  'entry',
  'junior',
  'mid-level',
  'senior',
  'lead',
  'executive'
];

const categories = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Marketing',
  'Sales',
  'Engineering',
  'Design',
  'Administration',
  'Customer Service',
  'Other'
];

const statuses = [
  'active',
  'inactive',
  'expired',
  'filled',
  'draft'
];

export default function EditJob() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const jobId = params.id;

  // Use the custom hooks
  const { data: jobData, isLoading, isError, error } = useFetchObject(
    'job',
    'jobs',
    jobId,
    token
  );

  const { handleUpdate, loading: isSubmitting } = useUpdate(
    'jobs',
    token,
    '/admin/jobs',
    'Job updated successfully!',
    'Failed to update job'
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_id: '',
    category: '',
    type: 'full-time',
    contract_type: 'permanent',
    province_id: '',
    remote: false,
    salary_range: '',
    currency: 'USD',
    experience: 'entry',
    years_of_experience: '',
    submission_guidelines: '',
    education: '',
    gender: 'any',
    duties_and_responsibilities: '',
    job_requirements: '',
    closing_date: '',
    status: 'draft',
    featured: false,
    number_of_vacancies: 1
  });

  const [companies, setCompanies] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Rich text editor state
  const [isMounted, setIsMounted] = useState(false);

  // Rich text editor setup for description
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
      UnderlineExtension,
      Strike,
      CodeExtension.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        description: editor.getHTML()
      }));
    },
  });

  // Rich text editor setup for submission guidelines
  const guidelinesEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
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
      UnderlineExtension,
      Strike,
      CodeExtension.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: formData.submission_guidelines,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        submission_guidelines: editor.getHTML()
      }));
    },
  });

  // Rich text editor setup for duties and responsibilities
  const dutiesAndResponsibilitiesEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
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
      UnderlineExtension,
      Strike,
      CodeExtension.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: formData.duties_and_responsibilities,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        duties_and_responsibilities: editor.getHTML()
      }));
    },
  });

  // Rich text editor setup for job requirements
  const jobRequirementsEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
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
      UnderlineExtension,
      Strike,
      CodeExtension.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: formData.job_requirements,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        job_requirements: editor.getHTML()
      }));
    },
  });

  // Rich text toolbar component
  const RichTextToolbar = ({ editor }) => {
    if (!editor) return null;

    return (
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
        {/* Headings */}
        <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Strikethrough"
          >
            <StrikethroughIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Code"
          >
            <CodeIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Blockquote */}
        <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Handle mounting for rich text editor
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch companies and provinces
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
        
        // Fetch companies
        const companiesUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/companies` 
          : `${baseUrl}/api/companies`;
        
        const companiesResponse = await fetch(companiesUrl, {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          setCompanies(companiesData.data?.companies || []);
        }

        // Fetch provinces
        const provincesUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/provinces` 
          : `${baseUrl}/api/provinces`;
        
        const provincesResponse = await fetch(provincesUrl, {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (provincesResponse.ok) {
          const provincesData = await provincesResponse.json();
          setProvinces(provincesData.data?.provinces || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

  // Update editor content when form data changes
  useEffect(() => {
    if (editor && formData.description !== editor.getHTML()) {
      editor.commands.clearContent();
      editor.commands.setContent(formData.description || '');
    }
  }, [formData.description, editor]);

  useEffect(() => {
    if (guidelinesEditor && formData.submission_guidelines !== guidelinesEditor.getHTML()) {
      guidelinesEditor.commands.setContent(formData.submission_guidelines);
    }
  }, [formData.submission_guidelines, guidelinesEditor]);

  useEffect(() => {
    if (requirementsEditor && formData.requirements !== requirementsEditor.getHTML()) {
      requirementsEditor.commands.setContent(formData.requirements);
    }
  }, [formData.requirements, requirementsEditor]);

  useEffect(() => {
    if (jobRequirementsEditor && formData.job_requirements !== jobRequirementsEditor.getHTML()) {
      jobRequirementsEditor.commands.setContent(formData.job_requirements);
    }
  }, [formData.job_requirements, jobRequirementsEditor]);

  // Update form data when job data is loaded
  useEffect(() => {
    if (jobData?.data?.job || jobData?.data) {
      const job = jobData.data.job || jobData.data;
      setFormData({
        title: job.title || '',
        description: job.description || '',
        company_id: job.company_id || '',
        category: job.category || '',
        type: job.type || 'full-time',
        contract_type: job.contract_type || 'permanent',
        province_id: job.province_id || '',
        remote: job.remote || false,
        salary_range: job.salary_range || '',
        currency: job.currency || 'USD',
        experience: job.experience || 'entry',
        years_of_experience: job.years_of_experience || '',
        submission_guidelines: job.submission_guidelines || '',
        education: job.education || '',
        gender: job.gender || 'any',
        requirements: job.requirements || '',
        job_requirements: job.job_requirements || '',
        closing_date: job.closing_date || '',
        status: job.status || 'draft',
        featured: job.featured || false,
        number_of_vacancies: job.number_of_vacancies || 1
      });
    }
  }, [jobData]);

  // Check for changes
  useEffect(() => {
    if (jobData?.data?.job || jobData?.data) {
      const job = jobData.data.job || jobData.data;
      const hasFormChanges = 
        formData.title !== (job.title || '') ||
        formData.description !== (job.description || '') ||
        formData.company_id !== (job.company_id || '') ||
        formData.category !== (job.category || '') ||
        formData.type !== (job.type || 'full-time') ||
        formData.contract_type !== (job.contract_type || 'permanent') ||
        formData.province_id !== (job.province_id || '') ||
        formData.remote !== (job.remote || false) ||
        formData.salary_range !== (job.salary_range || '') ||
        formData.currency !== (job.currency || 'USD') ||
        formData.experience !== (job.experience || 'entry') ||
        formData.years_of_experience !== (job.years_of_experience || '') ||
        formData.education !== (job.education || '') ||
        formData.gender !== (job.gender || 'any') ||
        formData.requirements !== (job.requirements || '') ||
        formData.job_requirements !== (job.job_requirements || '') ||
        formData.closing_date !== (job.closing_date || '') ||
        formData.status !== (job.status || 'draft') ||
        formData.featured !== (job.featured || false) ||
        formData.number_of_vacancies !== (job.number_of_vacancies || 1);
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, jobData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (!formData.company_id) {
      newErrors.company_id = 'Please select a company';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.province_id) {
      newErrors.province_id = 'Please select a location';
    }

    if (formData.number_of_vacancies && parseInt(formData.number_of_vacancies) < 1) {
      newErrors.number_of_vacancies = 'Number of vacancies must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Edit form submission started');
    console.log('Current formData:', formData);
    console.log('Description content:', formData.description);
    
    // Get the latest content from editor
    let finalFormData = { ...formData };
    if (editor) {
      const editorContent = editor.getHTML();
      console.log('Editor content:', editorContent);
      finalFormData.description = editorContent;
    }
    
    // Validate with the updated data
    const tempErrors = {};
    if (!finalFormData.title.trim()) tempErrors.title = 'Job title is required';
    if (!finalFormData.description.trim()) tempErrors.description = 'Job description is required';
    if (!finalFormData.company_id) tempErrors.company_id = 'Please select a company';
    if (!finalFormData.category) tempErrors.category = 'Please select a category';
    if (!finalFormData.province_id && (!finalFormData.province_ids || finalFormData.province_ids.length === 0)) {
      tempErrors.province_id = 'Please select at least one location';
    }
    
    console.log('Validation errors:', tempErrors);
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      console.log('Form validation failed');
      return;
    }

    // Validate required ID fields
    if (!finalFormData.company_id || (!finalFormData.province_id && (!finalFormData.province_ids || finalFormData.province_ids.length === 0))) {
      console.log('Missing required fields');
      alert('Please select a company and at least one location');
      return;
    }

    // Transform form data to match backend validation expectations
    const updateData = {
      ...finalFormData,
      // Convert ID fields to integers
      company_id: parseInt(finalFormData.company_id),
      province_id: finalFormData.province_id ? parseInt(finalFormData.province_id) : null,
      province_ids: finalFormData.province_ids || [],
      // Keep requirements and benefits as HTML strings
      duties_and_responsibilities: finalFormData.duties_and_responsibilities || '',
      job_requirements: finalFormData.job_requirements || '',
      // Ensure numeric fields are properly converted
      number_of_vacancies: parseInt(finalFormData.number_of_vacancies) || 1,
      years_of_experience: finalFormData.years_of_experience || '',
      submission_guidelines: finalFormData.submission_guidelines || '',
      // Keep salary_range as text (no conversion to number)
      salary_range: finalFormData.salary_range || null
    };

    console.log('Sending job data:', updateData);
    handleUpdate(jobId, updateData);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/jobs/${jobId}` 
          : `${baseUrl}/api/jobs/${jobId}`;

        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          alert('Job deleted successfully!');
          router.push('/admin/jobs');
        } else {
          throw new Error('Failed to delete job');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Error deleting job. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Job">
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job</h2>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Failed to load job data'}
            </p>
            <Link
              href="/admin/jobs"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Job">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/jobs"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Jobs
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
              <p className="text-gray-600">Update job information and requirements</p>
            </div>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Job
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
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter job title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className={`border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}>
                    {isMounted && editor && (
                      <>
                        <RichTextToolbar editor={editor} />
                        <div className="bg-white">
                          <EditorContent 
                            key={`description-editor-${isMounted}`}
                            editor={editor} 
                            className="min-h-[200px] p-4 prose prose-sm max-w-none focus:outline-none"
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
                      <div className="min-h-[200px] p-4 flex items-center justify-center bg-gray-50">
                        <div className="text-gray-500">Loading rich text editor...</div>
                      </div>
                    )}
                  </div>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
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
                      <option value="">Select Category</option>
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
                      Job Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Type
                    </label>
                    <select
                      name="contract_type"
                      value={formData.contract_type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {contractTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.company_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                    {errors.company_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.company_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province_id"
                      value={formData.province_id}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.province_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Location</option>
                      {provinces.map(province => (
                        <option key={province.id} value={province.id}>{province.name}</option>
                      ))}
                    </select>
                    {errors.province_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.province_id}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details & Requirements</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="salary_range"
                        value={formData.salary_range}
                        onChange={handleInputChange}
                        className={`flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.salary_range ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 10000 to 40000, As per company scale, Negotiable"
                      />
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="AFN">AFN</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter salary range as text (e.g., "10000 to 40000", "As per company scale", "Negotiable")
                    </p>
                    {errors.salary_range && (
                      <p className="mt-1 text-sm text-red-600">{errors.salary_range}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="text"
                      name="years_of_experience"
                      value={formData.years_of_experience}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 5 to 7, 5-7, 2+ years, 3-5 years"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter experience range (e.g., "5 to 7", "5-7", "2+ years")
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submission Guidelines</label>
                    <div className="border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                      {isMounted && guidelinesEditor && (
                        <>
                          <RichTextToolbar editor={guidelinesEditor} />
                          <div className="bg-white">
                            <EditorContent 
                              editor={guidelinesEditor} 
                              className="min-h-[150px] p-4 prose prose-sm max-w-none focus:outline-none"
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
                        <div className="min-h-[150px] p-4 flex items-center justify-center bg-gray-50">
                          <div className="text-gray-500">Loading rich text editor...</div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Instructions for applicants on how to apply
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Vacancies</label>
                    <input
                      type="number"
                      name="number_of_vacancies"
                      value={formData.number_of_vacancies}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.number_of_vacancies ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 1"
                    />
                    {errors.number_of_vacancies && (
                      <p className="mt-1 text-sm text-red-600">{errors.number_of_vacancies}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Education Level</option>
                      <option value="high-school">High School</option>
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="any">Any Gender</option>
                      <option value="male">Male Only</option>
                      <option value="female">Female Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline (Optional)</label>
                    <input
                      type="date"
                      name="closing_date"
                      value={formData.closing_date}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="remote"
                      id="remote"
                      checked={formData.remote}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remote" className="ml-2 block text-sm text-gray-900">
                      Remote work available
                    </label>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      id="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Featured job listing
                    </label>
                  </label>
                </div>
              </div>
            </div>

            {/* Requirements and Benefits */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements and Benefits</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (Optional)</label>
                  <div className="border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    {isMounted && dutiesAndResponsibilitiesEditor && (
                      <>
                        <RichTextToolbar editor={dutiesAndResponsibilitiesEditor} />
                        <div className="bg-white">
                          <EditorContent 
                            editor={dutiesAndResponsibilitiesEditor} 
                            className="min-h-[150px] p-4 prose prose-sm max-w-none focus:outline-none"
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
                      <div className="min-h-[150px] p-4 flex items-center justify-center bg-gray-50">
                        <div className="text-gray-500">Loading rich text editor...</div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Requirements (Optional)</label>
                  <div className="border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    {isMounted && jobRequirementsEditor && (
                      <>
                        <RichTextToolbar editor={jobRequirementsEditor} />
                        <div className="bg-white">
                          <EditorContent 
                            editor={jobRequirementsEditor} 
                            className="min-h-[150px] p-4 prose prose-sm max-w-none focus:outline-none"
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
                      <div className="min-h-[150px] p-4 flex items-center justify-center bg-gray-50">
                        <div className="text-gray-500">Loading rich text editor...</div>
                      </div>
                    )}
                  </div>
                </div>
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
              <Link
                href="/admin/jobs"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
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
                    Update Job
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
