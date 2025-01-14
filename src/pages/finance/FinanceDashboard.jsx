import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import AccountStatement from './AccountStatement';

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

// Add new state for Delete Account form
  const [selectedAccountToDelete, setSelectedAccountToDelete] = useState('');
const [deleteVerifiedDetails, setDeleteVerifiedDetails] = useState(null);
const [isVerifyingDeleteAccount, setIsVerifyingDeleteAccount] = useState(false);
const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
const [deletePassword, setDeletePassword] = useState('');
const [deleteError, setDeleteError] = useState('');
const [isDeletingAccount, setIsDeletingAccount] = useState(false);
const [passwordVisible, setPasswordVisible] = useState(false);
const [errors, setErrors] = useState({});
const [modalError, setModalError] = useState("");


 // Separate state for default account section
 const [selectedDefaultAccount, setSelectedDefaultAccount] = useState('');
 const [defaultAccountDetails, setDefaultAccountDetails] = useState(null);
 const [isVerifyingDefaultAccount, setIsVerifyingDefaultAccount] = useState(false);

   // Add new states for default account selections
const [accountSelections, setAccountSelections] = useState([
  { id: 1, selection: '' }
]);
  // Options for account types with their corresponding form field names and values
  const accountTypeOptions = [
    { 
      label: 'make default account for giving',
      field: 'for_giving',
      value: true
    },
    { 
      label: 'make default account for fund',
      field: 'for_fund',
      value: true
    },
    { 
      label: 'make default account for remittance',
      field: 'for_remittance',
      value: true
    },
    { 
      label: 'remove as default account for giving',
      field: 'for_giving',
      value: false
    },
    { 
      label: 'remove as default account for fund',
      field: 'for_fund',
      value: false
    },
    { 
      label: 'remove as default account for remittance',
      field: 'for_remittance',
      value: false
    }
  ];

   //state for Account Statement
const [showStatement, setShowStatement] = useState(false);

   const [fundPendingCount, setFundPendingCount] = useState(0);
  const [remittancePendingCount, setRemittancePendingCount] = useState(0);
  const [expensesPendingCount, setExpensesPendingCount] = useState(0);
  const [topupPendingCount, setTopupPendingCount] = useState(0);


  // State for dashboard data
  const [expenses, setExpenses] = useState(0);

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

    // Add state for success message visibility
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState('');


  // Add new states for loading
const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

 // Add new state for verified account details
 const [verifiedAccountDetails, setVerifiedAccountDetails] = useState(null);
//  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);

// Add new fetch functions for pending approvals
const fetchFundPendingApprovals = async () => {
  try {
    const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/fund/outgoing/');
    const pendingCount = response.data.results.filter(
      item => item.status !== 'APPROVED' && item.status !== 'DECLINED'
    ).length;
    setFundPendingCount(pendingCount);
  } catch (error) {
    console.error('Error fetching fund pending approvals:', error);
    setFundPendingCount(0);
  }
};

const fetchRemittancePendingApprovals = async () => {
  try {
    const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/remittance/outgoing/');
    const pendingCount = response.data.results.filter(
      item => item.status !== 'APPROVED' && item.status !== 'DECLINED'
    ).length;
    setRemittancePendingCount(pendingCount);
  } catch (error) {
    console.error('Error fetching remittance pending approvals:', error);
    setRemittancePendingCount(0);
  }
};

const fetchExpensesPendingApprovals = async () => {
  try {
    const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/expense/list/');
    const pendingCount = response.data.results.filter(
      item => item.status !== 'APPROVED' && item.status !== 'DECLINED'
    ).length;
    setExpensesPendingCount(pendingCount);
  } catch (error) {
    console.error('Error fetching expenses pending approvals:', error);
    setExpensesPendingCount(0);
  }
};

const fetchTopupPendingApprovals = async () => {
  try {
    const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/topup/list/');
    const pendingCount = response.data.results.filter(
      item => item.status !== 'APPROVED' && item.status !== 'DECLINED'
    ).length;
    setTopupPendingCount(pendingCount);
  } catch (error) {
    console.error('Error fetching topup pending approvals:', error);
    setTopupPendingCount(0);
  }
};

// Define fetch functions
const fetchAccounts = async () => {
  try {
    const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/?limit=30');
    setAccounts(response.data.results);
    
    // Set default account if exists
    const defaultAccount = response.data.results.find(account => account.is_default);
    if (defaultAccount) {
      setSelectedAccount(defaultAccount);
      setAccountDetails(defaultAccount);
    }
    return response.data.results;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    showMessage('error', 'Error fetching accounts');
    return [];
  }
};

const fetchBanks = async () => {
  try {
    const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/banks/');
    setBanks(response.data.banks);
  } catch (error) {
    console.error('Error fetching banks:', error);
    showMessage('error', 'Error fetching banks');
  }
};


const verifyDeleteAccountDetails = () => {
  const account = accounts.find(acc => acc.code === selectedAccountToDelete);
  setDeleteVerifiedDetails(account);
};

//Delete Account
const handleDeleteAccount = async () => {
  if (!deletePassword) {
    setDeleteError("Password is required");
    return;
  }
  
  setIsDeletingAccount(true);
  setDeleteError("");
  
  try {
    const response = await axios.post(
      `https://tlbc-platform-api.onrender.com/api/finance/accounts/${selectedAccountToDelete}/delete/`,
      { password: deletePassword }
    );

    if (response.status === 204) {
      setShowDeleteConfirmModal(false);
      setShowDeleteSuccessModal(true);
      // Refresh accounts list if needed
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    if (error.response) {
      if (error.response.status === 500) {
        setDeleteError("Unable to delete account, please contact support");
      } else if (error.response.data.detail) {
        setDeleteError(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors?.[0]) {
        setDeleteError(error.response.data.non_field_errors[0]);
      } else {
        setDeleteError(formatErrorMessage(error.response.data));
      }
    } else {
      setDeleteError('An error occurred. Please try again.');
    }
  } finally {
    setIsDeletingAccount(false);
    
  }
};


const handleInputChangeDelete = (e) => {
  const { name, value } = e.target;
 
  if (errors[name]) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
};

const formatErrorMessage = (error) => {
  if (typeof error === 'object' && error !== null) {
    return Object.entries(error)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(', ')}`;
        }
        return `${key}: ${value}`;
      })
      .join('\n');
  }
  return error;
};



// Modify useEffect to include new fetch calls
useEffect(() => {
  const fetchAllData = async () => {
    setIsLoading(true);
    try {

      // First fetch accounts to get initial data
      await fetchAccounts();

        // First fetch accounts to get initial data
        const accountsResponse = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/?limit=30');
        setAccounts(accountsResponse.data.results);
        
        // Set default account if exists
        const defaultAccount = accountsResponse.data.results.find(account => account.is_default);
        if (defaultAccount) {
          setSelectedAccount(defaultAccount);
          // Set initial balance for the cards
          setAccountDetails(defaultAccount);
        }

        // Fetch other data in parallel
        await Promise.all([
          fetchAccounts(),
          fetchBanks(),
          fetchExpenses(),
          fetchTransactions(),
          fetchFundPendingApprovals(),
          fetchRemittancePendingApprovals(),
          fetchExpensesPendingApprovals(),
          fetchTopupPendingApprovals()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        showMessage('error', 'Error loading dashboard data');
      } finally {
        setIsLoading(false); // Set loading to false after all fetches complete
      }
    };
    
  fetchAllData();
}, []);

// Modify error handling to capture specific errors
const handleErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const errorMessages = error.response.data.non_field_errors || 
                          error.response.data.detail || 
                          ['An unexpected error occurred'];
    return errorMessages[0];
  }
  return 'An unexpected error occurred';
};


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
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/?limit=30');
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
       const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/expense/list/');
    const transactions = response.data.results;
    // Calculate total expenses from approved transactions only
    const totalExpenses = transactions
      .filter(transaction => transaction.status === 'APPROVED')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    
    setExpenses(totalExpenses);
  } catch (error) {
    const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Error fetching expenses';
    showMessage('error', errorMsg);
  }
};


   // Fetch transactions
   // Update the fetch function
const fetchTransactions = async () => {
  try {
    const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/expense/list/');
    setTransactions(response.data.results);
  } catch (error) {
    const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Error fetching transactions';
    showMessage('error', errorMsg);
  }
};

  // Verify account details for update
  const verifyAccountDetails = async () => {
    setIsVerifyingAccount(true);
    setUpdateError(null);
    try {
      const response = await axios.post('https://tlbc-platform-api.onrender.com/api/finance/banks/verify/', {
        account_number: updateAccountNumber,
        bank_code: updateBankCode,
      });
      setVerifiedAccountName(response.data.account_name);
      setIsUpdateButtonDisabled(false);
      setUpdateError(null);
    } catch (error) {
      const errorMsg = handleErrorMessage(error);
    setUpdateError(errorMsg);
    setIsUpdateButtonDisabled(true);
  } finally {
    setIsVerifyingAccount(false);
  }
  };

  // Handle account update
  const handleUpdateAccount = async () => {
    setIsUpdatingAccount(true);
    try {
      await axios.put(`https://tlbc-platform-api.onrender.com/api/finance/accounts/${selectedAccount.code}/`, {
        account_number: updateAccountNumber,
        bank_code: updateBankCode,
      });
      // Refresh accounts after update
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/?limit=30');
      setAccounts(response.data.results);
      
      // Reset update form
      setUpdateAccountNumber('');
      setUpdateBankCode('');
      setVerifiedAccountName('');
      setIsUpdateButtonDisabled(true);
   
       // Show success message
       showMessage('success', 'Account successfully updated');
  } catch (error) {
    const errorMsg = handleErrorMessage(error);
    showMessage('error', errorMsg);
  } finally {
    setIsUpdatingAccount(false);
  }
};
  
    // Handle make default account
    const handleMakeDefaultAccount = async () => {
      try {
        await axios.put(`https://tlbc-platform-api.onrender.com/api/finance/accounts/${selectedDefaultAccount}/make-default/`);
        
        // Refresh accounts 
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/?limit=30');
        setAccounts(response.data.results);
        
        // Show success message
        showMessage('success', 'Default account updated successfully');
      } catch (error) {
        const errorMsg = error.response?.data?.non_field_errors?.[0] || 'Failed to make account default';
        showMessage('error', errorMsg);
      }
    };

    // Handle adding new selection field
  const addAccountSelection = () => {
    setAccountSelections([
      ...accountSelections,
      { id: accountSelections.length + 1, selection: '' }
    ]);
  };

    // Handle removing selection field
  const removeAccountSelection = (id) => {
    setAccountSelections(accountSelections.filter(selection => selection.id !== id));
  };

  // Handle selection change
  const handleSelectionChange = (id, value) => {
    setAccountSelections(accountSelections.map(selection => 
      selection.id === id ? { ...selection, selection: value } : selection
    ));
  };

  // Handle submit for default account settings
  const handleSubmitDefaultSettings = async () => {
    if (!selectedDefaultAccount) {
      showMessage('error', 'Please select an account first');
      return;
    }

    try {
      setIsLoading(true);

      // Get all selected account types
      const updates = accountSelections.reduce((acc, selection) => {
        if (selection.selection) {
          const option = accountTypeOptions.find(opt => opt.label === selection.selection);
          if (option) {
            acc[option.field] = option.value;
          }
        }
        return acc;
      }, {});

      const response = await axios.patch(
        `https://tlbc-platform-api.onrender.com/api/finance/accounts/${selectedDefaultAccount}/`,
        updates,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        showMessage('success', 'Account settings updated successfully');
        const successMessage = generateSuccessMessage(updates);
        setSuccessDetails(successMessage);
        setShowSuccessModal(true);
        
        // Reset selections
        setAccountSelections([{ id: 1, selection: '' }]);
        
        // Refresh accounts list
        await fetchAccounts();
        
        // Refresh account details
        if (selectedDefaultAccount) {
          await verifyDefaultAccountDetails();
        }

         // Auto-hide success modal after 5 seconds
         setTimeout(() => {
          setShowSuccessModal(false);
          setSuccessDetails('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.detail ||
                      'Failed to update account settings';
      showMessage('error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  
  // Update account selection to store the code
  const handleAccountSelect = async (e) => {
    const selectedCode = e.target.value;
    setSelectedDefaultAccount(selectedCode);
    
    try {
      setIsLoading(true);
      console.log('Selected account code:', selectedCode); // For debugging
      const response = await axios.get(`https://tlbc-platform-api.onrender.com/api/finance/accounts/${selectedCode}/`);
      const account = response.data;
      setSelectedAccount(account);
      setAccountDetails(account);
    } catch (error) {
      console.error('Error fetching account details:', error);
      showMessage('error', 'Error fetching account details');
    } finally {
      setIsLoading(false);
    }
  };


    const handleTimePeriodChange = (period, cardType) => {
      // You can add logic here to fetch data based on the selected time period
      console.log(`${cardType} time period changed to: ${period}`);
    };

    // Verify default account details
  const verifyDefaultAccountDetails = async () => {
    if (!selectedDefaultAccount) {
      showMessage('error', 'Please select an account first');
      return;
    }

    setIsVerifyingDefaultAccount(true);
  setDefaultAccountDetails(null);

    try {
      const response = await axios.get(`https://tlbc-platform-api.onrender.com/api/finance/accounts/${selectedDefaultAccount}/`);
      setDefaultAccountDetails(response.data);
    } catch (error) {
      const errorMsg = handleErrorMessage(error);
      showMessage('error', errorMsg);
    } finally {
      setIsVerifyingDefaultAccount(false);
    }
  };

     // Helper function to generate success message
  const generateSuccessMessage = (updates) => {
    const messages = [];
    
    if (updates.for_giving !== undefined) {
      messages.push(updates.for_giving ? 
        '✓ Set as default account for giving' : 
        '✓ Removed as default account for giving');
    }
    
    if (updates.for_fund !== undefined) {
      messages.push(updates.for_fund ? 
        '✓ Set as default account for fund' : 
        '✓ Removed as default account for fund');
    }
    
    if (updates.for_remittance !== undefined) {
      messages.push(updates.for_remittance ? 
        '✓ Set as default account for remittance' : 
        '✓ Removed as default account for remittance');
    }
    
    return messages.join('\n');
  };

    
  return (
    <>
 <Breadcrumb pageName="Account Management" className="text-black dark:text-white px-4 sm:px-6 lg:px-8" />
    
    {/* Loading Overlay */}
    {isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-xl m-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-black dark:text-white text-center">Loading...</p>
        </div>
      </div>
    )}

{/* Success Modal */}
{showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative bg-white dark:bg-boxdark rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              {/* Success Title */}
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Settings Updated Successfully!
              </h3>
              
              {/* Success Details */}
              <div className="mt-4 text-left">
                <pre className="whitespace-pre-line text-sm text-gray-500 dark:text-gray-300">
                  {successDetails}
                </pre>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Message Handling */}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm">
        {successMessage && (
          <div className="bg-green-500 text-white p-4 rounded shadow-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-500 text-white p-4 rounded shadow-lg">
            {errorMessage}
          </div>
        )}
      </div>


      {/* Account Selection */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-black dark:text-white mb-4">
          {selectedAccount ? `Hello, ${selectedAccount.account_name} ( ${selectedAccount.church} )` : 'Select an Account'}
        </h2>
        <select 
          onChange={handleAccountSelect}
          value={selectedAccount?.code || ''}
          className="w-full rounded border border-stroke bg-white dark:border-strokedark dark:bg-boxdark p-3 text-black dark:text-white"
        >
          <option value="" disabled>Select Account</option>
          {accounts.map(account => (
            <option key={account.code} value={account.code}>
              {account.account_name} - {account.bank_name}
            </option>
          ))}
        </select>
      </div>

            {/* Cards */}
      <div className="p-4 sm:p-6 bg-blue-50 dark:bg-boxdark rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Cards title="Monthly Expenses" value={`₦${expenses.toFixed(2)}` || '₦0.00'} bgColor="bg-gradient-to-r from-orange-300 to-red-400" onTimePeriodChange={(period) => handleTimePeriodChange(period, 'Expenses')} />
            <Cards title="Monthly Income" value={`₦${accountDetails?.balance || '0.00'}`} bgColor="bg-gradient-to-r from-blue-300 to-blue-500" onTimePeriodChange={(period) => handleTimePeriodChange(period, 'Income')} />
            <Cards title="Account Balance" value={`₦${accountDetails?.balance || '0.00'}`} icon="💰" bgColor="bg-gradient-to-r from-green-300 to-teal-500" />
            <Cards title="Transaction History" value={transactions.length.toString()} icon="📜" bgColor="bg-gradient-to-r from-yellow-300 to-yellow-500" />
            <Cards title="Fund Pending Approvals" value={fundPendingCount.toString()} icon="⏳" bgColor="bg-gradient-to-r from-pink-300 to-purple-400" />
            <Cards title="Remittance Pending Approvals" value={remittancePendingCount.toString()} icon="⏳" bgColor="bg-gradient-to-r from-cyan-300 to-sky-400" />
            <Cards title="Expenses Pending Approvals" value={expensesPendingCount.toString()} icon="⏳" bgColor="bg-gradient-to-r from-lime-300 to-green-400" />
            <Cards title="TopUp Pending Approvals" value={topupPendingCount.toString()} icon="⏳" bgColor="bg-gradient-to-r from-amber-300 to-orange-400" />
          </div>
        </div>


      {/* Update and Make Default Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Update Account Section */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
            <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Update Account Details</h3>
            <div className="space-y-4">
            <select 
              value={selectedAccount?.code || ''}
              onChange={(e) => {
                const account = accounts.find(acc => acc.code === e.target.value);
                setSelectedAccount(account);
              }}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />

            <button 
              onClick={verifyAccountDetails}
              disabled={isVerifyingAccount}
              className="w-full bg-blue-500 text-white rounded p-2 disabled:opacity-50 dark:border-form-strokedark dark:bg-blue-500 dark:hover:bg-blue-800   dark:text-white dark:focus:border-primary"
            >
              {isVerifyingAccount ? 'Verifying...' : 'Verify Account'}
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
              disabled={isUpdateButtonDisabled || isUpdatingAccount}
              className="w-full bg-blue-500 text-white rounded p-2 disabled:opacity-50 dark:border-form-strokedark dark:bg-blue-500 dark:hover:bg-blue-800 dark:text-white dark:focus:border-primary"
            >
               {isUpdatingAccount ? 'Updating...' : 'Update Account'}
            </button>

             {/* Add conditional rendering for success and error messages */}
{successMessage && (
  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
    {successMessage}
  </div>
)}

{errorMessage && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    {errorMessage}
  </div>
)}
          </div>
        </div>


        {/* Make Default Account Section */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-black dark:text-white">Set a Default Account</h3>
          <div className="space-y-4">
            {/* Account Selection Dropdown */}
            <div className="flex flex-col space-y-2">
              <select 
                  value={selectedDefaultAccount}
                onChange={(e) => {
                  setSelectedDefaultAccount(e.target.value);
                  setDefaultAccountDetails(null);
                }}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="" disabled>Select Account</option>
                {accounts.map(account => (
                  <option key={account.code} value={account.code}>
                    {account.account_name} - {account.bank_name}
                  </option>
                ))}
              </select>

              <button 
                 onClick={verifyDefaultAccountDetails}
                 disabled={!selectedDefaultAccount || isVerifyingDefaultAccount}
                className="w-full bg-blue-500 text-white rounded p-3 disabled:opacity-50 hover:bg-blue-600 transition-colors duration-200 dark:border-form-strokedark dark:bg-blue-500 dark:hover:bg-blue-800 dark:text-white dark:focus:border-primary"
              >
                 {isVerifyingDefaultAccount ? 'Verifying...' : 'Verify Account Details'}
              </button>
            </div>

             {/* Default Account verified details display */}
             {defaultAccountDetails && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-boxdark rounded-lg">
                <h4 className="text-lg font-semibold mb-3 text-black dark:text-white">Account Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded">
                    <p className="text-sm text-black dark:text-black">
                    <strong>Account Name:</strong><br />
                    {defaultAccountDetails.account_name}
                    </p>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded">
                    <p className="text-sm text-black dark:text-black">
                      <strong>Account Number:</strong><br />
                      {defaultAccountDetails.account_number}
                    </p>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded">
                    <p className="text-sm text-black dark:text-black">
                      <strong>Bank:</strong><br />
                      {defaultAccountDetails.bank_name}
                    </p>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded">
                    <p className="text-sm text-black dark:text-black">
                      <strong>Current Balance:</strong><br />
                      ₦{defaultAccountDetails.balance}
                    </p>
                  </div>
                </div>

                {/* Account Type Selections */}
                <div className="space-y-3">
                  {accountSelections.map((selection) => (
                    <div key={selection.id} className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selection.selection}
                        onChange={(e) => handleSelectionChange(selection.id, e.target.value)}
                        className="flex-1 rounded border-[1.5px] border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        <option value="">Select Account Type</option>
                        {accountTypeOptions.map((option) => (
                          <option key={option.label} value={option.label}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {accountSelections.length > 1 && (
                        <button
                          onClick={() => removeAccountSelection(selection.id)}
                          className="sm:w-auto w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-3">
                  <button 
                    onClick={addAccountSelection}
                    className="w-full bg-green-500 text-white rounded p-3 hover:bg-green-600 transition-colors duration-200"
                  >
                    Add Another Field
                  </button>

                  <button 
      onClick={handleSubmitDefaultSettings}
      disabled={!selectedDefaultAccount || accountSelections.every(s => !s.selection)}
      className="w-full bg-blue-500 text-white rounded p-3 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Update Default Settings
    </button>
                </div>
              </div>
            )}
          </div>
        </div>

 {/* Delete Account Section */}
<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4 sm:p-6">
  <h3 className="text-lg sm:text-xl font-bold mb-4 text-black dark:text-white">Delete Account</h3>
  <div className="space-y-4">
    {/* Account Selection Dropdown */}
    <div className="flex flex-col space-y-2">
      <select 
        value={selectedAccountToDelete || ''}
        onChange={(e) => {
          setSelectedAccountToDelete(e.target.value);
          setDeleteVerifiedDetails(null);
        }}
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      >
        <option value="" disabled>Select Account to Delete</option>
        {accounts.map(account => (
          <option key={account.code} value={account.code}>
            {account.account_name} - {account.bank_name}
          </option>
        ))}
      </select>

      <button 
        onClick={verifyDeleteAccountDetails}
        disabled={!selectedAccountToDelete || isVerifyingDeleteAccount}
        className="w-full bg-blue-500 text-white rounded p-3 disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200 dark:border-form-strokedark dark:bg-blue-500 dark:hover:bg-blue-800 dark:text-white dark:focus:border-primary"
      >
        {isVerifyingDeleteAccount ? 'Verifying...' : 'Verify Account Details'}
      </button>
    </div>

    {/* Verified Account Details */}
    {deleteVerifiedDetails && (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-boxdark rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-black dark:text-white">Account Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className="text-sm text-black dark:text-black">
              <strong>Account Name:</strong><br />
              {deleteVerifiedDetails.account_name}
            </p>
          </div>
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className="text-sm text-black dark:text-black">
              <strong>Account Number:</strong><br />
              {deleteVerifiedDetails.account_number}
            </p>
          </div>
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className="text-sm text-black dark:text-black">
              <strong>Bank:</strong><br />
              {deleteVerifiedDetails.bank_name}
            </p>
          </div>
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className="text-sm text-black dark:text-black">
              <strong>Current Balance:</strong><br />
              ₦{deleteVerifiedDetails.balance}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-3">
          <button 
            onClick={() => {
              setDeleteVerifiedDetails(null);
              setSelectedAccountToDelete('');
            }}
            className="w-full bg-blue-500 text-white rounded p-3 hover:bg-blue-700 transition-colors duration-200"
          >
            Cancel
          </button>

          <button 
            onClick={() => setShowDeleteConfirmModal(true)}
            className="w-full bg-red-500 text-white rounded p-3 hover:bg-red-800 transition-colors duration-200"
          >
            Delete Account
          </button>
        </div>
      </div>
    )}
  </div>
</div>

{/* Delete Confirmation Modal */}
{showDeleteConfirmModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-6 text-center shadow-lg max-w-md w-full mx-4">
      <h2 className="text-xl font-medium text-black mb-4">Confirm Account Deletion</h2>
      <p className="mb-6 text-gray-600 dark:text-black">
        Please enter your password to confirm deletion of account: 
        <span className="font-semibold">{deleteVerifiedDetails?.account_name}</span>
      </p>
      
      <div className="relative">
        <input
          type={passwordVisible ? 'text' : 'password'}
          placeholder="Enter your password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          className="w-full mb-6 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary"
        />
        <button
          type="button"
          onClick={() => setPasswordVisible(!passwordVisible)}
          className="absolute right-4 top-4"
        >
          <svg
            className="fill-current"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.5">
              <path
                d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                fill=""
              />
              <path
                d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                fill=""
              />
            </g>
          </svg>
        </button>
      </div>
      
      {deleteError && (
        <div className="mb-6 text-red-500 text-sm whitespace-pre-line">
          {deleteError}
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          className="bg-blue-500 hover:bg-blue-800 text-white py-2 px-6 rounded-lg transition duration-300"
          onClick={() => {
            setShowDeleteConfirmModal(false);
            setDeletePassword("");
            setDeleteError("");
          }}
        >
          Cancel
        </button>
        <button
          className="bg-red-600 hover:bg-red-800 text-white py-2 px-6 rounded-lg transition duration-300"
          onClick={handleDeleteAccount}
          disabled={isDeletingAccount || !deletePassword}
        >
          {isDeletingAccount ? 'Deleting...' : 'Confirm Delete'}
        </button>
      </div>
    </div>
  </div>
)}

{/* Success Modal */}
{showDeleteSuccessModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-6 text-center shadow-lg max-w-md w-full mx-4">
      <div className="mb-4 text-green-500">
        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-medium text-black mb-4">Success!</h2>
      <p className="mb-6 text-gray-600">The account has been successfully deleted.</p>
      <button
        className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition duration-300"
        onClick={() => {
          setShowDeleteSuccessModal(false);
          setSelectedAccountToDelete('');
          setDeleteVerifiedDetails(null);
        }}
      >
        Close
      </button>
    </div>
  </div>
)}


      {/* Recent Transactions Table */}
      <div className="mb-6">
  <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Recent Transactions</h3>
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-blue-100 dark:bg-boxdark">
          <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">Date</th>
          <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">Account Name</th>
          <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">Amount</th>
          <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">Purpose</th>
          <th className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">Status</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => {
          // Format the date
          const date = new Date(transaction.initiated_at);
          const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          
          return (
            <tr key={transaction.reference} className="hover:bg-blue-50 dark:hover:bg-boxdark">
              <td className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">{formattedDate}</td>
              <td className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">{transaction.account.account_name}</td>
              <td className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">₦{transaction.amount}</td>
              <td className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">{transaction.purpose}</td>
              <td className="border border-stroke dark:border-strokedark p-2 text-black dark:text-white">
                <span 
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    transaction.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {transaction.status}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    {/* Account */}
  
       {/* Add this button after the Recent Transactions section */}
       
<div className="mt-4 mb-6">
  <button
    onClick={() => setShowStatement(true)}
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  >
    Generate Account Statement
  </button>
</div>

{showStatement && (
  <AccountStatement
   selectedAccount={selectedAccount}
  isOpen={showStatement}
  onClose={() => setShowStatement(false)}
  />
)}
  </div>
</div>

       {/* Bar Chart */}
       <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} >
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
      </div>

 {/* Loading Overlay */}
 {isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-xl border border-stroke dark:border-strokedark">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
          <p className="mt-4 text-center text-black dark:text-white">Processing...</p>
        </div>
      </div>
    )}
    
    </>
  );
};


const Cards = ({ title, value, icon, bgColor }) => {
  const [timePeriod, setTimePeriod] = useState('monthly');

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  const getAdjustedTitle = () => {
    switch(timePeriod) {
      case 'weekly':
        return title.replace('Monthly', 'Weekly');
      case 'yearly':
        return title.replace('Monthly', 'Yearly');
      default:
        return title;
    }
  };

  const isFilterableCard = title === 'Monthly Expenses' || title === 'Monthly Income';

  return (
    <div className={`${bgColor} rounded-lg p-6 text-white relative`}>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">{getAdjustedTitle()}</h3>
      {isFilterableCard && (
        <select 
          className="absolute top-2 right-2 bg-white/20 text-white rounded px-1 py-1 text-xs outline-none dark:bg-boxdark/20"
          value={timePeriod} 
          onChange={handleTimePeriodChange}
        >
          <option value="weekly" className="text-black dark:text-white">Weekly</option>
          <option value="monthly" className="text-black dark:text-white">Monthly</option>
          <option value="yearly" className="text-black dark:text-white">Yearly</option>
        </select>
      )}
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);
};
 
export default FinanceDashboard;