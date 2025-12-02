// src/api/useFetchObjects.js
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import axios from "axios";
import { logger } from "@/utils/logger";

const useFetchObjects = (queryKey, endpoint, token) => {
  
  // Memoize the fetch function to prevent unnecessary recreations
  const fetchFunction = useCallback(async ({ signal }) => {
    // For public access, token is optional
    const headers = token ? { Authorization: `Token ${token}` } : {};
    
    // Convert endpoint from object to query string if it's an object
    let finalEndpoint = endpoint;
    if (typeof endpoint === 'object') {
      // Extract the base endpoint (the path without parameters)
      const baseEndpoint = queryKey;
      
      // Create URLSearchParams from the endpoint object
      const params = new URLSearchParams();
      Object.entries(endpoint).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      // Combine base endpoint with query parameters
      const queryString = params.toString();
      finalEndpoint = `${baseEndpoint}${queryString ? `?${queryString}` : ''}`;
    }
    
    // Get API URL from environment variable
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const apiUrl = baseUrl.endsWith('/api') 
      ? `${baseUrl}/${finalEndpoint}` 
      : `${baseUrl}/api/${finalEndpoint}`;
    
    // Include signal for request cancellation
    const response = await axios.get(apiUrl, { 
      headers,
      signal // Pass AbortController signal for cancellation
    });
    return response.data;
  }, [endpoint, token, queryKey]);

  // Memoize error handler to prevent unnecessary recreations
  const onError = useCallback((error) => {
    logger.error('API Error:', error);
  }, []);

  // Memoize success handler to prevent unnecessary recreations
  const onSuccess = useCallback((data) => {
    logger.log('API Success:', data);
  }, []);

  const { data, isLoading, isError, isSuccess, error, refetch } = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: fetchFunction,
    enabled: true, // Always run query (token is optional for public access)
    retry: 1, // Retry once on failure
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    onError,
    onSuccess
  });

  return { data, isLoading, isError, isSuccess, error, refetch };
};

export default useFetchObjects;
