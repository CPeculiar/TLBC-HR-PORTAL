import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const Giving = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    church: "",
    phone: "",
    purpose: "",
    amount: "",
    currency: "NGN",
    callback_url: `${window.location.origin}/PaymentStatus`,
  });

   // Get user role on component mount
   useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
      setUserRole(userInfo.role || '');
    } catch (error) {
      console.error('Error parsing user info:', error);
      setUserRole('');
    }
  }, []);

  // Function to handle navigation based on user role
  const handleDashboardNavigation = () => {
    if (userRole === 'admin' || userRole === 'superadmin') {
      navigate('/admindashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const churchOptions = {
    'TLBC Awka': 'tlbc-awka',
    'TLBC Ekwulobia': 'tlbc-ekwulobia',
    'TLBC Ihiala': 'tlbc-ihiala',
    'TLBC Nnewi': 'tlbc-nnewi',
    'TLBC Onitsha': 'tlbc-onitsha',
    'TLBCM Agulu': 'tlbcm-agulu',
    'TLBCM FUTO': 'tlbcm-futo',
    'TLBCM Igbariam': 'tlbcm-coou-igbariam',
    'TLBCM Mbaukwu': 'tlbcm-mbaukwu',
    'TLBCM Mgbakwu': 'tlbcm-mgbakwu',
    'TLBCM NAU': 'tlbcm-nau',
    'TLBCM Nekede': 'tlbcm-nekede',
    'TLBCM Oko': 'tlbcm-oko',
    'TLBCM Okofia': 'tlbcm-okofia',
    'TLBCM Uli': 'tlbcm-coou-uli',
    'TLBCM UNILAG': 'tlbcm-unilag',
    'TLTN Awka': 'tltn-awka',
    'TLTN Agulu': 'tltn-agulu',
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'church' ? churchOptions[value] || value : value
    }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate("/");
        return;
      }

      const response = await fetch(
        "https://lord-s-brethren-payment.onrender.com/api/partner/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(Object.values(data).flat().join(", "));
      }

      if (data.status === "success" && data.link) {
        window.location.href = data.link;
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      // setErrors({ general: error.message });
      setErrors({ general: 'Online Giving not yet opened' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Giving" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-xl text-black dark:text-white">
                Online Giving Form
              </h3>
            </div>

            <div className="p-6.5">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                  Welcome to our Online Giving form
                </h2>
                <p className="text-base text-black dark:text-white">
                  Please fill in your details below to proceed with your giving
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {errors.general && (
                  <div className="rounded-sm border border-red-500 bg-red-50 p-4 text-red-500">
                    {errors.general}
                  </div>
                )}

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded text-black dark:text-white border-stroke bg-transparent/5 py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Church
                  </label>
                  <select
                    name="church"
                    value={Object.keys(churchOptions).find(key => churchOptions[key] === formData.church) || ''}
                    onChange={handleInputChange}
                    className="w-full rounded text-black dark:text-white border-stroke bg-transparent/5 py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                    required
                  >
                    <option value="">Select your church</option>
                    {Object.keys(churchOptions).map((church) => (
                      <option key={church} value={church}>
                        {church}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded text-black dark:text-white border-stroke bg-transparent/5 py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Purpose of Giving
                  </label>
                  <input
                    type="text"
                    name="purpose"
                    placeholder="Enter the purpose of your giving"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full rounded text-black dark:text-white border-stroke bg-transparent/5 py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                    required
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full rounded text-black dark:text-white border-stroke bg-transparent/5 py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                      required
                    >
                      <option value="NGN">Naira</option>
                      <option value="USD">USD</option>
                      <option value="EUR">Euro</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div className="w-full md:w-1/2">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full rounded border-stroke text-black dark:text-white bg-transparent/5 py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center rounded bg-primary hover:bg-blue-500 py-3 px-6 font-medium text-gray hover:bg-opacity-90"
                  >
                    {isLoading ? "Processing..." : "Proceed to Give"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDashboardNavigation}
                    className="flex items-center justify-center rounded bg-secondary hover:bg-blue-300 py-3 px-6 font-medium text-gray hover:bg-opacity-90"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Giving;