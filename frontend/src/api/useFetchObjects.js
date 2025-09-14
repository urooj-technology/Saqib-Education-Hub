// src/api/useFetchObjects.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useFetchObjects = (queryKey, endpoint, token) => {
  
  const fetchFunction = async () => {
    // For public access, token is optional
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
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
    
    // Construct the proper API URL using environment variable
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
    const apiUrl = baseUrl.endsWith('/api') 
      ? `${baseUrl}/${finalEndpoint}` 
      : `${baseUrl}/api/${finalEndpoint}`;
    
    const response = await axios.get(apiUrl, { headers });
    return response.data;
  };

  const { data, isLoading, isError, isSuccess, error, refetch } = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: fetchFunction,
    enabled: true, // Always run query (token is optional for public access)
    retry: 1, // Retry once on failure
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    onError: (error) => {
      console.error('API Error:', error);
    },
    onSuccess: (data) => {
      console.log('API Success:', data);
    }
  });

  return { data, isLoading, isError, isSuccess, error, refetch };
};

export default useFetchObjects;
