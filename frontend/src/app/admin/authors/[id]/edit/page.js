'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Upload, 
  User,
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
import { toast } from 'react-toastify';

export default function EditAuthor() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const authorId = params.id;

  // Use the custom hooks
  const { data: authorData, isLoading, isError, error } = useFetchObject(
    'author',
    'authors',
    authorId,
    token
  );

  const { handleUpdate, loading: isSubmitting } = useUpdate(
    'authors',
    token,
    '/admin/authors',
    'Author updated successfully!',
    'Failed to update author'
  );

  const [formData, setFormData] = useState({
    penName: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Update form data when author data is loaded
  useEffect(() => {
    if (authorData?.data?.author || authorData?.data) {
      const author = authorData.data.author || authorData.data;
      console.log('Author data received:', author); // Debug log
      setFormData({
        penName: author.penName || '',
        bio: author.bio || ''
      });
    }
  }, [authorData]);

  // Check for changes
  useEffect(() => {
    if (authorData?.data?.author || authorData?.data) {
      const author = authorData.data.author || authorData.data;
      const hasFormChanges = 
        formData.penName !== (author.penName || '') ||
        formData.bio !== (author.bio || '') ||
        profileImage !== null;
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, profileImage, authorData]);

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

    // Prepare form data for API
    const updateData = new FormData();
    updateData.append('penName', formData.penName);
    updateData.append('bio', formData.bio);
    
    if (profileImage) {
      updateData.append('profileImage', profileImage);
    }

    // Send FormData directly (don't convert to object - this loses file data)
    handleUpdate(authorId, updateData);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this author? This action cannot be undone.')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/authors/${authorId}` 
          : `${baseUrl}/api/authors/${authorId}`;

        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          toast.success('Author deleted successfully!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          router.push('/admin/authors');
        } else {
          throw new Error('Failed to delete author');
        }
      } catch (error) {
        console.error('Error deleting author:', error);
        toast.error('Error deleting author. Please try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Author">
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Author</h2>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Failed to load author data'}
            </p>
            <Link
              href="/admin/authors"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Authors
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Author">
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Author</h1>
              <p className="text-gray-600">Update author information and profile</p>
            </div>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Author
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
                          Update profile image
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

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {hasChanges && (
                <span className="text-orange-600">You have unsaved changes</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/authors"
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
                    Update Author
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