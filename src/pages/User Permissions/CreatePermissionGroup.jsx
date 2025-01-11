import React, { useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';


const CreatePermissionGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    setGroupName(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, name: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!groupName.trim()) {
      newErrors.name = 'Group name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://tlbc-platform-api.onrender.com/api/groups/',
        { name: groupName },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setSuccessMessage(`${response.data.name} Group successfully created`);
      setGroupName('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      const errorData = error.response?.data;
      const formattedErrors = {};
      
      // Handle detail error message
      if (errorData?.detail) {
        formattedErrors.general = errorData.detail;
      }
      // Handle field-specific validation errors
      else if (typeof errorData === 'object') {
        Object.entries(errorData).forEach(([field, errorMessages]) => {
          formattedErrors[field] = Array.isArray(errorMessages) 
            ? errorMessages[0] 
            : errorMessages;
        });        
      } else {
        formattedErrors.general = 'Failed to create group. Please try again.';
      }
      setErrors(formattedErrors);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
    <Breadcrumb pageName="Create Permission Group" className="text-black dark:text-white" />

    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Create New Group
            </h3>
          </div>

          {successMessage && (
            <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-md px-6.5">
              {successMessage}
            </div>
          )}

          {errors.general && (
              <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md mx-6.5">
                {errors.general}
              </div>
            )}

          <form className="space-y-6 mb-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 p-6.5">
              <div className="relative">
                <label className="mb-2.5 block text-black dark:text-white">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={handleInputChange}
                  placeholder="Enter group name"
                  className={`w-full rounded border-[1.5px] ${
                      errors.name ? 'border-red-500' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                 {errors.name && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {errors.name}
                    </span>
                  )}
                  </div>
            </div>

            <div className="px-6.5">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white bg-blue-600 hover:bg-blue-800 py-2 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary
                    ${isLoading ? "bg-gray-400 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? "Creating..." : "Create Group"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    </>
  );
};

export default CreatePermissionGroup;