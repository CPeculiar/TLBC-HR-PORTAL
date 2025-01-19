import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, X, FileText, PlusCircle, CheckCircle, XCircle, Upload, DollarSign, RefreshCw, Filter } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from "../../components/ui/alert";

const TopupManagement = () => {
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
  const [pagination, setPagination] = useState({});

   // Helper Functions
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


  // Fetch Accounts and Topup List on Component Mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/?limit=30');
        setAccounts(response.data.results);
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch accounts');
        setIsLoading(false);
      }
    };

    const fetchTopupList = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/topup/list/');
        setTopupList(response.data.results);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        });
        
        // Filter approved and declined topups
        const approved = response.data.results.filter(item => item.status === 'APPROVED');
        const declined = response.data.results.filter(item => item.status === 'DECLINED');
        
        setApprovedTopups(approved);
        setDeclinedTopups(declined);
        
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch topup list');
        setIsLoading(false);
      }
    };

    fetchAccounts();
    fetchTopupList();
  }, []);

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



  // Navigation Button Component
  const NavButton = ({ section, icon: Icon }) => {
    const isActive = activeSection === section;
    return (
      <button 
        onClick={() => {
          setActiveSection(section);
          setIsMobileMenuOpen(false);
        }}
        className={`w-full p-4 text-left flex items-center space-x-3 transition-all ${
          isActive 
            ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-400' 
            : 'hover:bg-gray-50 text-gray-700 dark:text-gray-400 dark:hover:bg-boxdark-2'
        }`}
      >
        <Icon className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
        <span className="font-medium capitalize">
          {section.split('-').join(' ')}
        </span>
      </button>
    );
  };

  // Add animations utility classes to your Tailwind config or add them inline
