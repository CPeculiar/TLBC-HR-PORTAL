import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../../js/services/authService';

// Create the AuthContext
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => false
});

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      const isValidToken = await authService.checkTokenValidity();
      
      if (isValidToken) {
        // Fetch user info if token is valid
        const userData = await authService.getUserInfo();
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  // Login method
  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      await checkAuthStatus();
      return response;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  // Logout method
  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Context value
  const contextValue = {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};