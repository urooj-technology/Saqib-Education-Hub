import { useState, useEffect } from 'react';
import axios from 'axios';

const useSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiUrl = baseUrl.endsWith('/api') 
    ? `${baseUrl}/subscriptions` 
    : `${baseUrl}/api/subscriptions`;

  // Fetch all subscription plans (public)
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${apiUrl}/plans`);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch subscription plans');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's current subscription
  const fetchUserSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${apiUrl}/my-subscription`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch user subscription');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create new subscription
  const createSubscription = async (planId, paymentData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${apiUrl}`, {
        planId,
        paymentMethod: paymentData.paymentMethod || 'manual',
        transactionId: paymentData.transactionId || `txn_${Date.now()}`
      }, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create subscription');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Upgrade existing subscription
  const upgradeSubscription = async (planId, paymentData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`${apiUrl}/upgrade`, {
        planId,
        paymentMethod: paymentData.paymentMethod || 'manual',
        transactionId: paymentData.transactionId || `txn_${Date.now()}`
      }, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upgrade subscription');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if user can post job
  const checkCanPostJob = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${apiUrl}/can-post-job`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to check job posting capability');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get subscription analytics
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${apiUrl}/analytics`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch analytics');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchPlans,
    fetchUserSubscription,
    createSubscription,
    upgradeSubscription,
    checkCanPostJob,
    fetchAnalytics
  };
};

// Admin subscription management hooks
export const useAdminSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiUrl = baseUrl.endsWith('/api') 
    ? `${baseUrl}/subscriptions/admin` 
    : `${baseUrl}/api/subscriptions/admin`;

  // Fetch all plans (including inactive) - Admin only
  const fetchAllPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${apiUrl}/plans`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch subscription plans');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create new subscription plan - Admin only
  const createPlan = async (planData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${apiUrl}/plans`, planData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create subscription plan');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update subscription plan - Admin only
  const updatePlan = async (planId, planData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`${apiUrl}/plans/${planId}`, planData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update subscription plan');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete subscription plan - Admin only
  const deletePlan = async (planId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(`${apiUrl}/plans/${planId}`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete subscription plan');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchAllPlans,
    createPlan,
    updatePlan,
    deletePlan
  };
};

export default useSubscription;
