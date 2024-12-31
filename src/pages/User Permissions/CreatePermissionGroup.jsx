import React, { useState } from 'react';
import axios from 'axios';

const CreatePermissionGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    setGroupName(e.target.value);
    setError('');
  };

  const validateForm = () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return false;
    }
    return true;
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
      setError(error.response?.data?.message || 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {error && <span className="text-red-500 text-xs">{error}</span>}
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
  );
};

export default CreatePermissionGroup;