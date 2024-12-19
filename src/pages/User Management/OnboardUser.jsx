import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';


const OnboardUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [retypePasswordVisible, setRetypePasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    retypepassword: '',
    gender: "",
    phone_number: ""
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();



  const [error, setError] = useState('');  //remove later

   // Effect to check password match in real-time
   useEffect(() => {
    if (formData.password || formData.retypepassword) {
      validatePasswordMatch();
    }
  }, [formData.password, formData.retypepassword]);
  
  const validatePasswordMatch = () => {
    if (formData.password && formData.retypepassword) {
      if (formData.password !== formData.retypepassword) {
        setErrors(prev => ({
          ...prev,
          retypepassword: 'Passwords do not match'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.retypepassword;
          return newErrors;
        });
      }
    }
  };
  
  
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
   
  
   // Clear specific field error when user starts typing
   if (errors[name]) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
  };
  
  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  const toggleRetypePasswordVisibility = () => {
    setRetypePasswordVisible(!retypePasswordVisible);
  };
  
  const validateForm = (data) => {
    const newErrors = {};
    let isValid = true;
  
    if (!data.first_name) {
      newErrors.first_name = "First name is required";
      isValid = false;
    }
  
    if (!data.last_name) {
      newErrors.last_name = "Last name is required";
      isValid = false;
    }
  
    if (!data.username) {
      newErrors.username = "Username is required";
      isValid = false;
    }
  
    if (!data.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }
  
  
    if (!validatePhone(data.phone_number)) {
      newErrors.phone_number = "Invalid phone number";
      isValid = false;
    }
  
    if (!data.gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
    }

    if (!data.email) {
        newErrors.email = "Email is required";
        isValid = false;
    }
  
    setErrors(newErrors);
    return isValid;
  };
  
  
  
  const handleSubmit = async (e) => {
    e.preventDefault(); 
  
    if (!validateForm(formData)) {
      return;
    }
    setIsLoading(true);
  
    try {
      const response = await axios.post(
        "https://tlbc-platform-api.onrender.com/api/onboarding/",
        formData, // Payload goes here
        {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true, // Ensures cookies are sent with the request
        }
    );
  
    if (response.status === 201) {
        // Clear the form fields and show success message
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          username: "",
          password: "",
          retypepassword: "",
          gender: "",
          phone_number: "",
        });
        setSuccessMessage("New user added successfully.");
        setTimeout(() => setSuccessMessage(""), 5000); // Clear message after 5 seconds
      }
    } catch (error) {
      console.error("Error details:", error);
      setErrors({ submit: "Failed to add user. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const validatePhone = (phone) => {
    const re = /^\d{11}$/;
    return re.test(String(phone));
  };

  return (
    <>

<Breadcrumb pageName="Onboard a New User"  className="text-black dark:text-white"  />
            
<div className="p-4 md:p-6 2xl:p-10">
    <div className="mx-auto max-w-5xl">


        {/* Main Form Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Onboard a User
            </h3>
          </div>

          {successMessage && (
              <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-md px-6.5">
                {successMessage}
              </div>
            )}

          <form className="space-y-6 mb-8" method="post" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6.5">
                  <div className="relative">
                    <input
                      type="text"
                  id="first_name"
                  name="first_name"
                  placeholder="First Name"
                  onChange={handleInputChange}
                  value={formData.first_name}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />

    <span className="text-red-500 text-xs">{errors.first_name}</span>
  </div>

                  <div className="relative">
                    <input
                     type="text"
                      name="last_name"
                      placeholder="Last Name"
                      onChange={handleInputChange}
                      value={formData.last_name}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                    <span className="text-red-500 text-xs">{errors.last_name}</span>
                
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6.5">
                  <div className="relative">
                    <input
                        type="text"
                      name="username"
                      placeholder="Username"
                      onChange={handleInputChange}
                      value={formData.username}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />

    <span className="text-red-500 text-xs">{errors.username}</span>
  </div>


                  <div className="relative">
                  <input
                       type="email"
                        name="email"
                        placeholder="Email address"
                        onChange={handleInputChange}
                        value={formData.email}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />

                  </div>
                  <span className="text-red-500 text-xs">{errors.email}</span>
                </div>

 {/* ... password fields ... */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6.5">
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleInputChange}
                    value={formData.password}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  <span className="text-red-500 text-xs">{errors.password}</span>
                </div> 

                  <div className="relative">
                  <input
                       type={retypePasswordVisible ? "text" : "password"}
                        id="retypepassword"
                        name="retypepassword"
                        placeholder="Retype Password"
                        onChange={handleInputChange}
                        value={formData.retypepassword}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"                
                />
                 <button
                          type="button"
                          onClick={toggleRetypePasswordVisibility}
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
                    <span className="text-red-500 text-xs">{errors.retypepassword}</span>
              </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6.5">
                  <div>
                    <input
                       type="tel"
                        name="phone_number"
                        placeholder="Phone number"
                        onChange={handleInputChange}
                        value={formData.phone_number}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                         <span className="text-red-500 text-xs">
                  {errors.phone_number}
                </span>
                  </div>

                  <div className="relative">
                  <select
                  name="gender"
                  onChange={handleInputChange}
                  value={formData.gender}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                    <option disabled value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <span className="text-red-500 text-xs">{errors.gender}</span>
              </div>
                </div>

             
                <div className="mb-5">
                <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white bg-blue-600 hover:bg-blue-800 py-2 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary
            ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
  }`}>
          {isLoading ? "Onboarding..." : "Onboard"}
            </button>

            {errors.submit && (
              <div className="mt-4 text-center text-red-500">
                {errors.submit}
              </div>
            )}
                </div>


           
              </form>
          
        </div>
        </div>
        </div>

    
    
    
    
    
    
 </>
 
  )
}

export default OnboardUser