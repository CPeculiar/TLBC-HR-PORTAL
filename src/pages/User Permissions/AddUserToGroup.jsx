import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle } from '../../components/ui/card';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const AddUserToGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState({
    selectedPermission: '',
    username: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showUsernameField, setShowUsernameField] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(
        'https://tlbc-platform-api.onrender.com/api/groups/',
        {
          withCredentials: true
        }
      );
      setPermissions(response.data.results);
    } catch (error) {
      setErrors({
        submit: 'Failed to fetch permissions. Please try again.'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'selectedPermission') {
      setShowUsernameField(true);
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.selectedPermission) {
      newErrors.selectedPermission = 'Permission is required';
    }
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.put(
        `https://tlbc-platform-api.onrender.com/api/groups/${formData.selectedPermission}/`,
        {
          add_users: [formData.username]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setSuccessMessage('User successfully added to group');
      setFormData({ selectedPermission: '', username: '' });
      setShowUsernameField(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to assign permission. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
    <Breadcrumb pageName="Add User to Group"  className="text-black dark:text-white"  />

    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-xl text-black dark:text-white">
              Assign User to Group
            </h3>
          </div>

          {successMessage && (
            <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-md px-6.5">
              {successMessage}
            </div>
          )}

          <form className="space-y-6 mb-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 p-6.5">
              <div className="relative">
                <label className="mb-2.5 block text-black dark:text-white">
                  Select Group
                </label>
                <select
                  name="selectedPermission"
                  value={formData.selectedPermission}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" disabled>Select Permission</option>
                  {permissions.map((permission) => (
                    <option key={permission.name} value={permission.name}>
                      {permission.name}
                    </option>
                  ))}
                </select>
                <span className="text-red-500 text-xs">{errors.selectedPermission}</span>
              </div>

              {showUsernameField && (
                <div className="relative">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Enter Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                           {/* Forgot Username Link */}
                    <p className=''>
                      Forgot username? Click{" "}
                      <Link
                        to="/userSearchAdmin"
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        here
                      </Link>{" "}
                      to search.
                    </p>
                 
                  <span className="text-red-500 text-xs">{errors.username}</span>
                </div>
              )}
            </div>

            {showUsernameField && (
              <div className="px-6.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white bg-blue-600 hover:bg-blue-800 py-2 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary
                    ${isLoading ? "bg-gray-400 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? "Assigning..." : "Assign Permission"}
                </button>

                {errors.submit && (
                  <div className="mt-4 text-center text-red-500">
                    {errors.submit}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>

    </>
  );
};

export default AddUserToGroup;