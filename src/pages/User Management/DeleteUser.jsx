import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
 
const DeleteUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: ""
  });
  
  const [errors, setErrors] = useState({});
  const [modalError, setModalError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalPassword, setModalPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
   
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

    if (!data.username) {
      newErrors.username = "Username is required";
      isValid = false;
    }
  
    setErrors(newErrors);
    return isValid;
  };
  
  const handlePasswordChange = (e) => {
    const inputValue = e.target.value;
    setModalPassword(inputValue);
    setErrors(null);
  }

  const formatErrorMessage = (error) => {
    if (typeof error === 'object' && error !== null) {
      return Object.entries(error)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: ${value.join(', ')}`;
          }
          return `${key}: ${value}`;
        })
        .join('\n');
    }
    return error;
  };
  
  const handleDelete = async () => {
    if (!modalPassword) {
      setModalError("Password is required");
      return;
    }

    setIsLoading(true);
    setModalError("");
               
    try {
      const response = await axios.post(`https://api.thelordsbrethrenchurch.org/api/users/${formData.username}/delete/`, {  
          password: modalPassword
        },
      //   {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     headers: { Authorization: `Bearer ${accessToken}` }
      //   },
      //   withCredentials: true
      // }
    
    );

      if (response.status === 204) {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        setFormData({ username: '' });
        setModalPassword("");
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error.response) {
        if (error.response.status === 500) {
          setModalError("Unable to delete, please contact your Pastor");
        } else if (error.response.data.detail) {
          setModalError(error.response.data.detail);
        } else {
          setModalError(formatErrorMessage(error.response.data));
        }
      } else {
        setModalError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm(formData)) {
      return;
    }
    setModalError("");
    setModalPassword("");
    setShowConfirmModal(true);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <Breadcrumb pageName="Delete a User" className="text-black dark:text-white" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Delete a User
              </h3>
            </div>

            <form className="space-y-6 mb-8" method="post" onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Enter the Username of the member to be deleted
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={handleInputChange}
                    value={formData.username}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                  {errors.username && (
                    <span className="text-red-500 text-xs mt-1">{errors.username}</span>
                  )}

                  <p className='mt-2'>
                    Forgot username? Click{" "}
                    <Link to="/userSearchAdmin" className="text-blue-500 underline hover:text-blue-700">
                      here
                    </Link>{" "}
                    to search.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white bg-red-600 hover:bg-red-800 py-3 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-800 
                    ${isLoading ? "bg-gray-400 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? "Processing..." : "Delete User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 text-center shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-medium text-black mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-gray-600">Please enter your password to confirm deletion of user: <span className="font-semibold">{formData.username}</span></p>
            
            <div className="relative">
            <input
              id='password'
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Enter your password"
              value={modalPassword}
              // onChange={handlePasswordChange}
              onChange={(e) => setModalPassword(e.target.value)}
              className="w-full mb-6 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary"
            />
            <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-4 top-4"
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.5">
                              <path
                                d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                                fill=""
                              />
                              <path
                                d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </button>
                      </div>
            
            {modalError && (
              <div className="mb-6 text-red-500 text-sm whitespace-pre-line">
                {modalError}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-6 rounded-lg transition duration-300"
                onClick={() => {
                  setShowConfirmModal(false);
                  setModalPassword("");
                  setModalError("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition duration-300"
                onClick={handleDelete}
                disabled={isLoading || !modalPassword}
              >
                {isLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 text-center shadow-lg max-w-md w-full mx-4">
            <div className="mb-4 text-green-500">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-black mb-4">Success!</h2>
            <p className="mb-6 text-gray-600">The user has been successfully deleted.</p>
            <button
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition duration-300"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteUser;