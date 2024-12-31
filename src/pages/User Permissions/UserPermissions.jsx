import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';


const UserPermissions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    role: '',
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
    if (!data.identifier) {
      newErrors.identifier = 'Email or username is required';
      isValid = false;
    }
    if (!data.role) {
      newErrors.role = 'Role is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  
  const handleRoleAssignment = async (e) => {
    setIsLoading(true);
  
    try {
      const response = await axios.put(
        'https://tlbc-platform-api.onrender.com/api/users/make-admin/',
        formData,
        {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true, // Ensures cookies are sent with the request
        }
    );
  
    setSuccessMessage(response.data.message || 'Role updated successfully.');
    setFormData({ identifier: '', role: '' });
    setTimeout(() => setSuccessMessage(""), 5000); // Clear success message after 5 seconds
  } catch (error) {
    const errorMsg =
      error.response?.data?.identifier?.[0] ||
      error.response?.data?.message ||
      'Failed to assign role. Please try again.';
    setErrors({ submit: errorMsg });
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

<Breadcrumb pageName="User Permissions"  className="text-black dark:text-white"  />
            
<div className="p-4 md:p-6 2xl:p-10">
    <div className="mx-auto max-w-5xl">


        {/* Main Form Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
             Assign Admin Role
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
                  Enter the email or Username of the user
                </label>
                  <input
                      type="text"
                    name="identifier"
                    placeholder="Enter email or username"
                    onChange={handleInputChange}
                    value={formData.identifier}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />

<span className="text-red-500 text-xs">{errors.identifier}</span>
  </div>     

  <div className="relative">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Role
                  </label>
                  <select
                    name="role"
                    onChange={handleInputChange}
                    value={formData.role}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                  <span className="text-red-500 text-xs">{errors.role}</span>
                </div>
              </div>         
             
                <div className="mb-5">
                <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white bg-blue-600 hover:bg-blue-800 py-2 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary
            ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
  }`}>
          {isLoading ? "Assigning..." : "Assign Role"}
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
            <h2 className="text-lg font-medium text-black mb-4">Confirm Role Assignment</h2>
            <p className="mb-6">
              Are you sure you want to assign the role{' '}
              <strong>{formData.role}</strong> to the user{' '}
              <strong>{formData.identifier}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={handleRoleAssignment}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    
 </>
 
  )
}

export default UserPermissions;