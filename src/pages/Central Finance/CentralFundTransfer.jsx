import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { CheckCircle, XCircle } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CentralFundTransfer = () => {
  // State for accounts
  const [accounts, setAccounts] = useState([]);
  const [selectedTransferAccount, setSelectedTransferAccount] = useState('');
  const [transferAccountDetails, setTransferAccountDetails] = useState(null);
  
  // State for transfer form
  const [beneficiaryAccount, setBeneficiaryAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('');
  
  // State for loading and errors
  const [isVerifyingTransferAccount, setIsVerifyingTransferAccount] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [showTransferSuccess, setShowTransferSuccess] = useState(false);
  const [transferSuccessDetails, setTransferSuccessDetails] = useState(null);
  const [errorDetails, setErrorDetails] = useState({
    code: '',
    message: ''
  });

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/central/accounts/?limit=30');
      setAccounts(response.data.results);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showErrorMessage('Error fetching accounts');
    }
  };

  const verifyTransferAccountDetails = async () => {
    if (!selectedTransferAccount) {
      showErrorMessage('Please select an account first');
      return;
    }

    setIsVerifyingTransferAccount(true);
    setTransferAccountDetails(null);

    try {
      const response = await axios.get(`https://tlbc-platform-api.onrender.com/api/finance/central/accounts/${selectedTransferAccount}/`);
      setTransferAccountDetails(response.data);
    } catch (error) {
      showErrorMessage(handleErrorMessage(error));
    } finally {
      setIsVerifyingTransferAccount(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedTransferAccount || !beneficiaryAccount || !transferAmount || !transferPurpose) {
      setTransferError('Please fill in all required fields');
      return;
    }

    setIsTransferring(true);
    setTransferError('');
    setErrorDetails({ code: '', message: '' });

    try {
      await axios.post('https://tlbc-platform-api.onrender.com/api/finance/central/accounts/transfer/', {
        from_account: selectedTransferAccount,
        to_account: beneficiaryAccount,
        amount: transferAmount,
        purpose: transferPurpose
      });

      setTransferSuccessDetails({
        fromAccount: accounts.find(acc => acc.code === selectedTransferAccount)?.account_name,
        toAccount: accounts.find(acc => acc.code === beneficiaryAccount)?.account_name,
        amount: transferAmount,
        purpose: transferPurpose
      });
      
      setShowTransferSuccess(true);
      // resetForm();
      await fetchAccounts();
    } catch (error) {
      const errorCode = error.response?.data?.code || 'UNKNOWN_ERROR';
      const errorMessage = handleErrorMessage(error);
      
      setErrorDetails({
        code: errorCode,
        message: errorMessage
      });
      setTransferError(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleErrorMessage = (error) => {
    // Map error codes to user-friendly messages
    const errorMessages = {
      'INSUFFICIENT_FUNDS': 'Insufficient funds in the selected account',
      'INVALID_ACCOUNT': 'One or more account numbers are invalid',
      'ACCOUNT_INACTIVE': 'The selected account is inactive',
      'TRANSFER_LIMIT_EXCEEDED': 'Transfer amount exceeds daily limit',
      'INVALID_AMOUNT': 'Invalid transfer amount',
      'UNAUTHORIZED': 'You are not authorized to perform this transfer',
    };

    const errorCode = error.response?.data?.code;
    return errorMessages[errorCode] || 
           error.response?.data?.message || 
           error.response?.data?.detail || 
           'An unexpected error occurred';
  };

  const resetForm = () => {
    setTransferAmount('');
    setTransferPurpose('');
    setBeneficiaryAccount('');
    setSelectedTransferAccount('');
    setTransferAccountDetails(null);
    setBeneficiaryAccount('');
    setTransferError('');
    setShowTransferSuccess(false);
    setTransferSuccessDetails(null); 
    fetchAccounts();   
  };

  // const handleErrorMessage = (error) => {
  //   return error.response?.data?.message || 
  //          error.response?.data?.detail || 
  //          'An unexpected error occurred';
  // };

  const showErrorMessage = (message) => {
    setTransferError(message);
  };

  return (
    <>
      <Breadcrumb pageName="Fund Transfer" />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Fund Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* From Account Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">From Account</label>
                <select 
                  value={selectedTransferAccount}
                  onChange={(e) => {
                    setSelectedTransferAccount(e.target.value);
                    setTransferAccountDetails(null);
                  }}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select Sending Account</option>
                  {accounts.map(account => (
                    <option key={account.code} value={account.code}>
                      {account.account_name} - {account.bank_name}
                    </option>
                  ))}
                </select>

                <button 
                  onClick={verifyTransferAccountDetails}
                  disabled={!selectedTransferAccount || isVerifyingTransferAccount}
                  className="w-full bg-blue-500 text-white rounded p-3 disabled:opacity-50 hover:bg-blue-600 transition-colors duration-200"
                >
                  {isVerifyingTransferAccount ? 'Verifying...' : 'Verify Account Details'}
                </button>
              </div>

              {/* Account Details Display */}
              {transferAccountDetails && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-boxdark rounded-lg">
                  <h4 className="text-lg font-semibold mb-4 text-black dark:text-white">Account Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded">
                      <p className="text-sm text-black dark:text-white">
                        <strong>Account Name:</strong><br />
                        {transferAccountDetails.account_name}
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded">
                      <p className="text-sm text-black dark:text-white">
                        <strong>Account Number:</strong><br />
                        {transferAccountDetails.account_number}
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded">
                      <p className="text-sm text-black dark:text-white">
                        <strong>Bank:</strong><br />
                        {transferAccountDetails.bank_name}
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded">
                      <p className="text-sm text-black dark:text-white">
                        <strong>Available Balance:</strong><br />
                        ₦{transferAccountDetails.balance}
                      </p>
                    </div>
                  </div>

                  {/* Transfer Form */}
                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">To Account</label>
                      <select
                        value={beneficiaryAccount}
                        onChange={(e) => setBeneficiaryAccount(e.target.value)}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        <option value="">Select Receiving Account</option>
                        {accounts
                          .filter(account => account.code !== selectedTransferAccount)
                          .map(account => (
                            <option key={account.code} value={account.code}>
                              {account.account_name} - {account.bank_name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Amount (₦)</label>
                      <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Purpose</label>
                      <input
                        type="text"
                        value={transferPurpose}
                        onChange={(e) => setTransferPurpose(e.target.value)}
                        placeholder="Enter transfer purpose"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    {transferError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                      {transferError}
                    </AlertDescription>
                        {/* {transferError} */}
                      </div>
                    )}

                    {/* Success Modal using Shadcn Dialog */}
                    {showTransferSuccess && (         
      <Dialog open={showTransferSuccess} onOpenChange={setShowTransferSuccess}>
      <DialogContent className="bg-blue-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Fund Transfer Successful
            </DialogTitle>
            <DialogDescription>
              Your transfer has been processed successfully.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-1">From Account:</p>
                <p className="text-sm">{transferSuccessDetails?.fromAccount}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">To Account:</p>
                <p className="text-sm">{transferSuccessDetails?.toAccount}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Amount:</p>
                <p className="text-sm">₦{transferSuccessDetails?.amount}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Purpose:</p>
                <p className="text-sm">{transferSuccessDetails?.purpose}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={() => {
                resetForm();
              }}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}


                    <div className="flex gap-4">
                      <button
                        onClick={resetForm}
                        className="flex-1 text-white bg-primary/70  rounded p-3 hover:bg-primary/95 transition-colors duration-200"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleTransfer}
                        disabled={isTransferring || !selectedTransferAccount || !beneficiaryAccount || !transferAmount || !transferPurpose}
                        className="flex-1 bg-blue-500 text-white rounded p-3 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTransferring ? 'Processing...' : 'Transfer Funds'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </>
  );
};

export default CentralFundTransfer;