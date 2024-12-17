import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, X, FileText, PlusCircle, CheckCircle, XCircle, Upload, FilePlus, DollarSign } from 'lucide-react';

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

  // Fetch churches and remittances on component mount
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

    const fetchIncomingRemittances = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/remittance/incoming/');
        setIncomingRemittances(response.data.results);
        setIncomingPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        });
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch incoming remittances');
        setIsLoading(false);
      }
    };

    const fetchOutgoingRemittances = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/remittance/outgoing/');
        setOutgoingRemittances(response.data.results);
        setOutgoingPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        });
        setIsLoading(false);
      } catch (error) {
        setErrorMessage('Failed to fetch outgoing remittances');
        setIsLoading(false);
      }
    };

    fetchChurches();
    fetchIncomingRemittances();
    fetchOutgoingRemittances();
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


   // Create Remittance Handler
   const handleCreateRemittance = async () => {

     // Clear previous error messages
     setErrorMessage(null);

   // Front-end validation with error message display
    if (!selectedBeneficiary) {
      setErrorMessage('Please select a beneficiary church');
      return;
    }
    if (!selectedBenefactor) {
      setErrorMessage('Please select a benefactor church');
      return;
    }
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
      const formData = new FormData();
      formData.append('amount', remittanceAmount);
      formData.append('purpose', remittancePurpose);
      formData.append('beneficiary', selectedBeneficiary);
      formData.append('benefactor', selectedBenefactor);
      
      if (remittanceFile) {
        formData.append('files', remittanceFile);
      }

      const response = await axios.post('https://tlbc-platform-api.onrender.com/api/finance/remittance/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessModal({
        message: 'Remittance request successfully created',
        details: {
          benefactor: selectedBenefactor,
          amount: remittanceAmount,
          purpose: remittancePurpose
        }
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

        // Join multiple error messages if exist
        const combinedErrorMessage = errorMessages.length > 0 
          ? errorMessages.join(' | ') 
          : 'Failed to create remittance request';
        
        setErrorMessage(combinedErrorMessage);
      } else {
        setErrorMessage('Failed to create remittance request');
      }
      setIsLoading(false);
    }
  };



  // Remittance Processing Handlers
  const handleRemittanceProcessing = async (reference, type) => {
    try {
      setIsLoading(true);
      let endpoint = '';
      if (type === 'confirm') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/remittance/${reference}/confirm/`;
      } else if (type === 'paid') {
        endpoint = `https://tlbc-platform-api.onrender.com/api/finance/remittance/${reference}/paid/`;
      }

      const response = await axios.post(endpoint);

      setSuccessModal({
        message: response.data.message || 'Remittance status updated successfully'
      });

      // Refresh remittances list
      await fetchIncomingRemittances();
      await fetchOutgoingRemittances();
      
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Failed to update remittance status');
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
        `https://tlbc-platform-api.onrender.com/api/finance/remittance/${uploadFileReference.reference}/upload/`,
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

      // Refresh remittances list
      await fetchIncomingRemittances();
      await fetchOutgoingRemittances();

      setUploadFileReference(null);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to upload file');
      setIsLoading(false);
    }
  };

  // Pagination Handlers
  const handlePagination = async (type, direction) => {
    try {
      setIsLoading(true);
      const pagination = type === 'incoming' ? incomingPagination : outgoingPagination;
      const url = direction === 'next' ? pagination.next : pagination.previous;

      if (!url) return;

      const response = await axios.get(url);

      if (type === 'incoming') {
        setIncomingRemittances(response.data.results);
        setIncomingPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        });
      } else {
        setOutgoingRemittances(response.data.results);
        setOutgoingPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        });
      }

      setIsLoading(false);
    } catch (error) {
      setErrorMessage(`Failed to load ${type} remittances`);
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

   // NavButton component now handles sidebar closure
   const NavButton = ({ section, icon: Icon }) => (
    <button 
      onClick={() => {
        setActiveSection(section);
        // Close mobile menu when a nav item is clicked
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

  // Render Create Remittance Section
  const renderCreateRemittance = () => (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl mb-6 font-bold text-blue-600 text-center flex items-center justify-center">
        <PlusCircle className="mr-2" /> Create Remittance Request
      </h2>
      
      {/* Error Message Display */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        <select 
          value={selectedBeneficiary} 
          onChange={(e) => {
            setSelectedBeneficiary(e.target.value);
            setErrorMessage(null); // Clear error when user starts selecting
          }}
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
          onChange={(e) => {
            setSelectedBenefactor(e.target.value);
            setErrorMessage(null); // Clear error when user starts selecting
          }}
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
          value={remittanceAmount}
          onChange={(e) => {
            setRemittanceAmount(e.target.value);
            setErrorMessage(null); // Clear error when user starts typing
          }}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <input 
          type="text" 
          placeholder="Purpose" 
          value={remittancePurpose}
          onChange={(e) => {
            setRemittancePurpose(e.target.value);
            setErrorMessage(null); // Clear error when user starts typing
          }}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            onChange={(e) => setRemittanceFile(e.target.files[0])}
            className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button 
          onClick={handleCreateRemittance} 
          disabled={isLoading}
          className={`w-full text-white p-3 rounded-md transition-colors flex items-center justify-center ${
            isLoading 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <PlusCircle className="mr-2" /> {isLoading ? 'Processing...' : 'Create Remittance Request'}
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
            <div className="text-center p-4 text-gray-500">No remittances found</div>
          ) : (
            <>
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
                            className="text-blue-500 hover:underline flex items-center"
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
                                onClick={() => handleRemittanceProcessing(item.reference, 'confirm')}
                                className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors flex items-center"
                                disabled={isLoading}
                              >
                                <CheckCircle size={16} className="mr-1" /> Confirm
                              </button>
                              <button 
                                onClick={() => handleRemittanceProcessing(item.reference, 'paid')}
                                className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition-colors flex items-center"
                                disabled={isLoading}
                              >
                                <DollarSign size={16} className="mr-1" /> Paid
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
                                  file: file
                                });
                              }
                            };
                            fileInput.click();
                          }}
                          className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600 transition-colors flex items-center"
                        >
                          <Upload size={16} className="mr-1" /> Update
                        </button>
                        {uploadFileReference && uploadFileReference.reference === item.reference && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-sm truncate max-w-[100px]">{uploadFileReference.file.name}</span>
                            <button 
                              onClick={handleFileUpload}
                              className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors"
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
              {/* Pagination */}
              <div className="flex justify-between items-center p-4 bg-blue-50">
                <span className="text-sm text-blue-700">
                  Total: {type === 'incoming' ? incomingPagination.count : outgoingPagination.count}
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handlePagination(type, 'previous')}
                    disabled={type === 'incoming' ? !incomingPagination.previous : !outgoingPagination.previous}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => handlePagination(type, 'next')}
                    disabled={type === 'incoming' ? !incomingPagination.next : !outgoingPagination.next}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
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
  
    // Render Incoming and Outgoing Remittance Sections
    const renderIncomingRemittance = () => (
      <div className="w-full">
        <h2 className="text-2xl mb-6 font-bold text-blue-600 text-center flex items-center justify-center">
          <FileText className="mr-2" /> Incoming Remittance
        </h2>
        {renderTable(incomingRemittances, 'incoming')}
      </div>
    );
  
    const renderOutgoingRemittance = () => (
      <div className="w-full">
        <h2 className="text-2xl mb-6 font-bold text-blue-600 text-center flex items-center justify-center">
          <FileText className="mr-2" /> Outgoing Remittance
        </h2>
        {renderTable(outgoingRemittances, 'outgoing')}
      </div>
    );
  
    // Success Modal Component
    const SuccessModal = () => {
      if (!successModal) return null;
  
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-center mb-4 text-green-500">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4 text-green-700">Success</h2>
            <p className="text-center mb-4">{successModal.message}</p>
            
            {successModal.details && (
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                {successModal.details.benefactor && (
                  <p>Benefactor: {successModal.details.benefactor}</p>
                )}
                {successModal.details.amount && (
                  <p>Amount: ${successModal.details.amount}</p>
                )}
                {successModal.details.purpose && (
                  <p>Purpose: {successModal.details.purpose}</p>
                )}
              </div>
            )}
            
            <button 
              onClick={() => setSuccessModal(null)}
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      );
    };
  
     // Main Render - Update sidebar rendering
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">Remittance Management</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-blue-700"
        >
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
              <NavButton section="create-remittance" icon={PlusCircle} />
              <NavButton section="incoming-remittance" icon={FileText} />
              <NavButton section="outgoing-remittance" icon={FileText} />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:block md:w-1/5 bg-white shadow-md rounded-lg mr-4">
          <NavButton section="create-remittance" icon={PlusCircle} />
          <NavButton section="incoming-remittance" icon={FileText} />
          <NavButton section="outgoing-remittance" icon={FileText} />
        </div>

        {/* Main Content */}
        <div className="w-full md:w-4/5 bg-white shadow-md rounded-lg p-6">
          {activeSection === 'create-remittance' && renderCreateRemittance()}
          {activeSection === 'incoming-remittance' && renderIncomingRemittance()}
          {activeSection === 'outgoing-remittance' && renderOutgoingRemittance()}
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
        <SuccessModal />
  
      </div>
    );
  };
  
  export default RemittanceManagement;