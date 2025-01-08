import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import Paystack from '@paystack/inline-js';

const Giving = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [churches, setChurches] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [formData, setFormData] = useState({
    type: 'TITHE',
    amount: '',
    church: '',
    // callback_url: handlePaymentCompletion
  });

  const popup = new Paystack()

  useEffect(() => {
    fetchChurches();
  }, []);

  const fetchChurches = async (url = 'https://tlbc-platform-api.onrender.com/api/churches/') => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });

      if (url === 'https://tlbc-platform-api.onrender.com/api/churches/') {
        setChurches(response.data.results);
      } else {
        setChurches(prev => [...prev, ...response.data.results]);
      }
      
      setNextPage(response.data.next);
    } catch (error) {
      setError('Failed to fetch churches. Please try again.');
      console.error('Error fetching churches:', error);
    }
  };

  const loadMoreChurches = async () => {
    if (nextPage && !isLoadingMore) {
      setIsLoadingMore(true);
      await fetchChurches(nextPage);
      setIsLoadingMore(false);
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
      setError('Payment failed. Please try again.');
      navigate('/giving');
    }
  };

  const handleDashboardNavigation = () => {
    const userRole = localStorage.getItem('userRole'); // Ensure you're storing user role in localStorage
    if (userRole === 'superadmin') {
      navigate('/admindashboard');
    } else {
      navigate('/dashboard');
    }
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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
        
        // const popup = new Paystack()
        popup.resumeTransaction(response.data.access_code)


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
             {churches.map((church) => (
                <option key={church.slug} value={church.slug}>
                  {church.name}
                </option>
              ))}
            </select>
            {nextPage && (
              <button
                type="button"
                onClick={loadMoreChurches}
                className="mt-2 text-sm text-primary hover:text-primary/90"
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Loading more...' : 'Load more churches'}
              </button>
            )}
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