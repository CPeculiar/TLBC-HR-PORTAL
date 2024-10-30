// src/utils/toast.js
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultConfig = {
  position: "top-right",
  autoClose: 2300,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const showToast = {

  // Returns the toast ID so it can be dismissed programmatically
  success: (message, autoDismiss = false) => {
    const toastId = toast.success(message, {
      ...defaultConfig,
      className: 'toast-success',
      progressStyle: { background: '#4CAF50' },
      hideProgressBar: false 
    });
    return toastId;
  },

  error: (message, autoDismiss = false) => {
    const toastId = toast.error(message, {
      ...defaultConfig,
      className: 'toast-error',
    });
    return toastId;
  },

  info: (message, autoDismiss = false) => {
    const toastId = toast.info(message, {
      ...defaultConfig,
      className: 'toast-info',
    });
    return toastId;
  },

   warning: (message, autoDismiss = false) => {
    const toastId = toast.warning(message, {
      ...defaultConfig,
      className: 'toast-warning',
    });
    return toastId;
  },
  // custom: (message, options = {}) => toast(message, { ...defaultOptions, ...options }),
 
  // Custom styling
  custom: (message, autoDismiss = false) => {
    const toastId = toast(message, {
      ...defaultConfig,
      className: 'custom-toast',
      progressClassName: 'custom-progress-bar',
    });
    return toastId;
  },


    // Helper method to dismiss a specific toast
    dismiss: (toastId) => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    },
  
    // Helper method to dismiss all toasts
    dismissAll: () => {
      toast.dismiss();
    }
  };