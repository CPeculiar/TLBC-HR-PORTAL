import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import html2pdf from 'html2pdf.js';
import { X } from 'lucide-react';
import Logo from '../../../public/android-chrome-192x192.png';

const CentralAccountStatement = ({ selectedAccount, onClose, isOpen }) => {
  const [transactions, setTransactions] = useState([]);
  const [openingBalance, setOpeningBalance] = useState('0.00');
  const [closingBalance, setClosingBalance] = useState('0.00');
  const [channelStats, setChannelStats] = useState({
    credit: { count: 0, inflow: 0 },
    debit: { count: 0, outflow: 0 }
  });

  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (selectedAccount?.code) {
      fetchTransactions(selectedAccount.code);
    }
  }, [selectedAccount]);

  const fetchTransactions = async (code) => {
    try {
      const response = await axios.get(`https://tlbc-platform-api.onrender.com/api/finance/central/accounts/${code}/transactions/`);
      const { results } = response.data;
      setTransactions(results.transactions || []);
      setOpeningBalance(results.opening);
      setClosingBalance(results.closing);
      calculateChannelStats(results.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const calculateChannelStats = (txns) => {
    const stats = txns.reduce((acc, tx) => {
      const type = tx.type.toLowerCase();
      acc[type].count++;
      if (type === 'credit') {
        acc[type].inflow += parseFloat(tx.amount);
      } else {
        acc[type].outflow += parseFloat(tx.amount);
      }
      return acc;
    }, {
      credit: { count: 0, inflow: 0, outflow: 0 },
      debit: { count: 0, inflow: 0, outflow: 0 }
    });

    const total = stats.credit.count + stats.debit.count;
    stats.credit.percentage = ((stats.credit.count / total) * 100).toFixed(1);
    stats.debit.percentage = ((stats.debit.count / total) * 100).toFixed(1);
    setChannelStats(stats);
  };

  const handleDownload = () => {
    setIsPrinting(true);
    const element = document.getElementById('statement-content');
    const opt = {
      margin: 10,
      filename: `account-statement-${selectedAccount?.account_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      setIsPrinting(false);
    });
  };

  const pieData = [
    { name: 'Credit', value: parseFloat(channelStats.credit.percentage) },
    { name: 'Debit', value: parseFloat(channelStats.debit.percentage) }
  ];

  const COLORS = ['#4ECDC4', '#FF6B6B'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-2 sm:p-4 md:p-6 mt-18">
      <div className="relative bg-white dark:bg-boxdark rounded-lg w-full max-w-[95%] sm:max-w-[90%] md:max-w-7xl mt-4 sm:mt-8 mb-4 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className={`absolute right-4 top-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${isPrinting ? 'hidden' : ''}`}
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-4 sm:p-6">
          <div id="statement-content" className="space-y-4 sm:space-y-6 p-4">
            <div className="flex justify-between items-start">
              <img src={Logo} alt="Church Logo" className="w-16 sm:w-20" />
              {!isPrinting && (
                <button
                  onClick={handleDownload}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base"
                >
                  Download PDF
                </button>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-orange-500 text-lg">ACCOUNT STATEMENT for {selectedAccount?.church} Account </h3>
              <div className="grid grid-cols-2 text-sm sm:text-base gap-2 dark:text-white text-black">
                <p>Period: {new Date().toLocaleDateString()} TO {new Date().toLocaleDateString()}</p>
                <p>Account Number: {selectedAccount?.account_number}</p>
                <p>Account Name: {selectedAccount?.account_name}</p>
                <p>Currency: NGN</p>
                <p>Opening Balance: ₦{parseFloat(openingBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                <p>Closing Balance: ₦{parseFloat(closingBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="border p-3 sm:p-4 rounded overflow-x-auto dark:text-white text-black">
              <h4 className="font-bold mb-3 text-sm sm:text-base">ACCOUNTS SUMMARY</h4>
              <table className="w-full text-sm sm:text-base whitespace-nowrap dark:text-white text-black">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Account No</th>
                    <th className="border p-2 text-left">Account Name</th>
                    <th className="border p-2 text-left">Currency</th>
                    <th className="border p-2 text-right">Opening Balance</th>
                    <th className="border p-2 text-right">Debits</th>
                    <th className="border p-2 text-right">Credits</th>
                    <th className="border p-2 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">{selectedAccount?.account_number}</td>
                    <td className="border p-2">{selectedAccount?.account_name}</td>
                    <td className="border p-2">NGN</td>
                    <td className="border p-2 text-right">{parseFloat(openingBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                    <td className="border p-2 text-right">{channelStats.debit.outflow.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                    <td className="border p-2 text-right">{channelStats.credit.inflow.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                    <td className="border p-2 text-right">{parseFloat(closingBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 dark:text-white text-black">
              <div className="border p-3 sm:p-4 rounded overflow-x-auto">
                <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">CHANNEL INTERACTION</h4>
                <table className="w-full text-sm sm:text-base whitespace-nowrap">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 sm:px-4 py-2 text-left">Type</th>
                      <th className="px-2 sm:px-4 py-2 text-right">Count</th>
                      <th className="px-2 sm:px-4 py-2 text-right">Inflow (₦)</th>
                      <th className="px-2 sm:px-4 py-2 text-right">Outflow (₦)</th>
                      <th className="px-2 sm:px-4 py-2 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-2 sm:px-4 py-2">Credit</td>
                      <td className="px-2 sm:px-4 py-2 text-right">{channelStats.credit.count}</td>
                      <td className="px-2 sm:px-4 py-2 text-right">{channelStats.credit.inflow.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                      <td className="px-2 sm:px-4 py-2 text-right">-</td>
                      <td className="px-2 sm:px-4 py-2 text-right">{channelStats.credit.percentage}%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-2 sm:px-4 py-2">Debit</td>
                      <td className="px-2 sm:px-4 py-2 text-right">{channelStats.debit.count}</td>
                      <td className="px-2 sm:px-4 py-2 text-right">-</td>
                      <td className="px-2 sm:px-4 py-2 text-right">{channelStats.debit.outflow.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                      <td className="px-2 sm:px-4 py-2 text-right">{channelStats.debit.percentage}%</td>
                    </tr>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 font-bold">Total</td>
                      <td className="px-2 sm:px-4 py-2 text-right font-bold">{channelStats.credit.count + channelStats.debit.count}</td>
                      <td className="px-2 sm:px-4 py-2 text-right font-bold">{channelStats.credit.inflow.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                      <td className="px-2 sm:px-4 py-2 text-right font-bold">{channelStats.debit.outflow.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                      <td className="px-2 sm:px-4 py-2 text-right font-bold">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border p-3 sm:p-4 rounded dark:text-white text-black">
                <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">CHANNEL USAGE FREQUENCY</h4>
                <div className="h-48 flex justify-center items-center">
                  <PieChart width={200} height={200}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
                <div className="text-sm text-center mt-2">
                  <span className="mr-4">
                    <span className="inline-block w-3 h-3 mr-1" style={{ backgroundColor: COLORS[0] }}></span>
                    Credit
                  </span>
                  <span>
                    <span className="inline-block w-3 h-3 mr-1" style={{ backgroundColor: COLORS[1] }}></span>
                    Debit
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto dark:text-white text-black">
              <table className="w-full border-collapse text-sm sm:text-base whitespace-nowrap">
                <thead className="bg-gray-100 dark:bg-boxdark">
                  <tr>
                    <th className="border p-1.5 sm:p-2 text-left">Date</th>
                    <th className="border p-1.5 sm:p-2 text-left">Purpose</th>
                    <th className="border p-1.5 sm:p-2 text-left">Reference</th>
                    <th className="border p-1.5 sm:p-2 text-right">Debit</th>
                    <th className="border p-1.5 sm:p-2 text-right">Credit</th>
                    <th className="border p-1.5 sm:p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.reference} className="hover:bg-gray-50 dark:hover:bg-boxdark">
                      <td className="border p-1.5 sm:p-2">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="border p-1.5 sm:p-2">{tx.purpose}</td>
                      <td className="border p-1.5 sm:p-2">{tx.reference}</td>
                      <td className="border p-1.5 sm:p-2 text-right">
                        {tx.type === 'DEBIT' ? parseFloat(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : ''}
                      </td>
                      <td className="border p-1.5 sm:p-2 text-right">
                        {tx.type === 'CREDIT' ? parseFloat(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : ''}
                      </td>
                      <td className="border p-1.5 sm:p-2 text-right">{tx.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralAccountStatement;