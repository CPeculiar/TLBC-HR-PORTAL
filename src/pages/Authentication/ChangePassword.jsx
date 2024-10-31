
import React, { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New Password and Confirm Password do not match.');
      return;
    }  

    try {
      const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert("Access token not found. Please login first.");
      navigate('/login');
      return;
    }
    setIsLoading(true);

      const response = await axios.post('https://tlbc-platform-api.onrender.com/api/password/change/', {
        old_password: oldPassword,
        new_password: newPassword, f 
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

      setMessage('Password was successfully changed.');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = Object.values(error.response.data)[0][0];
        setMessage(errorMessage);
      } else {
        setMessage('An error occurred. Please try again.');
      }
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-5">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="old-password" className="block mb-1">Old Password</label>
          <div className="relative">
          <input
           type={showOldPassword ? 'text' : 'password'}
            id="old-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <button
              type="button"
              onClick={() => {
                setShowOldPassword(!showOldPassword);
                setMessage(''); // Clear the error message
              }}
              className="absolute right-3 top-2 text-gray-600"
            >
              {showOldPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
        </div>
        </div>
        <div>
          <label htmlFor="new-password" className="block mb-1">New Password</label>
          <div className="relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            id="new-password"
            value={newPassword}
            onChange={(e) => { 
              setNewPassword(e.target.value);
              setMessage(''); // Clear the error message
               }}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-2 text-gray-600"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm-password" className="block mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => { 
                setConfirmPassword(e.target.value);
                setMessage(''); // Clear the error message
                }}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2 text-gray-600"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className={`w-full py-2 rounded-md text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white px-4 py-2 rounded-md mb-4'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
      {message && (
        <div className="mt-4 p-3 bg-red-100 rounded-md">
          {message}
        </div>
      )}
    </div>
  );
};

export default ChangePassword;