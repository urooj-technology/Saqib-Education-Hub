'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Building2,
  ArrowLeft,
  Trash2,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../../../../../components/AdminLayout';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useFetchObject from '../../../../../api/useFetchObject';
import useUpdate from '../../../../../api/useUpdate';
import { useAuth } from '../../../../../context/AuthContext';


export default function EditCompany() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const companyId = params.id;

  // Use the custom hooks
  const { data: companyData, isLoading, isError, error } = useFetchObject(
    'company',
    'companies',
    companyId,
    token
  );

  const { handleUpdate, loading: isSubmitting } = useUpdate(
    'companies',
    token,
    '/admin/companies',
    'Company updated successfully!',
    'Failed to update company'
  );

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: null
  });

  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when company data is loaded
  useEffect(() => {
    if (companyData?.data?.company || companyData?.data) {
      const company = companyData.data.company || companyData.data;
      setFormData({
        name: company.name || '',
        description: company.description || '',
        logo: null // Don't pre-populate file inputs
      });
    }
  }, [companyData]);

  // Check for changes
  useEffect(() => {
    if (companyData?.data?.company || companyData?.data) {
      const company = companyData.data.company || companyData.data;
      const hasFormChanges = 
        formData.name !== (company.name || '') ||
        formData.description !== (company.description || '') ||
        formData.logo !== null;
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, companyData]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
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
    updateData.append('name', formData.name);
    updateData.append('description', formData.description);
    updateData.append('industry', formData.industry);
    updateData.append('size', formData.size);
    updateData.append('website', formData.website);
    updateData.append('email', formData.email);
    updateData.append('phone', formData.phone);
    updateData.append('address', formData.address);
    updateData.append('city', formData.city);
    updateData.append('country', formData.country);
    updateData.append('founded_year', formData.founded_year);
    
    if (formData.logo) {
      updateData.append('logo', formData.logo);
    }

    // Convert FormData to regular object for the API
    const dataObject = {};
    for (let [key, value] of updateData.entries()) {
      dataObject[key] = value;
    }

    handleUpdate(companyId, dataObject);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/companies/${companyId}` 
          : `${baseUrl}/api/companies/${companyId}`;

        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          alert('Company deleted successfully!');
          router.push('/admin/companies');
        } else {
          throw new Error('Failed to delete company');
        }
      } catch (error) {
        console.error('Error deleting company:', error);
        alert('Error deleting company. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Company">
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Company</h2>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Failed to load company data'}
            </p>
            <Link
              href="/admin/companies"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Company">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/companies"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Companies
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Company</h1>
              <p className="text-gray-600">Update company information and details</p>
            </div>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Company
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
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter company name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter company description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>


              </div>
            </div>



            {/* Logo Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Logo</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {formData.logo ? (
                  <div className="space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">{formData.logo.name}</p>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                          Update company logo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
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
              <Link
                href="/admin/companies"
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
                    Update Company
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
