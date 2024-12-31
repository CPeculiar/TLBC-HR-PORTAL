import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, X, FileText, PlusCircle, CheckCircle, XCircle, Upload } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CentralExpensesManagement = () => {
  // State variables
  const [activeSection, setActiveSection] = useState('expenses-list');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePurpose, setExpensePurpose] = useState('');
  const [expenseFile, setExpenseFile] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const [approvalsList, setApprovalsList] = useState([]);
  const [updatesList, setUpdatesList] = useState([]);
  const [updateFileReference, setUpdateFileReference] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedExpenseReference, setSelectedExpenseReference] = useState(null);


  // Fetch bank accounts and expenses on component mount
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/central/accounts/');
        setBankAccounts(response.data.results);
      } catch (error) {
        setErrorMessage('Failed to fetch bank accounts');
      }
    };

    const fetchExpensesList = async () => {
      try {
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/central/expense/list/');
        setExpensesList(response.data.results);
        setUpdatesList(response.data.results);
        
        // Filter approvals list for unapproved expenses
        const unapprovedExpenses = response.data.results.filter(expense => expense.approved_at === null);
        setApprovalsList(unapprovedExpenses);
      } catch (error) {
        setErrorMessage('Failed to fetch expenses list');
      }
    };

    fetchBankAccounts();
    fetchExpensesList();
  }, []);

  // Handlers for expense actions (same as previous implementation)
  const handleCreateExpense = async () => {
    try {
      const formData = new FormData();
      formData.append('account', selectedAccount);
      formData.append('amount', expenseAmount);
      formData.append('purpose', expensePurpose);
      
      if (expenseFile) {
        formData.append('files', expenseFile);
      }

      const response = await axios.post('https://tlbc-platform-api.onrender.com/api/finance/central/expense/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessModal({
        message: 'Expenses created successfully, waiting for approval from the leadership.',
        details: {
          amount: response.data.amount,
          purpose: response.data.purpose
        }
      });

      // Reset form
      setSelectedAccount('');
      setExpenseAmount('');
      setExpensePurpose('');
      setExpenseFile(null);
    } catch (error) {
      setErrorMessage('Failed to create expense');
    }
  };

  const handleApproveExpense = async (reference) => {
    try {
      const response = await axios.post(`https://tlbc-platform-api.onrender.com/api/finance/central/expense/${reference}/approve/`);
      
      // Update approvals list
      const updatedApprovals = approvalsList.filter(expense => expense.reference !== reference);
      setApprovalsList(updatedApprovals);

      setSuccessModal({
        message: response.data.message || 'Expense approved successfully',
        // details: { reference }
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to approve expense');
    }
  };


  const handleDeclineExpense = async (reference) => {
    try {
      const response = await axios.post(`https://tlbc-platform-api.onrender.com/api/finance/central/expense/${reference}/decline/`);
      
      // Update approvals list
      const updatedApprovals = approvalsList.filter(expense => expense.reference !== reference);
      setApprovalsList(updatedApprovals);

      setSuccessModal({
        message: response.data.message || 'Expense declined successfully',
        // details: { reference }
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to decline expense');
    }
  };


 const handleUpdateExpenseFile = async () => {
    try {

       // Check if a file is selected
       if (!updateFileReference || !updateFileReference.file) {
        setErrorMessage('Please select a file to upload');
        return;
      }

       const formData = new FormData();
      formData.append('files', updateFileReference.file);


      const response = await axios.put(
        `https://tlbc-platform-api.onrender.com/api/finance/central/expense/${updateFileReference.reference}/upload/`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

     // Reset the file input and reference
     setUpdateFileReference(null);

     // Show success modal
     setSuccessModal({
       message: 'File uploaded successfully',
       details: { reference: updateFileReference.reference }
     });
   // Refresh the updates list
   const fetchUpdatedList = async () => {
    try {
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/central/expense/list/');
      setUpdatesList(response.data.results);
    } catch (error) {
      setErrorMessage('Failed to refresh updates list');
    }
  };
  fetchUpdatedList();

} catch (error) {
  setErrorMessage('Failed to upload file');
}
};

const renderUpdates = () => (
  <div className="space-y-4 bg-white dark:bg-boxdark">
  <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
    <XCircle className="mr-2 text-blue-600 dark:text-blue-400" /> 
    <span className="text-black dark:text-white">Updates</span>
  </h2>
    {renderTable(
      updatesList, 
      ['Account', 'Amount', 'Purpose', 'Status', 'Initiator', 'Auditor', 'Initiated_at', 'Approved_at', 'Files', 'View'],
      (expense) => (
        <td className="p-3">
          <input 
            type="file"
            id={`file-upload-${expense.reference}`}
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) {
                setUpdateFileReference({
                  reference: expense.reference,
                  file: e.target.files[0]
                });
              }
            }}
          />
          <label 
            htmlFor={`file-upload-${expense.reference}`}
            className="cursor-pointer bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
            <Upload className="mr-2" /> Update File
          </label>
        </td>
      )
    )}
  </div>
);


  // Render sections with improved responsiveness
  const renderCreateExpenses = () => (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-boxdark shadow-md rounded-lg p-6">
    <h2 className="text-2xl mb-6 font-bold text-blue-600 dark:text-blue-400 text-center flex items-center justify-center">
      <PlusCircle className="mr-2 text-blue-600 dark:text-blue-400" /> 
      <span className="text-black dark:text-white">Create Expense</span>
    </h2>
      <div className="space-y-4">
        <select 
          value={selectedAccount} 
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all 
            bg-white dark:bg-form-input 
            text-black dark:text-white 
            border-stroke dark:border-form-strokedark 
            focus:border-primary dark:focus:border-primary"
        >
          <option value="" className="bg-white dark:bg-boxdark text-black dark:text-white">Select Bank Account</option>
          {bankAccounts.map(account => (
            <option key={account.code} value={account.code}  className="bg-white dark:bg-boxdark text-black dark:text-white">
              {account.account_name}
            </option>
          ))}
        </select>

        <input 
          type="number" 
          placeholder="Amount" 
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all 
            bg-white dark:bg-form-input 
            text-black dark:text-white 
            border-stroke dark:border-form-strokedark 
            focus:border-primary dark:focus:border-primary"
        />

        <input 
          type="text" 
          placeholder="Purpose" 
          value={expensePurpose}
          onChange={(e) => setExpensePurpose(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all 
            bg-white dark:bg-form-input 
            text-black dark:text-white 
            border-stroke dark:border-form-strokedark 
            focus:border-primary dark:focus:border-primary"
        />


        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            onChange={(e) => setExpenseFile(e.target.files[0])}
            className="flex-grow 
              file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
              file:text-sm file:bg-blue-50 file:text-blue-700 
              dark:file:bg-blue-900 dark:file:text-blue-300 
              hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
          />
        </div>

        <button 
          onClick={handleCreateExpense} 
          className="w-full bg-blue-500 text-white p-3 rounded-md 
            hover:bg-blue-600 transition-colors flex items-center justify-center 
            dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <PlusCircle className="mr-2" /> Add Expense
        </button>
      </div>
    </div>
  );

  // Helper function to extract name from email
const extractName = (fullString) => {
  if (!fullString) return 'N/A';
  return fullString.split('(')[0].trim();
};

// Helper function to format date
const formatDate = (dateString, prefix = '') => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  return prefix ? `${prefix} on ${formattedDate}` : formattedDate;
};


  // Render lists with responsive tables
  const renderTable = (data, columns, renderActions = null) => (
    <div className="w-full overflow-x-auto">
    {data.length === 0 ? (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400">No expenses found</div>
    ) : (
      <table className="w-full bg-white dark:bg-boxdark shadow-md rounded-lg overflow-hidden">
        <thead className="bg-blue-50 dark:bg-blue-900">
          <tr>
              {columns.map(column => (
                <th key={column} 
                  className="p-3 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider whitespace-nowrap"
                  >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} 
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors 
                  border-stroke dark:border-strokedark"
              >
                {columns.map((column, colIndex) => {
                  let value;
                  switch(column.toLowerCase()) {
                    case 'account':
                      value = item.account?.account_name || item.account || 'N/A';
                      break;
                    case 'amount':
                      value = item.amount ? `₦${Number(item.amount).toFixed(2)}` : 'N/A';
                      break;
                    case 'purpose':
                      value = item.purpose || 'N/A';
                      break;
                    case 'status':
                      value = item.status || 'N/A';
                      break;
                      case 'initiator':
                    value = extractName(item.initiator);
                    break;
                  case 'auditor':
                    value = extractName(item.auditor);
                    break;
                  case 'initiated_at':
                    value = formatDate(item.initiated_at);
                    break;
                  case 'approved_at':
                    value = formatDate(item.approved_at);
                    break;
                    case 'files':
                      value = item.files ? `${item.files.length} file(s)` : 'No files';
                      break;
                    default:
                      value = item[column.toLowerCase()] || 'N/A';
                  }
                  return (
                    <td key={colIndex} className="p-3 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                      {value}
                    </td>
                  );
                })}
                {renderActions && renderActions(item)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  
  const renderExpensesList = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-600 flex items-center">
        <FileText className="mr-2" /> Expenses List
      </h2>
      {renderTable(
        expensesList, 
        ['Account', 'Amount', 'Purpose', 'Status', 'Initiator', 'Auditor', 'Initiated_at', 'Approved_at', 'Files']
    )}
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-4 bg-white dark:bg-boxdark">
      <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
        <CheckCircle className="mr-2 text-blue-600 dark:text-blue-400" /> 
        <span className="text-black dark:text-white">Expense Approvals</span>
      </h2>
      {renderTable(
        approvalsList, 
        ['Account', 'Amount', 'Purpose', 'Initiator', 'Files', 'Actions'],
        (expense) => (
          <td className="p-3 space-x-2">
            <button 
              onClick={() => handleApproveExpense(expense.reference)} 
              className="bg-green-500 text-white p-2 rounded 
                hover:bg-green-600 transition-colors 
                dark:bg-green-700 dark:hover:bg-green-600"
            >
              Approve
            </button>
            <button 
              onClick={() => handleDeclineExpense(expense.reference)} 
              className="bg-red-500 text-white p-2 rounded 
                hover:bg-red-600 transition-colors 
                dark:bg-red-700 dark:hover:bg-red-600"
            >
              Decline
            </button>
          </td>
        )
      )}
    </div>
  );

  // Mobile and Desktop Navigation
  const NavButton = ({ section, icon: Icon }) => (
    <button 
      onClick={() => {
        setActiveSection(section);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full p-3 text-left flex items-center ${
        activeSection === section 
          ? 'bg-blue-500 text-white dark:bg-blue-700' 
          : 'hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300'
      }`}
    >
      <Icon className="mr-2" /> 
      {section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </button>
  );

  // Success and Error Modals
  const renderSuccessModal = () => {
    if (!successModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 dark:text-white">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full dark:text-white">
          <h2 className="text-xl font-bold mb-4 text-center">Success</h2>
          <p className="text-center mb-4 dark:text-white">{successModal.message}</p>
          {successModal.details && (
            <div className="mt-4 bg-gray-100 p-3 rounded text-center dark:text-white">
              <p className='dark:text-white'>Amount: {successModal.details.amount}</p>
              <p className='dark:text-white'>Purpose: {successModal.details.purpose}</p>
            </div>
          )}
          <button 
            onClick={() => setSuccessModal(null)}
            className="mt-4 w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors dark:text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
    <Breadcrumb pageName="Central Expenses Management"  className="text-black dark:text-white" />
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
    {/* Mobile Header */}
    <div className="md:hidden bg-white dark:bg-boxdark shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Central Expenses Management</h1>
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="text-blue-600 dark:text-blue-400"
      >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 overflow-y-auto dark:text-white">
          <div className="p-4 dark:text-white">
            <NavButton section="expenses-list" icon={FileText} />
            <NavButton section="create-expenses" icon={PlusCircle} />
            <NavButton section="approvals" icon={CheckCircle} />
            <NavButton section="updates" icon={XCircle} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto p-4 md:flex dark:text-white">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 mr-4 space-y-2 dark:text-white">
          <NavButton section="expenses-list" icon={FileText} />
          <NavButton section="create-expenses" icon={PlusCircle} />
          <NavButton section="approvals" icon={CheckCircle} />
          <NavButton section="updates" icon={XCircle} />
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeSection === 'create-expenses' && renderCreateExpenses()}
          {activeSection === 'expenses-list' && renderExpensesList()}
          {activeSection === 'approvals' && renderApprovals()}
          {activeSection === 'updates' && renderUpdates()}
        </div>
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 
          dark:bg-red-700">
          {errorMessage}
          <button 
            onClick={() => setErrorMessage(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Modal */}
      {renderSuccessModal()}

       {/* File Upload Modal (if a file is selected) */}
       {updateFileReference && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 dark:text-white">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full dark:text-white">
            <h2 className="text-xl font-bold mb-4 text-center dark:text-white">Confirm File Upload</h2>
            <p className="text-center mb-4 dark:text-white">
              Upload file: {updateFileReference.file.name}
            </p>
            <div className="flex justify-between space-x-4 dark:text-white">
              <button 
                onClick={handleUpdateExpenseFile}
                className="flex-1 bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors dark:text-white"
              >
                Upload
              </button>
              <button 
                onClick={() => setUpdateFileReference(null)}
                className="flex-1 bg-gray-300 text-gray-700 p-3 rounded hover:bg-gray-400 transition-colors dark:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

    </>
  );
};

export default CentralExpensesManagement;