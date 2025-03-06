import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, X, FileText, PlusCircle, CheckCircle, XCircle, Upload, FilePlus } from 'lucide-react';
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

  // Fetch churches and funds on component mount
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://api.thelordsbrethrenchurch.org/api/churches/');
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
        const response = await axios.get('https://api.thelordsbrethrenchurch.org/api/finance/fund/incoming/');
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
        const response = await axios.get('https://api.thelordsbrethrenchurch.org/api/finance/fund/outgoing/');
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

      const response = await axios.post('https://api.thelordsbrethrenchurch.org/api/finance/fund/create/', formData, {
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

  // Main Render Method
  return (
<>
<div className="min-h-screen bg-background">
<Breadcrumb pageName="Fund Management"  className="text-black dark:text-white" />

    <div className="min-h-screen bg-gray-100 dark:bg-boxdark">

    {/* Mobile Menu Toggle */}
    <div className="sticky top-0 z-30 md:hidden bg-background border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Funds Management</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

{/* Mobile Menu */}
{isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm mt-20">
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background p-6 shadow-lg">
            {/* Added Close Button */}
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            
            {/* Navigation Items */}
            <div className="space-y-2">
              <NavButton section="create-fund" icon={PlusCircle} />
              <NavButton section="incoming-fund" icon={FileText} />
              <NavButton section="outgoing-fund" icon={FilePlus} />
            </div>
          </div>
          
          {/* Backdrop click handler */}
          <div 
            className="fixed inset-0 -z-10" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      

      {/* Main Content */}
      <div className="container mx-auto p-4 md:flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 space-y-2">
          <NavButton section="create-fund" icon={PlusCircle} />
          <NavButton section="incoming-fund" icon={FileText} />
          <NavButton section="outgoing-fund" icon={FilePlus} />
        </aside>


          {/* Content Area */}
          <main className="flex-1 space-y-6">
          {activeSection === 'create-fund' && renderCreateFund()}
          
          {activeSection === 'incoming-fund' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Incoming Funds
              </h2>
              {renderTable(incomingFunds, 'incoming')}
            </div>
          )}
          
          {activeSection === 'outgoing-fund' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <FilePlus className="h-5 w-5" />
                Outgoing Funds
              </h2>
              {renderTable(outgoingFunds, 'outgoing')}
            </div>
          )}
        </main>
      </div>


       {/* Error Toast */}
       {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 dark:bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
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
          <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-xl max-w-sm w-full border border-stroke dark:border-strokedark">
            <h2 className="text-xl font-bold mb-4 text-center text-black dark:text-white">Confirm File Upload</h2>
            <p className="text-center mb-4 text-black dark:text-white">
              Upload file: {uploadFileReference.file.name}
            </p>
            <div className="flex justify-between space-x-4">
              <button 
                onClick={handleFileUpload}
                className="flex-1 bg-blue-500 dark:bg-blue-600 text-white p-3 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                Upload
              </button>
              <button 
                onClick={() => setUploadFileReference(null)}
                className="flex-1 bg-blue-500 dark:bg-blue-600 text-white p-3 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

     {/* Loading Overlay */}
     {isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-xl border border-stroke dark:border-strokedark">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
          <p className="mt-4 text-center text-black dark:text-white">Processing...</p>
        </div>
      </div>
    )}

    </div>
</>
  
)}
  

export default FundManagement;