import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Menu, X, FileText, PlusCircle, CheckCircle, XCircle, Upload, RefreshCw, ChevronLeft, ChevronRight, MoreVertical, Eye } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle} from '../../components/ui/dialog';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from "../../components/ui/alert";

const ExpensesManagement = () => {
  // State variables
  const [activeSection, setActiveSection] = useState('create-expense');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePurpose, setExpensePurpose] = useState('');
  const [expenseFile, setExpenseFile] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const [successModal, setSuccessModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

   const [approvedExpenses, setApprovedExpenses] = useState([]);
   const [declinedExpenses, setDeclinedExpenses] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [uploadModal, setUploadModal] = useState(null);
   const [uploadFile, setUploadFile] = useState(null);
   
  //  const [pagination, setPagination] = useState({});

    const [error, setError] = useState('');
     const [selectedFiles, setSelectedFiles] = useState([]);
   
     // Add new state for file upload
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

  {/*Fetch initial data*/}
    useEffect(() => {
      fetchAccounts();
    fetchExpensesList();
    }, []);


    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/?limit=30');
        setAccounts(response.data.results);
      } catch (error) {
        setErrorMessage(error.response?.data?.detail ||'Failed to fetch accounts');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchExpensesList = async (
      url = 'https://tlbc-platform-api.onrender.com/api/finance/expense/list/?limit=10', ) => {
      try {
        setIsLoading(true);
        const response = await axios.get(url);
        const results = response.data.results;

        setExpensesList(response.data.results);

          // These lines are critical
    setApprovedExpenses(response.data.results.filter(item => item.status === 'APPROVED'));
    setDeclinedExpenses(response.data.results.filter(item => item.status === 'DECLINED'));
   

    // setIsLoading(false);

    //     setTotalPages(Math.ceil(response.data.count / response.data.limit));
    //     setNextPageUrl(response.data.next);
    //     setPrevPageUrl(response.data.previous);

    //     const allResults = response.data.results;
              
        setPagination({
          count: response.data.count,
          limit: response.data.limit,
          next: response.data.next,
          previous: response.data.previous
        });
   
      } catch (error) {
       // Improved error handling
    if (error.response?.status === 500) {
      setErrorMessage('Server error. Please contact support.');
    } else if (error.response?.data?.detail) {
      setErrorMessage(error.response.data.detail);
    } else if (error.response?.data?.non_field_errors) {
      setErrorMessage(error.response.data.non_field_errors[0]);
    } else {
      setErrorMessage('Failed to fetch expenses. Please try again.');
    }
      } finally {
        setIsLoading(false);
      }
    };
 
     useEffect(() => {
          fetchExpensesList();
      }, [activeSection]);
 

  const handleCreateExpenses = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedAccount) {
      setErrorMessage('Please select an account');
      return;
    }
    if (!expenseAmount || isNaN(parseFloat(expenseAmount))) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    if (!expensePurpose) {
      setErrorMessage('Please enter a purpose for the expenses');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('account', selectedAccount);
      formData.append('amount', expenseAmount);
      formData.append('purpose', expensePurpose);
      
      if (expenseFile) {
        formData.append('files', expenseFile);
      }

      const { data } = await axios.post('https://tlbc-platform-api.onrender.com/api/finance/expense/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessModal({
        message: 'Expense request created successfully, waiting for approval from the leadership.',
        details: {
          accountName: accounts.find(acc => acc.code === selectedAccount)?.account_name,
          amount: data.amount,
          purpose: data.purpose
        }
      });

      // Reset form
      setSelectedAccount('');
      setExpenseAmount('');
      setExpensePurpose('');
      setExpenseFile(null);
      setIsLoading(false);

      // await fetchExpensesList();

      // Refresh expenses list
      const fetchExpensesList = async () => {
        const { data: refreshedData } = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/expense/list/');        
        setExpensesList(refreshedData.results);
        setApprovedExpenses(refreshedData.results.filter(item => item.status === 'APPROVED'));
        setDeclinedExpenses(refreshedData.results.filter(item => item.status === 'DECLINED'));
      };
      // fetchExpensesList();
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || error.message || 'Failed to create. Please try again' );
    } finally {
      setIsLoading(false);
  }
};

