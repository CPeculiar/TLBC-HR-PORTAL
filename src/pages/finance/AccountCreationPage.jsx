import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccountCreationPage = () => {
  const [banks, setBanks] = useState([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState(null);
  const [isCreateButtonDisabled, setIsCreateButtonDisabled] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAccountData, setCreatedAccountData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of banks on page load
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/finance/banks/');
      setBanks(response.data.banks);
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };


  
// Helper function to prevent non-numeric input
function preventNonNumericInput(event) {
    const value = event.target.value;
    event.target.value = value.replace(/[^0-9]/g, ''); // Removes any non-numeric character
  }

  const handleAccountNumberChange = (e) => {
    const inputValue = e.target.value;
    setAccountNumber(inputValue);
    setError(null);

    // Validate account number
    if (inputValue.length === 10) {
        const selectedBank = banks.find((bank) => bank.bank_code === document.getElementById('bank-dropdown').value);
        verifyAccountDetails(inputValue, selectedBank.bank_code);
      } else {
        setAccountName('');
        setIsCreateButtonDisabled(true);
      }
    };

    const verifyAccountDetails = async (accountNumber, bankCode) => {
        try {
          const response = await axios.post('https://tlbc-platform-api.onrender.com/api/finance/banks/verify/', {
              account_number: accountNumber,
              bank_code: bankCode,
          });
          setAccountName(response.data.account_name);
          setIsCreateButtonDisabled(false);
        } catch (error) {
          setError('Failed to verify account details. Please check your input and try again.');
          setIsCreateButtonDisabled(true);
        }
      };
    

      const handleCreateAccount = async () => {
        try {
          const bankCode = document.getElementById('bank-dropdown').value;
          const response = await axios.post('https://tlbc-platform-api.onrender.com/api/finance/accounts/create/', {
            account_number: accountNumber,
            bank_code: bankCode,
          });
          setCreatedAccountData(response.data);
          setShowSuccessModal(true);
        } catch (error) {
          setError('Failed to create account. Please try again.');
        }
      };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/accounts');
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:p-6.5 md:p-8 lg:p-6.5">  
      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">Create Account</h3>
      </div>
      <div className="p-6.5">
        <div className="mb-4.5">
          <label className="mb-2.5 block text-black dark:text-white">Bank</label>
          <select id="bank-dropdown" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" required>
          <option value="" disabled selected>Select Bank</option>
            {banks.map((bank) => (
              <option key={bank.bank_code} value={bank.bank_code}>
                {bank.bank_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4.5">
          <label className="mb-2.5 block text-black dark:text-white">Account Number</label>
          <input
            id="account-number"
            type="tel"
            value={accountNumber}
            onChange={handleAccountNumberChange}
            onInput={preventNonNumericInput}
            pattern="[0-9]*"
            maxLength="10"
            inputMode="numeric"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            required
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          {accountName && (
            <p>Account Name: <strong>{accountName}</strong></p>
          )}
        </div>
        <button
          onClick={handleCreateAccount}
          disabled={isCreateButtonDisabled}
          className="w-full rounded bg-primary p-3 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-70"
        >
          Create Account
        </button>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg mx-4 sm:mx-0">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-gray-600 mb-6">Your account has been successfully created.</p>
            <div className="mb-4">
              <h3 className="font-bold mb-2">Account Details:</h3>
              <p>Account Number: {createdAccountData?.account_number}</p>
              <p>Account Name: {createdAccountData?.account_name}</p>
              <p>Bank Name: {createdAccountData?.bank_name}</p>
            </div>
            <button
              onClick={handleCloseModal}
              className="w-full rounded bg-primary p-3 font-medium text-white transition hover:bg-opacity-90"
            >
              Go to Accounts
            </button>
          </div>
        </div>
      )}

{/* {showSuccessModal && (
        
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50   flex-col  h-screen">
          <div className="w-full max-w-md rounded bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center text-center">
                <svg className="mr-2 h-12 w-12 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h3 className="font-medium text-2xl text-center text-green-500">Account Created</h3>
              </div>
              <button onClick={handleCloseModal} className="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="mb-4 text-center">
              <p>Account Number: {createdAccountData?.account_number}</p>
              <p className="font-medium">Account Name: {createdAccountData?.account_name}</p>
              <p>Bank Name: {createdAccountData?.bank_name}</p>
            </div>
            <button
              onClick={handleCloseModal}
              className="w-full rounded bg-primary p-3 font-medium text-white transition hover:bg-opacity-90"
            >
              Go to Accounts
            </button>
          </div>
      
          </div>
        
      )} */}

</div>
  );
};

export default AccountCreationPage;