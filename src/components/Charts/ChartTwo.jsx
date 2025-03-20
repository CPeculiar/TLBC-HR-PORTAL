import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChartTwo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [rawData, setRawData] = useState({ count: 0, results: [] });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, [timeRange]);

  const getDateFilter = () => {
    const today = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'all':
        return '';
    }

    return timeRange === 'all' ? '' : `?start_date=${startDate.toISOString().split('T')[0]}`;
  };

  const fetchAttendanceData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("Access token not found. Please login first.");
        navigate("/");
        return;
      }

      setLoading(true);
      const dateFilter = getDateFilter();
      // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/attendance/me/${dateFilter}`,

      
        // `${BASE_URL}/api/attendance/me/${dateFilter}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      if (response.data.results) {
        setRawData(response.data);
        setAttendanceData(processAttendanceData(response.data.results));
      }
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate("/");
      } else {
        setError('Failed to fetch attendance data: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const processAttendanceData = (results) => {
    const programCounts = {
      SUNDAY: 0,
      MIDWEEK: 0,
      OTHER: 0
    };

    results.forEach(record => {
      if (programCounts.hasOwnProperty(record.program)) {
        programCounts[record.program]++;
      }
    });

    return {
      series: [
        {
          name: 'Attended',
          data: [
            programCounts.SUNDAY,
            programCounts.MIDWEEK,
            programCounts.OTHER
          ]
        }
      ]
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const Modal = ({ onClose }) => {
    if (!showModal) return null;
  
     // Handle modal close when clicking outside
     const handleOutsideClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div 
  // className="fixed inset-0 bg-black  bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
  className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto ml-0 lg:ml-[280px]"
  onClick={handleOutsideClick}
  // style={{ marginLeft: '280px' }}
>
  <div className="bg-white dark:bg-boxdark rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden my-4 mx-auto">
     <div className="p-3 sm:p-4 border-b border-stroke dark:border-strokedark flex justify-between items-center sticky top-0 bg-white dark:bg-boxdark z-10">
            <h3 className="text-lg sm:text-xl font-semibold truncate">
              Attendance Records ({rawData.count} total)
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
              aria-label="Close modal"
            >
              {/* ✕ */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="overflow-auto max-h-[calc(90vh-8rem)]">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-max">
              <thead>
              <tr className="border-b border-stroke dark:border-strokedark bg-gray-50 dark:bg-boxdark-2">
                    <th className="p-2 sm:p-4 text-left whitespace-nowrap">Date</th>
                    <th className="p-2 sm:p-4 text-left whitespace-nowrap">Program</th>
                    <th className="p-2 sm:p-4 text-left whitespace-nowrap">Name</th>
                    <th className="p-2 sm:p-4 text-left whitespace-nowrap">Venue</th>
                    <th className="p-2 sm:p-4 text-left whitespace-nowrap">Church</th>
                  </tr>
                </thead>
              <tbody>
                {rawData.results.map((record, index) => (
                  <tr 
                    key={index}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-boxdark-2"
                    >
                      <td className="p-2 sm:p-4 whitespace-nowrap">{formatDate(record.date)}</td>
                      <td className="p-2 sm:p-4 whitespace-nowrap">{record.program}</td>
                      <td className="p-2 sm:p-4 whitespace-nowrap">{record.name}</td>
                      <td className="p-2 sm:p-4 whitespace-nowrap">{record.venue}</td>
                      <td className="p-2 sm:p-4 whitespace-nowrap">{record.church}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    );
  };

  const options = {
    colors: ['#3C50E0'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      type: 'bar',
      height: 335,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
       // Make chart responsive
       redrawOnWindowResize: true,
       redrawOnParentResize: true,
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: '30%',
            },
          },
        },
      },
      {
        breakpoint: 1280,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '35%',
            },
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '40%',
            },
          },
          xaxis: {
            labels: {
              rotate: -45,
              rotateAlways: true,
              style: {
                fontSize: '10px',
              }
            }
          }
        },
      },
      {
        breakpoint: 480,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '50%',
            },
          },
          xaxis: {
            labels: {
              rotate: -45,
              offsetY: 0,
              style: {
                fontSize: '8px',
              }
            }
          },
          yaxis: {
            labels: {
              style: {
                fontSize: '8px',
              }
            }
          }
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 2,
        columnWidth: '25%',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ['Sunday Service', 'Midweek Service', 'Other Programs'],
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Satoshi',
      fontWeight: 500,
      fontSize: '14px',
      markers: {
        radius: 99,
      },
      itemMargin: {
        horizontal: 8
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            fontSize: '12px',
          }
        }
      ]
    },
    fill: {
      opacity: 1,
    },
  };

  if (loading) {
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white p-4 sm:p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm sm:text-base">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white p-4 sm:p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500 text-sm sm:text-base px-4 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-4 sm:p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
    <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
      <div>
        <h4 className="text-lg sm:text-xl font-semibold text-black dark:text-white">
          My Attendance History
        </h4>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Total Attendance: {rawData.count}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="relative z-20 inline-block min-w-[120px]">
            <select
              name="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input text-xs sm:text-sm"
            >
              <option value="week" className="dark:bg-boxdark">This Week</option>
              <option value="month" className="dark:bg-boxdark">This Month</option>
              <option value="all" className="dark:bg-boxdark">All Time</option>
            </select>
            <span className="absolute top-1/2 right-3 z-10 -translate-y-1/2 pointer-events-none">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.47072 1.08816C0.47072 1.02932 0.500141 0.955772 0.54427 0.911642C0.647241 0.808672 0.809051 0.808672 0.912022 0.896932L4.85431 4.60386C4.92785 4.67741 5.06025 4.67741 5.14851 4.60386L9.09079 0.896932C9.19376 0.793962 9.35557 0.808672 9.45854 0.911642C9.56151 1.01461 9.5468 1.17642 9.44383 1.27939L5.50155 4.98632C5.22206 5.23639 4.78076 5.23639 4.51598 4.98632L0.558981 1.27939C0.50014 1.22055 0.47072 1.16171 0.47072 1.08816Z" fill="#637381"/>
              </svg>
            </span>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
          >
            Show Records
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div id="chartTwo" className="min-h-[300px] w-full" style={{ minWidth: '300px' }}>
          {attendanceData && (
            <ReactApexChart
              options={options}
              series={attendanceData.series}
              type="bar"
              height={350}
              width="100%"
            />
          )}
        </div>
      </div>

      <Modal onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ChartTwo;