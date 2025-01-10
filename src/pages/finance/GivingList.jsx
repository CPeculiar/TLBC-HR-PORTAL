import React, { useState } from 'react';
import axios from 'axios';
import { Eye, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const GivingList = () => {
  const [records, setRecords] = useState([]);
  const [givings, setGivings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fetchGivings = async () => {
    setIsLoading(true);
    setError('');
    try {
        const url = 'https://tlbc-platform-api.onrender.com/api/finance/giving/admin/list/?limit=20';

        const response = await axios.get(url, { withCredentials: true });
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
      fetchGivings();  
    } catch (error) {
      setError(error.response?.data?.detail || error.response?.data?.church?.[0] || 'Failed to approve giving');
    } finally {
      clearMessagesAfterTimeout();
    }
  };

  const handleVerify = async (reference) => {
    setError('');
    try {
      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/finance/giving/${reference}/verify/`,
        { withCredentials: true }
      );
      
      if (response.data.confirmed) {
        setSuccess('Payment was successful');
      } else {
        setError("Payment hasn't been confirmed by PayStack");
      }
    } catch (error) {
      setError(error.response?.data?.detail || error.response?.data?.church?.[0] || 'Failed to verify payment');
    } finally {
      clearMessagesAfterTimeout();
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not confirmed';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy hh:mm a');
  };

   const handleViewFile = (files) => {
    if (files.length === 1) {
      window.open(files[0], '_blank');
    } else {
      setSelectedFiles(files);
      setIsModalOpen(true);
    }
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
        <div className="mx-auto max-w-full">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark dark:text-white">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="font-medium text-black dark:text-white">
                Church Giving Records
              </h3>
            <button
              onClick={fetchGivings}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto"
                disabled={isLoading}
              >
              {isLoading ? 'Loading...' : 'Fetch Giving List'}
            </button>
          </div>

          {error && (
              <Alert variant="destructive" className="m-4 text-red-500">
                <AlertDescription className="text-red-500 dark:font-bold">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="m-4 bg-green-100 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

         <div className="p-4 md:p-6.5">
              <div className="w-full overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border px-4 py-3 text-left">Type</th>
                      <th className="border px-4 py-3 text-left">Amount (₦)</th>
                      <th className="border px-4 py-3 text-left">Giver</th>
                      <th className="border px-4 py-3 text-center">Confirmed?</th>
                      <th className="border px-4 py-3 text-center">Auditor</th>
                      <th className="border px-4 py-3 text-left">Initiated At</th>
                      <th className="border px-4 py-3 text-left">Confirmation Date</th>
                      <th className="border px-4 py-3 text-center">Files</th>
                      <th className="border px-4 py-3 text-center">Verify</th>
                      <th className="border px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {givings?.results.map((giving) => (
                      <tr key={giving.reference} className="border-b hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="border px-4 py-3">{giving.type}</td>
                        <td className="border px-4 py-3">{giving.amount}</td>
                        <td className="border px-4 py-3">{giving.giver}</td>
                        <td className="border px-4 py-3 text-center">
                          {giving.confirmed ? 'Yes' : 'No'}
                        </td>
                        <td className="border px-4 py-3 text-center">
                          {giving.auditor ? giving.auditor.split('@')[0] : 'N/A'}
                        </td>
                        <td className="border px-4 py-3">{formatDateTime(giving.initiated_at)}</td>
                        <td className="border px-4 py-3">{formatDateTime(giving.confirmation_date)}</td>
                        <td className="border px-4 py-3 text-center">
                          {giving.files && giving.files.length > 0 ? (
                            <button
                              onClick={() => handleViewFile(giving.files)}
                              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Eye size={20} />
                            </button>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="border px-4 py-3 text-center">
                          <button
                            onClick={() => handleVerify(giving.reference)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <CheckCircle size={20} />
                          </button>
                        </td>
                        <td className="border px-4 py-3 text-center">
                          {giving.auditor ? (
                            <span className="text-green-600">Approved</span>
                          ) : (
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Files</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {selectedFiles.map((file, index) => (
              <button
                key={index}
                onClick={() => window.open(file, '_blank')}
                className="flex items-center gap-2 p-2 text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Eye size={20} />
                <span>File {index + 1}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GivingList;