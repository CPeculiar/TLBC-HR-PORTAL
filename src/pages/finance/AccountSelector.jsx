import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showMessage } from './notificationService'; // Assume showMessage is a helper for showing notifications

const AccountSelector = ({ onAccountSelect }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Fetch accounts on component load
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(
          'https://tlbc-platform-api.onrender.com/api/finance/accounts/?limit=30'
        );
        const accountList = response.data.results;
        setAccounts(accountList);

        // Set default account if available
        const defaultAccount = accountList.find(account => account.is_default);
        if (defaultAccount) {
          setSelectedAccount(defaultAccount);
          onAccountSelect(defaultAccount.code);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        showMessage('error', 'Error fetching accounts');
      }
    };

    fetchAccounts();
  }, [onAccountSelect]);

  // Handle account selection
  const handleAccountChange = (event) => {
    const selectedCode = event.target.value;
    const account = accounts.find(acc => acc.code === selectedCode);
    setSelectedAccount(account);
    onAccountSelect(selectedCode);
  };

  return (
    <div className="account-selector">
      <label htmlFor="account-select" className="block text-sm font-medium text-gray-700">
        Select Account:
      </label>
      <select
        id="account-select"
        value={selectedAccount?.code || ''}
        onChange={handleAccountChange}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="" disabled>Select an account</option>
        {accounts.map(account => (
          <option key={account.code} value={account.code}>
            {account.account_name} ({account.account_number}) - {account.bank_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AccountSelector;