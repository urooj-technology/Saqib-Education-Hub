'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Building,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Code
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import useAdd from '../../../../api/useAdd';
import useFetchObjects from '../../../../api/useFetchObjects';
import { toast } from 'react-toastify';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Heading } from '@tiptap/extension-heading';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline as UnderlineExtension } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { Code as CodeExtension } from '@tiptap/extension-code';
import { Link as LinkExtension } from '@tiptap/extension-link';

const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const contractTypes = ['permanent', 'contract', 'temporary', 'internship'];
const experienceLevels = ['entry', 'junior', 'mid-level', 'senior', 'lead', 'executive'];
const educationLevels = ['high-school', 'associate', 'bachelor', 'master', 'phd', 'any'];
const genderOptions = ['any', 'male', 'female'];

// Rich Text Toolbar Component
const RichTextToolbar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Headings */}
      <select
        value={editor.getAttributes('heading').level || 'paragraph'}
        onChange={(e) => {
          const level = parseInt(e.target.value);
          if (level === 0) {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
        className="px-2 py-1 border border-gray-300 rounded text-sm"
      >
        <option value="paragraph">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
      </select>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Code and Link */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-gray-300' : ''}`}
        title="Code"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
        title="Add Link"
      >
        <Link className="w-4 h-4" />
      </button>
    </div>
  );
};

// Map old experience values to new ones for backward compatibility
const mapExperienceValue = (value) => {
  const mapping = {
    'mid': 'mid-level',
    'entry': 'entry',
    'junior': 'junior',
    'senior': 'senior',
    'lead': 'lead',
    'executive': 'executive'
  };
  return mapping[value] || 'entry';
};

// Get display value for experience dropdown
const getExperienceDisplayValue = (value) => {
  const displayMapping = {
    'mid': 'Mid Level',
    'entry': 'Entry',
    'junior': 'Junior',
    'mid-level': 'Mid Level',
    'senior': 'Senior',
    'lead': 'Lead',
    'executive': 'Executive'
  };
  return displayMapping[value] || 'Entry';
};

export default function UserCreateJob() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', description: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [addCompanyLoading, setAddCompanyLoading] = useState(false);
  const [canPostJob, setCanPostJob] = useState(true); // Start optimistic, will be updated when data loads
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Use your existing useAdd hook
  const { handleAdd, loading, success, error: addError } = useAdd(
    'jobs',
    token,
    null, // No automatic redirect, handle it manually
    '/user/dashboard',
  );

  // State for subscription info
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    plan: 'none',
    jobLimit: 0
  });
  

  // Fetch subscription information
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!token) {
        setSubscriptionLoading(false);
        return;
      }
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/subscriptions/my-subscription` 
          : `${baseUrl}/api/subscriptions/my-subscription`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const subscriptionData = data.data;
          
          if (subscriptionData && subscriptionData.subscription) {
            const plan = subscriptionData.subscription.plan?.name || 'none';
            const jobLimit = subscriptionData.subscription.plan?.jobLimit || 0;
            
            setSubscriptionInfo({ plan, jobLimit });
            
            // Also use the canPostJob from API response if available
            if (typeof subscriptionData.canPostJob === 'boolean') {
              setCanPostJob(subscriptionData.canPostJob);
            }
          } else {
            setSubscriptionInfo({ plan: 'none', jobLimit: 0 });
            setCanPostJob(false);
          }
        } else {
          setSubscriptionInfo({ plan: 'none', jobLimit: 0 });
          setCanPostJob(false);
        }
      } catch (error) {
        console.error('Error fetching subscription info:', error);
        setSubscriptionInfo({ plan: 'none', jobLimit: 0 });
        setCanPostJob(false);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, [token]);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
        const response = await fetch(`${baseUrl}/api/provinces`);
        if (response.ok) {
          const data = await response.json();
          setProvinces(data.data?.provinces || []);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setProvincesLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
        const response = await fetch(`${baseUrl}/api/companies`);
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.data?.companies || []);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Note: Job limits checking is now handled in the subscription fetching useEffect above

  // Handle successful job creation
  useEffect(() => {
    if (success) {
      // Show success message
      toast.success('Job created successfully!');
      
      // Redirect to job list page after a short delay
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 1500);
    }
  }, [success, router]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_id: '',
    category: '',
    type: 'full-time',
    contract_type: 'permanent',
    contract_duration: '',
    probation_period: '',
    province_id: '',
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
    content: formData.description,
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

  const [errors, setErrors] = useState({});

  // Handle mounting for rich text editors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fix any old experience values on component mount
  useEffect(() => {
    if (formData.experience === 'mid') {
      setFormData(prev => ({
        ...prev,
        experience: 'mid-level'
      }));
    }
  }, []); // Run only once on mount

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Redirect if user status is not active
  useEffect(() => {
    if (user && user.status !== 'active') {
      toast.error('Your account must be approved by admin to post jobs');
      router.push('/user/dashboard');
    }
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle experience value conversion
    let processedValue = value;
    if (name === 'experience') {
      processedValue = mapExperienceValue(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Job title is required';
      if (!formData.description.trim()) newErrors.description = 'Job description is required';
      if (!formData.company_id) newErrors.company_id = 'Company is required';
      if (!formData.category.trim()) newErrors.category = 'Category is required';
    }

    if (step === 2) {
      if (!formData.province_id && (!formData.province_ids || formData.province_ids.length === 0)) {
        newErrors.province_id = 'Please select at least one location';
      }
      if (!formData.salary_range.trim()) newErrors.salary_range = 'Salary range is required';
    }

    if (step === 3) {
      if (!formData.duties_and_responsibilities.trim()) newErrors.duties_and_responsibilities = 'Duties and Responsibilities are required';
      if (!formData.job_requirements.trim()) newErrors.job_requirements = 'Job Requirements are required';
    }

    // Only set errors if we're validating the current step
    if (step === currentStep) {
    setErrors(newErrors);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canPostJob) {
      toast.error('You have reached your job posting limit for your subscription plan');
      return;
    }

    // Validate all steps before submission
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    
    if (!step1Valid || !step2Valid || !step3Valid) {
      toast.error('Please fill in all required fields before submitting');
      return;
    }

    // Prepare data for API
    const jobData = {
      ...formData,
      authorId: user.id,
      status: 'draft', // User jobs start as draft
      // Map old experience values to new ones
      experience: mapExperienceValue(formData.experience),
      // Handle province selection - use first selected province as primary, or single province_id
      province_id: formData.province_ids && formData.province_ids.length > 0 ? formData.province_ids[0] : formData.province_id,
      province_ids: formData.province_ids || []
    };

    handleAdd(jobData);
  };

  const handleAddCompany = async () => {
    if (!newCompany.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    setAddCompanyLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newCompany.name);
      formData.append('description', newCompany.description);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const response = await fetch(`${baseUrl}/api/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(prev => [...prev, data.data.company]);
        setFormData(prev => ({ ...prev, company_id: data.data.company.id }));
        setShowAddCompanyModal(false);
        setNewCompany({ name: '', description: '' });
        setLogoFile(null);
        toast.success('Company added successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add company');
      }
    } catch (error) {
      toast.error('Failed to add company');
    } finally {
      setAddCompanyLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Not Approved</h1>
          <p className="text-gray-600 mb-4">Your account must be approved by admin to post jobs.</p>
          <button
            onClick={() => router.push('/user/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while subscription data is being fetched
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  // Show no subscription message only if we're sure user can't post jobs
  if (!canPostJob && !subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Briefcase className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Subscription Plan</h1>
          <p className="text-gray-600 mb-4">
            You need an active subscription plan to post jobs. Contact admin to get assigned a subscription plan.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Current plan: {subscriptionInfo.plan || 'None'}
          </p>
          <button
            onClick={() => router.push('/user/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/user/dashboard')}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Post New Job</h1>
                <p className="text-gray-600">Create a new job listing</p>
              </div>
            </div>
            
            {/* Subscription Info */}
            <div className="text-right">
              <p className="text-sm text-gray-500">Subscription Plan</p>
              <p className="text-lg font-semibold text-gray-900">
                {subscriptionInfo.plan ? subscriptionInfo.plan.charAt(0).toUpperCase() + subscriptionInfo.plan.slice(1) : 'None'}
              </p>
              <p className="text-xs text-gray-500">
                {subscriptionInfo.plan === 'none' ? 'No job posting allowed' :
                 subscriptionInfo.plan === 'basic' ? '5 jobs per month' :
                 subscriptionInfo.plan === 'premium' ? '20 jobs per month' :
                 subscriptionInfo.plan === 'enterprise' ? 'Unlimited jobs' : 'Contact admin'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-indigo-600' : 'text-gray-500'
                }`}>
                  {step === 1 ? 'Basic Info' : step === 2 ? 'Details' : 'Requirements'}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>


        {/* Warning if user can't post jobs */}
        {!canPostJob && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Cannot Create Job</h3>
                <p className="text-sm text-red-700 mt-1">
                  {subscriptionInfo.plan === 'none' 
                    ? 'You need a subscription to post jobs. Please upgrade your account.'
                    : 'You have reached your job posting limit for your current subscription plan.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <div className="border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                  {isMounted && editor && (
                    <>
                      <RichTextToolbar editor={editor} />
                      <div className="bg-white">
                        <EditorContent 
                          editor={editor} 
                          className="min-h-[150px] p-4 prose prose-sm max-w-none focus:outline-none"
                          style={{
                            '--tw-prose-headings': '#111827',
                            '--tw-prose-body': '#374151',
                            '--tw-prose-links': '#2563eb',
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <div className="flex space-x-2">
                    <select
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleInputChange}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.company_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddCompanyModal(true)}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {errors.company_id && <p className="mt-1 text-sm text-red-600">{errors.company_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Technology, Healthcare"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {contractTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contract Duration - Only show for contract type */}
                {(formData.contract_type === 'contract' || formData.type === 'contract') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Duration (Optional)
                    </label>
                    <input
                      type="text"
                      name="contract_duration"
                      value={formData.contract_duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 6 months, 1 year, 2 years"
                    />
                  </div>
                )}

                {/* Probation Period - Only show for contract type */}
                {(formData.contract_type === 'contract' || formData.type === 'contract') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Probation Period (Optional)
                    </label>
                    <input
                      type="text"
                      name="probation_period"
                      value={formData.probation_period}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 3 months, 6 months"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Job Details */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Job Details
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location(s) *
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {provincesLoading ? (
                    <p className="text-gray-500 text-sm">Loading provinces...</p>
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
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800"
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
                              className="ml-1 text-indigo-600 hover:text-indigo-800"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {errors.province_id && <p className="mt-1 text-sm text-red-600">{errors.province_id}</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="remote"
                  checked={formData.remote}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Remote work available
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range *
                </label>
                <input
                  type="text"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleInputChange}
                  placeholder="e.g., $50,000 - $70,000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.salary_range ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.salary_range && <p className="mt-1 text-sm text-red-600">{errors.salary_range}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>
                        {getExperienceDisplayValue(level)}
                      </option>
                    ))}
                  </select>
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
                    placeholder="e.g., 5 to 7, 5-7, 2+ years, 3-5 years"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter experience range (e.g., "5 to 7", "5-7", "2+ years")
                  </p>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Guidelines
                  </label>
                  <div className="border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    {isMounted && guidelinesEditor && (
                      <>
                        <RichTextToolbar editor={guidelinesEditor} />
                        <div className="bg-white">
                          <EditorContent 
                            editor={guidelinesEditor} 
                            className="min-h-[100px] p-4 prose prose-sm max-w-none focus:outline-none"
                            style={{
                              '--tw-prose-headings': '#111827',
                              '--tw-prose-body': '#374151',
                              '--tw-prose-links': '#2563eb',
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Instructions for applicants on how to apply
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {educationLevels.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender Preference
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {genderOptions.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="closing_date"
                  value={formData.closing_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Requirements & Job Requirements */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Duties & Responsibilities & Job Requirements
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duties & Responsibilities *
                </label>
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
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
                {errors.duties_and_responsibilities && <p className="mt-1 text-sm text-red-600">{errors.duties_and_responsibilities}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Requirements *
                </label>
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
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
                {errors.job_requirements && <p className="mt-1 text-sm text-red-600">{errors.job_requirements}</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Feature this job (may require additional cost)
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Job...
                  </div>
                ) : (
                  'Create Job'
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Company</h3>
              <button
                onClick={() => setShowAddCompanyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCompany.description}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description of the company"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddCompanyModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCompany}
                disabled={addCompanyLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {addCompanyLoading ? 'Adding...' : 'Add Company'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
