import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Menu, Eye, X, Loader2, FileText, PlusCircle, CheckCircle, XCircle, Upload, FilePlus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const FundManagement = () => {
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

   const [records, setRecords] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch churches and funds on component mount
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://api.thelordsbrethrenchurch.org/api/churches/?limit=40');
        setChurches(response.data.results);
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch churches');
        setIsLoading(false);
      }
    };

    const fetchIncomingFunds = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://api.thelordsbrethrenchurch.org/api/finance/fund/incoming/?limit=25');
        setIncomingFunds(response.data.results);
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch incoming funds');
        setIsLoading(false);
      }
    };

    const fetchOutgoingFunds = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://api.thelordsbrethrenchurch.org/api/finance/fund/outgoing/?limit=25');
        setOutgoingFunds(response.data.results);
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch outgoing funds');
        setIsLoading(false);
      }
    };

    fetchChurches();
    fetchIncomingFunds();
    fetchOutgoingFunds();
  }, []);

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
      const formData = new FormData();
      formData.append('amount', fundAmount);
      formData.append('purpose', fundPurpose);
      formData.append('benefactor', selectedBenefactor);
      
      if (fundFile) {
        formData.append('files', fundFile);
      }

      const response = await axios.post('https://api.thelordsbrethrenchurch.org/api/finance/fund/create/', formData, {
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
      setErrorMessage('Failed to create fund request');
      setIsLoading(false);
    }
  };

  // Fund Processing Handlers
  const handleFundProcessing = async (reference, type) => {
    try {
      setIsLoading(true);
      let endpoint = '';
      if (type === 'processing') {
        endpoint = `https://api.thelordsbrethrenchurch.org/api/finance/fund/${reference}/processing/`;
      } else if (type === 'paid') {
        endpoint = `https://api.thelordsbrethrenchurch.org/api/finance/fund/${reference}/paid/`;
      } else if (type === 'decline') {
        endpoint = `https://api.thelordsbrethrenchurch.org/api/finance/fund/${reference}/decline/`;
      }

      const response = await axios.post(endpoint);

      setSuccessModal({
        message: response.data.message || 'Fund status updated successfully'
      });

      // Refresh funds list
      if (type === 'processing' || type === 'paid') {
        await fetchIncomingFunds();
        await fetchOutgoingFunds();
      }
      
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Failed to update fund status');
      setIsLoading(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('files', uploadFileReference.file);

      const response = await axios.put(
        `https://api.thelordsbrethrenchurch.org/api/finance/fund/${uploadFileReference.reference}/upload/`,
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

      // Refresh funds list
      await fetchIncomingFunds();
      await fetchOutgoingFunds();

      setUploadFileReference(null);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to upload file');
      setIsLoading(false);
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

   // NavButton component for consistent navigation styling
   const NavButton = ({ section, icon: Icon, label }) => (
    <Button
      variant={activeSection === section ? "default" : "ghost"}
      className={`w-full justify-start gap-2 text-left transition-colors ${
        activeSection === section 
          ? 'bg-primary' 
          : 'hover:bg-primary/10'
      }`}
      onClick={() => {
        setActiveSection(section);
        setIsMobileMenuOpen(false);
      }}
    >
      <Icon className="h-4 w-4" />
      {label || section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
    </Button>
  );

  // Render Create Fund Section
  const renderCreateFund = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <PlusCircle className="h-5 w-5" />
          Create Fund Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <select 
            value={selectedBeneficiary}
            onChange={(e) => setSelectedBeneficiary(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">Select Beneficiary Church</option>
            {churches.map(church => (
              <option key={church.slug} value={church.slug}>{church.name}</option>
            ))}
          </select>

          <select 
            value={selectedBenefactor}
            onChange={(e) => setSelectedBenefactor(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">Select Benefactor Church</option>
            {churches.map(church => (
              <option key={church.slug} value={church.slug}>{church.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input 
            type="number"
            placeholder="Amount"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />

          <input 
            type="text"
            placeholder="Purpose"
            value={fundPurpose}
            onChange={(e) => setFundPurpose(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Supporting Documents</label>
          <input 
            type="file"
            onChange={(e) => setFundFile(e.target.files[0])}
            className="w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2"
          />
        </div>

        <Button
          onClick={handleCreateFund}
          disabled={isLoading}
          className="w-full"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {isLoading ? 'Processing...' : 'Create Fund Request'}
        </Button>
      </CardContent>
    </Card>
  );

  // Render table function
  const renderTable = (data, type) => {
    const columns = [
      'Beneficiary', 'Benefactor', 'Amount', 'Purpose', 'Status', 
      'Initiator', 'Initiated At', 'Auditor', 'Approved At', 'Files', 
      'Action', 'Uploads'
    ];

    return (
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {data.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No funds found</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {columns.map(column => (
                      <th key={column} className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.reference} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">{type === 'incoming' ? item.benefactor : item.beneficiary}</td>
                      <td className="p-4">{type === 'incoming' ? item.beneficiary : item.benefactor}</td>
                      <td className="p-4">₦{Number(item.amount).toFixed(2)}</td>
                      <td className="p-4">{item.purpose}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          item.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">{extractName(item.initiator)}</td>
                      <td className="p-4">{formatDate(item.initiated_at)}</td>
                      <td className="p-4">{extractName(item.auditor)}</td>
                      <td className="p-4">{formatDate(item.approved_at)}</td>
                      <td className="p-4">
                        {item.files?.length > 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={`https://api.thelordsbrethrenchurch.org${item.files[0]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              View
                            </a>
                          </Button>
                        ) : 'N/A'}
                      </td>
                      {type === 'incoming' && (
                        <td className="p-4 space-y-2">
                          <Button
                            variant="warning"
                            size="sm"
                            className="w-full"
                            onClick={() => handleFundProcessing(item.reference, 'processing')}
                          >
                            Processing
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            className="w-full"
                            onClick={() => handleFundProcessing(item.reference, 'paid')}
                          >
                            Paid
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => handleFundProcessing(item.reference, 'decline')}
                          >
                            Decline
                          </Button>
                        </td>
                      )}
                      <td className="p-4">
                        <input
                          type="file"
                          id={`file-upload-${item.reference}`}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              setUploadFileReference({
                                reference: item.reference,
                                file: e.target.files[0]
                              });
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <label htmlFor={`file-upload-${item.reference}`}>
                            <Upload className="h-4 w-4 mr-2" />
                            Update
                          </label>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Success Modal
  const renderSuccessModal = () => {
    if (!successModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-xl max-w-sm w-full border border-stroke dark:border-strokedark">
        <h2 className="text-xl font-bold mb-4 text-center text-black dark:text-white">Success</h2>
        <p className="text-center mb-4 text-black dark:text-white">{successModal.message}</p>
          {successModal.details && (
            <div className="mt-4 bg-gray-100 dark:bg-blue-900 p-3 rounded text-center">
            <p className="text-black dark:text-white">Benefactor: {successModal.details.benefactor}</p>
              {/* Continue the previous code... */}
              <p className="text-black dark:text-white">Amount: ₦{successModal.details.amount}</p>
                <p className="text-black dark:text-white">Purpose: {successModal.details.purpose}</p>
              <button 
            onClick={() => setSuccessModal(null)}
            className="w-full mt-4 bg-blue-500 dark:bg-blue-600 text-white p-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700"
            >
            Close
          </button>
        </div>
          )}
      </div>
      </div>
    );
  };

 {/* Decline Confirmation Modal */}
  const renderDeclineModal = (reference) => {
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

    return (
      <>
        <button 
          onClick={() => setIsDeclineModalOpen(true)}
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 dark:text-white"
        >
          Decline
        </button>

        {isDeclineModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-xl max-w-sm w-full border border-stroke dark:border-strokedark">
            <h2 className="text-xl font-bold mb-4 text-center text-black dark:text-white">Confirm Decline</h2>
            <p className="text-center mb-4 text-black dark:text-white">Are you sure you want to decline this fund request?</p>
            <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    handleFundProcessing(reference, 'decline');
                    setIsDeclineModalOpen(false);
                  }}
                  className="flex-1 bg-red-500 dark:bg-red-600 text-white p-2 rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                  >
                  Confirm
                </button>
                <button 
                  onClick={() => setIsDeclineModalOpen(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
                  >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

    const formatDateTime = (dateString) => {
      if (!dateString) return 'Not confirmed';
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy hh:mm a');
    };

    const formatTime = (isoString) => {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    };

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
      { key: 'beneficiary', label: 'Beneficiary' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
    ];

    if (section === 'outgoing-fund') {
      baseColumns.push({ key: 'actions', label: 'Actions' });
    }

    return baseColumns;
  };

  


  return (
<>
<div className="min-h-screen">
<Breadcrumb pageName="Fund Management" className="text-black dark:text-white p-4 lg:px-8" />

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
                    <option value="" disabled>Select Church to send Fund</option>
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
                      <th className={tableHeaderClass}>Date</th>
                      <th className={tableHeaderClass}>Time</th>
                      <th className={tableHeaderClass}>Sent From</th>
                      <th className={tableHeaderClass}>Amount</th>
                      <th className={tableHeaderClass}>Purpose</th>
                      <th className={tableHeaderClass}>Request Created by</th>
                      <th className={tableHeaderClass}>Beneficiary</th>
                      <th className={tableHeaderClass}>Status</th>
                      <th className={tableHeaderClass}>Approved By</th>
                      <th className={tableHeaderClass}>Approved On</th>
                      <th className={tableHeaderClass}>Documents</th>
                      <th className={tableHeaderClass}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-navy-700 bg-white dark:bg-navy-800 dark:bg-boxdark dark:text-gray/70 ">
                    {(activeSection === 'incoming-fund' ? incomingFunds : outgoingFunds).map((fund) => (
                      <tr key={fund.reference} className="hover:bg-gray/100 dark:hover:bg-gray/10">
                        <td className={tableCellClass}>{formatDate(fund.initiated_at)}</td>
                        <td className={tableCellClass}>{formatTime(fund.initiated_at)}</td>
                        <td className={tableCellClass}>{fund.benefactor}</td>
                        <td className={tableCellClass}>₦{Number(fund.amount).toFixed(2)}</td>
                        <td className={tableCellClass}>{fund.purpose}</td>
                        <td className={tableCellClass}>
                        {fund.initiator ? fund.initiator.split('(')[0] : 'N/A'}
                        </td>
                        <td className={tableCellClass}>{fund.beneficiary}</td>
                        <td className={tableCellClass}>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            fund.status === 'PAID' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : fund.status === "DECLINED"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          }`}>
                            {fund.status}
                          </span>
                        </td>
                        <td className={tableCellClass}>
                        {fund.auditor ? fund.auditor.split('(')[0] : 'N/A'}
                        </td>
                        <td className={tableCellClass}>
                        {fund.approved_at ? formatDate(fund.initiated_at) : "N/A"}
                        </td>
                         <td className={tableCellClass}>
                        {fund.files && fund.files.length > 0 ? (
                          <button
                            onClick={() => handleViewFile(fund.files)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                             >
                            <Eye size={20} />
                        </button>
                        ) : (
                         'N/A'
                        )}
                      </td>

                        <td className={tableCellClass}>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFundProcessing(fund.reference, 'processing')}
                              className="text-primary hover:text-primary-dark"
                            >
                              Process
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFundProcessing(fund.reference, 'paid')}
                              className="text-green-600 hover:text-green-700"
                            >
                              Pay
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-navy-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-green-700">Success!</h2>
            <p className="text-green-700 dark:text-gray-300">{successModal.message}</p>
            <Button
              onClick={() => setSuccessModal(null)}
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          {errorMessage}
        </div>
      )}

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
  

export default FundManagement;