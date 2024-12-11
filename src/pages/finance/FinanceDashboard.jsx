import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

const FinanceDashboard = () => {
  // State for accounts
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);

  // State for banks (for update account)
  const [banks, setBanks] = useState([]);

  // State for update account form
  const [updateAccountNumber, setUpdateAccountNumber] = useState('');
  const [updateBankCode, setUpdateBankCode] = useState('');
  const [verifiedAccountName, setVerifiedAccountName] = useState('');
  const [updateError, setUpdateError] = useState(null);
  const [isUpdateButtonDisabled, setIsUpdateButtonDisabled] = useState(true);

   // State for default account
   const [selectedDefaultAccount, setSelectedDefaultAccount] = useState('');

  // State for dashboard data
  const [expenses, setExpenses] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // State for messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Chart data (example data, replace with actual data from API)
  const chartData = [
    { month: 'Jan', expenses: 4000, income: 2400 },
    { month: 'Feb', expenses: 3000, income: 1398 },
    { month: 'Mar', expenses: 2000, income: 9800 },
    { month: 'Apr', expenses: 2780, income: 3908 },
    { month: 'May', expenses: 1890, income: 4800 },
    { month: 'Jun', expenses: 2390, income: 3800 },
  ];

  // Show message with timeout
  const showMessage = (type, message) => {
    if (type === 'success') {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 5000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Fetch accounts on component load
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/');
        setAccounts(response.data.results);
        
      // Set default account if exists
      const defaultAccount = response.data.results.find(account => account.is_default);
      if (defaultAccount) {
        setSelectedAccount(defaultAccount);
        fetchAccountDetails(defaultAccount.code);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Error fetching accounts';
      showMessage('error', errorMsg);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/banks/');
      setBanks(response.data.banks);
    } catch (error) {
      const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Error fetching banks';
      showMessage('error', errorMsg);
    }
  };

    fetchAccounts();
    fetchBanks();
    fetchExpenses();
    fetchPendingApprovals();
    fetchTransactions();
  }, []);

  // Fetch account details for selected account
  const fetchAccountDetails = async (accountCode) => {
    try {
      const response = await axios.get(`https://tlbc-platform-api.onrender.com/api/finance/accounts/${accountCode}/`);
      setAccountDetails(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Error fetching account details';
      showMessage('error', errorMsg);
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/expenses/');
      setExpenses(response.data.results);
    } catch (error) {
      const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Error fetching expenses';
      showMessage('error', errorMsg);
    }
  };

  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/approvals/');
      setPendingApprovals(response.data.results);
    } catch (error) {
      const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Error fetching pending approvals';
      showMessage('error', errorMsg);
    }
  };

   // Fetch transactions
   const fetchTransactions = async () => {
    try {
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/transactions/');
      setTransactions(response.data.results);
    } catch (error) {
      const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Error fetching transactions';
      showMessage('error', errorMsg);
    }
  };

  // Handle account selection
  const handleAccountSelect = (e) => {
    const selectedCode = e.target.value;
    const account = accounts.find(acc => acc.code === selectedCode);
    setSelectedAccount(account);
    fetchAccountDetails(selectedCode);
  };

  // Verify account details for update
  const verifyAccountDetails = async () => {
    try {
      const response = await axios.post('https://tlbc-platform-api.onrender.com/api/finance/banks/verify/', {
        account_number: updateAccountNumber,
        bank_code: updateBankCode,
      });
      setVerifiedAccountName(response.data.account_name);
      setIsUpdateButtonDisabled(false);
      setUpdateError(null);
    } catch (error) {
      const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Failed to verify account details';
      setUpdateError(errorMsg);
      setIsUpdateButtonDisabled(true);
    }
  };

  // Handle account update
  const handleUpdateAccount = async () => {
    try {
      await axios.put(`https://tlbc-platform-api.onrender.com/api/finance/accounts/${selectedAccount.code}/`, {
        account_number: updateAccountNumber,
        bank_code: updateBankCode,
      });
      // Refresh accounts after update
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/');
      setAccounts(response.data.results);
      // Reset update form
      setUpdateAccountNumber('');
      setUpdateBankCode('');
      setVerifiedAccountName('');
      setIsUpdateButtonDisabled(true);
   
       // Show success message
       showMessage('success', 'Account updated successfully');
      } catch (error) {
        const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Failed to update account';
        showMessage('error', errorMsg);
      }
    };
  
    // Handle make default account
    const handleMakeDefaultAccount = async () => {
      try {
        await axios.put(`https://tlbc-platform-api.onrender.com/api/finance/accounts/${selectedDefaultAccount}/make-default/`);
        
        // Refresh accounts 
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/');
        setAccounts(response.data.results);
        
        // Show success message
        showMessage('success', 'Default account updated successfully');
      } catch (error) {
        const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Failed to make account default';
        showMessage('error', errorMsg);
      }
    };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Message Handling */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded shadow-lg">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white p-4 rounded shadow-lg">
          {errorMessage}
        </div>
      )}

      {/* Account Selection */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center">
          {selectedAccount ? `Hello, ${selectedAccount.account_name}` : 'Select an Account'}
        </h2>
        <select 
          onChange={handleAccountSelect}
          className="w-full rounded border border-blue-300 p-2 mt-2"
        >
          <option value="" disabled selected>Select Account</option>
          {accounts.map(account => (
            <option key={account.code} value={account.code}>
              {account.account_name} - {account.bank_name}
            </option>
          ))}
        </select>
      </div>

      <div className="p-6 bg-blue-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Cards title="Monthly Expenses" value={`₦${expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toFixed(2)} `|| '₦0.00'} icon="📈" bgColor="bg-gradient-to-r from-orange-300 to-red-400" />
        <Cards title="Monthly Income" value={`₦${accountDetails?.balance} `|| '₦0.00'} icon="💰" bgColor="bg-gradient-to-r from-blue-300 to-blue-500" />
        <Cards title="Account Balance" value={`₦${accountDetails?.balance} `|| '₦0.00'} icon="💎" bgColor="bg-gradient-to-r from-green-300 to-teal-500" />
        <Cards title="Pending Approvals" value="0" icon="⏳"  bgColor="bg-gradient-to-r from-yellow-300 to-yellow-500" />
      </div>
      </div>



      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="" bgColor="bg-gradient-to-r from-orange-300 to-red-400">
          <CardHeader>
            <CardTitle>Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
            ₦{accountDetails?.balance || '₦0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              ₦{expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {pendingApprovals.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Update and Make Default Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Update Account Section */}
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Update Account</h3>
          <div className="space-y-4">
            <select 
              value={selectedAccount?.code || ''}
              onChange={(e) => {
                const account = accounts.find(acc => acc.code === e.target.value);
                setSelectedAccount(account);
              }}
              className="w-full rounded border border-blue-300 p-2"
            >
              <option value="" disabled>Select Account</option>
              {accounts.map(account => (
                <option key={account.code} value={account.code}>
                  {account.account_name} - {account.bank_name}
                </option>
              ))}
            </select>

            <select 
              value={updateBankCode}
              onChange={(e) => setUpdateBankCode(e.target.value)}
              className="w-full rounded border border-blue-300 p-2"
            >
              <option value="" disabled>Select Bank</option>
              {banks.map(bank => (
                <option key={bank.bank_code} value={bank.bank_code}>
                  {bank.bank_name}
                </option>
              ))}
            </select>

            <input 
              type="text" 
              value={updateAccountNumber}
              onChange={(e) => {
                setUpdateAccountNumber(e.target.value);
                setVerifiedAccountName('');
                setIsUpdateButtonDisabled(true);
              }}
              placeholder="Enter Account Number"
              maxLength="10"
              className="w-full rounded border border-blue-300 p-2"
            />

            <button 
              onClick={verifyAccountDetails}
              className="w-full bg-blue-500 text-white rounded p-2"
            >
              Verify Account
            </button>

            {verifiedAccountName && (
              <div>
                <p>Account Name: <strong>{verifiedAccountName}</strong></p>
              </div>
            )}

            {updateError && (
              <p className="text-red-500">{updateError}</p>
            )}

            <button 
              onClick={handleUpdateAccount}
              disabled={isUpdateButtonDisabled}
              className="w-full bg-blue-500 text-white rounded p-2 disabled:opacity-50"
            >
              Update Account
            </button>
          </div>
        </div>

        {/* Make Default Account Section */}
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Select Default Account</h3>
          <div className="space-y-4">
            <select 
              value={selectedDefaultAccount}
              onChange={(e) => setSelectedDefaultAccount(e.target.value)}
              className="w-full rounded border border-blue-300 p-2"
            >
              <option value="" disabled>Select Account</option>
              {accounts.map(account => (
                <option key={account.code} value={account.code}>
                  {account.account_name} - {account.bank_name}
                </option>
              ))}
            </select>

            <button 
              onClick={handleMakeDefaultAccount}
              disabled={!selectedDefaultAccount}
              className="w-full bg-blue-500 text-white rounded p-2 disabled:opacity-50"
            >
              Make Default Account
            </button>
          </div>
        </div>
      </div>

      {/* Update Account Section */}
      {/* <div className="mt-6 p-6 border rounded-lg">
        <h3 className="text-xl font-bold mb-4">Update Account</h3>
        <div className="grid grid-cols-2 gap-4">
          <select 
            value={selectedAccount?.code || ''}
            onChange={(e) => {
              const account = accounts.find(acc => acc.code === e.target.value);
              setSelectedAccount(account);
            }}
            className="w-full rounded border border-blue-300 p-2"
          >
            {accounts.map(account => (
              <option key={account.code} value={account.code}>
                {account.account_name} - {account.bank_name}
              </option>
            ))}
          </select>

          <select 
            value={updateBankCode}
            onChange={(e) => setUpdateBankCode(e.target.value)}
            className="w-full rounded border border-blue-300 p-2"
          >
            <option value="">Select Bank</option>
            {banks.map(bank => (
              <option key={bank.bank_code} value={bank.bank_code}>
                {bank.bank_name}
              </option>
            ))}
          </select>

          <input 
            type="text" 
            value={updateAccountNumber}
            onChange={(e) => {
              setUpdateAccountNumber(e.target.value);
              setVerifiedAccountName('');
              setIsUpdateButtonDisabled(true);
            }}
            placeholder="Enter Account Number"
            maxLength="10"
            className="w-full rounded border border-blue-300 p-2"
          />

          <button 
            onClick={verifyAccountDetails}
            className="w-full bg-blue-500 text-white rounded p-2"
          >
            Verify Account
          </button>
        </div>

        {verifiedAccountName && (
          <div className="mt-4">
            <p>Account Name: <strong>{verifiedAccountName}</strong></p>
          </div>
        )}

        {updateError && (
          <p className="text-red-500 mt-2">{updateError}</p>
        )}

        <button 
          onClick={handleUpdateAccount}
          disabled={isUpdateButtonDisabled}
          className="mt-4 w-full bg-blue-500 text-white rounded p-2 disabled:opacity-50"
        >
          Update Account
        </button>
      </div> */}

      {/* Recent Transactions Table */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="border p-2 hidden md:table-cell">Date</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2 hidden md:table-cell">Type</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((transaction, index) => (
                <tr key={index} className="hover:bg-blue-50">
                  <td className="border p-2 hidden md:table-cell">{transaction.date}</td>
                  <td className="border p-2">{transaction.description}</td>
                  <td className="border p-2">₦{transaction.amount}</td>
                  <td className="border p-2">{transaction.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

       {/* Bar Chart */}
       <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="expenses" fill="#3B82F6" />
            <Bar dataKey="income" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};


const Cards = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 text-white`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default FinanceDashboard;