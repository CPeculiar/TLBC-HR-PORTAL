import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';


const DeleteUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: ""
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
   
  
   // Clear specific field error when user starts typing
   if (errors[name]) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
  };
  
  
  const validateForm = (data) => {
    const newErrors = {};
    let isValid = true;

    if (!data.email) {
        newErrors.email = "Email is required";
        isValid = false;
    }
  
    setErrors(newErrors);
    return isValid;
  };
  
  const handleDelete = async (e) => {
    setIsLoading(true);
  
    try {
      const response = await axios.delete(
      `https://tlbc-platform-api.onrender.com/api/users/${formData.email}/`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true, // Ensures cookies are sent with the request
        }
    );
  
    if (response.status === 204 || response.ok) {
      setFormData({ email: '' });
        setSuccessMessage("User deleted successfully.");
        setTimeout(() => setSuccessMessage(""), 5000); // Clear message after 5 seconds
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrors({ submit: 'Failed to delete user. Please try again.' });
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    setShowConfirmModal(true);
  };

  return (
    <>

<Breadcrumb pageName="Delete a User"  className="text-black dark:text-white"  />
            
<div className="p-4 md:p-6 2xl:p-10">
    <div className="mx-auto max-w-5xl">


        {/* Main Form Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Delete a User
            </h3>
          </div>

          {successMessage && (
              <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-md px-6.5">
                {successMessage}
              </div>
            )}

          <form className="space-y-6 mb-8" method="post" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6.5">
                  <div className="relative">
                  <label className="mb-2.5 block text-black dark:text-white">
                  Enter the email address of the user to delete
                </label>
                  <input
                       type="email"
                        name="email"
                        placeholder="Email address"
                        onChange={handleInputChange}
                        value={formData.email}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />

<span className="text-red-500 text-xs">{errors.email}</span>
  </div>
                 
                </div>
 
             
                <div className="mb-5">
                <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white bg-red-600 hover:bg-red-800 py-2 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-form-strokedark dark:bg-red-500 dark:hover:bg-red-800  dark:text-white dark:focus:border-danger
            ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
  }`}>
          {isLoading ? "Deleting..." : "Delete User"}
            </button>

            {errors.submit && (
              <div className="mt-4 text-center text-red-500">
                {errors.submit}
              </div>
            )}
                </div>


           
              </form>
          
        </div>
        </div>
        </div>


        {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 text-center shadow-lg">
            <h2 className="text-lg font-medium text-black mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete the user account?</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    
 </>
 
  )
}

export default DeleteUser;