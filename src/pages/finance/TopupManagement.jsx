import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, X, FileText, PlusCircle, CheckCircle, XCircle, Upload, DollarSign } from 'lucide-react';

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

  // Fetch Accounts and Topup List on Component Mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/');
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
  const NavButton = ({ section, icon: Icon }) => (
    <button 
      onClick={() => {
        setActiveSection(section);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full p-3 text-left flex items-center ${
        activeSection === section 
          ? 'bg-blue-500 text-white' 
          : 'hover:bg-blue-100 text-blue-700'
      }`}
    >
      <Icon className="mr-2" /> 
      {section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </button>
  );

  // Success Modal Component
  const SuccessModal = ({ message, details, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <h2 className="text-xl font-bold mb-4">{message}</h2>
          
          {details && (
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <p><strong>Account:</strong> {details.accountName}</p>
              <p><strong>Amount:</strong> ${details.amount}</p>
              <p><strong>Purpose:</strong> {details.purpose}</p>
            </div>
          )}
          
          <button 
            onClick={onClose} 
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
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
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl mb-6 font-bold text-blue-600 text-center flex items-center justify-center">
        <PlusCircle className="mr-2" /> Create Topup Request
      </h2>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
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
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
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
          placeholder="Amount" 
          value={topupAmount}
          onChange={(e) => {
            // Ensure only numbers are entered
            const value = e.target.value.replace(/[^0-9]/g, '');
            setTopupAmount(value);
            setErrorMessage(null);
          }}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <input 
          type="text" 
          placeholder="Purpose" 
          value={topupPurpose}
          onChange={(e) => {
            setTopupPurpose(e.target.value);
            setErrorMessage(null);
          }}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            onChange={(e) => setTopupFile(e.target.files[0])}
            className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button 
          onClick={handleCreateTopupRequest} 
          disabled={isLoading}
          className={`w-full text-white p-3 rounded-md transition-colors flex items-center justify-center ${
            isLoading 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <PlusCircle className="mr-2" /> {isLoading ? 'Processing...' : 'Create Topup Request'}
        </button>
      </div>
    </div>
  );



  // IMPORTANT: Move all the handler functions before the return statement
 // Create Topup Request Handler
  const handleCreateTopupRequest = async () => {
    // Clear previous error messages
    setErrorMessage(null);

    // Front-end validation
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
    const renderUploadProof = () => (
        <div className="w-full">
          <h2 className="text-2xl mb-6 font-bold text-blue-600 flex items-center">
            <Upload className="mr-2" /> Upload Proof
          </h2>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-blue-50">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Account Name</th>
                  <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Amount</th>
                  <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Purpose</th>
                  <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Initiated At</th>
                  <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Update</th>
                </tr>
              </thead>
              <tbody>
                {topupList.map((item) => (
                  <tr key={item.reference} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">{item.account.account_name}</td>
                    <td className="p-3">${Number(item.amount).toFixed(2)}</td>
                    <td className="p-3">{item.purpose}</td>
                    <td className="p-3">{item.status}</td>
                    <td className="p-3">{formatDate(item.initiated_at)}</td>
                    <td className="p-3">
                      <input 
                        type="file" 
                        onChange={(e) => {
                          setUploadFileReference({
                            reference: item.reference,
                            file: e.target.files[0]
                          });
                        }}
                        className="hidden"
                        id={`file-upload-${item.reference}`}
                      />
                      <label 
                        htmlFor={`file-upload-${item.reference}`}
                        className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                      >
                        <Upload className="mr-1" size={16} /> Select File
                      </label>
                      {uploadFileReference && uploadFileReference.reference === item.reference && (
                        <button 
                          onClick={handleFileUpload}
                          className="mt-2 w-full bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors flex items-center justify-center"
                        >
                          <Upload className="mr-1" size={16} /> Upload
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );


  // Navigation Button Component
//   function NavButton({ section, icon: Icon }) {
//     return (
//       <button 
//         onClick={() => {
//           setActiveSection(section);
//           setIsMobileMenuOpen(false);
//         }}
//         className={`w-full p-3 text-left flex items-center ${
//           activeSection === section 
//             ? 'bg-blue-500 text-white' 
//             : 'hover:bg-blue-100 text-blue-700'
//         }`}
//       >
//          <Icon className="mr-2" /> 
//         {section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
//       </button>
//     );
//   }



  // Render Topup List Section
  const renderTopupList = () => (
    <div className="w-full">
      <h2 className="text-2xl mb-6 font-bold text-blue-600 flex items-center">
        <FileText className="mr-2" /> Topup List
      </h2>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Account Name</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Amount</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Purpose</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Status</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Initiator</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Initiated At</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Auditor</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Approved At</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Files</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {topupList.map((item) => (
              <tr key={item.reference} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3">{item.account.account_name}</td>
                <td className="p-3">${Number(item.amount).toFixed(2)}</td>
                <td className="p-3">{item.purpose}</td>
                <td className="p-3">{item.status}</td>
                <td className="p-3">{extractName(item.initiator)}</td>
                <td className="p-3">{formatDate(item.initiated_at)}</td>
                <td className="p-3">{extractName(item.auditor)}</td>
                <td className="p-3">{formatDate(item.approved_at)}</td>
                <td className="p-3">
                  {item.files && item.files.length > 0 ? (
                    <a 
                      href={`https://tlbc-platform-api.onrender.com${item.files[0]}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      <FileText className="mr-1" size={16} /> View
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="p-3 flex space-x-2">
                  <button 
                    onClick={() => handleTopupApproval(item.reference)}
                    className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors flex items-center"
                    disabled={isLoading}
                  >
                    <CheckCircle size={16} className="mr-1" /> Approve
                  </button>
                  <button 
                    onClick={() => handleTopupDecline(item.reference)}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors flex items-center"
                    disabled={isLoading}
                  >
                    <XCircle size={16} className="mr-1" /> Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

  // Render Approved Topup Section
  const renderApprovedTopup = () => (
    <div className="w-full">
      <h2 className="text-2xl mb-6 font-bold text-blue-600 flex items-center">
        <CheckCircle className="mr-2" /> Approved Topups
      </h2>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Account Name</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Amount</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Purpose</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Status</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Initiator</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Initiated At</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Auditor</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Approved At</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Files</th>
            </tr>
          </thead>
          <tbody>
            {approvedTopups.map((item) => (
              <tr key={item.reference} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3">{item.account.account_name}</td>
                <td className="p-3">${Number(item.amount).toFixed(2)}</td>
                <td className="p-3">{item.purpose}</td>
                <td className="p-3">{item.status}</td>
                <td className="p-3">{extractName(item.initiator)}</td>
                <td className="p-3">{formatDate(item.initiated_at)}</td>
                <td className="p-3">{extractName(item.auditor)}</td>
                <td className="p-3">{formatDate(item.approved_at)}</td>
                <td className="p-3">
                  {item.files && item.files.length > 0 ? (
                    <a 
                      href={`https://tlbc-platform-api.onrender.com${item.files[0]}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      <FileText className="mr-1" size={16} /> View
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Declined Topup Section
  const renderDeclinedTopup = () => (
    <div className="w-full">
      <h2 className="text-2xl mb-6 font-bold text-blue-600 flex items-center">
        <XCircle className="mr-2" /> Declined Topups
      </h2>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Account Name</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Amount</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Purpose</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Status</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Initiator</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Initiated At</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Auditor</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Declined At</th>
              <th className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Files</th>
            </tr>
          </thead>
          <tbody>
            {declinedTopups.map((item) => (
              <tr key={item.reference} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3">{item.account.account_name}</td>
                <td className="p-3">${Number(item.amount).toFixed(2)}</td>
                <td className="p-3">{item.purpose}</td>
                <td className="p-3">{item.status}</td>
                <td className="p-3">{extractName(item.initiator)}</td>
                <td className="p-3">{formatDate(item.initiated_at)}</td>
                <td className="p-3">{extractName(item.auditor)}</td>
                <td className="p-3">{formatDate(item.approved_at)}</td>
                <td className="p-3">
                  {item.files && item.files.length > 0 ? (
                    <a 
                      href={`https://tlbc-platform-api.onrender.com${item.files[0]}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      <FileText className="mr-1" size={16} /> View
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  

  // Main Render
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">Topup Management</h1>
          <button onClick={toggleMobileMenu} className="text-blue-700">
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
        <div className="hidden md:block md:w-1/5 bg-white shadow-md rounded-lg mr-4">
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
        <div className="w-full md:w-4/5 bg-white shadow-md rounded-lg p-6">  
        {activeSection === 'create-topup' && renderCreateTopup()}
        {activeSection === 'topup-list' && renderTopupList()}
        {activeSection === 'approved-topup' && renderApprovedTopup()}
        {activeSection === 'declined-topup' && renderDeclinedTopup()}
        {activeSection === 'upload-proof' && renderUploadProof()}
        </div>
      </div>
  
        {/* Error Message */}
        {errorMessage && (
          <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-xl flex items-center">
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
  )
}


export default TopupManagement;