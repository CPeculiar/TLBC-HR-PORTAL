import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
// import Paystack from '@paystack/inline-js';

const Giving = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: 'TITHE',
    amount: '',
    church: '',
    callback_url: `${window.location.origin}/PaymentSuccess`
  });
  // const popup = new Paystack()

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log('Paystack script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      setError('Payment system initialization failed');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  
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
      [name]: value
    }));
    setError('');
  };

  const initializePayment = async (paymentData) => {
    try {
      if (typeof window.PaystackPop === 'undefined') {
        throw new Error('Paystack script not loaded');
      }

      const handler = window.PaystackPop.setup({
        key: 'pk_live_b9495327ded35c2603d7afa7399c2cb8cba2cb61',
        email: paymentData.email || 'chukwudipeculiar@gmail.com',
        amount: Number(formData.amount) * 100, // Convert to kobo
        currency: 'NGN',
        ref: paymentData.reference,
        access_code: paymentData.access_code,
        onClose: () => {
          setIsLoading(false);
          console.log('Payment window closed');
          navigate('/giving');
        },
      //  callback: handlePaymentCompletion
      });
      
      handler.openIframe();
    } catch (error) {
      console.error('Payment initialization error:', error);
      setError('Failed to initialize payment: ' + error.message);
      setIsLoading(false);
      navigate('/giving');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate("/");
        return;
      }

      // Initialize payment on your server
      const response = await axios.post(
        'https://tlbc-platform-api.onrender.com/api/finance/giving/payment/',
        formData,
        {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 && response.data) {
        // Initialize Paystack payment with the received data
        await initializePayment(response.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setError(errorMessage);
      navigate('/giving');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCompletion = (response) => {
    if (response.status === 'success') {
      // Navigate to success page with success status
      const params = new URLSearchParams({
        status: 'success',
        reference: response.reference
      });
      navigate(`/PaymentSuccess?${params.toString()}`);
    } else {
      // If payment failed, navigate back to giving page
      navigate('/giving');
    }
  };

  const handleDashboardNavigation = () => {
    if (userRole === 'admin' || userRole === 'superadmin') {
      navigate('/admindashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Give Online</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="TITHE">Tithe</option>
              <option value="OFFERING">Offering</option>
              <option value="PROJECT">Project</option>
              <option value="WELFARE">Welfare</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Church</label>
            <select
              name="church"
              value={formData.church}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
            <option value="" disabled>Select a church</option>
              {Object.entries(churchOptions).map(([label, value]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount (₦)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white p-2 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Proceed to Give'}
          </button>

          <button
              type="button"
              onClick={handleDashboardNavigation}
              className="flex items-center justify-center rounded bg-secondary hover:bg-secondary/90 py-3 px-6 font-medium text-white"
            >
              Back to Dashboard
            </button>
          </div>
          
        </form>
      </CardContent>
    </Card>
  );
};

export default Giving;