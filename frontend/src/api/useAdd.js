import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";

const useAdd = (
  queryKey,
  token = null, // Default token to null
  redirectPath = null, // Optional redirect path
  successMessage,
  errorMessage
) => {
  // Remove useTranslation to fix hooks order issue
  // const { t } = useTranslation();
  
  const queryClient = useQueryClient();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [responseData, setResponseData] = useState("");
  const [error, setError] = useState(null);

  const addMutation = useMutation({
    mutationFn: async (data) => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      console.log(`Sending request to ${process.env.NEXT_PUBLIC_API_URL}/${queryKey}/`, data);

      // Initialize headers object
      const headers = {};
      
      // Only set Content-Type for non-FormData objects
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      // Add Authorization header only if the token is valid
      if (token && typeof token === "string" && token.trim().length > 0) {
        headers.Authorization = `Bearer ${token.trim()}`;
      }

      try {
        // Debug: Check environment variable
        console.log('Environment variable NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
        
        // Special handling for authentication endpoints
        let apiUrl;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com/api';
        
        if (queryKey === "auth/login") {
          // For auth/login, use the correct endpoint structure
          apiUrl = baseUrl.endsWith('/api') 
            ? `${baseUrl}/${queryKey}` 
            : `${baseUrl}/api/${queryKey}`;
        } else {
          // For other endpoints, construct the proper URL
          apiUrl = baseUrl.endsWith('/api') 
            ? `${baseUrl}/${queryKey}` 
            : `${baseUrl}/api/${queryKey}`;
        }
        
        console.log('Final API URL:', apiUrl);
        
        const response = await axios.post(apiUrl, data, { headers });
        setResponseData(response.data);
        return response.data;
      } catch (error) {
        console.error("API error:", error.response || error);
        console.error("Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      setLoading(false);
      console.log("useAdd onSuccess called with data:", data);
      
      // Remove automatic toast - let component handle it
      setSuccess(true);
      console.log("Mutation successful:", data);

      // Reset the form after a short delay
      setTimeout(() => {
        setSuccess(false);
      }, 100);

      // Invalidate the query to refresh the data if not login
      if (queryKey !== "login") {
        queryClient.invalidateQueries(queryKey);
      }
      
      // Note: Redirect logic removed - handle navigation in the component using Next.js router
    },
    onError: (error) => {
      setLoading(false);
      setError(error);

      // Remove automatic toast - let component handle it
      console.error("useAdd onError:", error);
    },
  });

  const handleAdd = (data) => {
    addMutation.mutate(data);
  };

  return {
    handleAdd,
    success,
    loading,
    responseData,
    error,
  };
};

export default useAdd;