// Pagination controls
const PaginationControls = () => {
  const handlePageChange = async (url) => {
    if (!url) return;
    
    try {
      if (activeSection === 'expenses-list') {
        await fetchExpensesList(url);
      } else {
        await fetchExpensesList(url);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch page');
    }
  };

  return (
  <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-boxdark dark:bg-navy-800 border-t">
          <div className="flex items-center gap-2">
            <button
              className={`flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                !prevPageUrl
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-navy-700 dark:text-gray-200 dark:hover:bg-navy-600'
              } border dark:border-gray-600`}
              onClick={() => handlePageChange(prevPageUrl)}
              disabled={!prevPageUrl}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              className={`flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                !nextPageUrl
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-navy-700 dark:text-gray-200 dark:hover:bg-navy-600'
              } border dark:border-gray-600`}
              onClick={() => handlePageChange(nextPageUrl)}
              disabled={!nextPageUrl}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      );
    };


  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        if (activeSection === 'expenses-list') {
          await fetchExpensesList();
        } else if (activeSection === 'approved-expenses') {
          renderApprovedExpenses();
        }  else if (activeSection === 'declined-expenses') {
          renderDeclinedExpenses();
        }
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch initial data');
       setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [activeSection]);


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

  

  // Remittance Processing Handlers
  const handleExpenseProcessing = async (reference, type) => {
    try {
      setIsLoading(true);
      setError(null);
      setErrorMessage(null);

      let endpoint = '';
      if (type === 'approve') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/expense/${reference}/approve/`;
      } else if (type === 'decline') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/expense/${reference}/decline/`;
      }

      const response = await axios.post(endpoint);

      setSuccessModal({
        message:
          response.data.message || 'Expenses status updated successfully',
      });

      // Refresh funds list
      if (activeSection === 'expenses-list') {
        await fetchExpensesList();
      } else if (activeSection === 'approved-expenses') {
        renderApprovedExpenses();
      } else if (activeSection === 'declined-expenses') {
        renderDeclinedExpenses();
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

  // Handle File Upload
  const handleFileUpload = async (reference, file) => {
    try {
      setIsLoading(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('files', file);

      const response = await axios.patch(
        `https://tlbc-platform-api.onrender.com/api/finance/expense/${reference}/upload/`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setSuccessModal({
        message: 'File uploaded successfully'
      });

      // Refresh expenses list
        const { data: refreshedData } = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/expense/list/');
        setExpensesList(refreshedData.results);

      await fetchExpensesList();
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
      setUploadModal(null);
      setUploadFile(null);
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


  // Helper function to extract name from email
const extractName = (fullString) => {
  if (!fullString) return 'N/A';
  return fullString.split('(')[0].trim();
};


const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

  // Table Component
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

   // Loading Spinner
   const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  );


   // Render Approved Expenses Section
   const renderApprovedExpenses = () => {
    const columns = [
      { header: 'Account Name', key: 'account', render: (row) => row.account.account_name },
      { header: 'Amount', key: 'amount', render: (row) => `₦${Number(row.amount).toLocaleString('en-NG')}` },
      { header: 'Purpose', key: 'purpose' },
      { header: 'Status', key: 'status' },
      { header: 'Initiator', key: 'initiator', render: (row) => extractName(row.initiator) },
      { header: 'Initiated At', key: 'initiated_at', render: (row) => formatDate(row.initiated_at) },
      { header: 'Auditor', key: 'auditor', render: (row) => extractName(row.auditor) },
      { header: 'Approved At', key: 'approved_at', render: (row) => formatDate(row.approved_at) },
      { 
        header: 'Files', 
        key: 'files',
        render: (row) => row.files && row.files.length > 0 ? (
          <a 
            href={row.files[0]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center"
          >
            <FileText className="mr-1" size={16} /> View
          </a>
        ) : 'N/A'
      }
    ];

    return (
      <div className="w-full">
        <h2 className="text-2xl mb-6 font-bold text-blue-600 flex items-center">
          <CheckCircle className="mr-2" /> Approved Expenses
        </h2>
        
        <TableComponent 
          data={approvedExpenses} 
          columns={columns} 
          isLoading={isLoading} 
        />
      </div>
    );
  };

  // Render Declined Expenses Section
  const renderDeclinedExpenses = () => {
    const columns = [
      { header: 'Account Name', key: 'account', render: (row) => row.account.account_name },
      { header: 'Amount', key: 'amount', render: (row) => `₦${Number(row.amount).toLocaleString('en-NG')}` },
      { header: 'Purpose', key: 'purpose' },
      { header: 'Status', key: 'status' },
      { header: 'Initiator', key: 'initiator', render: (row) => extractName(row.initiator) },
      { header: 'Initiated At', key: 'initiated_at', render: (row) => formatDate(row.initiated_at) },
      { header: 'Auditor', key: 'auditor', render: (row) => extractName(row.auditor) },
      { header: 'Declined At', key: 'approved_at', render: (row) => formatDate(row.approved_at) },
      { 
        header: 'Files', 
        key: 'files',
        render: (row) => row.files && row.files.length > 0 ? (
          <a 
            href={row.files[0]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center"
          >
            <FileText className="mr-1" size={16} /> View
          </a>
        ) : 'N/A'
      }
    ];

    return (
      <div className="w-full">
        <h2 className="text-2xl mb-6 font-bold text-blue-600 flex items-center">
          <XCircle className="mr-2" /> Declined Expenses
        </h2>
        
        <TableComponent 
          data={declinedExpenses} 
          columns={columns} 
          isLoading={isLoading} 
        />
      </div>
    );
  };
  
    // Style configuration
    const tableHeaderClass =
      'border px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray/70 uppercase tracking-wider';
    const tableCellClass = 'border px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center';
  
    // Define table columns based on section
    const getTableColumns = (section) => {
      const baseColumns = [
        { key: 'initiated_date', label: 'Date' },
        { key: 'initiated_time', label: 'Time' },
        { key: 'account', label: 'Account Name' },
        { key: 'amount', label: 'Amount' },
        { key: 'purpose', label: 'Purpose' },
        { key: 'initiator', label: 'Expense Created by' },
        { key: 'status', label: 'Status' },
        { key: 'auditor', label: 'Approved By' },
        { key: 'approved_at', label: 'Approved On' },
        { key: 'files', label: 'Documents' },
        { key: 'upload', label: 'Upload' },
        { key: 'action', label: 'Action' },
      ];
  
      return baseColumns;
    };
  
    // Render table cell content
    const renderTableCell = (column, expense) => {
      switch (column.key) {
        case 'initiated_date':
          return formatDate(expense.initiated_at);
  
        case 'initiated_time':
          return formatTime(expense.initiated_at);
  
        case 'account':
          return expense.account.account_name;
  
        case 'amount':
          return `₦${Number(expense.amount).toLocaleString('en-NG')}`;
  
        case 'purpose':
          return expense.purpose;
  
        case 'initiator':
          return expense.initiator
            ? expense.initiator.split('(')[0].trim()
            : 'N/A';
  
        case 'status':
          return (
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                expense.status === 'APPROVED'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : expense.status === 'DECLINED'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
              }`}
            >
              {expense.status}
            </span>
          );
  
        case 'auditor':
          return expense.auditor ? expense.auditor.split('(')[0] : 'N/A';
  
        case 'approved_at':
          return expense.approved_at
            ? formatDate(expense.approved_at)
            : 'N/A';
  
        case 'files':
          return expense.files && expense.files.length > 0 ? (
            <button
              onClick={() => handleViewFile(expense.files)}
              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Eye size={20} />
            </button>
          ) : (
            <span>N/A</span>
          );

       case 'upload':
         return (
              <div className="flex justify-center">
                <input
                  type="file"
                  id={`file-upload-${expense.reference}`}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(expense.reference, e.target.files[0]);
                    }
                  }}
                />
                <label
                  htmlFor={`file-upload-${expense.reference}`}
                  className="cursor-pointer p-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Upload size={20} />
                </label>
              </div>
            );

        case 'action':
           const handleDeclineClick = () => {
                    if (!['APPROVED', 'DECLINED' ].includes(expense.status)) {
                      handleExpenseProcessing(expense.reference, 'decline');
                    }
                  };
                
                  const handleApproveClick = () => {
                    if (!['APPROVED', 'DECLINED' ].includes(expense.status)) {
                      handleExpenseProcessing(expense.reference, 'approve');
                    }
                  };
                
                  const isDeclineDisabled = ['APPROVED', 'DECLINED' ].includes(expense.status);
                  const isApprovedDisabled = ['APPROVED', 'DECLINED'].includes(expense.status);
          
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

  return (
    <>
    <div className="min-h-screen p-4">
      {isLoading && <div>Loading...</div>}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}

    <Breadcrumb pageName="Expenses Management" className="text-black dark:text-white p-4 lg:px-8" />
    

     <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white"></h1>

                {/* Tab Navigation */}
        <div className="w-full overflow-x-auto">
  <div className="flex flex-wrap gap-2 md:flex-nowrap">
    {['create-expense', 'expenses-list', 'approved-expenses', 'declined-expenses'].map((section) => (
      <Button
        key={section}
        onClick={() => setActiveSection(section)}
        variant={activeSection === section ? 'default' : 'outline'}
        className={`
          ${activeSection === section
            ? 'bg-primary/70 dark:bg-primary/30 text-primary shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-white dark:hover:bg-blue-900 hover:bg-blue-800'}
          flex-1 min-w-[150px] whitespace-nowrap text-xs md:text-sm py-2 px-3 md:px-4 transition-all
        `}
      >
        {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </Button>
    ))}
  </div>
</div>
</div>

            {/* Main Content Area */}
          <div className="space-y-6 overflow-hidden">
            {activeSection === 'create-expense' && (
             <Card className="bg-white border-0 shadow-l dark:bg-boxdark">
                             <CardHeader>
                               <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
            <PlusCircle className="mr-2" /> Create Expense Request
          </CardTitle>
        </CardHeader>
        <CardContent>
  
        <div className="md:col-span-2 mb-5">
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
          </div>

          <div className="">
            <input 
            type="number" 
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800"
            placeholder="Enter amount"
          />

          <input 
            type="text" 
            value={expensePurpose}
            onChange={(e) => setExpensePurpose(e.target.value)}
            className="w-full mt-4 p-2 border rounded dark:bg-gray-800"
            placeholder="Enter purpose"
          />

         <div className="border-2 border-dashed p-4 rounded-lg text-center mt-4">
          <input 
            type="file" 
            onChange={(e) => setExpenseFile(e.target.files[0])}
            className="hidden"
              id="expense-file-upload"
            />
           <label htmlFor="expense-file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm text-gray-600 dark:text-gray-400">
              {expenseFile ? expenseFile.name : 'Upload Supporting Document'}
              </span>
            </label>
          </div>

           <Button
            onClick={handleCreateExpenses}
            disabled={isLoading}
            className={`w-full mt-4 text-white ${
              isLoading 
                ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <RefreshCw className="animate-spin mr-2" size={18} />
            ) : (
              <PlusCircle className="mr-2" size={18} />
            )}
            {isLoading ? 'Creating...' : 'Create Expense Request'}
         </Button>
                    </div>
                  </CardContent>
                </Card>
              )}


            {activeSection === 'expenses-list' && (

              <Card className='bg-white dark:bg-navy-800 border-0 shadow-lg overflow-hidden dark:bg-boxdark'>
                {/* <Card className="bg-white dark:bg-navy-800 border-0 shadow-lg overflow-hidden dark:bg-boxdark"> */}
                <div className="w-full overflow-x-auto rounded-lg shadow-lg">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray/50 dark:bg-navy-700 dark:text-white text-center">
                      <tr>
                        {getTableColumns(activeSection).map((column) => (
                          <th key={column.key} className={tableHeaderClass}>
                            {column.label}
                          </th>
                        ))}
                      </tr>  
                    </thead>
                    <tbody>
                      {(activeSection === 'expenses-list'
                       ? expensesList
                       : activeSection === 'approved-expenses'
                       ? approvedExpenses
                       : declinedExpenses
                        ).length === 0 ? (
                                         <tr>
                                           <td
                                             colSpan={getTableColumns(activeSection).length}
                                             className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                                              >
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                  <FileText className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                                                  <p className="text-base font-medium">
                                                    No data available
                                                  </p>
                                                  <p className="text-sm">
                                                    No Expense record found for this section.
                                                  </p>
                                                </div>
                                           </td>
                                            </tr>
                                          ) : (
                                            (activeSection === 'expenses-list'
                                              ? expensesList
                                              : activeSection === 'approved-expenses'
                                              ? approvedExpenses
                                              : declinedExpenses
                                            ).map((expense) => (
                                              <tr
                                                key={expense.reference}
                                                className="hover:bg-gray/100 dark:hover:bg-gray/10"
                                              >
                                                {getTableColumns(activeSection).map((column) => (
                                                  <td
                                                    key={`${expense.reference}-${column.key}`}
                                                    className={tableCellClass}
                                                  >
                                                    {renderTableCell(column, expense)}
                                                  </td>
                                                ))}
                                              </tr>
                                            ))
                                          )}
                                        </tbody>
                                      </table>
                    
                                      {/* Add pagination below the table */}
                                      {(activeSection === 'expenses-list'
                                        ? expensesList
                                        : activeSection === 'approved-expenses'
                                        ? approvedExpenses
                                        : declinedExpenses
                                      ).length > 0 && <PaginationControls />}
                                    </div>
                                  </Card>
                                )}
                              </div>
                            </div>

            {activeSection === 'approved-expenses' && renderApprovedExpenses()}
            {activeSection === 'declined-expenses' && renderDeclinedExpenses()}

            {/* {activeSection !== 'create-expense' && <PaginationControls />} */}


             {/* Add the FileViewModal */}
             <FileViewModal />


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



{/* Render error and success messages */}
{renderMessages()}

{/* Loading Overlay */}
{isLoading && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
  </div>
)}


    </>
  );
};

export default ExpensesManagement;