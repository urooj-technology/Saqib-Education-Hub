"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useAuthContext } from "../../../context/AuthContext";
import useAdd from "@/api/useAdd";
import { toast } from "react-toastify";

const Login = () => {
  // All hooks must be called at the top level, before any conditional returns
  const router = useRouter();
  const authContext = useAuthContext();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Use useAdd for authentication - this will POST to /api/auth/login/
  const { handleAdd, loading, success, responseData, error: mutationError } = useAdd("auth/login", null);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Check if we're already logged in, but only after loading is complete
    if (authContext.isAuthenticated && !authContext.loading && authContext.user) {
      console.log('User already authenticated, redirecting based on role:', authContext.user.role);
      // Redirect based on user role
      if (authContext.user.role === 'admin') {
        console.log('Redirecting authenticated admin to /admin');
        router.push("/admin");
      } else if (authContext.user.role === 'hr') {
        console.log('Redirecting authenticated HR to /user/dashboard');
        router.push("/user/dashboard");
      } else {
        console.log('Redirecting authenticated user to /');
        router.push("/"); // Default redirect for other roles
      }
    }
  }, [authContext.isAuthenticated, authContext.loading, router, authContext.user]);

  // Handle successful login response
  useEffect(() => {
    if (success && responseData) {
      try {
        console.log('Login response received:', responseData);
        
        // Extract user data and token from response
        const userData = responseData.data?.user || responseData.user;
        const token = responseData.data?.token || responseData.token;

        console.log('Extracted userData:', userData);
        console.log('Extracted token:', token);

        if (userData && token) {
          console.log('Calling authContext.login with:', { userData, token });
          
          // Login successful - store in auth context
          authContext.login(userData, token);
          
          // Verify token was stored
          const storedToken = localStorage.getItem('token');
          console.log('Token stored in localStorage:', storedToken);
          
          // Redirect based on user role with a small delay to ensure auth context is updated
          setTimeout(() => {
            if (userData.role === 'admin') {
              console.log('Redirecting admin user to /admin');
              router.push("/admin");
            } else if (userData.role === 'hr') {
              console.log('Redirecting HR user to /user/dashboard');
              router.push("/user/dashboard");
            } else {
              console.log('Redirecting regular user to /');
              router.push("/"); // Default redirect for other roles
            }
          }, 100);
        } else {
          console.error('Missing userData or token:', { userData, token });
          setError("Invalid response from server");
        }
      } catch (error) {
        console.error("Error processing login response:", error);
        setError("Error processing login response");
      }
    }
  }, [success, responseData, authContext, router]);

  // Handle mutation errors
  useEffect(() => {
    if (mutationError) {
      console.error('Login mutation error:', mutationError);
      
      // Extract error message from the mutation error
      let errorMessage = "Login failed. Please try again.";
      
      if (mutationError.response?.data?.message) {
        errorMessage = mutationError.response.data.message;
      } else if (mutationError.message) {
        errorMessage = mutationError.message;
      }
      
      setError(errorMessage);
      
      // Show toast notification for better user experience
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [mutationError]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    if (!formData.email || !formData.password) {
      setError("Username and password are required");
      return;
    }

    // Use useAdd hook to send login request
    // This will POST to /api/auth/login/ with the form data
    handleAdd(formData);
  };

  // Show loading state while checking authentication
  // This must come AFTER all hooks are called
  if (authContext.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative">
        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign In
          </h1>
          <p className="text-gray-600">
            Sign in to your account to continue
          </p>
          
          {/* Show logout option if already authenticated */}
          {authContext.isAuthenticated && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">
                You are already logged in as {authContext.user?.email || authContext.user?.firstName || 'User'}
              </p>
              <button
                type="button"
                onClick={() => {
                  authContext.logout();
                  setFormData({ email: "", password: "" });
                  setError(null);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Logout and sign in with different account
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg border ${
            error.includes('not activated') || error.includes('system administrator') 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {error.includes('not activated') || error.includes('system administrator') ? (
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${
                  error.includes('not activated') || error.includes('system administrator') 
                    ? 'text-yellow-800' 
                    : 'text-red-800'
                }`}>
                  {error}
                </p>
                {error.includes('not activated') && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Please contact your system administrator to activate your account.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors pr-12"
                required
              />
              <button
                type="button"
                onClick={handleShowPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/auth/signup")}
              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
