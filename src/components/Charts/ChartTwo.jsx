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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const Modal = ({ onClose }) => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-boxdark rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b border-stroke dark:border-strokedark flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              Attendance Records ({rawData.count} total)
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark">
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Program</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Venue</th>
                  <th className="p-4 text-left">Church</th>
                </tr>
              </thead>
              <tbody>
                {rawData.results.map((record, index) => (
                  <tr 
                    key={index}
                    className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-boxdark-2"
                  >
                    <td className="p-4">{formatDate(record.date)}</td>
                    <td className="p-4">{record.program}</td>
                    <td className="p-4">{record.name}</td>
                    <td className="p-4">{record.venue}</td>
                    <td className="p-4">{record.church}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: '25%',
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
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
    },
    fill: {
      opacity: 1,
    },
  };

  if (loading) {
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <div className="flex items-center justify-center h-64">
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            My Attendance history
          </h4>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Total Attendance: {rawData.count}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative z-20 inline-block">
            <select
              name="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
            >
              <option value="week" className="dark:bg-boxdark">This Week</option>
              <option value="month" className="dark:bg-boxdark">This Month</option>
              <option value="all" className="dark:bg-boxdark">All Time</option>
            </select>
            <span className="absolute top-1/2 right-3 z-10 -translate-y-1/2">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.47072 1.08816C0.47072 1.02932 0.500141 0.955772 0.54427 0.911642C0.647241 0.808672 0.809051 0.808672 0.912022 0.896932L4.85431 4.60386C4.92785 4.67741 5.06025 4.67741 5.14851 4.60386L9.09079 0.896932C9.19376 0.793962 9.35557 0.808672 9.45854 0.911642C9.56151 1.01461 9.5468 1.17642 9.44383 1.27939L5.50155 4.98632C5.22206 5.23639 4.78076 5.23639 4.51598 4.98632L0.558981 1.27939C0.50014 1.22055 0.47072 1.16171 0.47072 1.08816Z" fill="#637381"/>
              </svg>
            </span>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Show Records
          </button>
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-ml-5 -mb-9">
          {attendanceData && (
            <ReactApexChart
              options={options}
              series={attendanceData.series}
              type="bar"
              height={350}
            />
          )}
        </div>
      </div>

      <Modal onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ChartTwo;