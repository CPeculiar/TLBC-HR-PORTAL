import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, X, FileText, PlusCircle, CheckCircle, XCircle } from 'lucide-react';

const ExpensesManagement = () => {
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
  const [successModal, setSuccessModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedExpenseReference, setSelectedExpenseReference] = useState(null);


  // Fetch bank accounts and expenses on component mount
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/accounts/');
        setBankAccounts(response.data.results);
      } catch (error) {
        setErrorMessage('Failed to fetch bank accounts');
      }
    };

    const fetchExpensesList = async () => {
      try {
        const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/expense/list/');
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

      const response = await axios.post('https://tlbc-platform-api.onrender.com/api/finance/expense/', formData, {
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
      const response = await axios.post(`https://tlbc-platform-api.onrender.com/api/finance/expense/${reference}/approve/`);
      
      // Update approvals list
      const updatedApprovals = approvalsList.filter(expense => expense.reference !== reference);
      setApprovalsList(updatedApprovals);

      setSuccessModal({
        message: response.data.message || 'Expense approved successfully',
        details: { reference }
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to approve expense');
    }
  };

  const handleDeclineExpense = async (reference) => {
    try {
      const response = await axios.post(`https://tlbc-platform-api.onrender.com/api/finance/expense/${reference}/decline/`);
      
      // Update approvals list
      const updatedApprovals = approvalsList.filter(expense => expense.reference !== reference);
      setApprovalsList(updatedApprovals);

      setSuccessModal({
        message: response.data.message || 'Expense declined successfully',
        details: { reference }
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to decline expense');
    }
  };

  const handleUpdateExpenseFile = async (reference, file) => {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await axios.put(`https://tlbc-platform-api.onrender.com/api/finance/expense/${reference}/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessModal({
        message: 'File uploaded successfully',
        details: { reference }
      });
    } catch (error) {
      setErrorMessage('Failed to upload file');
    }
  };

  // Render sections with improved responsiveness
  const renderCreateExpenses = () => (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl mb-6 font-bold text-blue-600 text-center flex items-center justify-center">
        <PlusCircle className="mr-2" /> Create Expense
      </h2>
      <div className="space-y-4">
        <select 
          value={selectedAccount} 
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="">Select Bank Account</option>
          {bankAccounts.map(account => (
            <option key={account.code} value={account.code}>
              {account.account_name}
            </option>
          ))}
        </select>

        <input 
          type="number" 
          placeholder="Amount" 
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <input 
          type="text" 
          placeholder="Purpose" 
          value={expensePurpose}
          onChange={(e) => setExpensePurpose(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            onChange={(e) => setExpenseFile(e.target.files[0])}
            className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button 
          onClick={handleCreateExpense} 
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          <PlusCircle className="mr-2" /> Add Expense
        </button>
      </div>
    </div>
  );

  // Render lists with responsive tables
  const renderTable = (data, columns, renderActions = null) => (
    <div className="w-full overflow-x-auto">
      {data.length === 0 ? (
        <div className="text-center p-4 text-gray-500">No expenses found</div>
      ) : (
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-50">
            <tr>
              {columns.map(column => (
                <th key={column} className="p-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                {columns.map((column, colIndex) => {
                  let value;
                  switch(column.toLowerCase()) {
                    case 'account':
                      value = item.account?.account_name || item.account || 'N/A';
                      break;
                    case 'amount':
                      value = item.amount ? `$${Number(item.amount).toFixed(2)}` : 'N/A';
                      break;
                    case 'purpose':
                      value = item.purpose || 'N/A';
                      break;
                    case 'status':
                      value = item.approved_at ? 'Approved' : 'Pending';
                      break;
                    case 'files':
                      value = item.files ? `${item.files.length} file(s)` : 'No files';
                      break;
                    default:
                      value = item[column.toLowerCase()] || 'N/A';
                  }
                  return (
                    <td key={colIndex} className="p-3 text-sm">
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
        ['Account', 'Amount', 'Purpose', 'Status', 'Files']
      )}
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-600 flex items-center">
        <CheckCircle className="mr-2" /> Expense Approvals
      </h2>
      {renderTable(
        approvalsList, 
        ['Account', 'Amount', 'Purpose', 'Initiator', 'Files', 'Actions'],
        (expense) => (
          <td className="p-3 space-x-2">
            <button 
              onClick={() => handleApproveExpense(expense.reference)} 
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
            >
              Approve
            </button>
            <button 
              onClick={() => handleDeclineExpense(expense.reference)} 
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
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
          ? 'bg-blue-500 text-white' 
          : 'hover:bg-blue-100 text-blue-700'
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4 text-center">Success</h2>
          <p className="text-center mb-4">{successModal.message}</p>
          {successModal.details && (
            <div className="mt-4 bg-gray-100 p-3 rounded text-center">
              <p>Amount: {successModal.details.amount}</p>
              <p>Purpose: {successModal.details.purpose}</p>
            </div>
          )}
          <button 
            onClick={() => setSuccessModal(null)}
            className="mt-4 w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Expenses Management</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-blue-600"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 overflow-y-auto">
          <div className="p-4">
            <NavButton section="expenses-list" icon={FileText} />
            <NavButton section="create-expenses" icon={PlusCircle} />
            <NavButton section="approvals" icon={CheckCircle} />
            <NavButton section="updates" icon={XCircle} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto p-4 md:flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 mr-4 space-y-2">
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
        </div>
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          {errorMessage}
        </div>
      )}

      {/* Success Modal */}
      {renderSuccessModal()}
    </div>
  );
};

export default ExpensesManagement;