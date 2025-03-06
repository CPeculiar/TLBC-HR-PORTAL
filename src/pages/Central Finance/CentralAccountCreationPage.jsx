import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CentralAccountCreationPage = () => {
  const [banks, setBanks] = useState([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState(null);
  const [isCreateButtonDisabled, setIsCreateButtonDisabled] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAccountData, setCreatedAccountData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    giving: false,
    fund: false,
    remittance: false,
    all: false
  });
  const navigate = useNavigate();
 
  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {

      const response = await axios.get('https://api.thelordsbrethrenchurch.org/api/finance/banks/');
      setBanks(response.data.banks);
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  function preventNonNumericInput(event) {
    const value = event.target.value;
    event.target.value = value.replace(/[^0-9]/g, '');
  }

  const handleAccountNumberChange = (e) => {
    const inputValue = e.target.value;
    setAccountNumber(inputValue);
    setError(null);

    if (inputValue.length === 10) {
      const selectedBank = banks.find((bank) => bank.bank_code === document.getElementById('bank-dropdown').value);
      verifyAccountDetails(inputValue, selectedBank.bank_code);
    } else {
      setAccountName('');
      setIsCreateButtonDisabled(true);
    }
  };

  const handleCheckboxChange = (type) => {
    if (type === 'all') {
      const newValue = !checkboxes.all;
      setCheckboxes({
        all: newValue,
        giving: newValue,
        fund: newValue,
        remittance: newValue
      });
    } else {
      const newCheckboxes = {
        ...checkboxes,
        [type]: !checkboxes[type]
      };
      // Check if all individual checkboxes are checked
      const allChecked = ['giving', 'fund', 'remittance'].every(key => newCheckboxes[key]);
      newCheckboxes.all = allChecked;
      setCheckboxes(newCheckboxes);
    }
  };

  const verifyAccountDetails = async (accountNumber, bankCode) => {
    try {

      const response = await axios.post('https://api.thelordsbrethrenchurch.org/api/finance/banks/verify/', {
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
      setIsLoading(true);
      setIsCreateButtonDisabled(true);

      const bankCode = document.getElementById('bank-dropdown').value;
      const response = await axios.post('https://api.thelordsbrethrenchurch.org/api/finance/central/accounts/create/', {
        account_number: accountNumber,
        bank_code: bankCode,
        for_giving: checkboxes.giving,
        for_fund: checkboxes.fund,
        for_remittance: checkboxes.remittance
      });
      setCreatedAccountData(response.data);
      setShowSuccessModal(true);
    } catch (error) {
      setError('Failed to create account. Please try again.');
      setIsLoading(false);
      setIsCreateButtonDisabled(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/central/financeDashboard');
  };

  return (
    <>
      <Breadcrumb pageName="Create Central Account" className="text-black dark:text-white" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:p-6.5 md:p-8 lg:p-6.5">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-xl text-black dark:text-white">Create Central Account</h3>
        </div>
        <div className="p-6.5">
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">Bank</label>
            <select
              id="bank-dropdown"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            >
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
              <div className="mt-3">
                <p className="text-green-500 text-xl mb-4">
                  Account Name: <strong>{accountName}</strong>
                </p>
                
                <div className="space-y-3 mb-4">
                  <p className="text-black dark:text-white font-medium">Make this account number the default account for:</p>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checkboxes.giving}
                        onChange={() => handleCheckboxChange('giving')}
                        className="form-checkbox h-5 w-5 text-primary rounded border-stroke"
                      />
                      <span className="text-black dark:text-white">Giving</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checkboxes.fund}
                        onChange={() => handleCheckboxChange('fund')}
                        className="form-checkbox h-5 w-5 text-primary rounded border-stroke"
                      />
                      <span className="text-black dark:text-white">Fund</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checkboxes.remittance}
                        onChange={() => handleCheckboxChange('remittance')}
                        className="form-checkbox h-5 w-5 text-primary rounded border-stroke"
                      />
                      <span className="text-black dark:text-white">Remittance</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checkboxes.all}
                        onChange={() => handleCheckboxChange('all')}
                        className="form-checkbox h-5 w-5 text-primary rounded border-stroke"
                      />
                      <span className="text-black dark:text-white">All</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleCreateAccount}
            disabled={isCreateButtonDisabled}
            className="w-full rounded bg-primary p-3 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-70"
          >
            {isCreateButtonDisabled ? "Creating..." : "Create Account"}
          </button>
        </div>

        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white dark:bg-boxdark p-8 rounded-lg shadow-lg mx-4 sm:mx-0">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Congratulations!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Your account has been successfully created.</p>
              <div className="mb-4">
                <h3 className="font-bold mb-2 text-black dark:text-white">Account Details:</h3>
                <p className="text-black dark:text-white">Account Number: {createdAccountData?.account_number}</p>
                <p className="text-black dark:text-white">Account Name: {createdAccountData?.account_name}</p>
                <p className="text-black dark:text-white">Bank Name: {createdAccountData?.bank_name}</p>
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
      </div>
    </>
  );
};

export default CentralAccountCreationPage;