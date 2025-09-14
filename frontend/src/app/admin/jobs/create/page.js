'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Star, 
  Check, 
  AlertCircle,
  Save,
  X,
  Plus,
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
import { Underline } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { Code } from '@tiptap/extension-code';
import { Link } from '@tiptap/extension-link';
import AdminLayout from '../../../../components/AdminLayout';
import useAdd from '../../../../api/useAdd';

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

export default function AdminCreateJob() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [provincesError, setProvincesError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', description: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [addCompanyLoading, setAddCompanyLoading] = useState(false);
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Use your existing useAdd hook
  const { handleAdd, loading, success, error: addError } = useAdd(
    'jobs',
    token,
    '/admin/jobs',
    'Job created successfully!',
    'Failed to create job'
  );

  // Form state - updated to match API snake_case fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_id: '',
    category: '',
    type: 'full-time',
    contract_type: 'permanent',
    contract_duration: '',
    probation_period: '',
    province_id:  '',
    province_ids: [],
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
    deadline: '',
    status: 'draft',
    featured: false,
    number_of_vacancies: 1
  });

  // State for creating multiple jobs
  const [createAnother, setCreateAnother] = useState(false);
  const [lastCreatedJob, setLastCreatedJob] = useState(null);
  
  // State for managing multiple jobs at once
  const [multipleJobs, setMultipleJobs] = useState([]);
  const [isMultipleMode, setIsMultipleMode] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);
  
  // State for subscription information
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});

  // Rich text editor state
  const [isMounted, setIsMounted] = useState(false);

  // Rich text editor setup for description
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
      }),
      TextStyle,
      Color,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
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
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
      }),
      TextStyle,
      Color,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
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
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
      }),
      TextStyle,
      Color,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
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
    content: formData.duties_and_responsibilities,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        duties_and_responsibilities: editor.getHTML()
      }));
    },
  });

  // Rich text editor setup for company description
  const companyDescriptionEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
      }),
      TextStyle,
      Color,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
      Code,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: newCompany.description,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setNewCompany(prev => ({
        ...prev,
        description: editor.getHTML()
      }));
    },
  });

  // Rich text editor setup for job requirements
  const jobRequirementsEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
      }),
      TextStyle,
      Color,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
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

  useEffect(() => {
    // Fetch provinces and companies for form selection
    fetchProvinces();
    fetchCompanies();
  }, []);

  // Handle mounting for rich text editor
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update editor content when formData changes
  useEffect(() => {
    if (editor && formData.description !== editor.getHTML()) {
      editor.commands.setContent(formData.description || '');
    }
  }, [formData.description, editor]);

  // Reset editor content when component mounts
  useEffect(() => {
    if (editor && isMounted) {
      editor.commands.clearContent();
      editor.commands.setContent(formData.description || '');
    }
  }, [editor, isMounted]);

  // Debug description field changes
  useEffect(() => {
    console.log('Description field changed:', formData.description);
  }, [formData.description]);

  // Fetch subscription information when company is selected
  useEffect(() => {
    if (formData.company_id) {
      fetchSubscriptionInfo();
    } else {
      setSubscriptionInfo(null);
    }
  }, [formData.company_id]);



  const fetchProvinces = async () => {
    try {
      setProvincesLoading(true);
      setProvincesError(null);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/provinces` 
        : `${baseUrl}/api/provinces`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setProvinces(data.data.provinces || []);
      } else {
        throw new Error(data.message || 'Failed to fetch provinces');
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setProvincesError(error.message);
      
      // Fallback to hardcoded provinces if API fails
      setProvinces([
        { id: 1, name: 'Kabul' },
        { id: 2, name: 'Herat' },
        { id: 3, name: 'Mazar-e-Sharif' },
        { id: 4, name: 'Kandahar' },
        { id: 5, name: 'Jalalabad' },
        { id: 6, name: 'Kunduz' },
        { id: 7, name: 'Ghazni' },
        { id: 8, name: 'Balkh' }
      ]);
    } finally {
      setProvincesLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      setCompaniesError(null);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/companies` 
        : `${baseUrl}/api/companies`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setCompanies(data.data.companies || []);
      } else {
        throw new Error(data.message || 'Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompaniesError(error.message);
      
      // Fallback to empty array if API fails
      setCompanies([]);
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Fetch subscription information for the selected company
  const fetchSubscriptionInfo = async () => {
    try {
      setSubscriptionLoading(true);
      
      // Skip subscription check if no token (admin might not need subscription)
      if (!token) {
        console.log('No token found, skipping subscription check for admin');
        setSubscriptionInfo(null);
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/subscriptions/my-subscription` 
        : `${baseUrl}/api/subscriptions/my-subscription`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo(data.data);
      } else if (response.status === 401) {
        // Unauthorized - admin might not need subscription
        console.log('Unauthorized access to subscription, treating as admin with unlimited access');
        setSubscriptionInfo({
          subscription: {
            plan: { name: 'Admin Plan', jobLimit: 0, duration: 30 },
            amount: 0,
            jobsPosted: 0
          },
          remainingJobs: 'Unlimited'
        });
      } else {
        console.error('Failed to fetch subscription info:', response.status);
        setSubscriptionInfo(null);
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error);
      // For admin users, treat subscription errors as unlimited access
      setSubscriptionInfo({
        subscription: {
          plan: { name: 'Admin Plan', jobLimit: 0, duration: 30 },
          amount: 0,
          jobsPosted: 0
        },
        remainingJobs: 'Unlimited'
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) return;

    setAddCompanyLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/companies` 
        : `${baseUrl}/api/companies`;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', newCompany.name);
      formData.append('description', newCompany.description || '');
      if (logoFile) {
        formData.append('companyLogo', logoFile);
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
          // Don't set Content-Type, let browser set it for FormData
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // Add the new company to the list
          setCompanies(prev => [...prev, data.data.company]);
          // Select the new company
          setFormData(prev => ({ ...prev, company_id: data.data.company.id }));
          // Close modal and reset form
          setShowAddCompanyModal(false);
          setNewCompany({ name: '', description: '' });
          setLogoFile(null);
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to create company: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company. Please try again.');
    } finally {
      setAddCompanyLoading(false);
    }
  };

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

  const validateForm = (step = null) => {
    const newErrors = {};
    
    console.log('Validating form with step:', step);
    console.log('Form data for validation:', {
      title: formData.title,
      description: formData.description,
      company_id: formData.company_id,
      category: formData.category,
      province_id: formData.province_id,
      province_ids: formData.province_ids
    });
    
    // Step 1 validation (Basic Info)
    if (step === 1 || step === null) {
      if (!formData.title.trim()) newErrors.title = 'Job title is required';
      if (!formData.description.trim()) newErrors.description = 'Job description is required';
      if (!formData.company_id) newErrors.company_id = 'Please select a company';
      if (!formData.category) newErrors.category = 'Please select a category';
    }
    
    // Step 2 validation (Details)
    if (step === 2 || step === null) {
      if (!formData.province_id && (!formData.province_ids || formData.province_ids.length === 0)) {
        newErrors.province_id = 'Please select at least one location';
      }
      if (formData.number_of_vacancies && parseInt(formData.number_of_vacancies) < 1) newErrors.number_of_vacancies = 'Number of vacancies must be at least 1';
    }
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateForm(currentStep)) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e, shouldCreateAnother = false) => {
    e.preventDefault();
    
    console.log('Form submission started');
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

    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // Validate required ID fields
    if (!finalFormData.company_id || (!finalFormData.province_id && (!finalFormData.province_ids || finalFormData.province_ids.length === 0))) {
      console.log('Missing required fields');
      alert('Please select a company and at least one location');
      return;
    }

    // Set the createAnother flag before submitting
    setCreateAnother(shouldCreateAnother);

    // Transform form data to match backend validation expectations
    const transformedData = {
      ...finalFormData,
      // Convert ID fields to integers
      company_id: parseInt(finalFormData.company_id),
      // Handle province selection - prioritize single province if provided, otherwise use first from multiple
      province_id: finalFormData.province_id ? parseInt(finalFormData.province_id) : 
                   (finalFormData.province_ids && finalFormData.province_ids.length > 0 ? parseInt(finalFormData.province_ids[0]) : null),
      province_ids: finalFormData.province_ids || [],
      // Keep requirements and job_requirements as HTML strings
      duties_and_responsibilities: finalFormData.duties_and_responsibilities || '',
      job_requirements: finalFormData.job_requirements || '',
      // Ensure numeric fields are properly converted
      number_of_vacancies: parseInt(finalFormData.number_of_vacancies) || 1,
      years_of_experience: finalFormData.years_of_experience || '',
      submission_guidelines: finalFormData.submission_guidelines || '',
      // Contract-related fields
      contract_duration: finalFormData.contract_duration || null,
      probation_period: finalFormData.probation_period || null,
      closing_date: finalFormData.closing_date || null,
      deadline: finalFormData.deadline || null,
      // Keep salary_range as text (no conversion to number)
      salary_range: finalFormData.salary_range || null,
      // Always set status to active for new jobs
      status: 'active'
    };

    console.log('Sending job data:', transformedData);
    handleAdd(transformedData);
  };

  // Function to add current job to multiple jobs list
  const handleAddToMultiple = () => {
    if (!validateForm()) return;
    
    // Validate required ID fields
    if (!formData.company_id || (!formData.province_id && (!formData.province_ids || formData.province_ids.length === 0))) {
      showToast('Please select a company and at least one location', 'error');
      return;
    }

    // Check subscription limits (skip for admin users without subscription info)
    if (subscriptionInfo && subscriptionInfo.remainingJobs !== 'Unlimited' && subscriptionInfo.remainingJobs !== null) {
      const totalJobsAfterAdd = multipleJobs.length + 1;
      if (totalJobsAfterAdd > subscriptionInfo.remainingJobs) {
        showToast(
          `Cannot add more jobs. You have ${subscriptionInfo.remainingJobs} remaining jobs, but trying to create ${totalJobsAfterAdd}. Please upgrade your plan.`,
          'error'
        );
        return;
      }
    }

    // Create job object for multiple jobs list
    const jobToAdd = {
      id: Date.now(), // temporary ID
      title: formData.title,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      contract_type: formData.contract_type,
      experience: formData.experience,
      education: formData.education,
      gender: formData.gender,
      remote: formData.remote,
      featured: formData.featured,
      number_of_vacancies: formData.number_of_vacancies,
      years_of_experience: formData.years_of_experience,
      submission_guidelines: formData.submission_guidelines,
      contract_duration: formData.contract_duration,
      probation_period: formData.probation_period,
      salary_range: formData.salary_range,
      currency: formData.currency,
      requirements: formData.requirements,
      job_requirements: formData.job_requirements,
      closing_date: formData.closing_date,
      deadline: formData.deadline,
      status: formData.status,
      company_id: formData.company_id,
      province_id: formData.province_id,
      province_ids: formData.province_ids,
      company_name: companies.find(c => c.id == formData.company_id)?.name,
      province_name: formData.province_id ? provinces.find(p => p.id == formData.province_id)?.name : 
                   (formData.province_ids && formData.province_ids.length > 0 ? 
                    formData.province_ids.map(id => provinces.find(p => p.id == id)?.name).filter(Boolean).join(', ') : '')
    };

    // Add to multiple jobs list
    setMultipleJobs(prev => [...prev, jobToAdd]);
    
    // Reset form but keep company and location
    setFormData(prev => ({
      ...prev,
      title: '',
      description: '',
      category: '',
      type: 'full-time',
      contract_type: 'permanent',
      experience: 'entry',
      education: 'high-school',
      gender: 'any',
      remote: false,
      featured: false,
      number_of_vacancies: 1,
      years_of_experience: '',
      salary_range: '',
      currency: 'USD',
      duties_and_responsibilities: '',
      job_requirements: '',
      deadline: '',
      status: 'active',
      province_ids: []
    }));
    
    // Go back to step 1
    setCurrentStep(1);
    
    // Show success message
    showToast(`Job "${jobToAdd.title}" added to list! You can add more jobs or submit all at once.`, 'success');
  };

  // Function to remove job from multiple jobs list
  const handleRemoveFromMultiple = (jobId) => {
    setMultipleJobs(prev => prev.filter(job => job.id !== jobId));
  };

  // State for toast notifications
  const [toast, setToast] = useState(null);

  // Function to show toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Function to submit all multiple jobs
  const handleSubmitMultipleJobs = async () => {
    if (multipleJobs.length === 0) {
      showToast('No jobs to submit', 'error');
      return;
    }

    try {
      // Define API URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/jobs` 
        : `${baseUrl}/api/jobs`;

      const results = [];
      
      for (const job of multipleJobs) {
        // Transform job data to match backend expectations
        const transformedData = {
          ...job,
          company_id: parseInt(job.company_id),
          // Handle province selection - prioritize single province if provided, otherwise use first from multiple
          province_id: job.province_id ? parseInt(job.province_id) : 
                       (job.province_ids && job.province_ids.length > 0 ? parseInt(job.province_ids[0]) : null),
          province_ids: job.province_ids || [],
          requirements: job.requirements ? [job.requirements] : [],
          benefits: job.benefits ? [job.benefits] : [],
          number_of_vacancies: parseInt(job.number_of_vacancies) || 1,
          years_of_experience: job.years_of_experience || '',
          contract_duration: job.contract_duration || null,
          probation_period: job.probation_period || null,
          closing_date: job.closing_date || null,
          deadline: job.deadline || null,
          salary_range: job.salary_range || null,
          // Always set status to active for new jobs
          status: 'active'
        };

        // Remove temporary fields
        delete transformedData.id;
        delete transformedData.company_name;
        delete transformedData.province_name;

        console.log('Submitting job:', transformedData);
        
        // Submit each job
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transformedData)
        });

        if (response.ok) {
          const data = await response.json();
          results.push({ success: true, job: job.title, data: data.data });
        } else {
          const errorData = await response.json();
          results.push({ success: false, job: job.title, error: errorData.message });
        }
      }

      // Show results
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0) {
        showToast(`Successfully created ${successful} job(s)!${failed > 0 ? ` ${failed} job(s) failed.` : ''}`, 'success');
        // Clear multiple jobs and redirect
        setMultipleJobs([]);
        setIsMultipleMode(false);
        setTimeout(() => router.push('/admin/jobs'), 2000);
      } else {
        showToast('Failed to create any jobs. Please try again.', 'error');
      }
      
    } catch (error) {
      console.error('Error submitting multiple jobs:', error);
      showToast('Error submitting jobs. Please try again.', 'error');
    }
  };

  // Handle success redirect
  useEffect(() => {
    if (success) {
      if (createAnother) {
        // Store the last created job info for success message
        setLastCreatedJob({
          title: formData.title,
          company_id: formData.company_id,
          company_name: companies.find(c => c.id == formData.company_id)?.name
        });
        
        // Reset form but keep company and some basic info
        setFormData(prev => ({
          ...prev,
          title: '',
          description: '',
          category: '',
          duties_and_responsibilities: '',
          job_requirements: '',
          deadline: '',
          province_ids: [],
          // Keep company_id, province_id, and other settings
        }));
        setCurrentStep(1);
        setCreateAnother(false);
        
        // Show success message for 3 seconds
        setTimeout(() => {
          setLastCreatedJob(null);
        }, 3000);
      } else {
        router.push('/admin/jobs');
      }
    }
  }, [success, router, createAnother, formData, companies]);

  // Handle subscription limit errors
  useEffect(() => {
    if (addError) {
      console.log('Full error object:', addError);
      
      // Extract error message from the error object
      let errorMessage = '';
      
      if (addError.response && addError.response.data && addError.response.data.message) {
        // Error from API response
        errorMessage = addError.response.data.message;
      } else if (addError.message) {
        // Error from axios or other sources
        errorMessage = addError.message;
      } else if (typeof addError === 'string') {
        // Direct string error
        errorMessage = addError;
      } else {
        // Fallback
        errorMessage = 'An error occurred while creating the job';
      }
      
      console.log('Extracted error message:', errorMessage);
      
      // Check if it's a subscription limit error
      if (errorMessage.includes('job posting limit') || errorMessage.includes('Free Plan') || errorMessage.includes('upgrade your plan')) {
        setSubscriptionError(errorMessage);
      }
    }
  }, [addError]);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Job Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Senior Software Engineer"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company *
            </label>
            <div className="flex gap-2">
              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleInputChange}
                disabled={companiesLoading}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.company_id ? 'border-red-500' : 'border-gray-300'
                } ${companiesLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {companiesLoading ? 'Loading companies...' : 'Select Company'}
                </option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddCompanyModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                title="Add New Company"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {errors.company_id && <p className="text-red-500 text-sm mt-1">{errors.company_id}</p>}
            {companiesError && (
              <p className="text-red-500 text-sm mt-1">
                Failed to load companies. Please refresh the page.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {jobTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract Type
            </label>
            <select
              name="contract_type"
              value={formData.contract_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {contractTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Contract Duration - Only show for contract type */}
          {formData.contract_type === 'contract' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Duration (Optional)
              </label>
              <input
                type="text"
                name="contract_duration"
                value={formData.contract_duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 6 months, 1 year, 2 years"
              />
            </div>
          )}

          {/* Probation Period - Only show for contract type */}
          {formData.contract_type === 'contract' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probation Period (Optional)
              </label>
              <input
                type="text"
                name="probation_period"
                value={formData.probation_period}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 3 months, 6 months"
              />
            </div>
          )}

        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description *
          </label>
          <div className={`border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
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
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details & Requirements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {experienceLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary Range (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleInputChange}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.salary_range ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 10000 to 40000, As per company scale, Negotiable"
              />
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            {errors.salary_range && <p className="text-red-500 text-sm mt-1">{errors.salary_range}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locations * (Select one or more)
            </label>
            <div className="space-y-2">
              {/* Single Location Selection */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Primary Location (Optional)
                </label>
                <select
                  name="province_id"
                  value={formData.province_id}
                  onChange={handleInputChange}
                  disabled={provincesLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.province_id ? 'border-red-500' : 'border-gray-300'
                  } ${provincesLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {provincesLoading ? 'Loading locations...' : 'Select Primary Location (Optional)'}
                  </option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>{province.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Multiple Locations Selection */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Additional Locations (Select multiple)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {provincesLoading ? (
                    <p className="text-gray-500 text-sm">Loading locations...</p>
                  ) : (
                    provinces.map(province => (
                      <label key={province.id} className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded px-2">
                        <input
                          type="checkbox"
                          value={province.id}
                          checked={formData.province_ids.includes(province.id)}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                province_ids: [...prev.province_ids, value]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                province_ids: prev.province_ids.filter(id => id !== value)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{province.name}</span>
                      </label>
                    ))
                  )}
                </div>
                {formData.province_ids.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Selected locations:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.province_ids.map(provinceId => {
                        const province = provinces.find(p => p.id === provinceId);
                        return (
                          <span
                            key={provinceId}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {province?.name}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  province_ids: prev.province_ids.filter(id => id !== provinceId)
                                }));
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {errors.province_id && <p className="text-red-500 text-sm mt-1">{errors.province_id}</p>}
            {provincesError && (
              <p className="text-red-500 text-sm mt-1">
                Failed to load locations. Please refresh the page.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <input
              type="text"
              name="years_of_experience"
              value={formData.years_of_experience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 5 to 7, 5-7, 2+ years, 3-5 years"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter experience range (e.g., "5 to 7", "5-7", "2+ years")
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Guidelines
            </label>
            <div className="border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Vacancies
            </label>
            <input
              type="number"
              name="number_of_vacancies"
              value={formData.number_of_vacancies}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.number_of_vacancies ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 1"
            />
            {errors.number_of_vacancies && <p className="text-red-500 text-sm mt-1">{errors.number_of_vacancies}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education Level
            </label>
            <select
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender Preference
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="any">Any Gender</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
            </select>
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="remote"
              id="remote"
              checked={formData.remote}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remote" className="ml-2 block text-sm text-gray-900">
              Remote work available
            </label>
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              Featured job listing
            </label>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements (Optional)
          </label>
          <div className="border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
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

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duties and Responsibilities (Optional)
          </label>
          <div className="border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
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

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Closing Date (Optional)
          </label>
          <input
            type="date"
            name="closing_date"
            value={formData.closing_date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Deadline (Optional)
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Submit</h3>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-lg text-gray-900 mb-4">{formData.title}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Company:</span>
              <span className="ml-2 font-medium">
                {companies.find(c => c.id == formData.company_id)?.name || 'Not selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <span className="ml-2 font-medium">{formData.category}</span>
            </div>
            <div>
              <span className="text-gray-600">Job Type:</span>
              <span className="ml-2 font-medium capitalize">{formData.type.replace('-', ' ')}</span>
            </div>
            <div>
              <span className="text-gray-600">Contract Type:</span>
              <span className="ml-2 font-medium capitalize">{formData.contract_type}</span>
            </div>
            <div>
              <span className="text-gray-600">Experience Level:</span>
              <span className="ml-2 font-medium capitalize">{formData.experience.replace('-', ' ')}</span>
            </div>
            <div>
              <span className="text-gray-600">Years of Experience:</span>
              <span className="ml-2 font-medium">{formData.years_of_experience}</span>
            </div>
            <div>
              <span className="text-gray-600">Featured:</span>
              <span className="ml-2 font-medium">{formData.featured ? 'Yes' : 'No'}</span>
            </div>
            {formData.salary_range && (
              <div>
                <span className="text-gray-600">Salary:</span>
                <span className="ml-2 font-medium">{formData.salary_range} {formData.currency}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Vacancies:</span>
              <span className="ml-2 font-medium">{formData.number_of_vacancies}</span>
            </div>
            <div>
              <span className="text-gray-600">Education:</span>
              <span className="ml-2 font-medium">{formData.education || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-gray-600">Gender:</span>
              <span className="ml-2 font-medium capitalize">{formData.gender}</span>
            </div>
            <div>
              <span className="text-gray-600">Remote:</span>
              <span className="ml-2 font-medium">{formData.remote ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-gray-600">Description:</span>
            <p className="mt-2 text-gray-700">{formData.description}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/jobs')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <X className="w-4 h-4 mr-2" />
              Back to Jobs
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Create New Job
              {lastCreatedJob && (
                <span className="ml-3 text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Multiple Job Mode
                </span>
              )}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {lastCreatedJob 
                ? `Creating additional jobs for ${lastCreatedJob.company_name}. Company and location are preserved.`
                : "Add a new job posting to the system"
              }
            </p>
            {lastCreatedJob && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You're creating multiple jobs for the same company. 
                  Make sure you haven't reached your subscription plan's job posting limit.
                </p>
              </div>
            )}
          </div>
        </div>

          {/* Multiple Jobs List */}
          {multipleJobs.length > 0 && (
            <div className="mb-8 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Jobs to Create ({multipleJobs.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitMultipleJobs}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create All Jobs
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setMultipleJobs([]);
                        setIsMultipleMode(false);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {multipleJobs.map((job, index) => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600">
                              {job.company_name} • {job.category} • {job.type.replace('-', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromMultiple(job.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove this job"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2 text-sm text-gray-600">
              <span className={currentStep >= 1 ? 'text-blue-600' : ''}>Basic Info</span>
              <span className={`mx-4 ${currentStep >= 2 ? 'text-blue-600' : ''}`}>Details</span>
              <span className={currentStep >= 3 ? 'text-blue-600' : ''}>Review</span>
            </div>
          </div>

          {/* Subscription Information */}
          {formData.company_id && (
            <div className="mb-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
                  {subscriptionLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </div>
                
                {subscriptionInfo ? (
                  <div className="space-y-4">
                    {/* Current Plan */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <h4 className="font-semibold text-blue-900">
                          {subscriptionInfo.subscription?.plan?.name || 'No Active Plan'}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {subscriptionInfo.subscription?.plan?.jobLimit === 0 
                            ? 'Unlimited job postings' 
                            : `Up to ${subscriptionInfo.subscription?.plan?.jobLimit} job postings per period`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">
                          ${subscriptionInfo.subscription?.amount || 0}
                        </p>
                        <p className="text-sm text-blue-600">
                          {subscriptionInfo.subscription?.plan?.duration || 30} days
                        </p>
                      </div>
                    </div>

                    {/* Usage Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {subscriptionInfo.subscription?.jobsPosted || 0}
                        </p>
                        <p className="text-sm text-gray-600">Jobs Posted</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {subscriptionInfo.remainingJobs === 'Unlimited' ? '∞' : subscriptionInfo.remainingJobs || 0}
                        </p>
                        <p className="text-sm text-gray-600">Remaining</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {subscriptionInfo.subscription?.plan?.jobLimit === 0 ? '∞' : subscriptionInfo.subscription?.plan?.jobLimit || 0}
                        </p>
                        <p className="text-sm text-gray-600">Total Limit</p>
                      </div>
                    </div>

                    {/* Warning for Multiple Jobs */}
                    {multipleJobs.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-yellow-800">Multiple Jobs Warning</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              You're planning to create {multipleJobs.length} job(s). 
                              {subscriptionInfo.remainingJobs !== 'Unlimited' && 
                                subscriptionInfo.remainingJobs < multipleJobs.length && (
                                <span className="font-semibold text-red-600">
                                  {' '}This will exceed your remaining limit of {subscriptionInfo.remainingJobs} jobs.
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upgrade Suggestion */}
                    {subscriptionInfo.remainingJobs !== 'Unlimited' && 
                     subscriptionInfo.remainingJobs < 5 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-green-800">Running Low on Jobs</h4>
                            <p className="text-sm text-green-700">
                              Only {subscriptionInfo.remainingJobs} job(s) remaining. Consider upgrading your plan.
                            </p>
                          </div>
                          <button
                            onClick={() => router.push('/admin/subscriptions')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            Upgrade Plan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : subscriptionInfo === null ? (
                  <div className="text-center p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Admin Access</h4>
                    <p className="text-gray-600 mb-4">
                      You have admin privileges and can create unlimited jobs without subscription restrictions.
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">No Active Subscription</h4>
                    <p className="text-gray-600 mb-4">
                      You don't have an active subscription. You need a subscription to post jobs.
                    </p>
                    <button
                      onClick={() => router.push('/admin/subscriptions')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Subscription Plans
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 text-sm rounded font-medium ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <div className="flex gap-3 items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      console.log('Submit button clicked');
                      console.log('Current formData before submit:', formData);
                      handleSubmit(e, false);
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Job
                      </>
                    )}
                  </button>
                  
                  <div className="flex flex-col items-center group">
                    <button
                      type="button"
                      onClick={handleAddToMultiple}
                      disabled={loading}
                      className="px-3 py-2 text-sm bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      title="Add this job to list and prepare for another"
                    >
                      <Plus className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
                    </button>
                    <span className="text-xs text-gray-500 mt-1 hidden sm:block group-hover:text-green-600 transition-colors">Add More</span>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Success Message for Multiple Job Creation */}
        {lastCreatedJob && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
            <div className="flex items-start">
              <Check className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Job created successfully!</p>
                <p className="text-sm mt-1">"{lastCreatedJob.title}" for {lastCreatedJob.company_name}</p>
                <p className="text-xs mt-1 text-green-600">Form reset for next job. Company and location are preserved.</p>
              </div>
              <button
                onClick={() => setLastCreatedJob(null)}
                className="ml-2 text-green-600 hover:text-green-800 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* General Error Display */}
        {addError && !subscriptionError && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Error creating job</p>
                <p className="text-sm mt-1">
                  {addError.response?.data?.message || addError.message || 'An unexpected error occurred'}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="ml-2 text-red-600 hover:text-red-800 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Subscription Limit Error Modal */}
        {subscriptionError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Job Posting Limit Reached</h3>
                <p className="text-sm text-gray-600">Subscription Plan Limit</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                {subscriptionError}
              </p>
              
              <div className="text-xs text-gray-500 mb-2">
                <strong>Debug Info:</strong> This error occurs when you've reached the maximum number of job postings allowed by your current subscription plan.
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Current Plan Benefits:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Limited number of job postings</li>
                  <li>• Basic company profiles</li>
                  <li>• Standard job listings</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSubscriptionError(null)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue with Current Plan
              </button>
              <button
                onClick={() => {
                  setSubscriptionError(null);
                  // Navigate to subscription page (you can update this route)
                  router.push('/admin/subscriptions');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
          </div>
        )}

        {/* Add Company Modal */}
        {showAddCompanyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Company</h3>
              <button
                onClick={() => setShowAddCompanyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter company name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                 <div className="border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                   {isMounted && companyDescriptionEditor && (
                     <>
                       <RichTextToolbar editor={companyDescriptionEditor} />
                       <div className="bg-white">
                         <EditorContent 
                           editor={companyDescriptionEditor} 
                           className="min-h-[100px] p-4 prose prose-sm max-w-none focus:outline-none"
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
                       </div>
                     </>
                   )}
                 </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
                </p>
                {logoFile && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">Selected: {logoFile.name}</p>
                    <div className="mt-1">
                      <img
                        src={URL.createObjectURL(logoFile)}
                        alt="Logo preview"
                        className="w-16 h-16 object-cover rounded border"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCompanyLoading || !newCompany.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {addCompanyLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Company
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center ${
              toast.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              <div className="flex items-center">
                {toast.type === 'success' ? (
                  <Check className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span className="font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => setToast(null)}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
    </AdminLayout>
  );
}
