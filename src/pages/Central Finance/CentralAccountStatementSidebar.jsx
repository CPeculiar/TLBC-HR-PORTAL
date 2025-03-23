import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { format, parse } from 'date-fns';
import html2pdf from 'html2pdf.js';

const CentralAccountStatementSidebar = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAccountCode, setSelectedAccountCode] = useState('');
  const [accountDetails, setAccountDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [openingBalance, setOpeningBalance] = useState('0.00');
  const [closingBalance, setClosingBalance] = useState('0.00');
  const [channelStats, setChannelStats] = useState({
    credit: { count: 0, inflow: 0, percentage: 0 },
    debit: { count: 0, outflow: 0, percentage: 0 },
    charges: 0
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
          'https://tlbc-platform-api.onrender.com/api/finance/central/accounts/?limit=30'
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
        `https://tlbc-platform-api.onrender.com/api/finance/central/accounts/${code}/`
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
    acc.charges += parseFloat(tx.charge || 0);
    return acc;
  }, {
    credit: { count: 0, inflow: 0, outflow: 0 },
    debit: { count: 0, inflow: 0, outflow: 0 },
    charges: 0 
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
      
      const finalUrl = url || `https://tlbc-platform-api.onrender.com/api/finance/central/accounts/${selectedAccountCode}/transactions/`;
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

  const formatAmount = (amount) => {
    return `₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    // {formatAmount(accountDetails.balance)}
  };

   // Clear Transactions Function
   const clearTransactions = () => {
    setSelectedAccount(null);
    setSelectedAccountCode('');
    setAccountDetails('');
    setTransactions([]);
    setOpeningBalance('0.00');
    setClosingBalance('0.00');
    setChannelStats({
      credit: { count: 0, inflow: 0, percentage: 0 },
      debit: { count: 0, outflow: 0, percentage: 0 },
      charges: 0
    });
    setDateRange({
      startDate: format(new Date().setDate(1), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    });
    setPaginationUrls({ next: null, previous: null });
    setErrors(null);
    setCurrentPage(1);
  };

  // New function to download statement as PDF
  const downloadStatement = () => {
    if (!transactions || !transactions.transactions) return;
  
    // Create a temporary div to hold the statement content
    const printContent = document.createElement('div');
    printContent.className = 'p-8';
  
    // Add header with company info and account details
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="text-align: left; margin-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #f97316;">ACCOUNT STATEMENT for ${accountDetails.account_name}</h1>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
          <p>Period: ${format(new Date(dateRange.startDate), 'dd/MM/yyyy')} TO ${format(new Date(dateRange.endDate), 'dd/MM/yyyy')}</p>
          <p>Account Number: ${accountDetails.account_number}</p>
          <p>Account Name: ${accountDetails.account_name}</p>
          <p>Bank Name: ${accountDetails.bank_name}</p>
          <p>Currency: NGN</p>
          <p>Current Balance: ${formatAmount(accountDetails.balance)}</p>
        </div>
      </div>
    `;
    printContent.appendChild(header);
  
    // Add summary cards section
    const summaryCards = document.createElement('div');
    summaryCards.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="padding: 15px; background: #eff6ff; border-radius: 8px;">
          <p style="color: #666; font-size: 14px;">Opening Balance</p>
          <p style="font-weight: bold; font-size: 18px;">${formatAmount(transactions.opening)}</p>
        </div>
        <div style="padding: 15px; background: #f0fdf4; border-radius: 8px;">
          <p style="color: #666; font-size: 14px;">Credits</p>
          <p style="font-weight: bold; font-size: 18px; color: #22c55e;">${formatAmount(transactions.credits)}</p>
        </div>
        <div style="padding: 15px; background: #fef2f2; border-radius: 8px;">
          <p style="color: #666; font-size: 14px;">Debits</p>
          <p style="font-weight: bold; font-size: 18px; color: #ef4444;">${formatAmount(transactions.debits)}</p>
        </div>
          <div style="padding: 15px; background: #fffbeb; border-radius: 8px;">
          <p style="color: #666; font-size: 14px;">Charges</p>
          <p style="font-weight: bold; font-size: 18px; color: #f59e0b;">${formatAmount(channelStats.charges)}</p>
        </div>
        <div style="padding: 15px; background: #faf5ff; border-radius: 8px;">
          <p style="color: #666; font-size: 14px;">Closing Balance</p>
          <p style="font-weight: bold; font-size: 18px;">${formatAmount(transactions.closing)}</p>
        </div>
      </div>
    `;
    printContent.appendChild(summaryCards);
  
    // Add account summary section
    const accountSummary = document.createElement('div');
    accountSummary.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h4 style="font-weight: bold; margin-bottom: 10px;">ACCOUNTS SUMMARY</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Account No</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Account Name</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Currency</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Opening Balance</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Debits</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Credits</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Charges</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Closing Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">${accountDetails.account_number}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">${accountDetails.account_name}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">NGN</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(transactions.opening)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(channelStats.debit.outflow)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(channelStats.credit.inflow)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(channelStats.charges)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(transactions.closing)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    printContent.appendChild(accountSummary);
  
    // Add channel interaction section
    const channelInteraction = document.createElement('div');
    channelInteraction.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h4 style="font-weight: bold; margin-bottom: 10px;">CHANNEL INTERACTION</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Type</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Count</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Inflow (₦)</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Outflow (₦)</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">%</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">Credit</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${channelStats.credit.count}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(channelStats.credit.inflow)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">-</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${channelStats.credit.percentage}%</td>
            </tr>
            <tr>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">Debit</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${channelStats.debit.count}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">-</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(channelStats.debit.outflow)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${channelStats.debit.percentage}%</td>
            </tr>
            <tr style="font-weight: bold;">
              <td style="border: 1px solid #e5e7eb; padding: 8px;">Total</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${channelStats.credit.count + channelStats.debit.count}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(channelStats.credit.inflow)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(channelStats.debit.outflow)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    printContent.appendChild(channelInteraction);
  
    // Add transactions table
    const transactionsTable = document.createElement('div');
    transactionsTable.innerHTML = `
      <div>
        <h4 style="font-weight: bold; margin-bottom: 10px;">TRANSACTIONS</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Date</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Purpose</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Reference</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Debit</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Credit</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Charge</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.transactions.map(tx => `
              <tr>
                <td style="border: 1px solid #e5e7eb; padding: 8px;">${format(new Date(tx.date), 'dd/MM/yyyy HH:mm')}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px;">${tx.purpose}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px;">${tx.reference}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${tx.type === 'DEBIT' ? formatAmount(tx.amount) : ''}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${tx.type === 'CREDIT' ? formatAmount(tx.amount) : ''}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(tx.charge)}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatAmount(tx.balance)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    printContent.appendChild(transactionsTable);
  
    // PDF options
    const opt = {
      margin: 10,
      filename: `account-statement for-${accountDetails.account_name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
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
    <>
    <Breadcrumb pageName="Central Account Statement" className="text-black dark:text-white px-4 sm:px-6 lg:px-8" />

    <Card className="w-full max-w-7xl mx-auto p-2 sm:p-4">
    <CardHeader>
    <CardTitle className="text-xl sm:text-2xl font-bold">Account Statement</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
     {/* Error Display */}
     {errors && (
          <Alert variant="destructive" className="mb-4 text-red-500">
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
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-black outline-none transition"
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
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-black outline-none transition"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !selectedAccountCode}
          className="w-full bg-primary text-white rounded py-2 sm:py-3 px-3 sm:px-5 hover:bg-opacity-90 transition-colors disabled:opacity-50"
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
      {accountDetails && transactions && (
        <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">     
          <div className="flex justify-end">
            <button
              onClick={downloadStatement}
              className="bg-green-500 text-white rounded py-2 px-4 text-sm sm:text-base hover:bg-green-600 transition-colors"
              >
              Download
            </button>
            </div>

             {/* Account Information */}        
             <div className="space-y-2 p-2 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-orange-500 text-base sm:text-lg">
                ACCOUNT STATEMENT for {accountDetails.account_name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 text-sm gap-2 text-black font-semibold">
              <p>Period: {format(new Date(dateRange.startDate), 'dd/MM/yyyy')} TO {format(new Date(dateRange.endDate), 'dd/MM/yyyy')}</p>
                <p>Account Number: {accountDetails.account_number}</p>
                <p>Account Name: {accountDetails.account_name}</p>
                <p>Bank Name: {accountDetails.bank_name}</p>
                <p>Currency: NGN</p>
                <p>Current Balance: {formatAmount(accountDetails.balance)}</p>
              </div>
              </div>
             
      
             {/* Summary Cards */}
             {accountDetails && transactions && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg dark:bg-blue-900">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Opening Balance</p>
                <p className="text-lg sm:text-xl font-bold">{formatAmount(transactions.opening)}</p>
              </div>
              <div className="p-3 sm:p-4 bg-green-50 rounded-lg dark:bg-green-900">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Credits</p>
                <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">{formatAmount(transactions.credits)}</p>
              </div>
              <div className="p-3 sm:p-4 bg-red-50 rounded-lg dark:bg-red-900">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Debits</p>
                <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">{formatAmount(transactions.debits)}</p>
              </div>
              <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg dark:bg-yellow-900">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Charges</p>
              <p className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400">{formatAmount(channelStats.charges)}</p>
            </div>
              <div className="p-3 sm:p-4 bg-purple-50 rounded-lg dark:bg-purple-900">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Closing Balance</p>
                <p className="text-lg sm:text-xl font-bold">{formatAmount(transactions.closing)}</p>
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
                      <th className="border p-2 text-right">Charges</th>
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
                      <td className="border p-2 text-right">{formatAmount(channelStats.charges)}</td>
                      <td className="border p-2 text-right">{formatAmount(transactions.closing)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
             

            {/* Channel Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Channel Interaction */}
              <div className="border p-2 sm:p-4 rounded overflow-x-auto dark:text-black">
                <h4 className="font-bold mb-3 text-sm sm:text-base">CHANNEL INTERACTION</h4>
                <div className="min-w-[500px] sm:min-w-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                    <th className="p-2 text-left text-xs sm:text-sm">Type</th>
                          <th className="p-2 text-right text-xs sm:text-sm">Count</th>
                          <th className="p-2 text-right text-xs sm:text-sm">Inflow (₦)</th>
                          <th className="p-2 text-right text-xs sm:text-sm">Outflow (₦)</th>
                          <th className="p-2 text-right text-xs sm:text-sm">%</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm">
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
                    <tr>
                      <td className="p-2 font-bold">Total</td>
                      <td className="p-2 text-right font-bold">{channelStats.credit.count + channelStats.debit.count}</td>
                      <td className="p-2 text-right font-bold">{formatAmount(channelStats.credit.inflow)}</td>
                      <td className="p-2 text-right font-bold">{formatAmount(channelStats.debit.outflow)}</td>
                      <td className="p-2 text-right font-bold">100%</td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>

              {/* Channel Usage Frequency */}
              <div className="border p-2 sm:p-4 rounded">
                <h4 className="font-bold mb-3 text-sm sm:text-base dark:text-black">CHANNEL USAGE FREQUENCY</h4>
                <div className="h-48 w-full flex justify-center items-center">
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
         <div className="min-w-[700px] sm:min-w-0">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-boxdark dark:text-white">
                  <th className="border p-2 text-left text-xs sm:text-sm">Date</th>
                        <th className="border p-2 text-left text-xs sm:text-sm">Purpose</th>
                        <th className="border p-2 text-left text-xs sm:text-sm">Reference</th>
                        <th className="border p-2 text-right text-xs sm:text-sm">Debit</th>
                        <th className="border p-2 text-right text-xs sm:text-sm">Credit</th>
                        <th className="border p-2 text-right text-xs sm:text-sm">Charge</th>
                        <th className="border p-2 text-right text-xs sm:text-sm">Balance</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm">
                  {transactions.transactions?.map((tx) => (
                    <tr key={tx.reference} className="hover:bg-gray/50 dark:hover:bg-boxdark dark:text-black dark:hover:text-white">
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
                      <td className="border p-2 text-right">{formatAmount(tx.charge)}</td>
                      <td className="border p-2 text-right">{formatAmount(tx.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
         )}

            {/* Pagination */}
            {accountDetails && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <button
                onClick={() => handlePageChange(paginationUrls.previous)}
                disabled={!paginationUrls.previous}
                className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm rounded bg-gray-100 disabled:opacity-50"
                >
                <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
                Previous
              </button>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage}
              </span>

              <button 
           className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-100 text-red-700 rounded hover:bg-red-400 hover:text-white hover:font-semibold" 
           onClick={clearTransactions}
        >
          Clear Table
        </button>

              <button
                onClick={() => handlePageChange(paginationUrls.next)}
                disabled={!paginationUrls.next}
               className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm rounded bg-gray-100 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
              </button>
            </div>
            )}
          </div>
        )}

        {selectedAccount && !isLoading && !transactions && !errors && (
          <div className="mt-4 text-center text-gray-500 text-sm sm:text-base">
            No transactions found for the selected period.
          </div>
        )}
      </CardContent>
    </Card>

    </>
);
};


export default CentralAccountStatementSidebar;