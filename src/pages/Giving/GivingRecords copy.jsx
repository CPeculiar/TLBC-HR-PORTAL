import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const GivingRecords = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchRecords = async (url = 'https://tlbc-platform-api.onrender.com/api/finance/giving/list/?limit=20') => {
    setIsLoading(true);
    try {
      const response = await axios.get(url, { withCredentials: true });
      setRecords(response.data);
      setCurrentPage(url);
    } catch (error) {
      setError('Failed to fetch records');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecordDetails = async (reference) => {
    try {
      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/finance/giving/${reference}/`,
        { withCredentials: true }
      );
      setSelectedRecord(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      setError('Failed to fetch record details');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');
    setIsLoading(true);

    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }

    if (selectedFile.size > 3 * 1024 * 1024) {
      setUploadError('File size must not exceed 3MB');
      return;
    }

    const formData = new FormData();
    formData.append('files', selectedFile);

    try {
      await axios.patch(
        `https://tlbc-platform-api.onrender.com/api/finance/giving/${selectedRecord.reference}/upload/`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
       setUploadSuccess('File uploaded successfully!');
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadSuccess('');
        fetchRecords(currentPage);
      }, 2000);
    } catch (error) {
        if (error.response?.data) {
            // Extract the first error message from the response
            const errorData = error.response.data;
            const firstError = Object.values(errorData)[0]?.[0];
            setUploadError(firstError || 'Failed to upload file');
          } else {
            setUploadError('Failed to upload file');
          }
        } finally {
            setIsLoading(false);
          }
      };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not confirmed';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy hh:mm a');
  };

  return (
    <>
      <Breadcrumb pageName="Giving Records" className="text-black dark:text-white" />

      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
              <h3 className="font-medium text-black dark:text-white">
                My Giving Records
              </h3>
              <button
                onClick={() => fetchRecords()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                Fetch My Giving Records
              </button>
            </div>

            {error && (
              <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md mx-6.5">
                {error}
              </div>
            )}

            <div className="p-6.5">
              <div className="w-full overflow-x-auto">
                <table className="w-full table-auto dark:text-white">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Amount (₦)</th>
                      <th className="px-4 py-3 text-left">Church</th>
                      <th className="px-4 py-3 text-left">Details</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-center">Confirmed</th>
                      <th className="px-4 py-3 text-center">Upload</th>
                      <th className="px-4 py-3 text-center">View</th>
                    </tr>
                  </thead>
                  {records.results?.length > 0 ? (
                  <tbody>
                    {records.results?.map((record) => (
                      <tr key={record.reference} className="border-b dark:border-gray/50">
                        <td className="px-4 py-3">{record.type}</td>
                        <td className="px-4 py-3">{record.amount}</td>
                        <td className="px-4 py-3">{record.church}</td>
                        <td className="px-4 py-3">{record.detail ? record.detail : 'N/A'}</td>
                        <td className="px-4 py-3">{formatDateTime(record.initiated_at)}</td>
                        <td className="px-4 py-3 text-center">
                          {record.confirmed ? 'Yes' : 'No'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowUploadModal(true);
                              setUploadError('');
                              setUploadSuccess('');
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Upload size={20} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => fetchRecordDetails(record.reference)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                <tbody>
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-black/70 dark:text-white">
                      You do not have any record of giving so far in the system
                    </td>
                  </tr>
                </tbody>
              )}
                </table>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => records.previous && fetchRecords(records.previous)}
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
                  onClick={() => records.next && fetchRecords(records.next)}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-md w-full mx-4 dark:text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upload Document</h3>
              <button 
                onClick={() => {
                    setShowUploadModal(false);
                  setSelectedFile(null);
                  setUploadError('');
                  setUploadSuccess('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            {uploadError && (
              <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
                {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-md">
                {uploadSuccess}
              </div>
            )}
            <form onSubmit={handleFileUpload}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mb-4 w-full"
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadError('');
                    setUploadSuccess('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-3xl w-full mx-4 dark:text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Giving Record Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <table className="w-full mb-4">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Type</td>
                  <td>{selectedRecord.type}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Amount</td>
                  <td>{selectedRecord.amount}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Church</td>
                  <td>{selectedRecord.church}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Confirmed</td>
                  <td>{selectedRecord.confirmed ? 'Yes' : 'No'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Initiated At</td>
                  <td>{formatDateTime(selectedRecord.initiated_at)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Confirmation Date</td>
                  <td>{selectedRecord.confirmation_date ? formatDateTime(selectedRecord.confirmation_date) : 'Not confirmed'}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Files</td>
                  <td>
                    {selectedRecord.files?.map((file, index) => (
                      <a
                        key={index}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-4"
                      >
                        <Eye size={20} className="mr-1" />
                        View File {index + 1}
                      </a>
                    ))}
                    {(!selectedRecord.files || selectedRecord.files.length === 0) && 'No files uploaded'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default GivingRecords;