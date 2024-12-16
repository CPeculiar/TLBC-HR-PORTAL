import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, X, FileText, PlusCircle, CheckCircle, XCircle, Upload, FilePlus, DollarSign } from 'lucide-react';

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

  // Fetch churches and funds on component mount
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/churches/');
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
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/fund/incoming/');
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
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/fund/outgoing/');
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
      formData.append('beneficiary', selectedBeneficiary);
      formData.append('benefactor', selectedBenefactor);
      
      if (fundFile) {
        formData.append('files', fundFile);
      }

      const response = await axios.post('https://tlbc-platform-api.onrender.com/api/finance/fund/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessModal({
        message: 'Fund request successfully created',
        details: {
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
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/fund/${reference}/processing/`;
      } else if (type === 'paid') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/fund/${reference}/paid/`;
      } else if (type === 'decline') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/fund/${reference}/decline/`;
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
        `https://tlbc-platform-api.onrender.com/api/finance/fund/${uploadFileReference.reference}/upload/`,
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

  // Render Create Fund Section
  const renderCreateFund = () => (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
    <h2 className="text-2xl mb-6 font-bold text-blue-600 text-center flex items-center justify-center">
      <PlusCircle className="mr-2" /> Create Fund Request
    </h2>
    <div className="space-y-4">
        <select 
          value={selectedBeneficiary} 
          onChange={(e) => setSelectedBeneficiary(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
          >
          <option value="">Select Beneficiary Church</option>
          {churches.map(church => (
            <option key={church.slug} value={church.slug}>
              {church.name}
            </option>
          ))}
        </select>

        <select 
          value={selectedBenefactor} 
          onChange={(e) => setSelectedBenefactor(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
          >
          <option value="">Select Benefactor Church</option>
          {churches.map(church => (
            <option key={church.slug} value={church.slug}>
              {church.name}
            </option>
          ))}
        </select>

        <input 
          type="number" 
          placeholder="Amount" 
          value={fundAmount}
          onChange={(e) => setFundAmount(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <input 
          type="text" 
          placeholder="Purpose" 
          value={fundPurpose}
          onChange={(e) => setFundPurpose(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            onChange={(e) => setFundFile(e.target.files[0])}
            className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button 
          onClick={handleCreateFund} 
          disabled={isLoading}
          className={`w-full text-white p-3 rounded-md transition-colors flex items-center justify-center ${
            isLoading 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <PlusCircle className="mr-2" /> {isLoading ? 'Processing...' : 'Create Fund Request'}
        </button>
      </div>
    </div>
  );

  // Render table function
  const renderTable = (data, type) => {
    const columns = [
      'Beneficiary', 'Benefactor', 'Amount', 'Purpose', 'Status', 
      'Initiator', 'Initiated At', 'Auditor', 'Approved At', 'Files', 
      'Action', 'Uploads'
    ];

    return (
      <div className="w-full overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center p-4 text-gray-500">No funds found</div>
        ) : (
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-50">
              <tr>
                {columns.map(column => (
                  <th key={column} className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider whitespace-nowrap">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.reference} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3">{type === 'incoming' ? item.benefactor : item.beneficiary}</td>
                  <td className="p-3">{type === 'incoming' ? item.beneficiary : item.benefactor}</td>
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
                        className="text-blue-500 hover:underline"
                      >
                        View File
                      </a>
                    ) : 'N/A'}
                  </td>
                  {type === 'incoming' && (
                    <td className="p-3 space-y-2">
                      <button 
                        onClick={() => handleFundProcessing(item.reference, 'processing')}
                        className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                      >
                        Processing
                      </button>
                      <button 
                        onClick={() => handleFundProcessing(item.reference, 'paid')}
                        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                      >
                        Paid
                      </button>
                      <button 
                        onClick={() => handleFundProcessing(item.reference, 'decline')}
                        className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                      >
                        Decline
                      </button>
                    </td>
                  )}
                  <td className="p-3">
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
                    <label 
                      htmlFor={`file-upload-${item.reference}`}
                      className="cursor-pointer bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      <Upload className="mr-2" /> Update
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Success Modal
  const renderSuccessModal = () => {
    if (!successModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4 text-center">Success</h2>
          <p className="text-center mb-4">{successModal.message}</p>
          {successModal.details && (
            <div className="mt-4 bg-gray-100 p-3 rounded text-center">
              <p>Benefactor: {successModal.details.benefactor}</p>
              {/* Continue the previous code... */}
          <p>Amount: ${successModal.details.amount}</p>
          <p>Purpose: {successModal.details.purpose}</p>
          <button 
            onClick={() => setSuccessModal(null)}
            className="w-full mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
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
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Decline
        </button>

        {isDeclineModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4 text-center">Confirm Decline</h2>
              <p className="text-center mb-4">Are you sure you want to decline this fund request?</p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    handleFundProcessing(reference, 'decline');
                    setIsDeclineModalOpen(false);
                  }}
                  className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setIsDeclineModalOpen(false)}
                  className="flex-1 bg-gray-300 text-black p-2 rounded hover:bg-gray-400"
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

  // Main Render Method
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Mobile Menu Toggle */}
      <div className="md:hidden bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Funds Management</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-blue-600"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

{/* Mobile Menu */}
{isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 overflow-y-auto mb-5">
          <div className="pt-25">
            <NavButton section="create-fund" icon={PlusCircle} />
            <NavButton section="incoming-fund" icon={FileText} />
            <NavButton section="outgoing-fund" icon={DollarSign} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto p-4 md:flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 mr-4 space-y-2">
          <NavButton section="create-fund" icon={PlusCircle} />
          <NavButton section="incoming-fund" icon={FileText} />
          <NavButton section="outgoing-fund" icon={DollarSign} />
        </div>


          {/* Content Area */}
        <div className="flex-1">
          {activeSection === 'create-fund' && renderCreateFund()}
          
          {activeSection === 'incoming-fund' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-blue-600 flex items-center">
                <FileText className="mr-2" /> Incoming Funds
              </h2>
              {renderTable(incomingFunds, 'incoming')}
            </div>
          )}
          
          {activeSection === 'outgoing-fund' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-blue-600 flex items-center">
                <DollarSign className="mr-2" /> Outgoing Funds
              </h2>
              {renderTable(outgoingFunds, 'outgoing')}
            </div>
          )}
        </div>
      </div>


       {/* Error Toast */}
       {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          {errorMessage}
          <button 
            onClick={() => setErrorMessage(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Render Success Modal */}
      {renderSuccessModal()}




      {/* File Upload Modal when a file is selected */}
      {uploadFileReference && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Confirm File Upload</h2>
            <p className="text-center mb-4">
              Upload file: {uploadFileReference.file.name}
            </p>
            <div className="flex justify-between space-x-4">
              <button 
                onClick={handleFileUpload}
                className="flex-1 bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors"
              >
                Upload
              </button>
              <button 
                onClick={() => setUploadFileReference(null)}
                className="flex-1 bg-gray-300 text-gray-700 p-3 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundManagement;