import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const GiveOffline = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [churches, setChurches] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const initialFormState = {
    type: 'STEWARDSHIP',
    amount: '',
    church: '',
    detail: '',
    files: []
  };
  const [formData, setFormData] = useState(initialFormState);


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

       const response = await axios.get('https://tlbc-platform-api.onrender.com/api/churches/?limit=25', {
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFileError('');

    const invalidFiles = files.filter(file => {
      const isValidType = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(file.type);
      
      const isValidSize = file.size <= 3 * 1024 * 1024; // 3MB
      return !isValidType || !isValidSize;
    });

    if (invalidFiles.length > 0) {
      setFileError('Invalid file(s). Please upload images, PDF, or Word documents under 3MB.');
      e.target.value = '';
      return;
    }

    setFormData(prev => ({
      ...prev,
      files: files
    }));
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

      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('church', formData.church);
      formDataToSend.append('detail', formData.detail);
      formData.files.forEach(file => {
        formDataToSend.append('files', file);
      });


      // Initialize payment on your server
      const response = await axios.post(
        'https://tlbc-platform-api.onrender.com/api/finance/giving/',
        formDataToSend,
        {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
           'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 201 && response.data) {
        alert('Transaction submitted successfully');
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
      }
    } finally {
      setIsLoading(false);
    }
  };

 
 
  return (
    <>
    <Breadcrumb pageName="Giving" />

    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Record your Giving Here</CardTitle>
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

          <div>
            <label className="block text-sm font-medium mb-1">Upload Files</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              accept=".pdf,.doc,.docx,image/*"
              multiple
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: Images, PDF, Word documents (Max 3MB)
            </p>
            {fileError && (
              <p className="text-xs text-red-500 mt-1">{fileError}</p>
            )}
          </div>


          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white p-2 rounded hover:bg-blue-400 hover:font-bold disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>

          <button
              type="button"
              onClick={handleDashboardNavigation}
              className="flex items-center justify-center rounded bg-secondary hover:bg-secondary/50 hover:font-bold py-3 px-6 font-medium text-white"
            >
              Back to Dashboard
            </button>
          </div>
          
          
        </form>
      </CardContent>
    </Card>
    </>
  );
};

export default GiveOffline;