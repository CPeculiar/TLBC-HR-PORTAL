import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PreventBackNavigation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Replace the current history state when landing on homepage
    const preventBackNavigation = () => {
      // Replace the current history entry to prevent going back
      window.history.replaceState(null, '', window.location.href);

      // Add an event listener for popstate to handle back button
      const handlePopState = (event) => {
        // Redirect to login if attempting to go back
        navigate('/signin');
      };

      // Add event listener
      window.addEventListener('popstate', handlePopState);

      // Cleanup event listener
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    };

    // Call the function to set up prevention
    preventBackNavigation();
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default PreventBackNavigation;