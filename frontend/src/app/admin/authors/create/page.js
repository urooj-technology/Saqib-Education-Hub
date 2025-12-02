'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Upload, 
  User,
  ArrowLeft
} from 'lucide-react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import useAdd from '../../../../api/useAdd';
import { useRouter } from 'next/navigation';

export default function CreateAuthor() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    penName: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const auth = useAuth();
  const token = auth.token;
  const { handleAdd, loading, success, responseData, error } = useAdd("authors", token);

  // Handle successful creation and redirect
  useEffect(() => {
    if (success && responseData) {
      // Show success message and redirect after a short delay
      setTimeout(() => {
        router.push('/admin/authors');
      }, 1500);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.penName.trim()) {
      newErrors.penName = 'Pen name is required';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
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
      
      // Add author data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add profile image if selected
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      // Call the API
      await handleAdd(formDataToSend);
      
    } catch (error) {
      console.error('Error creating author:', error);
      setErrors({ submit: 'Error creating author. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Create New Author">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/authors"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Authors
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Author</h1>
              <p className="text-gray-600">Add a new author to your platform</p>
            </div>
          </div>
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
                    Pen Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="penName"
                    value={formData.penName}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.penName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter pen name or real name"
                  />
                  {errors.penName && (
                    <p className="mt-1 text-sm text-red-600">{errors.penName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.bio ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter author bio and background"
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Image Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Image</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {profileImage ? (
                  <div className="space-y-4">
                    <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">{profileImage.name}</p>
                    <button
                      type="button"
                      onClick={() => setProfileImage(null)}
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
                          Upload profile image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Pen Name:</strong> {formData.penName || 'Not set'}</p>
                <p><strong>Bio:</strong> {formData.bio ? `${formData.bio.substring(0, 50)}${formData.bio.length > 50 ? '...' : ''}` : 'Not set'}</p>
                <p><strong>Profile Image:</strong> {profileImage ? 'Selected' : 'Not selected'}</p>
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
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/admin/authors"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting || loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Author
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
