"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuthStatus = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      const timestamp = localStorage.getItem('timestamp');
      
      // Check if token is expired (24 hours)
      const now = new Date().getTime();
      const isExpired = !timestamp || now - timestamp > 24 * 60 * 60 * 1000;
      
      if (savedUser && savedToken && !isExpired) {
        try {
          // Validate token with backend
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
          const apiUrl = baseUrl.endsWith('/api') 
            ? `${baseUrl}/auth/me` 
            : `${baseUrl}/api/auth/me`;
            
          
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Token ${savedToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.data?.user || JSON.parse(savedUser));
            setIsAuthenticated(true);
            setToken(savedToken);
          } else {
            // Don't clear storage immediately on API failure
            // Just set the stored user data
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
            setToken(savedToken);
          }
        } catch (error) {
          // Don't clear storage on network errors
          // Just set the stored user data
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          setToken(savedToken);
        }
      } else if (isExpired) {
        // Clear expired data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('timestamp');
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  const login = (userData, token) => {
    if (!userData || !token) {
      return;
    }
    setUser(userData);
    setIsAuthenticated(true);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    localStorage.setItem('timestamp', new Date().getTime());
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('timestamp');
  };

  const refreshUserData = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqibeduhub.com';
      const apiUrl = baseUrl.endsWith('/api') 
        ? `${baseUrl}/auth/me` 
        : `${baseUrl}/api/auth/me`;
        
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Token ${savedToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        const updatedUser = userData.data?.user;
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    token,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
