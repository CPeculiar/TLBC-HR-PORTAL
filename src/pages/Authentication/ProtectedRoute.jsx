// ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../js/services/authService';
import Loader from '../../common/Loader';
import IdleTimerProvider from '../../components/idleTimer/IdleTimerProvider';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
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
          
          // Get user info for role-based access control
          if (requiredRoles.length > 0) {
            const userInfo = await authService.getUserInfo();
            setUserRole(userInfo.role);
          }
        } else {
          // Try to refresh the token
          const isRefreshed = await authService.refreshToken();
          
          if (isRefreshed) {
            setIsAuthenticated(true);
            
            // Get user info for role-based access control
            if (requiredRoles.length > 0) {
              const userInfo = await authService.getUserInfo();
              setUserRole(userInfo.role);
            }
          } else {
            // Refresh failed, redirect to login
            throw new Error('Token refresh failed');
          }
        }
      } catch (error) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [requiredRoles]);

  if (isLoading) {
    return <div><Loader /></div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Check for required roles
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Wrap children with IdleTimerProvider only for authenticated routes
  return (
    <IdleTimerProvider>
      {children}
    </IdleTimerProvider>
  );
};

export default ProtectedRoute;