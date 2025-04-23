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

const CentralTopupManagement = () => {
  // State Variables
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [uploadFileReference, setUploadFileReference] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
  
    // Add new state for file upload
    const [uploadingFile, setUploadingFile] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
    // Add new state for pagination
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
    fetchTopups();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/central/accounts/?limit=30');
      setAccounts(response.data.results);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail ||'Failed to fetch accounts');
      setIsLoading(false);
    }
  };

 // Single fetch function that handles filtering client-side
const fetchTopups = async (url = 'https://tlbc-platform-api.onrender.com/api/finance/central/topup/list/') => {
  try {
    setIsLoading(true);
    const response = await axios.get(url);
    const allResults = response.data.results;
    
    // Store all results
    if (activeSection === 'topup-list') {
      setTopupList(allResults);
    } else if (activeSection === 'approved-topup-list') {
      // Filter for approved topups only
      setApprovedTopups(allResults.filter(topup => topup.status === 'APPROVED'));
    } else if (activeSection === 'declined-topup-list') {
      // Filter for declined topups only
      setDeclinedTopups(allResults.filter(topup => topup.status === 'DECLINED'));
    }
    
    // Update pagination based on API response
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

useEffect(() => {
  if (activeSection !== 'create-topup') {
    fetchTopups();
  }
}, [activeSection]);
 
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

    await axios.post('https://tlbc-platform-api.onrender.com/api/finance/central/topup/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    setSuccessModal({ message: 'TopUp request created successfully' });
    setSelectedAccount('');
    setTopupAmount('');
    setTopupPurpose('');
    setTopupFile(null);
    await fetchTopups();
  } catch (error) {
    setErrorMessage(error.response?.data?.detail || 'Failed to create topup request');
  } finally {
    setIsLoading(false);
  }
};

const handleTopupAction = async (reference, action) => {
  try {
    setIsLoading(true);
    await axios.post(`https://tlbc-platform-api.onrender.com/api/finance/central/topup/${reference}/${action}/`);
    setSuccessModal({ message: `TopUp ${action}ed successfully` });
    await fetchTopups();
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
if (!data || data.length === 0) {
  return (
    <Card className="mt-4 dark:bg-boxdark">
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
  <div className="overflow-x-auto rounded-lg shadow dark:bg-boxdark">
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
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 dark:bg-boxdark">
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
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/central/topup/${reference}/approve/`;
      } else if (type === 'decline') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/central/topup/${reference}/decline/`;
      }

      const response = await axios.post(endpoint);

      setSuccessModal({
        message:
          response.data.message || 'TopUp status updated successfully',
      });

      // Refresh funds list
      if (activeSection === 'topup-list') {
        await fetchTopups();
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
      
  
    const handleViewFile = (files) => {
      if (!files || files.length === 0) return;
  
      if (files.length === 1) {
        window.open(files[0], '_blank');
      } else {
        setSelectedFiles(files);
        setIsViewModalOpen(true);
      }
    };

  // Main Render - Update sidebar rendering
  return (
    <>
      <div className="min-h-screen p-4">
      {isLoading && <div>Loading...</div>}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}

        <Breadcrumb
          pageName="Central TopUp Management"
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
        <Card className='dark:text-black'>
          <CardHeader>
            <CardTitle>Create TopUp Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-black"
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

export default CentralTopupManagement;