import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Eye,
  X,
  FileText,
  PlusCircle,
  CheckCircle,
  DollarSign,
  Upload,
  ChevronLeft,
  ChevronRight,
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

const RemittanceManagement = () => {
  // State variables
  const [activeSection, setActiveSection] = useState('create-remittance');
  const [churches, setChurches] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
  const [selectedBenefactor, setSelectedBenefactor] = useState('');
  const [remittanceAmount, setRemittanceAmount] = useState('');
  const [remittancePurpose, setRemittancePurpose] = useState('');
  const [remittanceFile, setRemittanceFile] = useState(null);
  const [incomingRemittances, setIncomingRemittances] = useState([]);
  const [outgoingRemittances, setOutgoingRemittances] = useState([]);
  const [successModal, setSuccessModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [uploadFileReference, setUploadFileReference] = useState(null);
  const [currentIncomingPage, setCurrentIncomingPage] = useState(1);
  const [currentOutgoingPage, setCurrentOutgoingPage] = useState(1);
  const [incomingPagination, setIncomingPagination] = useState({});
  const [outgoingPagination, setOutgoingPagination] = useState({});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Add new state for file upload
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewMessage, setViewMessage] = useState('');

  // Add new state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);

  // Fetch churches and remittances on component mount
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          'https://tlbc-platform-api.onrender.com/api/churches/?limit=40',
        );
        setChurches(response.data.results);
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch churches');
        setIsLoading(false);
      }
    };

    fetchChurches();
    fetchIncomingRemittances();
    fetchOutgoingRemittances();
  }, []);

  const fetchIncomingRemittances = async (
    url = 'https://tlbc-platform-api.onrender.com/api/finance/remittance/incoming/',
  ) => {
    try {
      setIsLoading(true);
      const response = await axios.get(url);
      setIncomingRemittances(response.data.results);
      setTotalPages(Math.ceil(response.data.count / response.data.limit));
      setNextPageUrl(response.data.next);
      setPrevPageUrl(response.data.previous);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to fetch incoming remittances');
      setIsLoading(false);
    }
  };

  const fetchOutgoingRemittances = async (
    url = 'https://tlbc-platform-api.onrender.com/api/finance/remittance/outgoing/',
  ) => {
    try {
      setIsLoading(true);
      const response = await axios.get(url);
      setOutgoingRemittances(response.data.results);
      setTotalPages(Math.ceil(response.data.count / response.data.limit));
      setNextPageUrl(response.data.next);
      setPrevPageUrl(response.data.previous);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to fetch outgoing remittances');
      setIsLoading(false);
    }
  };

  // Add pagination component
  const PaginationControls = () => {
    const handlePageChange = async (url) => {
      if (!url) return;

      try {
        if (activeSection === 'incoming-remittance') {
          await fetchIncomingRemittances(url);
        } else {
          await fetchOutgoingRemittances(url);
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
  const handleRemittanceProcessing = async (reference, type) => {
    try {
      setIsLoading(true);
      setError(null);
      setErrorMessage(null);

      let endpoint = '';
      if (type === 'confirm') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/remittance/${reference}/confirm/`;
      } else if (type === 'paid') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/remittance/${reference}/paid/`;
      }

      const response = await axios.post(endpoint);

      setSuccessModal({
        message:
          response.data.message || 'Remittance status updated successfully',
      });

      // Refresh funds list
      if (activeSection === 'incoming-remittance') {
        await fetchIncomingRemittances();
      } else {
        await fetchOutgoingRemittances();
      }

      // Refresh remittances list
      // await fetchIncomingRemittances();
      // await fetchOutgoingRemittances();

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

  // Create Remittance Handler
  const handleCreateRemittance = async () => {
    // Front-end validation with error message display
    if (!selectedBeneficiary) {
      setErrorMessage('Please select a beneficiary church');
      return;
    }
    // if (!selectedBenefactor) {
    //   setErrorMessage('Please select a benefactor church');
    //   return;
    // }
    if (!remittanceAmount || isNaN(parseFloat(remittanceAmount))) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    if (!remittancePurpose) {
      setErrorMessage('Please enter a purpose for the remittance');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('amount', remittanceAmount);
      formData.append('purpose', remittancePurpose);
      formData.append('beneficiary', selectedBeneficiary);
      // formData.append('benefactor', selectedBenefactor);

      if (remittanceFile) {
        formData.append('files', remittanceFile);
      }

      const response = await axios.post(
        'https://tlbc-platform-api.onrender.com/api/finance/remittance/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setSuccessModal({
        message: 'Remittance request successfully created',
        details: {
          beneficiary: selectedBeneficiary,
          benefactor: selectedBenefactor,
          amount: remittanceAmount,
          purpose: remittancePurpose,
        },
      });

      // Reset form
      setSelectedBeneficiary('');
      setSelectedBenefactor('');
      setRemittanceAmount('');
      setRemittancePurpose('');
      setRemittanceFile(null);
      setIsLoading(false);
    } catch (error) {
      // Detailed error handling
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessages = [];

        if (errorData.detail) {
          errorMessages.push(errorData.detail[0]);
        }
        if (errorData.non_field_errors) {
          errorMessages.push(errorData.non_field_errors[0]);
        }
        if (errorData.amount) {
          errorMessages.push(errorData.amount[0]);
        }
        if (errorData.purpose) {
          errorMessages.push(errorData.purpose[0]);
        }
        if (errorData.beneficiary) {
          errorMessages.push(errorData.beneficiary[0]);
        }
        if (errorData.benefactor) {
          errorMessages.push(errorData.benefactor[0]);
        }

        if (error.response?.data?.detail) {
          setErrorMessage(error.response.data.detail);
        } else if (error.response?.data?.non_field_errors) {
          setErrorMessage(error.response.data.non_field_errors[0]);
        } else if (error.response.status === 500) {
          setErrorMessage('Failed to process. Contact Support Team.');
        } else {
          setErrorMessage('Failed to process. Please try again');
        }

        // Join multiple error messages if exist
        const combinedErrorMessage =
          errorMessages.length > 0
            ? errorMessages.join(' | ')
            : 'Failed to create remittance request';

        setErrorMessage(combinedErrorMessage);
      } else {
        setErrorMessage('Failed to create remittance request');
      }
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
        `https://tlbc-platform-api.onrender.com/api/finance/remittance/${reference}/upload/`,
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
      if (activeSection === 'incoming-remittance') {
        await fetchIncomingRemittances();
      } else {
        await fetchOutgoingRemittances();
      }

      // Refresh remittances list
      // await fetchIncomingRemittances();
      await fetchOutgoingRemittances();

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


  // Updated Button styling for disabled state
  const getButtonStyles = (isDisabled) => {
    if (isDisabled) {
      return 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500';
    }
    return 'bg-primary hover:bg-primary/80 text-white dark:hover:bg-primary/70';
  };

  // Pagination Handlers
  const handlePagination = async (type, direction) => {
    try {
      setIsLoading(true);
      const pagination =
        type === 'incoming' ? incomingPagination : outgoingPagination;
      const url = direction === 'next' ? pagination.next : pagination.previous;

      if (!url) return;

      const response = await axios.get(url);

      if (type === 'incoming') {
        setIncomingRemittances(response.data.results);
        setIncomingPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      } else {
        setOutgoingRemittances(response.data.results);
        setOutgoingPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      }

      setIsLoading(false);
    } catch (error) {
      setErrorMessage(`Failed to load ${type} remittances`);
      setIsLoading(false);
    }
  };

  // Render table function
  const renderTable = (data, type) => {
    const columns = [
      'Beneficiary',
      'Benefactor',
      'Amount',
      'Purpose',
      'Status',
      'Initiator',
      'Initiated At',
      'Auditor',
      'Approved At',
      'Files',
      'Action',
      'Uploads',
    ];

    return (
      <div className="w-full overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
            No remittances found
          </div>
        ) : (
          <>
            <table className="w-full bg-white dark:bg-boxdark shadow-md rounded-lg overflow-hidden">
              <thead className="bg-blue-50 dark:bg-blue-900">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="p-3 text-left text-xs font-medium text-blue-700 dark:text-blue-200 uppercase tracking-wider whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr
                    key={item.reference}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <td className="p-3 text-black dark:text-white">
                      {type === 'incoming' ? item.benefactor : item.beneficiary}
                    </td>
                    <td className="p-3 text-black dark:text-white">
                      {type === 'incoming' ? item.beneficiary : item.benefactor}
                    </td>
                    <td className="p-3 text-black dark:text-white">
                      ₦{Number(item.amount).toFixed(2)}
                    </td>
                    <td className="p-3 text-black dark:text-white">
                      {item.purpose}
                    </td>
                    <td className="p-3 text-black dark:text-white">
                      {item.status}
                    </td>
                    <td className="p-3 text-black dark:text-white">
                      {extractName(item.initiator)}
                    </td>
                    <td className="p-3 text-black dark:text-white">
                      {formatDate(item.initiated_at)}
                    </td>
                    <td className="p-3 text-black dark:text-white">
                      {extractName(item.auditor)}
                    </td>
                    <td className="p-3 text-black dark:text-white">
                      {formatDate(item.approved_at)}
                    </td>
                    <td className="p-3">
                      {item.files && item.files.length > 0 ? (
                        <a
                          href={`https://tlbc-platform-api.onrender.com${item.files[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 dark:text-blue-400 hover:underline flex items-center"
                        >
                          <FileText className="mr-1" size={16} /> View
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        {type === 'incoming' && (
                          <>
                            <button
                              onClick={() =>
                                handleRemittanceProcessing(
                                  item.reference,
                                  'confirm',
                                )
                              }
                              className="bg-green-500 dark:bg-green-600 text-white p-1 rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center"
                              disabled={isLoading}
                            >
                              <CheckCircle size={16} className="mr-1" /> Confirm
                            </button>
                            <button
                              onClick={() =>
                                handleRemittanceProcessing(
                                  item.reference,
                                  'paid',
                                )
                              }
                              className="bg-blue-500 dark:bg-blue-600 text-white p-1 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center"
                              disabled={isLoading}
                            >
                              <CheckCircle className="mr-1" /> Paid
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const fileInput = document.createElement('input');
                          fileInput.type = 'file';
                          fileInput.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setUploadFileReference({
                                reference: item.reference,
                                file: file,
                              });
                            }
                          };
                          fileInput.click();
                        }}
                        className="bg-yellow-500 dark:bg-yellow-600 text-white p-1 rounded hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors flex items-center"
                      >
                        <Upload size={16} className="mr-1" /> Update
                      </button>
                      {uploadFileReference &&
                        uploadFileReference.reference === item.reference && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-sm truncate max-w-[100px] text-black dark:text-white">
                              {uploadFileReference.file.name}
                            </span>
                            <button
                              onClick={handleFileUpload}
                              className="bg-green-500 dark:bg-green-600 text-white p-1 rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                            >
                              Upload
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900">
              <span className="text-sm text-blue-700 dark:text-blue-200">
                Total:{' '}
                {type === 'incoming'
                  ? incomingPagination.count
                  : outgoingPagination.count}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePagination(type, 'previous')}
                  disabled={
                    type === 'incoming'
                      ? !incomingPagination.previous
                      : !outgoingPagination.previous
                  }
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded disabled:bg-blue-300 dark:disabled:bg-blue-800"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePagination(type, 'next')}
                  disabled={
                    type === 'incoming'
                      ? !incomingPagination.next
                      : !outgoingPagination.next
                  }
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded disabled:bg-blue-300 dark:disabled:bg-blue-800"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
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

  // Function to handle payment
  const handlePayment = async (reference) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `https://tlbc-platform-api.onrender.com/api/finance/remittance/${reference}/paid/`,
      );
      setSuccessModal({
        message: response.data.message,
      });
      // Refresh the data
      fetchOutgoingRemittances();
    } catch (error) {
      // setErrorMessage(error.response?.data?.detail || 'Failed to process payment');
      setSuccessModal(null);
      if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else if (error.response.status === 500) {
        setErrorMessage('Failed to process. Contact Support Team.');
      } else {
        setErrorMessage('Failed to process payment.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle confirmation
  const handleConfirm = async (reference) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `https://tlbc-platform-api.onrender.com/api/finance/remittance/${reference}/confirm/`,
      );
      setSuccessModal({
        message: response.data.message,
      });
      // Refresh the data
      fetchIncomingRemittances();
    } catch (error) {
      // setErrorMessage(error.response?.data?.detail || 'Failed to confirm remittance');
      setSuccessModal(null);
      if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        setErrorMessage(error.response.data.non_field_errors[0]);
      } else if (error.response.status === 500) {
        setErrorMessage('Failed to process. Contact Support Team.');
      } else {
        setErrorMessage('Failed to confirm remittance.');
      }
    } finally {
      setIsLoading(false);
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

    if (section === 'outgoing-remittance') {
      baseColumns.push({ key: 'uploads', label: 'Uploads' });
      baseColumns.push({ key: 'pay', label: 'Action' });
    }

    if (section === 'incoming-remittance') {
      baseColumns.push({ key: 'confirm', label: 'Confirm' });
    }

    return baseColumns;
  };

  // Render table cell content
  const renderTableCell = (column, remittance) => {
    switch (column.key) {
      case 'initiated_date':
        return formatDate(remittance.initiated_at);

      case 'initiated_time':
        return formatTime(remittance.initiated_at);

      case 'benefactor':
        return remittance.benefactor;

      case 'amount':
        return `₦${Number(remittance.amount).toFixed(2)}`;

      case 'purpose':
        return remittance.purpose;

      case 'initiator':
        return remittance.initiator
          ? remittance.initiator.split('(')[0].trim()
          : 'N/A';

      case 'beneficiary':
        return remittance.beneficiary;

      case 'status':
        return (
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              remittance.status === 'CONFIRMED'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : remittance.status === 'DECLINED'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
            }`}
          >
            {remittance.status}
          </span>
        );

      case 'auditor':
        return remittance.auditor ? remittance.auditor.split('(')[0] : 'N/A';

      case 'approved_at':
        return remittance.approved_at
          ? formatDate(remittance.approved_at)
          : 'N/A';

      case 'files':
        return remittance.files && remittance.files.length > 0 ? (
          <button
            onClick={() => handleViewFile(remittance.files)}
            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Eye size={20} />
          </button>
        ) : (
          <span>N/A</span>
        );

      case 'pay':
        return (
          <Button
            onClick={() => handlePayment(remittance.reference)}
            disabled={remittance.status === 'PAID'}
            className={`w-full sm:w-auto ${getButtonStyles(remittance.status === 'PAID')}`}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Pay
          </Button>
        );

      case 'confirm':
        return (
          <Button
                          onClick={() => handleConfirm(remittance.reference)}
                          disabled={remittance.status === 'CONFIRMED'}
                          className={`w-full sm:w-auto ${getButtonStyles(remittance.status === 'CONFIRMED')}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm
                        </Button>
        );

      case 'uploads':
        return (
          <div className="flex justify-center">
            <input
              type="file"
              id={`file-upload-${remittance.reference}`}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(remittance.reference, e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor={`file-upload-${remittance.reference}`}
              className="cursor-pointer p-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Upload size={20} />
            </label>
          </div>
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
      <div className="min-h-screen">
        <Breadcrumb
          pageName="Remittance Management"
          className="text-black dark:text-white p-4 lg:px-8"
        />

        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white"></h1>

            {/* Tab Navigation */}
            <div className="w-full lg:w-auto flex overflow-x-auto lg:overflow-visible space-x-2 bg-gray-100 dark:bg-navy-800 p-1 rounded-lg">
              {[
                'create-remittance',
                'incoming-remittance',
                'outgoing-remittance',
              ].map((tab) => (
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
                  {tab
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6 overflow-hidden">
            {activeSection === 'create-remittance' && (
              <Card className="bg-white border-0 shadow-l dark:bg-boxdark">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                    Create New Remittance Request
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="md:col-span-2 mb-5">
                    <select
                      value={selectedBeneficiary}
                      onChange={(e) => setSelectedBeneficiary(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 py-2.5 text-gray-900 dark:text-white
                    text-black transition focus:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                              dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="" disabled>
                        Select Receiving Church
                      </option>
                      {churches.map((church) => (
                        <option key={church.slug} value={church.slug}>
                          {church.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={remittanceAmount}
                      onChange={(e) => setRemittanceAmount(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 py-2.5 text-gray-900 dark:text-white
                    text-black transition focus:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                              dark:bg-form-input dark:focus:border-primary"
                    />

                    <input
                      type="text"
                      placeholder="Purpose"
                      value={remittancePurpose}
                      onChange={(e) => setRemittancePurpose(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 py-2.5 text-gray-900 dark:text-white
                    text-black transition focus:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                              dark:bg-form-input dark:focus:border-primary"
                    />

                    <div className="md:col-span-2">
                      <input
                        type="file"
                        onChange={(e) => setRemittanceFile(e.target.files[0])}
                        className="w-full cursor-pointer rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 py-2.5 text-gray-900 dark:text-white
                      text-black transition focus:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                              dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>

                    <Button
                      onClick={handleCreateRemittance}
                      disabled={isLoading}
                      className="md:col-span-2 bg-primary hover:bg-blue-800 text-white dark:hover:bg-blue-900"
                    >
                      {isLoading
                        ? 'Processing...'
                        : 'Create Remittance Request'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {(activeSection === 'incoming-remittance' ||
              activeSection === 'outgoing-remittance') && (
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
                      {(activeSection === 'incoming-remittance'
                        ? incomingRemittances
                        : outgoingRemittances
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
                                No Remittance records found for this section.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        (activeSection === 'incoming-remittance'
                          ? incomingRemittances
                          : outgoingRemittances
                        ).map((remittance) => (
                          <tr
                            key={remittance.reference}
                            className="hover:bg-gray/100 dark:hover:bg-gray/10"
                          >
                            {getTableColumns(activeSection).map((column) => (
                              <td
                                key={`${remittance.reference}-${column.key}`}
                                className={tableCellClass}
                              >
                                {renderTableCell(column, remittance)}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Add pagination below the table */}
                  {(activeSection === 'incoming-remittance'
                    ? incomingRemittances
                    : outgoingRemittances
                  ).length > 0 && <PaginationControls />}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Add the FileViewModal */}
        <FileViewModal />

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
  );
};

export default RemittanceManagement;
