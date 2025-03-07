import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Eye,
  X,
  FileText,
  PlusCircle,
  CheckCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const TopUpManagement = () => {
  // State variables
  const [activeSection, setActiveSection] = useState('create-topup');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [topupPurpose, setTopupPurpose] = useState('');
  const [topupFile, setTopupFile] = useState(null); 
  const [topupList, setTopupList] = useState([]);
  const [approvedTopups, setApprovedTopups] = useState([]);
  const [declinedTopups, setDeclinedTopups] = useState([]);
  
  const [successModal, setSuccessModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [uploadFileReference, setUploadFileReference] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Add new state for file upload
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Add new state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    limit: 10,
    next: null,
    previous: null
  });

   // Fetch initial data
   useEffect(() => {
    fetchAccounts();
    fetchTopupList();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/?limit=30');
      setAccounts(response.data.results);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail ||'Failed to fetch accounts');
      setIsLoading(false);
    }
  };

   // Single fetch function that handles filtering client-side
   const fetchTopups = async (url = 'https://tlbc-platform-api.onrender.com/api/finance/topup/list/') => {
    try {
      setIsLoading(true);
      const response = await axios.get(url);
      const allResults = response.data.results;
      
      // Filter results by status
      setTopupList(allResults);
      setApprovedTopups(allResults.filter(topup => topup.status === 'APPROVED'));
      setDeclinedTopups(allResults.filter(topup => topup.status === 'DECLINED'));
      
      // Update pagination based on filtered results
      setPagination({
        count: response.data.count,
        limit: response.data.limit,
        next: response.data.next,
        previous: response.data.previous
      });
      
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to fetch topup data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection !== 'create-topup') {
      fetchTopups();
    }
  }, [activeSection]);


  const fetchTopupList = async (url = 'https://tlbc-platform-api.onrender.com/api/finance/topup/list/?limit=3') => {
    try {
      setIsLoading(true);
      const response = await axios.get(url);
      setTopupList(response.data.results);
      setPagination({
        count: response.data.count,
        limit: response.data.limit,
        next: response.data.next,
        previous: response.data.previous
      });
      setIsLoading(false);
    } catch (error) {
      if (error.response?.status === 500) {
        setErrorMessage('Unable to process. Contact Support.');
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else {
        setErrorMessage('Failed to upload file. Please try again.');
      }
      setErrorMessage('Failed to fetch topup list');
      setIsLoading(false);
    }
  };
  
  const fetchApprovedTopups = async (url = 'https://tlbc-platform-api.onrender.com/api/finance/topup/list/?status=APPROVED') => {
    try {
      setIsLoading(true);
      const response = await axios.get(url);
      setApprovedTopups(response.data.results);
      setPagination({
        count: response.data.count,
        limit: response.data.limit,
        next: response.data.next,
        previous: response.data.previous
      });
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to fetch approved topups');
      setIsLoading(false);
    }
  };

  const fetchDeclinedTopups = async (url = 'https://tlbc-platform-api.onrender.com/api/finance/topup/list/?status=DECLINED') => {
    try {
      setIsLoading(true);
      const response = await axios.get(url);
      setDeclinedTopups(response.data.results);
      setPagination({
        count: response.data.count,
        limit: response.data.limit,
        next: response.data.next,
        previous: response.data.previous
      });
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to fetch declined topups');
      setIsLoading(false);
    }
  };

  // Update useEffect to handle different sections
  useEffect(() => {
    const fetchData = async () => {
      switch (activeSection) {
        case 'topup-list':
          await fetchTopupList();
          break;
        case 'approved-topup-list':
          await fetchApprovedTopups();
          break;
        case 'declined-topup-list':
          await fetchDeclinedTopups();
          break;
        default:
          break;
      }
    };

    if (activeSection !== 'create-topup') {
      fetchData();
    }
  }, [activeSection]);

  // Updated pagination handler
  const handlePagination = async (url) => {
    if (!url) return;
    await fetchTopups(url);
  };

  const handleCreateTopup = async () => {
    if (!selectedAccount || !topupAmount || !topupPurpose) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('account', selectedAccount);
      formData.append('amount', topupAmount);
      formData.append('purpose', topupPurpose);
      if (topupFile) formData.append('files', topupFile);

      await axios.post('https://tlbc-platform-api.onrender.com/api/finance/topup/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccessModal({ message: 'TopUp request created successfully' });
      setSelectedAccount('');
      setTopupAmount('');
      setTopupPurpose('');
      setTopupFile(null);
      await fetchTopupList();
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Failed to create topup request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopupAction = async (reference, action) => {
    try {
      setIsLoading(true);
      await axios.post(`https://tlbc-platform-api.onrender.com/api/finance/topup/${reference}/${action}/`);
      setSuccessModal({ message: `TopUp ${action}ed successfully` });
      await fetchTopupList();
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || `Failed to ${action} topup`);


      if (error.response?.status === 500) {
        setErrorMessage('Unable to process. Contact Support.');
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else {
        setErrorMessage(`Failed to ${action} topup`);
      }
    } finally {
      setIsLoading(false);
      setUploadFileReference(null);
      setUploadingFile(null);
    }
  };

// Render functions
const renderTable = (data) => {
  if (!data.length) {
    return (
      <Card className="mt-4">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">No records found</p>
          <p className="text-sm text-gray-500">
            {activeSection === 'approved-topup-list' 
              ? 'No approved topup requests yet'
              : activeSection === 'declined-topup-list'
              ? 'No declined topup requests yet'
              : 'No topup requests found'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const columns = [
    { key: 'initiated_at', label: 'Date' },
    { key: 'initiator', label: 'Initiator' },
    { key: 'account', label: 'Account' },
    { key: 'amount', label: 'Amount' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'status', label: 'Status' },
    { key: 'files', label: 'Files' },
    { key: 'actions', label: 'Actions' }
  ];

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map(item => (
            <tr key={item.reference}>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(item.initiated_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">{item.initiator?.split('(')[0]}</td>
              <td className="px-6 py-4">{item.account.account_name}</td>
              <td className="px-6 py-4">₦{parseFloat(item.amount).toLocaleString()}</td>
              <td className="px-6 py-4">{item.purpose}</td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${item.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                  item.status === 'DECLINED' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {item.files?.length > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewFile(item.files)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                ) : 'No files'}
              </td>
              <td className="px-6 py-4">
                <DropdownMenu
                  trigger={
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                >
                  <DropdownItem
                    onClick={() => handleTopupAction(item.reference, 'approve')}
                    disabled={item.status !== 'PROCESSING'}
                    className={`${item.status !== 'PROCESSING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Approve
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => handleTopupAction(item.reference, 'decline')}
                    disabled={item.status !== 'PROCESSING'}
                    className={`${item.status !== 'PROCESSING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Decline
                  </DropdownItem>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Pagination controls
const PaginationControls = () => {
  const currentData = 
    activeSection === 'approved-topup-list' ? approvedTopups :
    activeSection === 'declined-topup-list' ? declinedTopups :
    topupList;

  const showPagination = currentData.length > 0 && pagination.count > pagination.limit;

  if (!showPagination) return null;

  return (
    <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <Button
        onClick={() => handlePagination(pagination.previous)}
        disabled={!pagination.previous}
        variant="outline"
        size="sm"
        className={`${!pagination.previous && 'opacity-50 cursor-not-allowed'}`}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Showing {currentData.length} of {pagination.count} entries
      </span>
      <Button
        onClick={() => handlePagination(pagination.next)}
        disabled={!pagination.next}
        variant="outline"
        size="sm"
        className={`${!pagination.next && 'opacity-50 cursor-not-allowed'}`}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};



  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 7000);
      return () => clearTimeout(timer);
    }

    if (successModal && successModal.type !== 'permanent') {
      const timer = setTimeout(() => {
        setSuccessModal(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successModal]);
       

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        if (activeSection === 'incoming-remittance') {
          await fetchIncomingRemittances();
        } else if (activeSection === 'outgoing-remittance') {
          await fetchOutgoingRemittances();
        }
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch initial data');
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [activeSection]);

  // Remittance Processing Handlers
  const handleTopUpProcessing = async (reference, type) => {
    try {
      setIsLoading(true);
      setError(null);
      setErrorMessage(null);

      let endpoint = '';
      if (type === 'approve') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/topup/${reference}/approve/`;
      } else if (type === 'decline') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/topup/${reference}/decline/`;
      }

      const response = await axios.post(endpoint);

      setSuccessModal({
        message:
          response.data.message || 'TopUp status updated successfully',
      });

      // Refresh funds list
      if (activeSection === 'topup-list') {
        await fetchTopupList();
      } else {
        await fetchAccounts();
      }   

      setIsLoading(false);
    } catch (error) {
      // setErrorMessage(error.response?.data?.detail || 'Failed to update remittance status');
      setSuccessModal(null);
      if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else if (error.response.status === 500) {
        setErrorMessage('Failed to process. Contact Support Team.');
      } else {
        setErrorMessage('Failed to process. Please try again');
      }
      setIsLoading(false);
    }
  };






  // Clear error message when user starts typing
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);


  // Helper function to extract name from email
  const extractName = (fullString) => {
    if (!fullString) return 'N/A';
    return fullString.split('(')[0].trim();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };


  const TableComponent = ({ data, columns, isLoading }) => (
    <div className="w-full overflow-x-auto rounded-lg border border-stroke dark:border-strokedark">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-boxdark-2">
            {columns.map((column, index) => (
              <th key={index} className="p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="p-4">
                <LoadingSpinner />
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className="border-t border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-boxdark-2 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-4 text-sm text-gray-600 dark:text-gray-300">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

   // Enhanced Loading Component
   const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  );



  // Render Create Topup Section
  const renderCreateTopup = () => (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-boxdark shadow-md rounded-lg p-6 border border-stroke dark:border-strokedark">
      <h2 className="text-2xl mb-6 font-bold text-blue-600 dark:text-blue-400 text-center flex items-center justify-center">
        <PlusCircle className="mr-2" /> Create TopUp Request
      </h2>

      {/* Error Message Display */}
      {errorMessage && (
        <div
          className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        <select
          value={selectedAccount} 
          onChange={(e) => {
              setSelectedAccount(e.target.value);
              setErrorMessage(null);
            }}
          className="w-full p-3 border rounded-md border-stroke bg-transparent text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="" disabled>Select Account</option>
          {accounts.map(account => (
              <option key={account.code} value={account.code}>
                {account.account_name}
              </option>
          ))}
        </select>

        <select
          value={selectedBenefactor}
          onChange={(e) => {
            setSelectedBenefactor(e.target.value);
            setErrorMessage(null); // Clear error when user starts selecting
          }}
          className="w-full p-3 border rounded-md border-stroke bg-transparent text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">Select Benefactor Church</option>
          {churches.map((church) => (
            <option key={church.slug} value={church.slug}>
              {church.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={topupAmount}
          onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setTopupAmount(value);
                setErrorMessage(null);
          }}
          className="w-full p-3 border rounded-md border-stroke bg-transparent text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

        <input
          type="text"
          placeholder="Purpose"
          value={topupPurpose}
            onChange={(e) => {
              setTopupPurpose(e.target.value);
              setErrorMessage(null);
           }}
          className="w-full p-3 border rounded-md border-stroke bg-transparent text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />

        <div className="flex items-center space-x-4">
          <input
            type="file"
            onChange={(e) => setTopupFile(e.target.files[0])}
            className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
          />
          <label 
            htmlFor="file-upload"
            className="w-full flex items-center justify-center p-3 border-2 border-dashed border-blue-500 rounded-lg cursor-pointer hover:border-blue-600 transition-all dark:border-blue-400"
           >
            <Upload className="mr-2" size={18} />
               {topupFile ? topupFile.name : 'Upload Supporting Document'}
           </label>
        </div>

        <button
          onClick={handleCreateTopupRequest}
          disabled={isLoading}
          className={`w-full text-white p-3 rounded-md transition-colors flex items-center justify-center ${
            isLoading
              ? 'bg-blue-300 dark:bg-blue-700 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
          }`}
        >
          <PlusCircle className="mr-2" />{' '}
          {isLoading ? 'Processing...' : 'Create Remittance Request'}
        </button>
      </div>
    </div>
  );

    const handleCreateTopupRequest = async () => {
      setErrorMessage(null);
  
      if (!selectedAccount) {
        setErrorMessage('Please select an account');
        return;
      }
      if (!topupAmount || isNaN(parseFloat(topupAmount))) {
        setErrorMessage('Please enter a valid amount');
        return;
      }
      if (!topupPurpose) {
        setErrorMessage('Please enter a purpose for the topup');
        return;
      }
  
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('account', selectedAccount);
        formData.append('amount', topupAmount);
        formData.append('purpose', topupPurpose);
        
        if (topupFile) {
          formData.append('files', topupFile);
        }
  
        const response = await axios.post(
          'https://tlbc-platform-api.onrender.com/api/finance/topup/', 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
  
        setSuccessModal({
          type: 'permanent',
          message: 'Topup request successfully created',
          details: {
            accountName: accounts.find(acc => acc.code === selectedAccount)?.account_name,
            amount: topupAmount,
            purpose: topupPurpose
          }
        });
  
        // Reset form
        setSelectedAccount('');
        setTopupAmount('');
        setTopupPurpose('');
        setTopupFile(null);
        setIsLoading(false);
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Failed to create topup request';
        setErrorMessage(errorMessage);
        setIsLoading(false);
      }
    };
    
        // File Upload Handler
  const handleFileUpload = async (reference, file) => {
    try {
      setIsLoading(true);
      setUploadError('');

      const formData = new FormData();
      // formData.append('files', uploadFileReference.file);
      formData.append('files', file);

      // uploadFileReference.reference

      const response = await axios.patch(
        `https://tlbc-platform-api.onrender.com/api/finance/topup/${reference}/upload/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setSuccessModal({
        message: 'File uploaded successfully',
      });

      // Refresh the funds list
      if (activeSection === 'topup-list') {
        await fetchTopupList();
      } else {
        await fetchAccounts();
      }

      await fetchTopupList();

      setIsLoading(false);
    } catch (error) {
      // setErrorMessage('Failed to upload file');
      if (error.response?.status === 500) {
        setErrorMessage('Unable to process. Contact Support.');
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else {
        setErrorMessage('Failed to upload file. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setUploadFileReference(null);
      setUploadingFile(null);
    }
  };

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
  }

  const handleViewFile = (files) => {
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      window.open(files[0], '_blank');
    } else {
      setSelectedFiles(files);
      setIsViewModalOpen(true);
    }
  };


  // File Viewing Modal Component
  const FileViewModal = () => (
    <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle>View Files</DialogTitle>
          <div className='flex justify-end mb-2'>
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:ring-offset-gray-950 dark:focus:ring-gray-800 dark:data-[state=open]:bg-gray-800"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </button>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="text-sm font-medium truncate max-w-[200px]">
                File {index + 1}
              </span>
              <Button
                onClick={() => window.open(file, '_blank')}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                <Eye className="h-4 w-4 mr-2" /> View
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Style configuration
  const tableHeaderClass =
    'border px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray/70 uppercase tracking-wider';
  const tableCellClass =
    'border px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray/70 text-center';

  // Define table columns based on section
  const getTableColumns = (section) => {
    const baseColumns = [
      { key: 'initiated_date', label: 'Date' },
      { key: 'initiated_time', label: 'Time' },
      { key: 'initiator', label: 'Request Created by' },
      { key: 'account_name', label: 'Account Name' },
      { key: 'amount', label: 'Amount' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'status', label: 'Status' },
      { key: 'auditor', label: 'Approved By' },
      { key: 'approved_at', label: 'Approved On' },
      { key: 'files', label: 'Documents' },
      { key: 'uploads', label: 'Uploads' },
      { key: 'action', label: 'Action' },
    ];

    return baseColumns;
  };

  // Render table cell content
  const renderTableCell = (column, topup) => {
    switch (column.key) {
      case 'initiated_date':
        return formatDate(topup.initiated_at);

      case 'initiated_time':
        return formatTime(topup.initiated_at);

        case 'initiator':
          return topup.initiator
            ? topup.initiator.split('(')[0].trim()
            : 'N/A';

        case 'account_name':
        return topup.account.account_name;
        
      case 'amount':
        return `₦${Number(topup.amount).toFixed(2)}`;

      case 'purpose':
        return topup.purpose;

      case 'status':
        return (
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              topup.status === 'APPROVED'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : topup.status === 'DECLINED'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
            }`}
          >
            {topup.status}
          </span>
        );

      case 'auditor':
        return topup.auditor ? topup.auditor.split('(')[0] : 'N/A';

      case 'approved_at':
        return topup.approved_at
          ? formatDate(topup.approved_at)
          : 'N/A';

      case 'files':
        return topup.files && topup.files.length > 0 ? (
          <button
            onClick={() => handleViewFile(topup.files)}
            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Eye size={20} />
          </button>
        ) : (
          <span>N/A</span>
        );

        case 'uploads':
        return (
          <div className="flex justify-center">
            <input
              type="file"
              id={`file-upload-${topup.reference}`}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(topup.reference, e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor={`file-upload-${topup.reference}`}
              className="cursor-pointer p-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Upload size={20} />
            </label>
          </div>
        );

        case 'actions':
        const handleDeclineClick = () => {
          if (!['APPROVED', 'DECLINED' ].includes(topup.status)) {
            handleTopUpProcessing(topup.reference, 'decline');
          }
        };
      
        const handleApproveClick = () => {
          if (!['APPROVED', 'DECLINED' ].includes(topup.status)) {
            handleTopUpProcessing(fund.reference, 'approve');
          }
        };
      
        const isDeclineDisabled = ['APPROVED', 'DECLINED' ].includes(topup.status);
        const isApprovedDisabled = ['APPROVED', 'DECLINED'].includes(topup.status);

        return (
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
          >
            <DropdownItem 
            onClick={handleDeclineClick}
            disabled={isDeclineDisabled}
            className={`${
          isDeclineDisabled 
            ? 'opacity-50 cursor-not-allowed pointer-events-none' 
            : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
            >
              Decline request
            </DropdownItem>
            <DropdownItem 
            onClick={handleApproveClick}
        disabled={isApprovedDisabled}
        className={`${
          isApprovedDisabled
            ? 'opacity-50 cursor-not-allowed pointer-events-none' 
            : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
            >
              Approve request
            </DropdownItem>
          </DropdownMenu>
        );
      
      default:
        return null;
    }
  };

  // Error and Success Messages
  const renderMessages = () => (
    <>
      {errorMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-4">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {successModal && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <span>{successModal.message}</span>
            <button onClick={() => setSuccessModal(null)} className="ml-4">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );

  // Main Render - Update sidebar rendering
  return (
    <>
      <div className="min-h-screen p-4">
      {isLoading && <div>Loading...</div>}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}

        <Breadcrumb
          pageName="TopUp Management"
          className="text-black dark:text-white p-4 lg:px-8"
        />

<div className="mb-6 flex flex-wrap gap-2">
        {['create-topup', 'topup-list', 'approved-topup-list', 'declined-topup-list'].map((section) => (
          <Button
            key={section}
            onClick={() => setActiveSection(section)}
            variant={activeSection === section ? 'default' : 'outline'}
          >
            {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Button>
        ))}
      </div>

      {activeSection === 'create-topup' && (
        <Card>
          <CardHeader>
            <CardTitle>Create TopUp Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800"
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account.code} value={account.code}>
                    {account.account_name}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Amount"
                className="w-full p-2 border rounded dark:bg-gray-800"
              />
              
              <input
                type="text"
                value={topupPurpose}
                onChange={(e) => setTopupPurpose(e.target.value)}
                placeholder="Purpose"
                className="w-full p-2 border rounded dark:bg-gray-800"
              />
              
              <div className="border-2 border-dashed p-4 rounded-lg text-center">
                <input
                  type="file"
                  onChange={(e) => setTopupFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm text-gray-600 dark:text-gray-400">
                    {topupFile ? topupFile.name : 'Upload supporting document'}
                  </span>
                </label>
              </div>
              
              <Button
                onClick={handleCreateTopup}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating...' : 'Create TopUp Request'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

       {activeSection === 'topup-list' && renderTable(topupList)}
      {activeSection === 'approved-topup-list' && renderTable(approvedTopups)}
      {activeSection === 'declined-topup-list' && renderTable(declinedTopups)}

      {activeSection !== 'create-topup' && <PaginationControls />}

      {/* File View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Files</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {selectedFiles.map((file, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => window.open(file, '_blank')}
              >
                View File {index + 1}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded flex items-center shadow-lg">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-4">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {successModal && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-lg">
          <span>{successModal.message}</span>
          <button onClick={() => setSuccessModal(null)} className="ml-4">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>

    </>
  );
};

export default TopUpManagement;
