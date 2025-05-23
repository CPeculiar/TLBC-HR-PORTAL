import React, { useState } from 'react';
import axios from 'axios';
import { Eye, CheckCircle, X, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import html2pdf from 'html2pdf.js';

const CentralGivingList = () => {
  const [records, setRecords] = useState([]);
  const [givings, setGivings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

 // New state variables for download functionality
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [downloadData, setDownloadData] = useState(null);
  const [downloadError, setDownloadError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Fetch user info on component mount
  React.useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          'https://tlbc-platform-api.onrender.com/api/user/',
          { withCredentials: true }
        );
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchUserInfo();
  }, []);


  const fetchGivings = async (
    url = 'https://tlbc-platform-api.onrender.com/api/finance/central/giving/admin/list/?limit=20',
  ) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(url, { withCredentials: true });
      setGivings(response.data);
      setRecords(response.data);
    } catch (error) {
      setError('Failed to fetch central giving list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (reference) => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(
        `https://tlbc-platform-api.onrender.com/api/finance/central/giving/admin/${reference}/`,
        {},
        { withCredentials: true },
      );
      setSuccess(response.data.message);
      // Refresh the list after successful approval
      fetchGivings();
    } catch (error) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data?.church) {
        setError(error.response.data.church[0]);
      } else {
        setError('Failed to approve giving');
      }
    } finally {
      clearMessagesAfterTimeout();
    }
  };

  const handleVerify = async (reference) => {
    setError('');
    try {
      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/finance/giving/${reference}/verify/`,
        { withCredentials: true },
      );

      if (response.data.confirmed) {
        setSuccess('Payment was successful');
      } else {
        setError("Payment hasn't been confirmed by PayStack");
      }
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          error.response?.data?.church?.[0] ||
          'Failed to verify payment',
      );
    } finally {
      clearMessagesAfterTimeout();
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not confirmed';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy hh:mm a');
  };

  const handleViewFile = (files) => {
    if (files.length === 1) {
      window.open(files[0], '_blank');
    } else {
      setSelectedFiles(files);
      setIsModalOpen(true);
    }
  };

  const clearMessagesAfterTimeout = () => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  };



  // New functions for download functionality
  const handleDownloadRequest = async () => {
    if (!fromDate || !toDate) {
      setDownloadError('Please select both start and end dates');
      return;
    }

    const formattedFromDate = format(new Date(fromDate), 'MM/dd/yyyy');
    const formattedToDate = format(new Date(toDate), 'MM/dd/yyyy');

    try {
      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/finance/giving/admin/list/?initiated_after=${encodeURIComponent(
          formattedFromDate
        )}&initiated_before=${encodeURIComponent(
          formattedToDate
        )}&limit=100`,
        { withCredentials: true }
      );
      setDownloadData(response.data);
      setShowDownloadModal(false);
      setShowReportModal(true);
    } catch (error) {
      setDownloadError('Failed to fetch report data');
    }
  };


  const generatePDF = () => {
    const element = document.getElementById('report-content');
    
    // First check table width to determine orientation
    const table = element.querySelector('table');
    const tableWidth = table?.offsetWidth || 0;
    
    // If table is wider than 8.5 inches (standard letter width), use landscape
    const orientation = tableWidth > 8.5 * 96 ? 'landscape' : 'portrait'; // 96 is approximate DPI
  
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5], // Smaller margins: top, right, bottom, left
      filename: `church-giving-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        letterRendering: true,
        windowWidth: table?.scrollWidth || 1000, // Ensure full table width is captured
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: orientation,
        compress: true,
        precision: 4,
        putOnlyUsedFonts: true
      },
      pagebreak: { mode: 'avoid-all', before: '.page-break' }
    };
  
    // Add some CSS to the table before generating PDF
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        table {
          font-size: 8pt !important; /* Smaller font size for better fit */
          width: 100% !important;
          table-layout: fixed !important;
        }
        th, td {
          padding: 4px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
      }
    `;
    document.head.appendChild(style);
  
    // Generate PDF with adjusted settings
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        // Clean up added style
        document.head.removeChild(style);
      })
      .catch(error => {
        console.error('PDF generation error:', error);
        document.head.removeChild(style);
      });
  };
  
  const calculateTotalsByCategory = (records) => {
    const totals = records.reduce((acc, record) => {

        // Only process confirmed records
        if (!record.confirmed) {
          return acc;
        }

      const amount = parseFloat(record.amount) || 0;
      const type = record.type?.toLowerCase() || '';

      if (type.includes('stewardship') || type.includes('tithe')) {
        acc.stewardshipTithe += amount;
      } else if (type.includes('offering')) {
        acc.offering += amount;
      } else if (type.includes('project')) {
        acc.project += amount;
      } else if (type.includes('welfare')) {
        acc.welfare += amount;
      }

      return acc;
    }, {
      stewardshipTithe: 0,
      offering: 0,
      project: 0,
      welfare: 0
    });

    totals.grandTotal = totals.stewardshipTithe + totals.offering + totals.project + totals.welfare;
    return totals;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const clearRecords = () => {
    setGivings(null);
    setRecords([]);
    setError('');
  };

   // Add this near the top of your return statement, after the "Fetch My Giving Records" button
     const renderDownloadButton = () => (
      <button
        onClick={() => setShowDownloadModal(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ml-4"
      >
        <Download size={20} className="inline mr-2" />
        Download Report
      </button>
    );

  const renderDownloadModal = () => (
    showDownloadModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium dark:text-white">Select Date Range</h3>
            <button
              onClick={() => {
                setShowDownloadModal(false);
                setDownloadError('');
                setFromDate('');
                setToDate('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {downloadError && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
              {downloadError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block mb-2 dark:text-white">From Date:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-2 dark:text-white">To Date:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setDownloadError('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const renderReportModal = () => (
    showReportModal && downloadData && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto mt-28">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium dark:text-white">Generated Report</h3>
            <button
              onClick={() => setShowReportModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div id="report-content" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold dark:text-white">
                Church Giving Records Report
              </h2>
              {userInfo && (
                <>
                  <p className="dark:text-white font-semibold">Church: CENTRAL</p>
                </>
              )}
              <p className="dark:text-white font-semibold">
                Period: {format(new Date(fromDate), 'dd/MM/yyyy')} -{' '}
                {format(new Date(toDate), 'dd/MM/yyyy')}
              </p>
            </div>

            {downloadData.results?.length > 0 ? (
              <>
                <table className="w-full border-collapse border dark:text-white">
                  <thead>
                    <tr className="bg-gray/10 dark:bg-gray/5 text-center">
                      <th className="border p-2">Type</th>
                      <th className="border p-2">Amount (₦)</th>
                      <th className="border p-2">Details</th>
                      <th className="border p-2">Giver</th>
                      <th className="border p-2">Date of Giving</th>
                      <th className="border p-2">Auditor</th>
                      <th className="border p-2">Confirmed Date</th>
                      <th className="border p-2">Confirmed?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downloadData.results?.map((record) => (
                      <tr key={record.reference} className="border-b text-center">
                        <td className="border p-2">{record.type}</td>
                        <td className="border p-2">{record.amount}</td>
                        <td className="border p-2">{record.detail || 'N/A'}</td>
                        <td className="border p-2">{record.giver}</td>
                        <td className="border p-2">
                          {formatDateTime(record.initiated_at)}
                        </td>
                        <td className="border p-2">
                          {record.auditor ? record.auditor.split('(')[0] : 'N/A'}
                        </td>
                        <td className="border p-2">
                          {formatDateTime(record.confirmation_date)}
                        </td>
                        <td className="border p-2 text-center">
                          {record.confirmed ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border rounded-lg p-4 dark:text-white">
                  <h3 className="font-bold text-lg mb-4">Summary</h3>
                  {(() => {
                    const totals = calculateTotalsByCategory(downloadData.results);
                    return (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 border-b pb-2">
                          <span>Stewardship/Tithe:</span>
                          <span className="text-right">{formatCurrency(totals.stewardshipTithe)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-b pb-2">
                          <span>Offering:</span>
                          <span className="text-right">{formatCurrency(totals.offering)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-b pb-2">
                          <span>Project:</span>
                          <span className="text-right">{formatCurrency(totals.project)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-b pb-2">
                          <span>Welfare:</span>
                          <span className="text-right">{formatCurrency(totals.welfare)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 font-bold">
                          <span>Grand Total:</span>
                          <span className="text-right">{formatCurrency(totals.grandTotal)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                No data found for the selected period.
              </div>
            )}
          </div>

          {downloadData.results?.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={generatePDF}
               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                           >
                             <Download size={20} className="inline mr-2" />
                             Download PDF
                           </button>
                         </div>
                         )}
                       </div>
                     </div>
                   )
                 );
               

  return (
    <>
      <Breadcrumb pageName="Central Givings" />

      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-full">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark dark:text-white">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="font-medium text-black dark:text-white text-xl">
                Central Giving List
              </h3>
              <div className="flex">
              <button
                onClick={() => fetchGivings()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Fetching...' : 'Fetch Central Giving List'}
              </button>

              {renderDownloadButton()}
            </div>
            </div>

            {error && (
              <Alert variant="destructive" className="text-red-500">
                <AlertDescription className="text-red-500 dark:font-bold">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-100 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="p-4 md:p-6.5">
              <div className="w-full overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray/5 dark:bg-gray/5 text-center">
                      <th className="border px-4 py-3">Type</th>
                      <th className="border px-4 py-3">Amount (₦)</th>
                      <th className="border px-4 py-3">Details</th>
                      <th className="border px-4 py-3">Giver</th>
                      <th className="border px-4 py-3">Confirmed?</th>
                      <th className="border px-4 py-3">Auditor</th>
                      <th className="border px-4 py-3">Initiated At</th>
                      <th className="border px-4 py-3">Confirmation Date</th>
                      <th className="border px-4 py-3">Files</th>
                      <th className="border px-4 py-3 ">Verify</th>
                      <th className="border px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  {givings?.results?.length > 0 ? (
                  <tbody>
                    {givings?.results.map((giving) => (
                      <tr
                        key={giving.reference}
                        className="border-b hover:bg-gray/90 dark:hover:bg-gray/10 text-center"
                      >
                        <td className="border px-4 py-3">{giving.type}</td>
                        <td className="border px-4 py-3">{giving.amount}</td>
                        <td className="border px-4 py-3">
                          {giving.detail ? giving.detail : 'N/A'}
                        </td>
                        <td className="border px-4 py-3">{giving.giver}</td>
                        <td className="border px-4 py-3 text-center">
                          {giving.confirmed ? 'Yes' : 'No'}
                        </td>
                        <td className="border px-4 py-3 text-center">
                          {giving.auditor
                            ? giving.auditor.split('(')[0]
                            : 'N/A'}
                        </td>
                        <td className="border px-4 py-3">
                          {formatDateTime(giving.initiated_at)}
                        </td>
                        <td className="border px-4 py-3">
                          {formatDateTime(giving.confirmation_date)}
                        </td>
                        <td className="border px-4 py-3 text-center">
                          {giving.files && giving.files.length > 0 ? (
                            <button
                              onClick={() => handleViewFile(giving.files)}
                              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Eye size={20} />
                            </button>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="border px-4 py-3 text-center">
                          <button
                            onClick={() => handleVerify(giving.reference)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <CheckCircle size={20} />
                          </button>
                        </td>
                        <td className="border px-4 py-3 text-center">
                          {giving.auditor ? (
                            <span className="text-green-600">Approved</span>
                          ) : (
                            <button
                              onClick={() => handleApprove(giving.reference)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                <tbody>
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-black/70 dark:text-white">
                      Click the "Fetch Central Giving List" button to fetch the list of Central givings.
                    </td>
                  </tr>
                </tbody>
              )}
                </table>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() =>
                    givings?.previous && fetchGivings(givings.previous)
                  }
                  disabled={!givings?.previous}
                  className={`px-4 py-2 rounded-md ${
                    givings?.previous
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => givings?.next && fetchGivings(givings.next)}
                  disabled={!givings?.next}
                  className={`px-4 py-2 rounded-md ${
                    givings?.next
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={clearRecords}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear List
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Files</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {selectedFiles.map((file, index) => (
              <button
                key={index}
                onClick={() => window.open(file, '_blank')}
                className="flex items-center gap-2 p-2 text-blue-600 hover:bg-gray/50 rounded-md transition-colors"
              >
                <Eye size={20} />
                <span>File {index + 1}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {renderDownloadModal()}
      {renderReportModal()}
    </>
  );
};

export default CentralGivingList;
