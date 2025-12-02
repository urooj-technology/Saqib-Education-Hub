// src/api/useUpdate.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const useUpdate = (queryKey, token, redirectPath, successMessage, errorMessage, onSuccessCallback) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Don't set Content-Type for FormData - let browser set it with boundary
      if (data instanceof FormData) {
        // Remove any existing Content-Type header for FormData
        delete headers['Content-Type'];
      }
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        
        const apiUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/${queryKey}/${id}` 
          : `${baseUrl}/api/${queryKey}/${id}`;
        
        const response = await axios.put(apiUrl, data, { headers });
        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.detail || error.response?.data?.message || errorMessage || "Failed to update"
        );
      }
    },
    onSuccess: () => {
      setSuccess(true);
      setLoading(false);
      // Show success message using toast notification
      if (successMessage) {
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      // Invalidate all queries that start with the queryKey
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      
      // Also invalidate any queries that might have the queryKey as a prefix
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === queryKey;
        }
      });
      
      // Force refetch of all articles queries
      queryClient.refetchQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === queryKey;
        }
      });
      
      // For articles, also invalidate any single article queries and admin list queries
      if (queryKey === 'articles') {
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            return query.queryKey[0] === 'articles' || 
                   query.queryKey[0] === 'article' ||
                   query.queryKey[0] === 'admin-articles';
          }
        });
      }
      
      // Call the success callback if provided
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      
      if (redirectPath) {
        router.push(redirectPath);
      }
    },
    onError: (error) => {
      setSuccess(false);
      setLoading(false);
      // Show error message using toast notification
      toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleUpdate = (id, data) => {
    updateMutation.mutate({ id, data });
  };

  return {
    handleUpdate,
    loading,
    success,
    setSuccess,
  };
};

export default useUpdate;
