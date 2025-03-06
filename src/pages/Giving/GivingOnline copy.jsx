import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import Paystack from '@paystack/inline-js';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const GivingOnline = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [churches, setChurches] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const initialFormState = {
    type: 'STEWARDSHIP',
    amount: '',
    church: '',
    detail: '',
  };
   const [formData, setFormData] = useState(initialFormState);
 

  const popup = new Paystack()

  useEffect(() => {
    fetchChurches();
  }, []);

  const resetForm = () => {
    setFormData(initialFormState);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const fetchChurches = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const response = await axios.get('https://api.thelordsbrethrenchurch.org/api/churches/?limit=100', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      setChurches(response.data.results);
      setNextPage(response.data.next);
    } catch (error) {
      setError('Failed to fetch churches. Please try again.');
      console.error('Error fetching churches:', error);
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
    const userRole = localStorage.getItem('userRole');
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
        'https://api.thelordsbrethrenchurch.org/api/finance/giving/payment/',
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
        resetForm();

      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      // Enhanced error handling
      if (error.response?.data) {
        // Handle specific API error messages
        if (error.response.data.church) {
          setError(error.response.data.church[0]); // This will display "Church does not have a giving account"
        } else if (typeof error.response.data === 'object') {
          // Handle other field errors by taking the first error message found
          const firstErrorField = Object.keys(error.response.data)[0];
          if (firstErrorField && Array.isArray(error.response.data[firstErrorField])) {
            setError(error.response.data[firstErrorField][0]);
          } else {
            setError('An error occurred while processing your request.');
          }
        } else {
          setError(error.response.data.message || 'An error occurred while processing your request.');
        }
      } else {
        setError(error.message || 'An error occurred while processing your request.');
        navigate('/giving');
      }
    } finally {
      setIsLoading(false);
    }
  };

 
 
  return (
    <>
     <Breadcrumb pageName="Online Giving" />

    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center dark:text-black">Give Online</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 dark:text-black text-black">
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
              <option value="STEWARDSHIP">Stewardship</option>
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

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              name="detail"
              value={formData.detail}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Enter details about your giving"
              maxLength={30}
              required
            />
            <small>{30 - formData.detail.length} characters remaining</small>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white p-2 rounded hover:bg-blue-400 hover:font-bold disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Proceed to Give'}
          </button>

          <button
              type="button"
              onClick={handleDashboardNavigation}
              className="flex items-center justify-center rounded bg-secondary hover:bg-secondary/50 hover:font-bold py-3 px-6 font-medium text-white"
            >
              Back to Dashboard
            </button>
          </div>
          
          <div className='text-justify'>

           NB: If you have already transferred this money to the Church's account, please click <span className='text-blue-500 hover:underline hover:text-blue-300'> <Link to="/giveoffline">HERE</Link> </span> to upload 
           your receipt as proof of payment and also have the transaction recorded for you.  
          </div>
        </form>
      </CardContent>
    </Card>
    </>
  );
};

export default GivingOnline;