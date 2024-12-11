import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

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

  // Fetch bank accounts on component mount
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

  // Create Expense Handler
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

  // Approve Expense Handler
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

  // Decline Expense Handler
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

  // Update Expense File Handler
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

  // Render sections
  const renderCreateExpenses = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select 
            value={selectedAccount} 
            onValueChange={setSelectedAccount}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Bank Account" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map(account => (
                <SelectItem key={account.code} value={account.code}>
                  {account.account_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input 
            type="number" 
            placeholder="Amount" 
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input 
            type="text" 
            placeholder="Purpose" 
            value={expensePurpose}
            onChange={(e) => setExpensePurpose(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input 
            type="file" 
            onChange={(e) => setExpenseFile(e.target.files[0])}
            className="w-full p-2 border rounded"
          />

          <Button 
            onClick={handleCreateExpense} 
            className="w-full bg-blue-500 text-white"
          >
            Add Expense
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderExpensesList = () => (
    <Card>
      <CardHeader>
        <CardTitle>Expenses List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Files</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expensesList.map(expense => (
              <TableRow key={expense.reference}>
                <TableCell>{expense.account.account_name}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell>{expense.purpose}</TableCell>
                <TableCell>{expense.status}</TableCell>
                <TableCell>
                  {expense.files.length > 0 ? <Eye /> : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderApprovals = () => (
    <Card>
      <CardHeader>
        <CardTitle>Expense Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Initiator</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvalsList.map(expense => (
              <TableRow key={expense.reference}>
                <TableCell>{expense.account.account_name}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell>{expense.purpose}</TableCell>
                <TableCell>{expense.initiator}</TableCell>
                <TableCell>
                  {expense.files.length > 0 ? <Eye /> : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleApproveExpense(expense.reference)} 
                      className="bg-green-500 text-white"
                    >
                      <CheckCircle className="mr-2" /> Approve
                    </Button>
                    <Button 
                      onClick={() => handleDeclineExpense(expense.reference)} 
                      className="bg-red-500 text-white"
                    >
                      <XCircle className="mr-2" /> Decline
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderUpdates = () => (
    <Card>
      <CardHeader>
        <CardTitle>Update Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updatesList.map(expense => (
              <TableRow key={expense.reference}>
                <TableCell>{expense.account.account_name}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell>{expense.purpose}</TableCell>
                <TableCell>{expense.status}</TableCell>
                <TableCell>
                  {expense.files.length > 0 ? <Eye /> : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.onchange = (e) => {
                        const file = e.target.files[0];
                        handleUpdateExpenseFile(expense.reference, file);
                      };
                      fileInput.click();
                    }} 
                    className="bg-blue-500 text-white"
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // Success Modal
  const renderSuccessModal = () => {
    if (!successModal) return null;

    return (
      <Dialog open={true} onOpenChange={() => setSuccessModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <p>{successModal.message}</p>
            {successModal.details && (
              <div className="mt-4 bg-gray-100 p-3 rounded">
                <p>Amount: {successModal.details.amount}</p>
                <p>Purpose: {successModal.details.purpose}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Main render
  return (
    <div className="container mx-auto p-4 bg-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 mr-4 space-y-2">
          {['expenses-list', 'create-expenses', 'approvals', 'updates'].map(section => (
            <Button 
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full ${activeSection === section ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeSection === 'create-expenses' && renderCreateExpenses()}
          {activeSection === 'expenses-list' && renderExpensesList()}
          {activeSection === 'approvals' && renderApprovals()}
          {activeSection === 'updates' && renderUpdates()}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="destructive" className="fixed bottom-4 right-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Success Modal */}
      {renderSuccessModal()}
    </div>
  );
};

export default ExpensesManagement;