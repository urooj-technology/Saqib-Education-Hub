// src/api/useFetchObject.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useFetchObject = (queryKey, endpoint, id, token) => {
  const fetchFunction = async () => {
    const headers = token ? { Authorization: `Token ${token}` } : {};
    
    // Build the endpoint URL
    let finalEndpoint = endpoint;
    
    // If endpoint doesn't include the id, add it
    if (!finalEndpoint.includes(id)) {
      // Ensure endpoint doesn't end with a slash
      finalEndpoint = finalEndpoint.endsWith('/') ? finalEndpoint.slice(0, -1) : finalEndpoint;
      // Add id without trailing slash for our Express API
      finalEndpoint = `${finalEndpoint}/${id}`;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    
    const apiUrl = baseUrl.endsWith('/api') 
      ? `${baseUrl}/${finalEndpoint}` 
      : `${baseUrl}/api/${finalEndpoint}`;
    
    console.log("Fetching single object from:", apiUrl);

    const response = await axios.get(apiUrl, {
      headers,
    });
    return response.data;
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchFunction,
  });

  return { data, isLoading, isError, error, refetch };
};

export default useFetchObject;
