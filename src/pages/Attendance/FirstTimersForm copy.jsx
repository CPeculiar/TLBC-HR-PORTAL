import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Download } from 'lucide-react';

const FirstTimersForm = () => {
  const location = useLocation();
  const refCode = location.state?.refCode || location.pathname.split('/form/')[1];
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    gender: '',
    birth_date: '',
    address: '',
    profile_picture: null,
    occupation: '',
    invited_by: '',
    want_to_be_member: true,
    marital_status: '',
    interested_department: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        profile_picture: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

     // Verify refCode before making API call
 if (!refCode) {
    setErrors({ message: 'Invalid reference code' });
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

      const response = await axios.patch(
        `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/newcomers/`,
        formDataToSubmit,
        {
          params: { ref_code: refCode }, 
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`, 
          },
          
        }
      );

      // Extract date from response message
      const match = response.data.message.match(/for '(.*?)'/);
      const dateString = match ? match[1] : 'this service';
      
      setSuccessMessage(`You have successfully marked your Attendance for ${dateString}`);
      alert("You have successfully marked your Attendance for this service");
    
      setFormData({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        gender: '',
        birth_date: '',
        address: '',
        profile_picture: null,
        occupation: '',
        invited_by: '',
        want_to_be_member: true,
        marital_status: '',
        interested_department: ''
      });
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ message: 'An unexpected error occurred. Please try again.' });
      }
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
              Newcomer Registration Form
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              {/* First Name */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  First Name
                </label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.first_name[0]}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Last Name
                </label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.last_name[0]}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Phone Number
                </label>
                <input
                  id="phone_number"
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone_number[0]}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>
                )}
              </div>

              {/* Gender */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-500">{errors.gender[0]}</p>
                )}
              </div>

              {/* Birth Date */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Birth Date
                </label>
                <input
                  id="birth_date"
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                {errors.birth_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.birth_date[0]}</p>
                )}
              </div>

              {/* Address */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address[0]}</p>
                )}
              </div>

              {/* Profile Picture */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Profile Picture
                </label>
                <input
                  id="profile_picture"
                  type="file"
                  name="profile_picture"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.profile_picture && (
                  <p className="mt-1 text-sm text-red-500">{errors.profile_picture[0]}</p>
                )}
              </div>

              {/* Occupation */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Occupation
                </label>
                <input
                  id="occupation"
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.occupation && (
                  <p className="mt-1 text-sm text-red-500">{errors.occupation[0]}</p>
                )}
              </div>

              {/* Invited By */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Invited By
                </label>
                <input
                  id="invited_by"
                  type="text"
                  name="invited_by"
                  value={formData.invited_by}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {errors.invited_by && (
                  <p className="mt-1 text-sm text-red-500">{errors.invited_by[0]}</p>
                )}
              </div>

              {/* Membership Interest */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Want to be a Member
                </label>
                <select
                  id="want_to_be_member"
                  name="want_to_be_member"
                  value={formData.want_to_be_member}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
                {errors.want_to_be_member && (
                  <p className="mt-1 text-sm text-red-500">{errors.want_to_be_member[0]}</p>
                )}
              </div>

              {/* Marital Status */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Marital Status
                </label>
                <select
                  id="marital_status"
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="" disabled>Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
                {errors.marital_status && (
                  <p className="mt-1 text-sm text-red-500">{errors.marital_status[0]}</p>
                )}
              </div>

              {/* Interested Department */}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Interested Department
                </label>
                <select
                  id="interested_department"
                  name="interested_department"
                  value={formData.interested_department}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" disabled>Select Department</option>
                  <option value="CHOIR">Choir</option>
                  <option value="MEDIA">Media</option>
                  <option value="PROTOCOL">Protocol</option>
                  <option value="USHERING">Ushering</option>
                  <option value="CHILDREN">Children Department</option>
                  <option value="DRAMA">Drama</option>
                  <option value="EVANGELISM">Evangelism</option>
                </select>
                {errors.interested_department && (
                  <p className="mt-1 text-sm text-red-500">{errors.interested_department[0]}</p>
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
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-500">
                  {successMessage}
                </div>
              )}

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
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
              >
                submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FirstTimersForm;