// PreventBackNavigation.jsx
import React, { useEffect } from 'react';

const PreventBackNavigation = () => {
  useEffect(() => {
    // Clear any stored tokens or session data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    
    // Replace the current history state to prevent going back
    window.history.replaceState(null, document.title, window.location.href);
    
    // Add event listener for popstate to handle back button
    const handlePopState = () => {
      window.history.pushState(null, document.title, window.location.href);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PreventBackNavigation;