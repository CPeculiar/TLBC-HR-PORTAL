import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

const ChartOne = () => {
  const [timeRange, setTimeRange] = useState('day');
  const [chartData, setChartData] = useState({
    stewardship: [],
    offerings: []
  });
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [loading, setLoading] = useState(true);

  const options = {
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#3C50E0', '#80CAEE'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 335,
      type: 'area',
      dropShadow: {
        enabled: true,
        color: '#623CEA14',
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: 'straight',
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: '#fff',
      strokeColors: ['#3056D3', '#80CAEE'],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: 'datetime',
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: '0px',
        },
      },
      min: 0,
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy',
      },
    },
  };

  const formatDateForAPI = (date) => {
    return format(date, 'MM/dd/yyyy');
  };

  const calculateDateRange = (latestDate) => {
    const date = parseISO(latestDate);
    
    switch (timeRange) {
      case 'day':
        return {
          start: format(date, 'MM/dd/yyyy'),
          end: format(date, 'MM/dd/yyyy')
        };
      case 'week':
        return {
          start: formatDateForAPI(startOfWeek(date)),
          end: formatDateForAPI(endOfWeek(date))
        };
      case 'month':
        return {
          start: formatDateForAPI(startOfMonth(date)),
          end: formatDateForAPI(endOfMonth(date))
        };
      default:
        return { start: '', end: '' };
    }
  };

  const fetchData = async (initiated_after, initiated_before) => {
    try {
      setLoading(true);
      const url = `https://tlbc-platform-api.onrender.com/api/finance/giving/list/?initiated_after=${initiated_after}&initiated_before=${initiated_before}&limit=200`;
      const response = await axios.get(url);
      
      const confirmedTransactions = response.data.results.filter(item => item.confirmed);
      
      const stewardshipData = confirmedTransactions
        .filter(item => ['STEWARDSHIP', 'TITHE'].includes(item.type))
        .map(item => ({
          x: new Date(item.initiated_at).getTime(),
          y: parseFloat(item.amount)
        }))
        .sort((a, b) => a.x - b.x);

      const offeringsData = confirmedTransactions
        .filter(item => item.type === 'OFFERING')
        .map(item => ({
          x: new Date(item.initiated_at).getTime(),
          y: parseFloat(item.amount)
        }))
        .sort((a, b) => a.x - b.x);

      setChartData({
        stewardship: stewardshipData,
        offerings: offeringsData
      });

      if (confirmedTransactions.length > 0) {
        const latestTransaction = confirmedTransactions.sort(
          (a, b) => new Date(b.initiated_at) - new Date(a.initiated_at)
        )[0];
        const newDateRange = calculateDateRange(latestTransaction.initiated_at);
        setDateRange(newDateRange);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const currentDate = new Date();
      const thirtyDaysAgo = subDays(currentDate, 30);
      await fetchData(
        formatDateForAPI(thirtyDaysAgo),
        formatDateForAPI(currentDate)
      );
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchData(dateRange.start, dateRange.end);
    }
  }, [timeRange]);

  const series = [
    {
      name: 'Stewardship/Tithe',
      data: chartData.stewardship
    },
    {
      name: 'Offerings',
      data: chartData.offerings
    }
  ];

  const formatDisplayDate = (dateStr) => {
    return format(new Date(dateStr), 'dd.MM.yyyy');
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="text-xl font-semibold text-black dark:text-white mb-3">Financial Giving Chart</div>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Total Stewardship/Tithe</p>
              {dateRange.start && dateRange.end && (
                <p className="text-sm font-medium">
                  {formatDisplayDate(dateRange.start)} - {formatDisplayDate(dateRange.end)}
                </p>
              )}
            </div>
          </div>
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-secondary">Total Offerings</p>
              {dateRange.start && dateRange.end && (
                <p className="text-sm font-medium">
                  {formatDisplayDate(dateRange.start)} - {formatDisplayDate(dateRange.end)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button
              className={`rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${
                timeRange === 'day' ? 'bg-white shadow-card dark:bg-boxdark' : ''
              }`}
              onClick={() => setTimeRange('day')}
            >
              Day
            </button>
            <button
              className={`rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${
                timeRange === 'week' ? 'bg-white shadow-card dark:bg-boxdark' : ''
              }`}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button
              className={`rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${
                timeRange === 'month' ? 'bg-white shadow-card dark:bg-boxdark' : ''
              }`}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          {loading ? (
            <div className="flex items-center justify-center h-[350px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={350}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartOne;