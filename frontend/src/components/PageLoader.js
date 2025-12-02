'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PageLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Simulate realistic loading progress
    if (isLoading) {
      setLoadingProgress(0);
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85; // Stop at 85% until page actually loads
          }
          // More realistic progress increments
          const increment = Math.random() * 8 + 3; // 3-11% increments
          return Math.min(prev + increment, 85);
        });
      }, 120);

      return () => clearInterval(progressInterval);
    }
  }, [isLoading]);

  useEffect(() => {
    // Complete loading when pathname changes
    if (isLoading) {
      setLoadingProgress(100);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 400);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, isLoading]);

  // Listen for router events (we'll handle this in the main layout)
  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setLoadingProgress(0);
    };

    const handleComplete = () => {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 300);
    };

    // We'll expose these functions globally so they can be called from the layout
    window.pageLoaderStart = handleStart;
    window.pageLoaderComplete = handleComplete;

    // Handle Link clicks
    const handleLinkClick = (e) => {
      const href = e.target.closest('a')?.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('http')) {
        handleStart();
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      delete window.pageLoaderStart;
      delete window.pageLoaderComplete;
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  if (!isLoading && loadingProgress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main loading bar with enhanced styling */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg relative overflow-hidden">
        {/* Background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        
        {/* Progress bar */}
        <div 
          className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 transition-all duration-300 ease-out relative overflow-hidden animate-pulse-glow"
          style={{ 
            width: `${loadingProgress}%`,
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.3)'
          }}
        >
          {/* Moving shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300/50 via-white/30 to-purple-300/50 animate-shimmer"></div>
        </div>
      </div>
      
      {/* Secondary progress indicator */}
      <div className="h-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20">
        <div 
          className="h-full bg-gradient-to-r from-blue-400/80 via-indigo-400/80 to-purple-400/80 transition-all duration-500 ease-out"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      
      {/* Pulse effect at the end of progress bar */}
      {loadingProgress > 0 && (
        <div 
          className="absolute top-0 h-1 w-2 bg-white rounded-full shadow-lg animate-pulse"
          style={{ left: `calc(${loadingProgress}% - 8px)` }}
        />
      )}
    </div>
  );
};

export default PageLoader;
