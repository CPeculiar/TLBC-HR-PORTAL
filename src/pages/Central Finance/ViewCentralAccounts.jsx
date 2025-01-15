import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, X, Trash2 } from "lucide-react";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';

const ViewCentralAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [accountToDelete, setAccountToDelete] = useState(null);
  
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteVerifiedDetails, setDeleteVerifiedDetails] = useState(null); 

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Access token not found. Please login first.");
        navigate("/");
        return;
      }

      const response = await axios.get(
        "https://tlbc-platform-api.onrender.com/api/finance/central/accounts/?limit=30",
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
        navigate("/");
        return;
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


    const handleDeleteClick = (account) => {
      console.log("Selected account for deletion:", account); 
      setAccountToDelete(account);
      setShowDeleteConfirmModal(true);
      setDeleteError('');
      setDeletePassword('');
    };
  
   
    const handleDeleteAccount = async () => {
      try {
        setIsDeletingAccount(true);
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("Access token not found. Please login first.");
          navigate("/");
        return;
        }
  
        console.log("Deleting account with code:", accountToDelete.code); // For debugging
  
        const response = await axios.post(
          `https://tlbc-platform-api.onrender.com/api/finance/central/accounts/${accountToDelete.code}/delete/`,
          { password: deletePassword },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
  
        setShowDeleteConfirmModal(false);
        setShowDeleteSuccessModal(true);
        setDeletePassword('');
        fetchAccounts();
      } catch (error) {
          // Handle nested error messages
      const errorMessage = error.response?.data?.password?.[0] || 
      error.response?.data?.non_field_errors?.[0] ||
      error.response?.data?.detail || 
      error.message;
  setDeleteError(errorMessage);
        console.error("Delete error:", error.response?.data); 
      } finally {
        setIsDeletingAccount(false);
      }
    };

    const formatAmount = (amount) => {
      return `₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
      // {formatAmount(accountDetails.balance)}
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
                      View
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
                      {/* ₦{new Intl.NumberFormat('en-NG').format(account.balance)} */}
                      {formatAmount(account.balance)}
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
                     <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                       <button
                         className="text-danger hover:text-red-700"
                         onClick={() => handleDeleteClick(account)}
                        >
                        <Trash2 className="h-5 w-5 text-red-500" />
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

    {/* Delete Confirmation Modal */}
    {showDeleteConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 text-center shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-medium text-black mb-4">Confirm Account Deletion</h2>
            <p className="mb-6 text-gray-600 dark:text-black">
              Please enter your password to confirm deletion of account: {' '}
              <span className="font-semibold">{accountToDelete?.account_name}</span>
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
              <div className="mb-6 text-red-500 text-sm whitespace-pre-line text-center">
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
                setAccountToDelete(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}


      </div>
    </>
  );
};

export default ViewCentralAccounts;