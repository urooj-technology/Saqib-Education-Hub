'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const RouterWrapper = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    let loadingTimer;

    const handleRouteChangeStart = () => {
      // Start loading animation
      if (window.pageLoaderStart) {
        window.pageLoaderStart();
      }
    };

    const handleRouteChangeComplete = () => {
      // Complete loading animation after a short delay
      if (window.pageLoaderComplete) {
        window.pageLoaderComplete();
      }
    };

    // Override router methods to trigger loading
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalForward = router.forward;

    router.push = (...args) => {
      handleRouteChangeStart();
      return originalPush.apply(router, args);
    };

    router.replace = (...args) => {
      handleRouteChangeStart();
      return originalReplace.apply(router, args);
    };

    router.back = () => {
      handleRouteChangeStart();
      return originalBack.apply(router);
    };

    router.forward = () => {
      handleRouteChangeStart();
      return originalForward.apply(router);
    };

    // Handle pathname changes (when navigation completes)
    if (previousPathname.current !== pathname) {
      // Pathname changed, complete loading
      loadingTimer = setTimeout(() => {
        handleRouteChangeComplete();
      }, 100);
      
      previousPathname.current = pathname;
    }

    // Cleanup
    return () => {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
    };
  }, [router, pathname]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (window.pageLoaderStart) {
        window.pageLoaderStart();
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return children;
};

export default RouterWrapper;
