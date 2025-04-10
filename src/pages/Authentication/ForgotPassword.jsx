import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post('https://tlbc-platform-api.onrender.com/api/password/reset/', { email });
      
       if (response.status === 200) {
        setMessage('A password reset mail has been sent to your email. Click on the link in the mail and follow the instructions to change your password. Blessings!');
        setShowPopup(true);
        setEmail('');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.email) {
        setError(error.response.data.email[0]);
      } else {
        setError('An error occurred. Please try again.');
      }
        setMessage(error);
        setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Forgot Your Password?
          </h2>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            Enter your email address to receive a password reset link
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 
                  rounded-md shadow-sm placeholder-gray-500 focus:outline-none 
                  focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg 
                            className="h-5 w-5 text-gray-400" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
            )}
          </div>

          <div>
          <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent 
                rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ease-in-out 
                ${isLoading 
                  ? "bg-primary/35 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                }`}
            >
              {isLoading ? "Sending..." : "Reset Password"}
            </button>
          </div>
        </form>
        </div>
        
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
            <h3 className={`text-lg font-semibold mb-4 ${error ? 'text-red-600' : 'text-gray-900'}`}>
                {error || message}
              </h3>
              <button
                onClick={() => {
                  setShowPopup(false);
                  if (!error) {
                      navigate('/');
                    }
                }}
                className={`w-full py-2 px-4 text-white rounded-md ${error ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} 
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                `}>
                Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
</>

    
  );
};


export default ForgotPassword;
