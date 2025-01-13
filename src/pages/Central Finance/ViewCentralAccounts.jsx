import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, X } from "lucide-react";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const ViewCentralAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found. Please login first.");
      }

      const response = await axios.get(
        "https://tlbc-platform-api.onrender.com/api/finance/central/accounts/?limit=20",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setAccounts(response.data.results);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAccount = async (code) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found. Please login first.");
      }

      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/finance/central/accounts/${code}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setSelectedAccount(response.data);
      setIsModalOpen(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <Breadcrumb pageName="View Central Accounts" className="text-black dark:text-white" />

      <div className="p-4 md:p-6 2xl:p-10">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">Loading accounts...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-red-500">{error}</div>
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Account Name
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Account Number
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Bank Name
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Balance
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Church
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Giving Account?
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Fund Account?
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Remittance Account?
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.code} className="dark:text-white">
                      <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                        {account.account_name}
                      </td>
                      <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                        {account.account_number}
                      </td>
                      <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                        {account.bank_name}
                      </td>
                      <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                      ₦{new Intl.NumberFormat('en-NG').format(account.balance)}
                      </td>
                      <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                        {account.church}
                      </td>
                      <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">  
                        {account.for_giving ? 'Yes' : 'No'}
                      </td>
                      <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                        {account.for_fund ? 'Yes' : 'No'}
                      </td>
                      <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                        {account.for_remittance ? 'Yes' : 'No'}
                      </td>
                      <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                        <button
                          onClick={() => handleViewAccount(account.code)}
                          className="hover:text-primary"
                        >
                          <Eye className="h-6 w-6" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Account Details Modal */}
        {isModalOpen && selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-lg rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  Account Details
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-black dark:text-white hover:text-primary"
                >
                  <X size={22} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-black dark:text-white">Account Name</p>
                  <p className="font-medium">{selectedAccount.account_name}</p>
                </div>
                <div>
                  <p className="text-sm text-black dark:text-white">Account Number</p>
                  <p className="font-medium">{selectedAccount.account_number}</p>
                </div>
                <div>
                  <p className="text-sm text-black dark:text-white">Bank Name</p>
                  <p className="font-medium">{selectedAccount.bank_name}</p>
                </div>
                <div>
                  <p className="text-sm text-black dark:text-white">Balance</p>
                  <p className="font-medium">₦{new Intl.NumberFormat('en-NG').format(selectedAccount.balance)}</p>
                </div>
                <div>
                  <p className="text-sm text-black dark:text-white">Church</p>
                  <p className="font-medium">{selectedAccount.church}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-black dark:text-white">For Giving</p>
                    <p className="font-medium">{selectedAccount.for_giving ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-black dark:text-white">For Fund</p>
                    <p className="font-medium">{selectedAccount.for_fund ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-black dark:text-white">For Remittance</p>
                    <p className="font-medium">{selectedAccount.for_remittance ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewCentralAccounts;