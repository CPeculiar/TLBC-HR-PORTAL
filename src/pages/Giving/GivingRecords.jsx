import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Upload, X, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import html2pdf from 'html2pdf.js';

const GivingRecords = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [downloadData, setDownloadData] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [downloadError, setDownloadError] = useState('');

    useEffect(() => {
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
  
    const handleDownloadRequest = async () => {
      if (!fromDate || !toDate) {
        setDownloadError('Please select both start and end dates');
        return;
      }
  
      const formattedFromDate = format(new Date(fromDate), 'MM/dd/yyyy');
      const formattedToDate = format(new Date(toDate), 'MM/dd/yyyy');
  
      try {
        const response = await axios.get(
          `https://tlbc-platform-api.onrender.com/api/finance/giving/list/?initiated_after=${encodeURIComponent(
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


  const fetchRecords = async (url = 'https://tlbc-platform-api.onrender.com/api/finance/giving/list/?limit=10') => {
    setIsLoading(true);
    try {
      const response = await axios.get(url, { withCredentials: true });
      setRecords(response.data);
      setCurrentPage(url);
    } catch (error) {
      setError('Failed to fetch records');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecordDetails = async (reference) => {
    try {
      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/finance/giving/${reference}/`,
        { withCredentials: true }
      );
      setSelectedRecord(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      setError('Failed to fetch record details');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');
    setIsLoading(true);

    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }

    if (selectedFile.size > 3 * 1024 * 1024) {
      setUploadError('File size must not exceed 3MB');
      return;
    }

    const formData = new FormData();
    formData.append('files', selectedFile);

    try {
      await axios.patch(
        `https://tlbc-platform-api.onrender.com/api/finance/giving/${selectedRecord.reference}/upload/`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
       setUploadSuccess('File uploaded successfully!');
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadSuccess('');
        fetchRecords(currentPage);
      }, 2000);
    } catch (error) {
        if (error.response?.data) {
            // Extract the first error message from the response
            const errorData = error.response.data;
            const firstError = Object.values(errorData)[0]?.[0];
            setUploadError(firstError || 'Failed to upload file');
          } else {
            setUploadError('Failed to upload file');
          }
        } finally {
            setIsLoading(false);
          }
      };

      const clearRecords = () => {
        setRecords([]);
        setError('');
      };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not confirmed';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy hh:mm a');
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

   // Add this near the top of your return statement, after the "Fetch My Giving Records" button
  //  const renderDownloadButton = () => (
  //   <button
  //     onClick={() => setShowDownloadModal(true)}
  //     className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ml-4"
  //   >
  //     <Download size={20} className="inline mr-2" />
  //     Download Report
  //   </button>
  // );

  const renderDownloadButton = () => (
    <button
      onClick={() => setShowDownloadModal(true)}
      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm md:text-base md:px-4 md:py-2 whitespace-nowrap flex items-center"
    >
      <Download size={16} className="mr-1 md:mr-2" />
      <span className="hidden sm:inline">Download Report</span>
      <span className="sm:hidden">Report</span>
    </button>
  );

  // Add these modals to your existing JSX, after the Details Modal
  // const renderDownloadModal = () => (
  //   showDownloadModal && (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //       <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-md w-full mx-4">
  //         <div className="flex justify-between items-center mb-4">
  //           <h3 className="text-lg font-medium dark:text-white">Select Date Range</h3>
  //           <button
  //             onClick={() => {
  //               setShowDownloadModal(false);
  //               setDownloadError('');
  //               setFromDate('');
  //               setToDate('');
  //             }}
  //             className="text-gray-500 hover:text-gray-700"
  //           >
  //             <X size={20} />
  //           </button>
  //         </div>

  //         {downloadError && (
  //           <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
  //             {downloadError}
  //           </div>
  //         )}

  //         <div className="space-y-4">
  //           <div>
  //             <label className="block mb-2 dark:text-white">From Date:</label>
  //             <input
  //               type="date"
  //               value={fromDate}
  //               onChange={(e) => setFromDate(e.target.value)}
  //               className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
  //             />
  //           </div>
  //           <div>
  //             <label className="block mb-2 dark:text-white">To Date:</label>
  //             <input
  //               type="date"
  //               value={toDate}
  //               onChange={(e) => setToDate(e.target.value)}
  //               className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
  //             />
  //           </div>
  //           <div className="flex justify-end gap-4">
  //             <button
  //               onClick={() => {
  //                 setShowDownloadModal(false);
  //                 setDownloadError('');
  //               }}
  //               className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
  //             >
  //               Cancel
  //             </button>
  //             <button
  //               onClick={handleDownloadRequest}
  //               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
  //             >
  //               Generate Report
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // );

  const renderDownloadModal = () => (
    showDownloadModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 md:p-6 w-full max-w-md mx-auto">
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
            <div className="flex justify-end gap-2 md:gap-4">
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setDownloadError('');
                }}
                className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm md:text-base md:px-4 md:py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadRequest}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base md:px-4 md:py-2"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

//   const renderReportModal = () => (
//     showReportModal && downloadData && (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto mt-28">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-medium dark:text-white">Generated Report</h3>
//             <button
//               onClick={() => setShowReportModal(false)}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X size={20} />
//             </button>
//           </div>

//           <div id="report-content" className="space-y-6">
//             <div className="text-center space-y-2">
//               <h2 className="text-2xl font-bold dark:text-white">
//                 Giving Records Report
//               </h2>
//               {userInfo && (
//                 <>
//                   <p className="dark:text-white font-semibold">
//                     Name: {userInfo.first_name} {userInfo.last_name}
//                   </p>
//                   <p className="dark:text-white font-semibold">Church: {userInfo.church}</p>
//                 </>
//               )}
//               <p className="dark:text-white font-semibold">
//                 Period: {format(new Date(fromDate), 'dd/MM/yyyy')} -{' '}
//                 {format(new Date(toDate), 'dd/MM/yyyy')}
//               </p>
//             </div>

//             {downloadData.results?.length > 0 ? (
//               <>
//             <table className="w-full border-collapse border dark:text-white">
//               <thead>
//                 <tr className="bg-gray/10 dark:bg-gray/5 text-center">
//                   <th className="border p-2">Type</th>
//                   <th className="border p-2">Amount (₦)</th>
//                   <th className="border p-2">Church</th>
//                   <th className="border p-2">Details</th>
//                   <th className="border p-2">Date</th>
//                   <th className="border p-2">Confirmed</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {downloadData.results?.map((record) => (
//                   <tr key={record.reference} className="border-b text-center">
//                     <td className="border p-2">{record.type}</td>
//                     <td className="border p-2">{record.amount}</td>
//                     <td className="border p-2">{record.church}</td>
//                     <td className="border p-2">{record.detail || 'N/A'}</td>
//                     <td className="border p-2">
//                       {formatDateTime(record.initiated_at)}
//                     </td>
//                     <td className="border p-2 text-center">
//                       {record.confirmed ? 'Yes' : 'No'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>


//  {/* Totals Section */}
//  <div className="border rounded-lg p-4 dark:text-white">
//                   <h3 className="font-bold text-lg mb-4">Summary</h3>
//                   {(() => {
//                     const totals = calculateTotalsByCategory(downloadData.results);
//                     return (
//                       <div className="space-y-2">
//                         <div className="grid grid-cols-2 gap-4 border-b pb-2">
//                           <span>Stewardship/Tithe:</span>
//                           <span className="text-right">{formatCurrency(totals.stewardshipTithe)}</span>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4 border-b pb-2">
//                           <span>Offering:</span>
//                           <span className="text-right">{formatCurrency(totals.offering)}</span>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4 border-b pb-2">
//                           <span>Project:</span>
//                           <span className="text-right">{formatCurrency(totals.project)}</span>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4 border-b pb-2">
//                           <span>Welfare:</span>
//                           <span className="text-right">{formatCurrency(totals.welfare)}</span>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4 pt-2 font-bold">
//                           <span>Grand Total:</span>
//                           <span className="text-right">{formatCurrency(totals.grandTotal)}</span>
//                         </div>
//                       </div>
//                     );
//                   })()}
//                 </div>
//               </>
//             ) : (
//               <div className="text-center py-8 text-gray-600 dark:text-gray-300">
//                 No data found for the selected period.
//               </div>
//             )}
//           </div>

//           {downloadData.results?.length > 0 && (
//           <div className="mt-6 flex justify-end">
//             <button
//               onClick={generatePDF}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//             >
//               <Download size={20} className="inline mr-2" />
//               Download PDF
//             </button>
//           </div>
//           )}
//         </div>
//       </div>
//     )
//   );

const renderReportModal = () => (
  showReportModal && downloadData && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white dark:bg-boxdark rounded-lg p-3 md:p-6 w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto mt-16 md:mt-28">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium dark:text-white">Generated Report</h3>
          <button
            onClick={() => setShowReportModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div id="report-content" className="space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-bold dark:text-white">
              Giving Records Report
            </h2>
            {userInfo && (
              <>
                <p className="dark:text-white font-semibold">
                  Name: {userInfo.first_name} {userInfo.last_name}
                </p>
                <p className="dark:text-white font-semibold">Church: {userInfo.church}</p>
              </>
            )}
            <p className="dark:text-white font-semibold">
              Period: {format(new Date(fromDate), 'dd/MM/yyyy')} -{' '}
              {format(new Date(toDate), 'dd/MM/yyyy')}
            </p>
          </div>

          {downloadData.results?.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border dark:text-white text-sm md:text-base">
                  <thead>
                    <tr className="bg-gray/10 dark:bg-gray/5 text-center">
                      <th className="border p-1 md:p-2">Type</th>
                      <th className="border p-1 md:p-2">Amount (₦)</th>
                      <th className="border p-1 md:p-2">Church</th>
                      <th className="border p-1 md:p-2">Details</th>
                      <th className="border p-1 md:p-2">Date</th>
                      <th className="border p-1 md:p-2">Confirmed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downloadData.results?.map((record) => (
                      <tr key={record.reference} className="border-b text-center">
                        <td className="border p-1 md:p-2">{record.type}</td>
                        <td className="border p-1 md:p-2">{record.amount}</td>
                        <td className="border p-1 md:p-2">{record.church}</td>
                        <td className="border p-1 md:p-2">{record.detail || 'N/A'}</td>
                        <td className="border p-1 md:p-2">
                          {formatDateTime(record.initiated_at)}
                        </td>
                        <td className="border p-1 md:p-2 text-center">
                          {record.confirmed ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="border rounded-lg p-3 md:p-4 dark:text-white">
                <h3 className="font-bold text-lg mb-3 md:mb-4">Summary</h3>
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
          <div className="mt-4 md:mt-6 flex justify-end">
            <button
              onClick={generatePDF}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base md:px-4 md:py-2 flex items-center"
            >
              <Download size={16} className="mr-1 md:mr-2" />
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
      <Breadcrumb pageName="Giving Records" className="text-black dark:text-white" />

      <div className="p-3 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-3 px-4 md:py-4 md:px-6.5 dark:border-strokedark flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
              <h3 className="font-medium text-black dark:text-white mb-2 md:mb-0">
                My Giving Records
              </h3>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => fetchRecords()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base md:px-4 md:py-2 flex-grow md:flex-grow-0 whitespace-nowrap flex items-center justify-center"
                  disabled={isLoading}
                >
                {isLoading ? 'Fetching...' : 'Fetch Records'}
              </button>

              <div className="flex-grow md:flex-grow-0">
                  {renderDownloadButton()}
                </div>
              </div>
            </div>
            

            {error && (
              <div className="p-3 md:p-4 mb-3 md:mb-4 text-red-700 bg-red-100 rounded-md mx-4 md:mx-6.5">
                {error}
              </div>
            )}


            <div className="p-3 md:p-6.5">
              <div className="w-full overflow-x-auto">
                <table className="w-full table-auto dark:text-white text-sm md:text-base">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-2 py-2 md:px-4 md:py-3 text-left">Type</th>
                      <th className="px-2 py-2 md:px-4 md:py-3 text-left">Amount (₦)</th>
                      <th className="px-2 py-2 md:px-4 md:py-3 text-left">Church</th>
                      <th className="px-2 py-2 md:px-4 md:py-3 text-left">Details</th>
                      <th className="px-2 py-2 md:px-4 md:py-3 text-left">Date</th>
                      <th className="px-2 py-2 md:px-4 md:py-3 text-center">Confirmed</th>
                      <th className="px-2 py-2 md:px-4 md:py-3 text-center">Upload</th>
                      <th className="px-2 py-2 md:px-4 md:py-3 text-center">View</th>
                    </tr>
                  </thead>
                  {records.results?.length > 0 ? (
                    <tbody>
                      {records.results?.map((record) => (
                        <tr key={record.reference} className="border-b dark:border-gray/50">
                          <td className="px-2 py-2 md:px-4 md:py-3">{record.type}</td>
                          <td className="px-2 py-2 md:px-4 md:py-3">{record.amount}</td>
                          <td className="px-2 py-2 md:px-4 md:py-3">{record.church}</td>
                          <td className="px-2 py-2 md:px-4 md:py-3">{record.detail ? record.detail : 'N/A'}</td>
                          <td className="px-2 py-2 md:px-4 md:py-3">{formatDateTime(record.initiated_at)}</td>
                          <td className="px-2 py-2 md:px-4 md:py-3 text-center">
                            {record.confirmed ? 'Yes' : 'No'}
                          </td>
                          <td className="px-2 py-2 md:px-4 md:py-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowUploadModal(true);
                                setUploadError('');
                                setUploadSuccess('');
                              }}
                              className="p-1 md:p-2 text-blue-600 hover:text-blue-800 transition-colors"
                              aria-label="Upload document"
                            >
                              <Upload size={18} />
                            </button>
                          </td>
                          <td className="px-2 py-2 md:px-4 md:py-3 text-center">
                            <button
                              onClick={() => fetchRecordDetails(record.reference)}
                              className="p-1 md:p-2 text-blue-600 hover:text-blue-800 transition-colors"
                              aria-label="View details"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    <tbody>
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-black/70 dark:text-white">
                          Click the "Fetch Records" button to fetch your givings.
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between mt-4 gap-3">
                <button
                  onClick={() => records.previous && fetchRecords(records.previous)}
                  disabled={!records.previous}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base ${
                    records.previous
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => records.next && fetchRecords(records.next)}
                  disabled={!records.next}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base ${
                    records.next
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>

              {/* Clear button */}
              <div className="flex justify-center mt-4 md:mt-6">
                <button
                  onClick={clearRecords}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm md:text-base md:px-4 md:py-2"
                >
                  Clear List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-boxdark rounded-lg p-4 md:p-6 max-w-md w-full mx-auto dark:text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upload Document</h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setUploadError('');
                  setUploadSuccess('');
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            {uploadError && (
              <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
                {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-md">
                {uploadSuccess}
              </div>
            )}
            <form onSubmit={handleFileUpload}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mb-4 w-full text-sm md:text-base"
              />
              <div className="flex justify-end gap-2 md:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadError('');
                    setUploadSuccess('');
                  }}
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray/50 text-sm md:text-base md:px-4 md:py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-400 text-sm md:text-base md:px-4 md:py-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-boxdark rounded-lg p-4 md:p-6 max-w-3xl w-full mx-auto dark:text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Giving Record Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full mb-4 text-sm md:text-base">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Type</td>
                    <td>{selectedRecord.type}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Amount</td>
                    <td>{selectedRecord.amount}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Church</td>
                    <td>{selectedRecord.church}</td>
                  </tr>
                  <tr className="border-b">
                  <td className="py-2 font-medium">Confirmed</td>
                  <td>{selectedRecord.confirmed ? 'Yes' : 'No'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Initiated At</td>
                  <td>{formatDateTime(selectedRecord.initiated_at)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Confirmation Date</td>
                  <td>{selectedRecord.confirmation_date ? formatDateTime(selectedRecord.confirmation_date) : 'Not confirmed'}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Files</td>
                  <td>
                    {selectedRecord.files?.map((file, index) => (
                      <a
                        key={index}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-4"
                      >
                        <Eye size={20} className="mr-1" />
                        View File {index + 1}
                      </a>
                    ))}
                    {(!selectedRecord.files || selectedRecord.files.length === 0) && 'No files uploaded'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {renderDownloadModal()}
      {renderReportModal()}
    </>
  );
};

export default GivingRecords;