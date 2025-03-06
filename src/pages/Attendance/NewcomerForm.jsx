import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NewcomerForm = () => {
  const { ref_code } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    gender: '',
    birth_date: '',
    address: '',
    profile_picture: '',
    occupation: '',
    invited_by: '',
    want_to_be_member: false,
    marital_status: '',
    interested_department: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `https://api.thelordsbrethrenchurch.org/api/attendance/${ref_code}/newcomers/`,
        formData      );
      console.log('Newcomer data submitted:', response.data);
      alert('Thank you for submitting your information!');
      navigate('/'); // Redirect to home page or a thank you page
    } catch (error) {
      console.error('Error submitting newcomer data:', error);
      setError('An error occurred while submitting your information. Please contact your Pastor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-1 text-blue-500 text-center">Welcome to TLBC Int'l.</h1>
      <p className="text-lg mb-6 text-center">Please fill your data below</p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Birth Date</label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            ></textarea>
          </div>
          <div>
            <label className="block mb-1">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Invited By</label>
            <input
              type="text"
              name="invited_by"
              value={formData.invited_by}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Marital Status</label>
            <select
              name="marital_status"
              value={formData.marital_status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Interested Department</label>
            <select
              type="text"
              name="interested_department"
              value={formData.interested_department}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
             <option value="" disabled>Select a department</option>
             <option value="Music">Music</option>
              <option value="Media">Media</option>
              <option value="Welcoming Team">Welcoming Team</option>
              <option value="Technical">Technical</option>
              <option value="Stage management">Stage management</option>
              <option value="Ushering">Ushering</option>
              <option value="Venue department">Venue management</option>
              <option value="Protocol">Protocol</option>
              <option value="Decoration Team">Decoration Team</option>
              <option value="Security">Security</option>
              <option value="Transport">Transport</option>
              <option value="Welfare">Welfare</option>
              <option value="Children">Children</option>
              <option value="Equipment">Equipment</option>
              <option value="Leadership and Tech">Leadership and Tech</option>
              <option value="Wealthy Place">Wealthy Place</option>
              <option value="Medical">Medical</option>
              <option value="Light of Life">Light of Life</option>        
          </select>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="want_to_be_member"
                checked={formData.want_to_be_member}
                onChange={handleChange}
                className="mr-2"
              />
              I want to be a member
            </label>
          </div>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default NewcomerForm;