import React, { useState } from 'react';
import axios from 'axios';
import { Eye, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const GivingList = () => {
  const [records, setRecords] = useState([]);
  const [givings, setGivings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchGivings = async () => {
    setIsLoading(true);
    setError('');
    try {
        const url = 'https://tlbc-platform-api.onrender.com/api/finance/giving/admin/list/?limit=20';

      const response = await axios.get(
        'https://tlbc-platform-api.onrender.com/api/finance/giving/admin/list/?limit=20',
        { withCredentials: true }
      );
    
      setGivings(response.data);
      setRecords(response.data);
      setCurrentPage(url);
 
    } catch (error) {
      setError('Failed to fetch giving list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (reference) => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(
        `https://tlbc-platform-api.onrender.com/api/finance/giving/admin/${reference}/`,
        {},
        { withCredentials: true }
      );
      setSuccess(response.data.message);
      // Refresh the list after successful approval
      fetchGivings();
   
    } catch (error) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data?.church) {
        setError(error.response.data.church[0]);
      } else {
        setError('Failed to approve giving');
      }
    } finally {
        clearMessagesAfterTimeout();
      }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not confirmed';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy hh:mm a');
  };

  const handleViewFile = (url) => {
    window.open(url, '_blank');
  };

  const clearMessagesAfterTimeout = () => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  };


  return (
    <>
     <Breadcrumb pageName="Church Giving Records" />

    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark dark:text-white">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
            <h3 className="font-medium text-black dark:text-white">
              Church Giving Records
            </h3>
            <button
              onClick={fetchGivings}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Fetch Giving List'}
            </button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4 text-red-500">
              <AlertDescription className='text-red-500 dark:font-bold'>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mx-6.5 mt-4 bg-green-100 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="p-6.5">
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Amount (₦)</th>
                    <th className="px-4 py-3 text-left">Giver</th>
                    <th className="px-4 py-3 text-center">Confirmed?</th>
                    <th className="px-4 py-3 text-center">Auditor</th>
                    <th className="px-4 py-3 text-left">Initiated At</th>
                    <th className="px-4 py-3 text-left">Confirmation Date</th>
                    <th className="px-4 py-3 text-center">Files</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {givings?.results.map((giving) => (
                    <tr key={giving.reference} className="border-b dark:border-gray-700">
                      <td className="px-4 py-3">{giving.type}</td>
                      <td className="px-4 py-3">{giving.amount}</td>
                      <td className="px-4 py-3">{giving.giver}</td>
                      <td className="px-4 py-3 text-center">
                        {giving.confirmed ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3">
                        {giving.auditor ? giving.auditor : 'N/A'}
                    </td>
                      <td className="px-4 py-3">{formatDateTime(giving.initiated_at)}</td>
                      <td className="px-4 py-3">{formatDateTime(giving.confirmation_date)}</td>
                      <td className="px-4 py-3 text-center">
                        {giving.files?.map((file, index) => (
                          <button
                            key={index}
                            onClick={() => handleViewFile(file)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye size={20} />
                          </button>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!giving.confirmed && (
                          <button
                            onClick={() => handleApprove(giving.reference)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            <div className="flex justify-between mt-4">
                <button
                  onClick={() => records.previous && fetchGivings(records.previous)}
                  disabled={!records.previous}
                  className={`px-4 py-2 rounded-md ${
                    records.previous
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => records.next && fetchGivings(records.next)}
                  disabled={!records.next}
                  className={`px-4 py-2 rounded-md ${
                    records.next
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>



          </div>
        </div>
      </div>
    </div>

    </>
  );
};

export default GivingList;