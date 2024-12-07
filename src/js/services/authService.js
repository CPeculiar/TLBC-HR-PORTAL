import axios from 'axios';
import { showToast } from '../../utils/toast';

const API_URL = 'https://tlbc-platform-api.onrender.com/api';

const authService = {
  login: async (username, password) => {

    // Show initial loading toast and store its ID
    const loadingToastId = showToast.info('Logging in...');

    try {
      const response = await axios.post(`${API_URL}/login/`, { 
        username, 
        password 
      });
    // showToast.info('Logging in...', { autoClose: 2000 });

    if (response.data.access && response.data.refresh) { 
      // Store tokens securely
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      // Set the default authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      authService.setAuthHeader(response.data.access);

      // Fetch user info
      await authService.getUserInfo(); // Fetch and save user info after successful login
     
      // Dismiss loading toast and show success
      showToast.dismiss(loadingToastId);
      showToast.success('Successfully logged in!');
      
      return response.data;
    }

} catch (error) {
  // Dismiss loading toast before showing error
  showToast.dismiss(loadingToastId);
  showToast.error('Login failed. Please check your credentials.');
  console.error('Login error:', error);
  // showToast.error('Login failed. Please check your credentials.');
  throw error;
}
},


  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const loadingToastId = showToast.info('Logging out...');
    // showToast.info('Logging out...');
   
    try {
      await axios.post(`${API_URL}/logout/`, { refresh: refreshToken });
      
      // if (response.data.detail === "Successfully logged out." || response.status === 200) {

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('firstName');
        localStorage.removeItem('userRole');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');

        // Remove authorization header
      delete axios.defaults.headers.common['Authorization'];
        
         // Dismiss loading toast and show success
         showToast.dismiss(loadingToastId);
         showToast.success('Successfully logged out!');

       // Prevent back navigation after logout
      window.history.pushState(null, '', '/');
      window.onpopstate = function () {
        window.history.pushState(null, '', '/');

        // Optionally redirect to login page
    window.location.href = '/';
      };

      // Redirect to login page
      window.location.replace("/");
      
        // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.replace("/");
      }, 1000); 

    } catch (error) {
      // Dismiss loading toast before showing error
      showToast.dismiss(loadingToastId);
      showToast.error('An error occurred during logout.');
      console.error('Logout error:', error);
    }
  },

  getUserInfo: async () => {
    try {
    const response = await axios.get(`${API_URL}/user/`);
    const userData = response.data;

     // Save non-null values to localStorage
     Object.entries(userData).forEach(([key, value]) => {
      if (value !== null) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });

    return userData;
    } catch (error) {
      showToast.error('Error fetching user information');
      console.error('Error fetching user info:', error);
      throw error;
    }
  },

  updateProfile: async (updatedData) => {
    const loadingToastId = showToast.info('Updating profile...');

    try {
      const response = await axios.put(`${API_URL}/user/`, updatedData);
      await authService.getUserInfo(); // Refresh user info after update

      // Dismiss loading toast and show success
      showToast.dismiss(loadingToastId);
      showToast.success('Profile updated successfully!');

      return response.data;
    } catch (error) {
       // Dismiss loading toast before showing error
       showToast.dismiss(loadingToastId);
       showToast.error('Failed to update profile');
      console.error('Error updating profile:', error);
      throw error;
    }
  },


  checkTokenValidity: async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return false;

    try {
      const response = await axios.post(`${API_URL}/token/verify/`, { 
        token: accessToken 
      });
      return response.status === 200;
    } catch (error) {
      console.log('Token validation error:', error);
      return false;
    }
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await axios.post(`${API_URL}/token/refresh/`, { 
        refresh: refreshToken 
      });

      if (response.data.access && response.data.refresh) {
        // Update tokens in localStorage
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);

        // Update axios default header
        this.setAuthHeader(response.data.access);

        return true;
      }
      return false;
    } catch (error) {
      console.log('Token refresh error:', error);
      return false;
    }
  },

  setAuthHeader: (token) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
};


export default authService;



// getUserInfo: async () => {
//   const response = await axios.get(`${API_URL}/user/`);
//   localStorage.setItem('firstName', response.data.first_name);
//   localStorage.setItem('lastName', response.data.last_name);
//   localStorage.setItem('userRole', response.data.role);
//   localStorage.setItem('gender', response.data.gender);
//   return response.data;
// },


// Notify().showSuccessNotification("We are logging you in...");
// Notify().showInfoNotification("Logging in...");
// Notify().showInfoNotification(message || "We are logging you out...");