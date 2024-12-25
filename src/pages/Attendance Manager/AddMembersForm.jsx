import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Download } from 'lucide-react';

const AddMembersForm = () => {
  const location = useLocation();
  const refCode = location.state?.refCode || location.pathname.split('/addmembers/')[1];
  
  const [formData, setFormData] = useState({
    username: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

     // Verify refCode before making API call
 if (!refCode) {
    setErrors({ message: 'Invalid reference code' });
    setIsLoading(false);
    return;
  }

    const formDataToSubmit = new FormData();
    
    // Append all form fields to FormData
  Object.keys(formData).forEach(key => {
    if (formData[key] !== null && formData[key] !== undefined) {
      formDataToSubmit.append(key, formData[key]);
    }
  });


  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Access token not found. Please login first.");
      navigate("/");
      return;
    }

      const username = formData.username;

      const response = await axios.put(
        `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/mark/${username}/admin/`,
        formDataToSubmit,
        {
          params: { ref_code: refCode }, 
          headers: { 
            Authorization: `Bearer ${accessToken}`, 
          },
        }
      );
      
      setSuccessMessage(response.data.message);
      alert(response.data.message);

      // Clear the success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
    
      setFormData({ username: '', });
    } catch (error) {
      if (error.response) {
        // Handle the specific "No User matches" error
        if (error.response.data.detail) {
          setErrors({ message: error.response.data.detail });
        } else if (error.response.data) {
          setErrors(error.response.data);
        }
      } else {
        setErrors({ message: 'An unexpected error occurred. Please try again.' });
      }

      setTimeout(() => {
        setErrors({});
      }, 10000);
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
              Membership Manual Attendance Form
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  User Name
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username[0]}</p>
                )}
              </div>

              {/* Global Error Message */}
              {errors.message && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">
                  {errors.message}
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
                  {successMessage}
                </div>
              )}

             {/* Forgot Username Link */}
    <p className='mb-4'>
      Forgot username? Click{" "}
      <Link
        to="/userSearchAdmin"
        className="text-blue-500 underline hover:text-blue-700"
      >
        here
      </Link>{" "}
      to search.
    </p>

              {/* Submit Button */}
              {/* <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
              >
                {isLoading ? "Submitting..." : "Register"}
              </button> */}

              <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
              >
                {isLoading ? "Adding..." : "Add Member"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMembersForm;