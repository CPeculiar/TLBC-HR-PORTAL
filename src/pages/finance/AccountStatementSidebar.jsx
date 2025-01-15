import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, parse } from 'date-fns';
import html2pdf from 'html2pdf.js';
import Logo from '../../../public/android-chrome-192x192.png';

const AccountStatementSidebar = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAccountCode, setSelectedAccountCode] = useState('');
  const [accountDetails, setAccountDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [openingBalance, setOpeningBalance] = useState('0.00');
  const [closingBalance, setClosingBalance] = useState('0.00');
  const [channelStats, setChannelStats] = useState({
    credit: { count: 0, inflow: 0, percentage: 0 },
    debit: { count: 0, outflow: 0, percentage: 0 }
  });

  const [dateRange, setDateRange] = useState({
    startDate: format(new Date().setDate(1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationUrls, setPaginationUrls] = useState({
    next: null,
    previous: null
  });


  const [isPrinting, setIsPrinting] = useState(false);

  
// Fetch accounts on component mount
useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch account details when an account is selected
  useEffect(() => {
    if (selectedAccountCode) {
      fetchAccountDetails(selectedAccountCode);
    }
  }, [selectedAccountCode]);

  // Format error messages
  const formatErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (Array.isArray(error)) return error.join(', ');
    if (typeof error === 'object' && error !== null) {
      return Object.entries(error)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('; ');
    }
    return 'An error occurred';
  };

 // Fetch accounts list
 const fetchAccounts = async () => {
      try {
        const response = await axios.get(
          'https://tlbc-platform-api.onrender.com/api/finance/accounts/?limit=30'
        );
        setAccounts(response.data.results);
    } catch (error) {
        setErrors(error.response?.data || { error: 'Error fetching accounts' });
    }
  };

   // Fetch account details
   const fetchAccountDetails = async (code) => {
    try {
      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/finance/accounts/${code}/`
      );
      setAccountDetails(response.data);
    } catch (error) {
      setErrors(error.response?.data || { error: 'Error fetching account details' });
    }
  };

// Calculate channel statistics
const calculateChannelStats = (txns) => {
  if (!txns) return;
  
  const stats = txns.reduce((acc, tx) => {
    const type = tx.type.toLowerCase();
    acc[type].count++;
    if (type === 'credit') {
      acc[type].inflow += parseFloat(tx.amount);
    } else {
      acc[type].outflow += parseFloat(tx.amount);
    }
    return acc;
  }, {
    credit: { count: 0, inflow: 0, outflow: 0 },
    debit: { count: 0, inflow: 0, outflow: 0 }
  });

  const total = stats.credit.count + stats.debit.count;
  stats.credit.percentage = ((stats.credit.count / total) * 100).toFixed(1);
  stats.debit.percentage = ((stats.debit.count / total) * 100).toFixed(1);
  setChannelStats(stats);
};

 // Handle account selection
 const handleAccountSelect = (e) => {
  const code = e.target.value;
  setSelectedAccountCode(code);
  setSelectedAccount(code); // Add this line if you're using both state variables
  setErrors(null);
  setTransactions(null);
};

 // Fetch transactions for selected account
 const fetchTransactions = async (url = null) => {
     // Add a guard clause to prevent calls with null account code
  if (!selectedAccountCode) {
    setErrors('Please select an account first');
    return;
  }
    
    setIsLoading(true);
    setErrors(null);
    
    try {
        // Parse the date from yyyy-MM-dd to yyyy-MM-dd format for the API
      const startDate = format(new Date(dateRange.startDate), 'yyyy-MM-dd');
      const endDate = format(new Date(dateRange.endDate), 'yyyy-MM-dd');
      
      const finalUrl = url || `https://tlbc-platform-api.onrender.com/api/finance/accounts/${selectedAccountCode}/transactions/`;
      const params = {
        limit: 100,
        ...(url ? {} : {
          date_after: startDate,
          date_before: endDate
        })
      };

      console.log('Fetching transactions for account:', selectedAccountCode); // Debug log
      console.log('Request URL:', finalUrl); // Debug log


      const response = await axios.get(finalUrl, { params });
      setTransactions(response.data.results);
      calculateChannelStats(response.data.results.transactions);
      setPaginationUrls({
        next: response.data.next,
        previous: response.data.previous
      });
    } catch (error) {
      console.error('Error fetching transactions:', error); // Debug log
      setErrors(error.response?.data?.detail || { error: 'Error fetching transactions' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (url) => {
    if (url) {
      setCurrentPage(url.includes('page=') ? parseInt(url.split('page=')[1]) : 1);
      fetchTransactions(url);
    }
  };

  // Handle date range changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(null);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAccountCode) {
      setErrors('Please select an account first');
      return;
    }
    setCurrentPage(1);
    fetchTransactions();
  };

  // Add this helper function at the top of your component
// const formatAmount = (amount) => {
    // Convert to number and fix to 2 decimal places
    // const number = Number(amount).toFixed(2);
    // Add thousand separators and ₦ symbol
  //   return `₦${number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  // };

  const formatAmount = (amount) => {
    return `₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };


  // New function to download statement as PDF
  const downloadStatement = () => {
    if (!transactions || !transactions.transactions) return;

    // Create a temporary div to hold the statement content
    const printContent = document.createElement('div');
    printContent.className = 'p-8';

    // Add header with company info
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Account Statement</h1>
        <p style="margin-bottom: 5px;">Period: ${format(new Date(dateRange.startDate), 'dd/MM/yyyy')} - ${format(new Date(dateRange.endDate), 'dd/MM/yyyy')}</p>
      </div>
    `;
    printContent.appendChild(header);

    // Add summary section
    const summary = document.createElement('div');
    summary.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="padding: 10px; background: #f0f9ff; border-radius: 8px;">
          <p style="color: #666;">Opening Balance</p>
          <p style="font-weight: bold;">${formatAmount(transactions.opening)}</p>
        </div>
        <div style="padding: 10px; background: #f0fdf4; border-radius: 8px;">
          <p style="color: #666;">Credits</p>
          <p style="font-weight: bold; color: #22c55e;">${formatAmount(transactions.credits)}</p>
        </div>
        <div style="padding: 10px; background: #fef2f2; border-radius: 8px;">
          <p style="color: #666;">Debits</p>
          <p style="font-weight: bold; color: #ef4444;">${formatAmount(transactions.debits)}</p>
        </div>
        <div style="padding: 10px; background: #faf5ff; border-radius: 8px;">
          <p style="color: #666;">Closing Balance</p>
          <p style="font-weight: bold;">${formatAmount(transactions.closing)}</p>
        </div>
      </div>
    `;
    printContent.appendChild(summary);

    // Add transactions table
    const table = document.createElement('div');
    table.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Date</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Reference</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Purpose</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Amount</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">Type</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.transactions.map(tx => `
            <tr>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">${format(new Date(tx.date), 'dd/MM/yyyy HH:mm')}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">${tx.reference}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">${tx.purpose}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(tx.amount)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; ${
                  tx.type === 'CREDIT' 
                    ? 'background: #dcfce7; color: #166534;' 
                    : 'background: #fee2e2; color: #991b1b;'
                }">${tx.type}</span>
              </td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(tx.balance)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    printContent.appendChild(table);

    // PDF options
    const opt = {
      margin: 10,
      filename: `account-statement-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    // Generate PDF
    html2pdf().from(printContent).set(opt).save();
  };

   // Add pieData calculation
   const pieData = [
    { name: 'Credit', value: parseFloat(channelStats.credit.percentage) },
    { name: 'Debit', value: parseFloat(channelStats.debit.percentage) }
  ];

  const COLORS = ['#4ECDC4', '#FF6B6B'];


  return (
    <Card className="w-full max-w-7xl mx-auto">
    <CardHeader>
      <CardTitle className="text-2xl font-bold">Account Statement</CardTitle>
    </CardHeader>
    <CardContent>
     {/* Error Display */}
     {errors && (
          <Alert variant="destructive" className="mb-4">
          <AlertDescription>
      {typeof errors === 'string' 
        ? errors 
        : typeof errors === 'object' 
          ? Object.entries(errors).map(([key, value]) => (
              <div key={key} className="mb-1">
                {formatErrorMessage(value)}
              </div>
            ))
          : 'An error occurred'}
         </AlertDescription>
            {/* <AlertDescription>
              {Object.entries(errors).map(([key, value]) => (
                <div key={key} className="mb-1">
                  {formatErrorMessage(value)}
                </div>
              ))}
            </AlertDescription> */}
          </Alert>
        )}


      {/* <form onSubmit={handleSubmit} className="space-y-4"> */}
      <form onSubmit={(e) => {
          e.preventDefault();
          fetchTransactions();
        }} className="space-y-4">

        {/* Account Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Account</label>
          <select
            value={selectedAccountCode || ''} 
            onChange={handleAccountSelect}
            // className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            required
          >
            <option value="" disabled>Select an account</option>
            {accounts.map(account => (
              <option key={account.code} value={account.code}>
              {account.account_name} - {account.bank_name}
            </option>
            ))}
          </select>
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              // onChange={handleDateChange}
              // className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              // onChange={handleDateChange}
              // className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !selectedAccountCode}
          // className="w-full bg-primary text-white rounded py-3 px-5 hover:bg-opacity-90 transition-colors disabled:opacity-50"
          className="w-full bg-primary text-white rounded py-3 px-5 hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
          {isLoading ? 'Loading...' : 'Generate Statement'}
        </button>
      </form>

      {/* Error Message */}
      {errors && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {errors}
        </div>
      )}

      {/* Transactions Table */}
      {transactions && (
        <div className="mt-6 space-y-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={downloadStatement}
              className="bg-green-500 text-white rounded py-2 px-4 hover:bg-green-600 transition-colors"
            >
              Download
            </button>
            </div>

             {/* Account Information */}
             {accountDetails && (
             <div className="space-y-2">
              <h3 className="font-bold text-orange-500 text-lg">
                ACCOUNT STATEMENT for {accountDetails.account_name}
              </h3>
              <div className="grid grid-cols-2 text-sm gap-2 text-black font-semibold">
              <p>Period: {format(new Date(dateRange.startDate), 'dd/MM/yyyy')} TO {format(new Date(dateRange.endDate), 'dd/MM/yyyy')}</p>
                <p>Account Number: {accountDetails.account_number}</p>
                <p>Account Name: {accountDetails.account_name}</p>
                <p>Bank Name: {accountDetails.bank_name}</p>
                <p>Currency: NGN</p>
                <p>Current Balance: {formatAmount(accountDetails.balance)}</p>
              </div>
              </div>
             )}
      
             {/* Summary Cards */}
             {transactions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900">
                <p className="text-sm text-gray-600 dark:text-gray-300">Opening Balance</p>
                <p className="text-xl font-bold">{formatAmount(transactions.opening)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg dark:bg-green-900">
                <p className="text-sm text-gray-600 dark:text-gray-300">Credits</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatAmount(transactions.credits)}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg dark:bg-red-900">
                <p className="text-sm text-gray-600 dark:text-gray-300">Debits</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatAmount(transactions.debits)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg dark:bg-purple-900">
                <p className="text-sm text-gray-600 dark:text-gray-300">Closing Balance</p>
                <p className="text-xl font-bold">{formatAmount(transactions.closing)}</p>
              </div>
            </div>
             )}

              {/* Account Summary */}
            <div className="border p-4 rounded dark:text-black">
              <h4 className="font-bold mb-3">ACCOUNTS SUMMARY</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Account No</th>
                      <th className="border p-2 text-left">Account Name</th>
                      <th className="border p-2 text-left">Currency</th>
                      <th className="border p-2 text-right">Opening Balance</th>
                      <th className="border p-2 text-right">Debits</th>
                      <th className="border p-2 text-right">Credits</th>
                      <th className="border p-2 text-right">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">{accountDetails?.account_number}</td>
                      <td className="border p-2">{accountDetails?.account_name}</td>
                      <td className="border p-2">NGN</td>
                      <td className="border p-2 text-right">{formatAmount(transactions.opening)}</td>
                      <td className="border p-2 text-right">{formatAmount(channelStats.debit.outflow)}</td>
                      <td className="border p-2 text-right">{formatAmount(channelStats.credit.inflow)}</td>
                      <td className="border p-2 text-right">{formatAmount(transactions.closing)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Channel Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Channel Interaction */}
              <div className="border p-4 rounded dark:text-black">
                <h4 className="font-bold mb-3">CHANNEL INTERACTION</h4>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-right">Count</th>
                      <th className="p-2 text-right">Inflow (₦)</th>
                      <th className="p-2 text-right">Outflow (₦)</th>
                      <th className="p-2 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Credit</td>
                      <td className="p-2 text-right">{channelStats.credit.count}</td>
                      <td className="p-2 text-right">{formatAmount(channelStats.credit.inflow)}</td>
                      <td className="p-2 text-right">-</td>
                      <td className="p-2 text-right">{channelStats.credit.percentage}%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Debit</td>
                      <td className="p-2 text-right">{channelStats.debit.count}</td>
                      <td className="p-2 text-right">-</td>
                      <td className="p-2 text-right">{formatAmount(channelStats.debit.outflow)}</td>
                      <td className="p-2 text-right">{channelStats.debit.percentage}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Channel Usage Frequency */}
              <div className="border p-4 rounded">
                <h4 className="font-bold mb-3 dark:text-black">CHANNEL USAGE FREQUENCY</h4>
                <div className="h-48 flex justify-center items-center">
                  <PieChart width={200} height={200}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </div>

         {/* Transactions Table */}
         {transactions && transactions.transactions && (
         <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-boxdark dark:text-white">
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Purpose</th>
                    <th className="border p-2 text-left">Reference</th>
                    <th className="border p-2 text-right">Debit</th>
                    <th className="border p-2 text-right">Credit</th>
                    <th className="border p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.transactions?.map((tx) => (
                    <tr key={tx.reference} className="hover:bg-gray-50 dark:hover:bg-boxdark dark:text-black dark:hover:text-white">
                      <td className="border p-2">
                        {format(new Date(tx.date), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="border p-2">{tx.purpose}</td>
                      <td className="border p-2">{tx.reference}</td>
                      <td className="border p-2 text-right">
                        {tx.type === 'DEBIT' ? formatAmount(tx.amount) : ''}
                      </td>
                      <td className="border p-2 text-right">
                        {tx.type === 'CREDIT' ? formatAmount(tx.amount) : ''}
                      </td>
                      <td className="border p-2 text-right">{formatAmount(tx.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => handlePageChange(paginationUrls.previous)}
                disabled={!paginationUrls.previous}
                className="flex items-center px-4 py-2 text-sm rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(paginationUrls.next)}
                disabled={!paginationUrls.next}
                className="flex items-center px-4 py-2 text-sm rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {selectedAccount && !isLoading && !transactions && !errors && (
          <div className="mt-4 text-center text-gray-500">
            No transactions found for the selected period.
          </div>
        )}
      </CardContent>
    </Card>


);
};


export default AccountStatementSidebar;