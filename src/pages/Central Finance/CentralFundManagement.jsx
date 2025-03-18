import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Menu, Eye, X, Loader2, FileText, PlusCircle, CheckCircle, XCircle, Upload, FilePlus, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CentralFundManagement = () => {
  // State variables
  const [activeSection, setActiveSection] = useState('create-fund');
  const [churches, setChurches] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
  const [selectedBenefactor, setSelectedBenefactor] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [fundPurpose, setFundPurpose] = useState('');
  const [fundFile, setFundFile] = useState(null);
  const [incomingFunds, setIncomingFunds] = useState([]);
  const [outgoingFunds, setOutgoingFunds] = useState([]);
  const [successModal, setSuccessModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadFileReference, setUploadFileReference] = useState(null);

  const [error, setError] = useState('');
      const [success, setSuccess] = useState('');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [selectedFiles, setSelectedFiles] = useState([]);
  
       // Add new state for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);
    const [uploadingFile, setUploadingFile] = useState(null);
    const [uploadError, setUploadError] = useState('');


  // Fetch churches and funds on component mount
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/churches/?limit=40');
        setChurches(response.data.results);
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch churches');
        setIsLoading(false);
      }
    };

    fetchChurches();
    fetchIncomingFunds();
    fetchOutgoingFunds();
  }, []);

  const fetchIncomingFunds = async  (url = 'https://tlbc-platform-api.onrender.com/api/finance/central/fund/incoming/?limit=15') => {
    try {
      setIsLoading(true);
      const response = await axios.get(url);
      setIncomingFunds(response.data.results);
      setTotalPages(Math.ceil(response.data.count / response.data.limit));
      setNextPageUrl(response.data.next);
      setPrevPageUrl(response.data.previous);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to fetch incoming funds');
      setIsLoading(false);
    }
  };

  const fetchOutgoingFunds = async (url = 'https://tlbc-platform-api.onrender.com/api/finance/central/fund/outgoing/?limit=15') => {
    try {
      setIsLoading(true);
      const response = await axios.get(url);
      setOutgoingFunds(response.data.results);
      setTotalPages(Math.ceil(response.data.count / response.data.limit));
      setNextPageUrl(response.data.next);
      setPrevPageUrl(response.data.previous);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to fetch outgoing funds');
      setIsLoading(false);
    }
  };

    // Add pagination component
      const PaginationControls = () => {
        const handlePageChange = async (url) => {
          if (!url) return;
          
          try {
            if (activeSection === 'incoming-fund') {
              await fetchIncomingFunds(url);
            } else {
              await fetchOutgoingFunds(url);
            }
          } catch (error) {
            setError('Failed to fetch page');
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
        
        if (activeSection === 'incoming-fund') {
          await fetchIncomingFunds();
        } else if (activeSection === 'outgoing-fund') {
          await fetchOutgoingFunds();
        }
        setIsLoading(false);
      } catch (error) {
        setError('Failed to fetch initial data');
        setIsLoading(false);
      }
    };
  
    fetchInitialData();
  }, [activeSection]);
  

   // Fund Processing Handlers
   const handleFundProcessing = async (reference, type) => {
    try {
      setIsLoading(true);
      setError(null);
      setErrorMessage(null);

      let endpoint = '';
      if (type === 'processing') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/central/fund/${reference}/processing/`;
      } else if (type === 'paid') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/central/fund/${reference}/paid/`;
      } else if (type === 'decline') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/central/fund/${reference}/decline/`;
      }

      const response = await axios.post(endpoint);

      setSuccessModal({
        message: response.data.message || 'Fund status updated successfully'
      });

      // Refresh funds list
        if (activeSection === 'incoming-fund') {
          await fetchIncomingFunds();
        } else {
          await fetchOutgoingFunds()
    }
   
   
    fetchIncomingFunds();
    fetchOutgoingFunds();

      setIsLoading(false);
    } catch (error) {
      // setErrorMessage(error.response?.data?.detail || 'Failed to update fund status');
      setSuccessModal(null);
      if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      }  else  if (error.response.status === 500) {
        setErrorMessage('Failed to process. Contact Support Team.');
    }else {
        setErrorMessage('Failed to process. Please try again');
      }
      setIsLoading(false);
      // setErrorMessage('Network error. Please check your connection.');
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

  // Create Fund Handler
  const handleCreateFund = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

       // Validate required fields
    if (!fundAmount || !fundPurpose || !selectedBenefactor) {
      setErrorMessage('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('amount', fundAmount);
    formData.append('purpose', fundPurpose);
    formData.append('benefactor', selectedBenefactor);
    
    if (fundFile) {
      formData.append('files', fundFile);
    }

      const response = await axios.post(
        'https://tlbc-platform-api.onrender.com/api/finance/central/fund/create/',
       formData, 
       {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessModal({
        message: 'Fund request successfully created',
        details: {
          beneficiary: selectedBeneficiary,
          benefactor: selectedBenefactor,
          amount: fundAmount,
          purpose: fundPurpose
        }
      });

      // Reset form
      setSelectedBeneficiary('');
      setSelectedBenefactor('');
      setFundAmount('');
      setFundPurpose('');
      setFundFile(null);
      setIsLoading(false);

    } catch (error) {
      // setErrorMessage('Failed to create fund request');
      console.error ('create fund error:', error);
       // More detailed error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      if (error.response.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else if (error.response.status === 500) {
        setErrorMessage('Internal server error. Please try again or contact support.');
      } else {
        setErrorMessage(`Server error: ${error.response.status}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      setErrorMessage('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      setErrorMessage('Failed to create fund request. Please try again.');
    }
    } finally {
      setIsLoading(false);
    }
  };

  // Add file upload handler
