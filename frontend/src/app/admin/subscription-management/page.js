'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  Briefcase, 
  DollarSign, 
  Edit, 
  Save, 
  X,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { useAdminSubscription } from '../../../api/useSubscription';

export default function SubscriptionManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { 
    fetchAllPlans, 
    createPlan, 
    updatePlan, 
    deletePlan,
    loading: apiLoading,
    error: apiError 
  } = useAdminSubscription();

  const [editingPlan, setEditingPlan] = useState(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: 0,
    currency: 'USD',
    duration: 30,
    jobLimit: 10,
    features: [],
    description: '',
    isActive: true
  });

  // Fetch plans on component mount
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAllPlans();
        const plansData = response.data.plans || [];
        
        // Ensure features is always an array
        const normalizedPlans = plansData.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : 
                   (typeof plan.features === 'string' ? [plan.features] : [])
        }));
        
        setPlans(normalizedPlans);
      } catch (error) {
        console.error('Error loading plans:', error);
        setError('Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleEditPlan = (plan) => {
    setEditingPlan({ 
      ...plan, 
      features: Array.isArray(plan.features) ? plan.features : 
               (typeof plan.features === 'string' ? [plan.features] : [])
    });
  };

  const handleSavePlan = async (planId) => {
    try {
      setLoading(true);
      const response = await updatePlan(planId, editingPlan);
      setPlans(prev => prev.map(plan => 
        plan.id === planId ? response.data.plan : plan
      ));
      setEditingPlan(null);
      alert('Plan updated successfully!');
    } catch (error) {
      console.error('Error updating plan:', error);
      alert(`Failed to update plan: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
  };

  const handleAddPlan = async () => {
    try {
      setLoading(true);
      const response = await createPlan(newPlan);
      setPlans(prev => [...prev, response.data.plan]);
      setNewPlan({
        name: '',
        price: 0,
        currency: 'USD',
        duration: 30,
        jobLimit: 10,
        features: [],
        description: '',
        isActive: true
      });
      setShowAddPlan(false);
      alert('Plan created successfully!');
    } catch (error) {
      console.error('Error creating plan:', error);
      alert(`Failed to create plan: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        setLoading(true);
        await deletePlan(planId);
        setPlans(prev => prev.filter(plan => plan.id !== planId));
        alert('Plan deleted successfully!');
      } catch (error) {
        console.error('Error deleting plan:', error);
        alert(`Failed to delete plan: ${error.message || 'Please try again.'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const addFeature = (planId, feature) => {
    if (editingPlan && editingPlan.id === planId) {
      setEditingPlan(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    } else if (showAddPlan) {
      setNewPlan(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const removeFeature = (planId, featureIndex) => {
    if (editingPlan && editingPlan.id === planId) {
      setEditingPlan(prev => ({
        ...prev,
        features: prev.features.filter((_, index) => index !== featureIndex)
      }));
    } else if (showAddPlan) {
      setNewPlan(prev => ({
        ...prev,
        features: prev.features.filter((_, index) => index !== featureIndex)
      }));
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Subscription Plan Management
              </h1>
              <p className="text-gray-600">
                Manage job posting limits and subscription plans
              </p>
            </div>
            <button
              onClick={() => setShowAddPlan(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Plan
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Failed to load subscription plans</p>
                <p className="text-sm text-gray-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            </div>
          ) : (
            /* Plans Grid */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-6">
                  {/* Plan Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        ${plan.price}
                        <span className="text-sm font-normal text-gray-600">/{plan.duration} days</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit Plan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Job Limit */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        {plan.jobLimit === 0 ? 'Unlimited' : plan.jobLimit} Job Postings
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">per subscription period</p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {Array.isArray(plan.features) && plan.features.length > 0 ? (
                        plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            {feature}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500">No features listed</li>
                      )}
                    </ul>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      plan.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Edit Plan Modal */}
          {editingPlan && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Edit Plan: {editingPlan.name}</h3>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                    <input
                      type="text"
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={editingPlan.price}
                      onChange={(e) => setEditingPlan(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                    <input
                      type="number"
                      value={editingPlan.duration}
                      onChange={(e) => setEditingPlan(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Limit (0 = unlimited)</label>
                    <input
                      type="number"
                      value={editingPlan.jobLimit}
                      onChange={(e) => setEditingPlan(prev => ({ ...prev, jobLimit: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Features Management */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  <div className="space-y-2">
                    {Array.isArray(editingPlan.features) && editingPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...editingPlan.features];
                            newFeatures[index] = e.target.value;
                            setEditingPlan(prev => ({ ...prev, features: newFeatures }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => removeFeature(editingPlan.id, index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addFeature(editingPlan.id, '')}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSavePlan(editingPlan.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Plan Modal */}
          {showAddPlan && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Plan</h3>
                  <button
                    onClick={() => setShowAddPlan(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                    <input
                      type="text"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                    <input
                      type="number"
                      value={newPlan.duration}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Limit (0 = unlimited)</label>
                    <input
                      type="number"
                      value={newPlan.jobLimit}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, jobLimit: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Features Management */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  <div className="space-y-2">
                    {Array.isArray(newPlan.features) && newPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...newPlan.features];
                            newFeatures[index] = e.target.value;
                            setNewPlan(prev => ({ ...prev, features: newFeatures }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => removeFeature(null, index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addFeature(null, '')}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddPlan(false)}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPlan}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Plan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
