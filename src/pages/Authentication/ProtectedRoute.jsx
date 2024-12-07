import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import authService from '../../js/services/authService';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // First, check if access token exists
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
          throw new Error('No tokens found');
        }

        // Verify the access token
        const isTokenValid = await authService.checkTokenValidity();

        if (isTokenValid) {
          // Token is valid, allow access
          setIsAuthenticated(true);
        } else {
          // Try to refresh the token
          const isRefreshed = await authService.refreshToken();
          
          if (isRefreshed) {
            setIsAuthenticated(true);
          } else {
            // Refresh failed, redirect to login
            throw new Error('Token refresh failed');
          }
        }
      } catch (error) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/', { replace: true });
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [navigate]);

  // Prevent browser back button access to protected routes when logged out
  useEffect(() => {
    const handlePopState = () => {
      if (!localStorage.getItem('accessToken')) {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  if (isLoading) {
    // Optional: You can add a loader here
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;