// userApi.js - Handle Django API calls
import axiosInstance from './axiosConfig';

<<<<<<< HEAD
const API_BASE_URL = 'https://tlbc-platform-api.onrender.com';
=======
const API_BASE_URL = 'https://api.thelordsbrethrenchurch.org';
>>>>>>> dfc3f27a5deda41d600716fc965790772dae9a98

export const userApi = {
  // Get user profile from Django
  getUserProfile: async (username) => {
    try {    
    const response = await axiosInstance.get(`/api/users/?s=${username}`)
    return response.data.results[0]; // Return first matching user
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Get current user from Django
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/api/user/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Get user list
  getUsers: async () => {
    try {
      const response = await axiosInstance.get('/api/users/?limit=100');
      return response.data.results; // Return the results array
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
};