const handleFileUpload = async (reference, file) => {
  try {
    setIsLoading(true);
    setUploadError('');
    setErrorMessage(null); // Use your existing error message state
    setUploadingFile(reference); // Track which file is being uploaded
    
    const formData = new FormData();
    formData.append('files', file);

    await axios.patch(
      `https://tlbc-platform-api.onrender.com/api/finance/central/fund/${reference}/upload/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Show success message
    setSuccessModal({
      message: 'File uploaded successfully'
    });

    // Refresh the funds list
    if (activeSection === 'incoming-fund') {
      await fetchIncomingFunds();
    } else {
      await fetchOutgoingFunds();
    }

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
  } finally {
    setIsLoading(false);
    setUploadingFile(null);
  }
};

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
      year: 'numeric'
    });
  };

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-NG', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Africa/Lagos' 
    });
  }
  

       const handleViewFile = (files) => {
        if (files.length === 1) {
          window.open(files[0], '_blank');
        } else {
          setSelectedFiles(files);
          setIsModalOpen(true);
        }
      };
      
    // Style configuration
    const tableHeaderClass = "border px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray/70 uppercase tracking-wider";
    const tableCellClass = "border px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray/70 text-center";
    const buttonClass = "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors";


     // Define table columns based on section
  const getTableColumns = (section) => {
    const baseColumns = [
      { key: 'initiated_date', label: 'Date' },
      { key: 'initiated_time', label: 'Time' },
      { key: 'benefactor', label: 'Sent From' },
      { key: 'amount', label: 'Amount' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'initiator', label: 'Request Created by' },
      { key: 'beneficiary', label: 'Beneficiary' },
      { key: 'status', label: 'Status' },
      { key: 'auditor', label: 'Approved By' },
      { key: 'approved_at', label: 'Approved On' },
      { key: 'files', label: 'Documents' },
    ];

    if (section === 'outgoing-fund') {
      baseColumns.push({ key: 'uploads', label: 'Uploads' });
      baseColumns.push({ key: 'actions', label: 'Actions' });
    }

    return baseColumns;
  };
 

  // Render table cell content
    const renderTableCell = (column, fund) => {
      switch (column.key) {
        case 'initiated_date':
          return formatDate(fund.initiated_at);  
          case 'initiated_time':
          return formatTime(fund.initiated_at);
          case 'benefactor':
          return fund.benefactor;
          case 'amount':
          return `₦${Number(fund.amount).toLocaleString('en-NG')}`;
          case 'purpose':
          return fund.purpose;
          case 'initiator':
          return fund.initiator ? fund.initiator.split('(')[0].trim() : 'N/A';
          case 'beneficiary':
          return fund.beneficiary;
          case 'status':
          return (
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              fund.status === 'PAID' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                : fund.status === "DECLINED"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
            }`}>
              {fund.status}
            </span>
          );
        case 'auditor':
          return fund.auditor ? fund.auditor.split('(')[0] : 'N/A'
        case 'approved_at':
          return fund.approved_at ? formatDate(fund.approved_at) : "N/A";
        case 'files':
          return fund.files && fund.files.length > 0 ? (
            <button
              onClick={() => handleViewFile(fund.files)}
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
                          id={`file-upload-${fund.reference}`}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(fund.reference, e.target.files[0]);
                            }
                          }}
                        />
                        <label
                          htmlFor={`file-upload-${fund.reference}`}
                          className="cursor-pointer p-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                         {uploadingFile === fund.reference ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Upload size={20} />
                          )}
                        </label>
                      </div>
                    );
        case 'actions':
          const handleProcessingClick = () => {
            if (!['PAID', 'DECLINED', 'PROCESSING'].includes(fund.status)) {
              handleFundProcessing(fund.reference, 'processing');
            }
          };
        
          const handlePaidClick = () => {
            if (!['PAID', 'DECLINED'].includes(fund.status)) {
              handleFundProcessing(fund.reference, 'paid');
            }
          };

          const handleDeclineClick = () => {
            if (!['PAID', 'DECLINED'].includes(fund.status)) {
              handleFundProcessing(fund.reference, 'decline');
            }
          };
        
          const isProcessingDisabled = ['PAID', 'DECLINED', 'PROCESSING'].includes(fund.status);
          const isPaidDisabled = ['PAID', 'DECLINED'].includes(fund.status);
          const isDeclineDisabled = ['PAID', 'DECLINED'].includes(fund.status);
  
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
            Decline
          </DropdownItem>

              <DropdownItem 
              onClick={handleProcessingClick}
              disabled={isProcessingDisabled}
              className={`${
            isProcessingDisabled 
              ? 'opacity-50 cursor-not-allowed pointer-events-none' 
              : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
              >
                Move to Processing
              </DropdownItem>

              <DropdownItem 
              onClick={handlePaidClick}
          disabled={isPaidDisabled}
          className={`${
            isPaidDisabled
              ? 'opacity-50 cursor-not-allowed pointer-events-none' 
              : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
              >
                Move to Paid
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
<div className="min-h-screen">
<Breadcrumb pageName="Central Fund Management"  className="text-black dark:text-white p-4 lg:px-8" />
    
     <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white"></h1>
              
              {/* Tab Navigation */}
              <div className="flex space-x-2 bg-gray-100 dark:bg-navy-800 p-1 rounded-lg">
                {['create-fund', 'incoming-fund', 'outgoing-fund'].map((tab) => (
                  <Button
                    key={tab}
                    onClick={() => setActiveSection(tab)}
                    variant={activeSection === tab ? 'default' : 'ghost'}
                    className={`${
                      activeSection === tab 
                        ? 'bg-primary/70 dark:bg-primary/60 text-primary shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-white dark:hover:bg-blue-900 hover:bg-blue-800'
                    } px-4 py-2 rounded-md transition-all`}
                  >
                    {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Button>
                ))}
              </div>
            </div>

      {/* Main Content Area */}
             <div className="space-y-6">
               {activeSection === 'create-fund' && (
                 <Card className="bg-white border-0 shadow-l dark:bg-boxdark">
                   <CardHeader>
                     <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                       Create New Fund Request
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                   <div className="md:col-span-2 mb-5">
                   <select 
                         value={selectedBenefactor}
                         onChange={(e) => setSelectedBenefactor(e.target.value)}
                         className="w-full rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 py-2.5 text-gray-900 dark:text-white
                         text-black transition focus:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                                   dark:bg-form-input dark:focus:border-primary"
                       >
                         <option value="" disabled>Select Church to request Fund</option>
                         {churches.map(church => (
                           <option key={church.slug} value={church.slug}>{church.name}</option>
                         ))}
                       </select>
                       </div>
     
                     <div className="grid gap-6 md:grid-cols-2">
                       <input 
                         type="number"
                         placeholder="Amount"
                         value={fundAmount}
                         onChange={(e) => setFundAmount(e.target.value)}
                         className="w-full rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 py-2.5 text-gray-900 dark:text-white
                         text-black transition focus:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                                   dark:bg-form-input dark:focus:border-primary"
                       />
     
                       <input 
                         type="text"
                         placeholder="Purpose"
                         value={fundPurpose}
                         onChange={(e) => setFundPurpose(e.target.value)}
                         className="w-full rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 py-2.5 text-gray-900 dark:text-white
                         text-black transition focus:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                                   dark:bg-form-input dark:focus:border-primary"
                       />
     
                       <div className="md:col-span-2">
                         <input 
                           type="file"
                           onChange={(e) => setFundFile(e.target.files[0])}
                           className="w-full cursor-pointer rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 py-2.5 text-gray-900 dark:text-white
                           text-black transition focus:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                                   dark:bg-form-input dark:focus:border-primary"
                         />
                       </div>
     
                       <Button
                         onClick={handleCreateFund}
                         disabled={isLoading}
                         className="md:col-span-2 bg-primary hover:bg-blue-800 text-white dark:hover:bg-blue-900"
                       >
                         {isLoading ? 'Processing...' : 'Create Fund Request'}
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               )}
     
               {(activeSection === 'incoming-fund' || activeSection === 'outgoing-fund') && (
                 <Card className="bg-white dark:bg-navy-800 border-0 shadow-lg overflow-hidden dark:bg-boxdark">
                   <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200 dark:divide-navy-700">
                       <thead className="bg-gray-50 dark:bg-navy-700 dark:text-white text-center">
                         <tr>
                         {getTableColumns(activeSection).map((column) => (
                             <th key={column.key} className={tableHeaderClass}>
                               {column.label}
                             </th>
                           ))}
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200 dark:divide-navy-700 bg-white dark:bg-navy-800 dark:bg-boxdark dark:text-gray/70 ">
                        {(activeSection === 'incoming-fund' ? incomingFunds : outgoingFunds).length === 0 ? (
                                    <tr>
                                      <td 
                                        colSpan={getTableColumns(activeSection).length} 
                                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                                      >
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                          <FileText className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                                          <p className="text-base font-medium">No data available</p>
                                          <p className="text-sm">No fund records found for this section.</p>
                                        </div>
                                      </td>
                                    </tr>
                                  ) : (
                         (activeSection === 'incoming-fund' ? incomingFunds : outgoingFunds).map((fund) => (
                           <tr key={fund.reference} className="hover:bg-gray/100 dark:hover:bg-gray/10">
     
                           {getTableColumns(activeSection).map((column) => (
                               <td key={`${fund.reference}-${column.key}`} className={tableCellClass}>
                                 {renderTableCell(column, fund)}
                               </td>
                             ))}
                           </tr>
                         ))
                                  )}
                       </tbody>
                     </table>
     
                      {/* Add pagination below the table */}
                      {(activeSection === 'incoming-fund' ? incomingFunds : outgoingFunds).length > 0  && (
        <PaginationControls />
      )}
     
                   </div>
                 </Card>
               )}
             </div>
           </div>
     
           {/* Render error and success messages */}
           {renderMessages()}
     
           {/* Loading Overlay */}
           {isLoading && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
             </div>
           )}
         </div>
     
</>
  
)}
  

export default CentralFundManagement;