const animations = {
  'animate-fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  'animate-slide-up': {
    '0%': { transform: 'translateY(1rem)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  'animate-slide-in': {
    '0%': { transform: 'translateX(-1rem)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
};

   // Enhanced Loading Component
   const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
    </div>
  );

  // Success Modal Component
  const SuccessModal = ({ message, details, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-boxdark p-6 rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all animate-slide-up">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">{message}</h2>
          
          {details || successModal.details && (
            <div className="bg-gray-50 dark:bg-boxdark-2 p-4 rounded-lg mb-4 space-y-2">
              <p className="text-black dark:text-white"><span className="font-semibold">Account:</span> {details.accountName}</p>
              <p className="text-black dark:text-white"><span className="font-semibold">Amount:</span> ₦{details.amount}</p>
              <p className="text-black dark:text-white"><span className="font-semibold">Purpose:</span> {details.purpose}</p>
            </div>
          )}
          
          <button 
            onClick={onClose} 
            className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile Navigation Toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Render Create Topup Section
  const renderCreateTopup = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-2xl text-blue-600 dark:text-blue-400">
          <PlusCircle className="mr-2" /> Create Topup Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <select 
            value={selectedAccount} 
            onChange={(e) => {
              setSelectedAccount(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-form-input dark:border-form-strokedark dark:text-white"
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.code} value={account.code}>
                {account.account_name}
              </option>
            ))}
          </select>

          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="number" 
              placeholder="Amount" 
              value={topupAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setTopupAmount(value);
                setErrorMessage(null);
              }}
              className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-form-input dark:border-form-strokedark dark:text-white"
            />
          </div>

          <input 
            type="text" 
            placeholder="Purpose" 
            value={topupPurpose}
            onChange={(e) => {
              setTopupPurpose(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-form-input dark:border-form-strokedark dark:text-white"
          />

          <div className="relative">
            <input 
              type="file" 
              onChange={(e) => setTopupFile(e.target.files[0])}
              className="hidden"
              id="file-upload"
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
            className={`w-full text-white p-3 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center ${
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
            {isLoading ? 'Processing...' : 'Create Topup Request'}
          </button>
        </div>
      </CardContent>
    </Card>
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


 // Topup Processing Handlers
  const handleTopupApproval = async (reference) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`https://tlbc-platform-api.onrender.com/api/finance/topup/${reference}/approve/`);

      setSuccessModal({
        message: response.data.message || 'Topup approved successfully'
      });

      // Refresh topup list
      const fetchTopupList = async () => {
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/topup/list/');
        setTopupList(response.data.results);
        const approved = response.data.results.filter(item => item.status === 'APPROVED');
        const declined = response.data.results.filter(item => item.status === 'DECLINED');
        setApprovedTopups(approved);
        setDeclinedTopups(declined);
      };
      fetchTopupList();

      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Failed to approve topup');
      setIsLoading(false);
    }
  };


  const handleTopupDecline = async (reference) => {
    const confirmDecline = window.confirm('Are you sure you want to decline this topup?');
    
    if (confirmDecline) {
      try {
        setIsLoading(true);
        const response = await axios.post(`https://tlbc-platform-api.onrender.com/api/finance/topup/${reference}/decline/`);

        setSuccessModal({
          message: response.data.message || 'Topup declined successfully'
        });

        // Refresh topup list
        const fetchTopupList = async () => {
          const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/topup/list/');
          setTopupList(response.data.results);
          const approved = response.data.results.filter(item => item.status === 'APPROVED');
          const declined = response.data.results.filter(item => item.status === 'DECLINED');
          setApprovedTopups(approved);
          setDeclinedTopups(declined);
        };
        fetchTopupList();

        setIsLoading(false);
      } catch (error) {
        setErrorMessage(error.response?.data?.detail || 'Failed to decline topup');
        setIsLoading(false);
      }
    }
  };


  // File Upload Handler
  const handleFileUpload = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('files', uploadFileReference.file);

      const response = await axios.put(
        `https://tlbc-platform-api.onrender.com/api/finance/topup/${uploadFileReference.reference}/upload/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccessModal({
        message: 'File uploaded successfully'
      });

      // Refresh topup list to reflect changes
      const fetchTopupList = async () => {
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/topup/list/');
        setTopupList(response.data.results);
      };
      fetchTopupList();

      setUploadFileReference(null);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to upload file');
      setIsLoading(false);
    }
  };

  // Pagination Handler
  const handlePagination = async (direction) => {
    try {
      setIsLoading(true);
      const url = direction === 'next' ? pagination.next : pagination.previous;

      if (!url) return;

      const response = await axios.get(url);
      
      setTopupList(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous
      });

      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to load topup list');
      setIsLoading(false);
    }
  };


    // Render Upload Proof Section
    const renderUploadProof = () => {
      const columns = [
        { header: 'Account Name', key: 'account', render: (row) => row.account.account_name },
        { header: 'Amount', key: 'amount', render: (row) => `₦${Number(row.amount).toFixed(2)}` },
        { header: 'Purpose', key: 'purpose' },
        { header: 'Status', key: 'status' },
        { header: 'Initiated At', key: 'initiated_at', render: (row) => formatDate(row.initiated_at) },
        { 
          header: 'Update',
          key: 'update',
          render: (row) => (
            <div>
              <input 
                type="file" 
                onChange={(e) => {
                  setUploadFileReference({
                    reference: row.reference,
                    file: e.target.files[0]
                  });
                }}
                className="hidden"
                id={`file-upload-${row.reference}`}
              />
              <label 
                htmlFor={`file-upload-${row.reference}`}
                className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <Upload className="mr-1" size={16} /> Select File
              </label>
              {uploadFileReference && uploadFileReference.reference === row.reference && (
                <button 
                  onClick={handleFileUpload}
                  className="mt-2 w-full bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <Upload className="mr-1" size={16} /> Upload
                </button>
              )}
            </div>
          )
        }
      ];
    
      return (
        <div className="w-full">
          <h2 className="text-2xl mb-6 font-bold text-blue-600 flex items-center">
            <Upload className="mr-2" /> Upload Proof
          </h2>
          
          <TableComponent 
            data={topupList} 
            columns={columns} 
            isLoading={isLoading} 
          />
        </div>
      );
    };


  // Render Topup List Section
 const renderTopupList = () => {
  const columns = [
    { header: 'Account Name', key: 'account', render: (row) => row.account.account_name },
    { header: 'Amount', key: 'amount', render: (row) => `₦${Number(row.amount).toFixed(2)}` },
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
          href={`https://tlbc-platform-api.onrender.com${row.files[0]}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-center"
        >
          <FileText className="mr-1" size={16} /> View
        </a>
      ) : 'N/A'
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleTopupApproval(row.reference)}
            className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors flex items-center"
            disabled={isLoading}
          >
            <CheckCircle size={16} className="mr-1" /> Approve
          </button>
          <button 
            onClick={() => handleTopupDecline(row.reference)}
            className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors flex items-center"
            disabled={isLoading}
          >
            <XCircle size={16} className="mr-1" /> Decline
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl mb-6 font-bold text-blue-600 flex items-center">
        <FileText className="mr-2" /> Topup List
      </h2>
      
      <TableComponent 
        data={topupList} 
        columns={columns} 
        isLoading={isLoading} 
      />

      {/* Pagination section remains the same */}
      <div className="mt-4 flex justify-between items-center">
        <span className="text-gray-600">Total: {pagination.count} entries</span>
        <div className="flex space-x-2">
          <button 
            onClick={() => handlePagination('previous')}
            disabled={!pagination.previous}
            className={`px-4 py-2 rounded ${
              pagination.previous 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          <button 
            onClick={() => handlePagination('next')}
            disabled={!pagination.next}
            className={`px-4 py-2 rounded ${
              pagination.next 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

  // Render Approved Topup Section
  const renderApprovedTopup = () => {
    const columns = [
      { header: 'Account Name', key: 'account', render: (row) => row.account.account_name },
      { header: 'Amount', key: 'amount', render: (row) => `₦${Number(row.amount).toFixed(2)}` },
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
            href={`https://tlbc-platform-api.onrender.com${row.files[0]}`} 
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
          <CheckCircle className="mr-2" /> Approved Topups
        </h2>
        
        <TableComponent 
          data={approvedTopups} 
          columns={columns} 
          isLoading={isLoading} 
        />
      </div>
    );
  };


  // Render Declined Topup Section
  const renderDeclinedTopup = () => {
  const columns = [
    { header: 'Account Name', key: 'account', render: (row) => row.account.account_name },
    { header: 'Amount', key: 'amount', render: (row) => `₦${Number(row.amount).toFixed(2)}` },
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
          href={`https://tlbc-platform-api.onrender.com${row.files[0]}`} 
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
        <XCircle className="mr-2" /> Declined Topups
      </h2>
      
      <TableComponent 
        data={declinedTopups} 
        columns={columns} 
        isLoading={isLoading} 
      />
    </div>
  );
};



  // Table components with dark mode
  const TableHeader = ({ children }) => (
    <th className="p-3 text-left text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-boxdark">
      {children}
    </th>
  );

  const TableCell = ({ children, className = "" }) => (
    <td className={`p-3 dark:text-white ${className}`}>
      {children}
    </td>
  );

  const TableRow = ({ children }) => (
    <tr className="border-b dark:border-strokedark hover:bg-gray-50 dark:hover:bg-boxdark transition-colors">
      {children}
    </tr>
  );
  

  // Main Render
  return (
    <>
    <Breadcrumb pageName="Topup Management"  className="text-black dark:text-white" />
    <div className="min-h-screen bg-gray-100 dark:bg-boxdark p-4 md:p-8 relative">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">Topup Management</h1>
          <button onClick={toggleMobileMenu} className="text-blue-700 dark:text-blue-400">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="flex">
        {/* Sidebar Navigation - Updated for overlay on mobile */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="absolute top-0 left-0 w-3/4 h-full bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on sidebar
            >
              <div className="p-8 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-700">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} className="text-blue-700" />
                </button>
              </div>
              <NavButton 
            section="create-topup" 
            icon={PlusCircle} 
          />
          <NavButton 
            section="topup-list" 
            icon={FileText} 
          />
          <NavButton 
            section="approved-topup" 
            icon={CheckCircle} 
          />
          <NavButton 
            section="declined-topup" 
            icon={XCircle} 
          />
          <NavButton 
            section="upload-proof" 
            icon={Upload} 
          />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:block md:w-1/5 bg-white dark:bg-boxdark shadow-md rounded-lg mr-4">
        <NavButton 
            section="create-topup" 
            icon={PlusCircle} 
          />
          <NavButton 
            section="topup-list" 
            icon={FileText} 
          />
          <NavButton 
            section="approved-topup" 
            icon={CheckCircle} 
          />
          <NavButton 
            section="declined-topup" 
            icon={XCircle} 
          />
          <NavButton 
            section="upload-proof" 
            icon={Upload} 
          />
        </div>



        {/* Main Content */}
         {/* Render Sections */}
         <div className="w-full md:w-4/5 bg-white dark:bg-boxdark shadow-md rounded-lg p-6">
        {activeSection === 'create-topup' && renderCreateTopup()}
        {activeSection === 'topup-list' && renderTopupList()}
        {activeSection === 'approved-topup' && renderApprovedTopup()}
        {activeSection === 'declined-topup' && renderDeclinedTopup()}
        {activeSection === 'upload-proof' && renderUploadProof()}
        </div>
      </div>
  
        {/* Error Message */}
        {errorMessage && (
            <div className="fixed top-4 right-4 bg-red-500 dark:bg-red-600 text-white p-4 rounded-lg shadow-xl flex items-center">
            <XCircle className="mr-2" />
            {errorMessage}
          </div>
        )}
  
        {/* Success Modal */}
       {successModal && (
          <SuccessModal 
            message={successModal.message}
            details={successModal.details}
            onClose={() => setSuccessModal(null)} 
          />
        )} 
  
      </div>

      </>
  )
}


export default TopupManagement;