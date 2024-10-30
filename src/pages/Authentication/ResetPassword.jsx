import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New Password and Confirm Password do not match.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://tlbc-platform-api.onrender.com/api/password/reset/confirm/",
        {
          new_password: newPassword,
          key: key,
        }
      );

      setMessage("Password was successfully changed.");
      setShowPopup(true);
      setNewPassword("");
      setConfirmPassword("");
      setKey("");
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = Object.values(error.response.data)[0][0];
        setMessage(errorMessage);
        setError(error.response.data);
      } else {
        setMessage("An error occurred. Please try again.");
        setShowPopup(true);
        setError("An error occurred. Please try again.");
      }
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <input
              type={showNewPassword ? "text" : "password"}
              id="new-password"
              value={newPassword}
              onChange={(e) => {                
               setNewPassword(e.target.value);
               setMessage(''); // Clear the error message
               }}
               className="appearance-none rounded-md relative border-stroke bg-transparent block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
                required
              />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                <FontAwesomeIcon
                  icon={showNewPassword ? faEyeSlash : faEye}
                  className="h-5 w-5 text-gray-400"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                />
              </div>
            </div>

        <div className="relative">
              <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => { 
                setConfirmPassword(e.target.value);
                setMessage(''); // Clear the error message
              }}
              className="appearance-none rounded-md relative border-stroke bg-transparent block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm New Password"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                  className="h-5 w-5 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>
            </div>

           <div className="relative">
              <input
              type="text"
              id="key"
              value={key}
              onChange={(e) => {
                 setKey(e.target.value);
                 setMessage(''); // Clear the error message  
              }}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Key"
                required
              />
            </div>
            {message && (
              <p className="text-red-500 text-xs mt-1">{message}</p>
            )}
          </div>
          <div>
            <button
           type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition duration-150 ease-in-out 
              ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
        {message && (
        <div className="mt-4 p-3 bg-red-100 rounded-md">{message}</div>
      )}

       {showPopup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{message}</h3>
                <div className="mt-2 px-7 py-3">
                  <button
                    className="px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    onClick={() => {
                      setShowPopup(false);
                      navigate('/login');
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
