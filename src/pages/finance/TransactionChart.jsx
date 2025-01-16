import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const TransactionChart = ({ selectedAccount }) => {
  const [chartData, setChartData] = useState([]);

  // Default data for initial render
  const defaultData = [
    { month: 'Jan', income: 0, expenses: 0 },
    { month: 'Feb', income: 0, expenses: 0 },
    { month: 'Mar', income: 0, expenses: 0 },
    { month: 'Apr', income: 0, expenses: 0 },
    { month: 'May', income: 0, expenses: 0 },
    { month: 'Jun', income: 0, expenses: 0 },
    { month: 'Jul', income: 0, expenses: 0 },
    { month: 'Aug', income: 0, expenses: 0 },
    { month: 'Sep', income: 0, expenses: 0 },
    { month: 'Oct', income: 0, expenses: 0 },
    { month: 'Nov', income: 0, expenses: 0 },
    { month: 'Dec', income: 0, expenses: 0 }
  ];

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!selectedAccount?.code) {
        setChartData(defaultData);
        return;
      }

      try {
        const response = await axios.get(
          `https://tlbc-platform-api.onrender.com/api/finance/accounts/${selectedAccount.code}/transactions/?limit=500`
        );

        // Process transactions into monthly data
        const monthlyData = new Array(12).fill(0).map((_, index) => ({
          month: defaultData[index].month,
          income: 0,
          expenses: 0
        }));

        response.data.results.transactions.forEach(transaction => {
          const date = new Date(transaction.date);
          const monthIndex = date.getMonth();
          const amount = parseFloat(transaction.amount);

          if (transaction.type === 'CREDIT') {
            monthlyData[monthIndex].income += amount;
          } else if (transaction.type === 'DEBIT') {
            monthlyData[monthIndex].expenses += amount;
          }
        });

        setChartData(monthlyData);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setChartData(defaultData);
      }
    };

    fetchTransactionData();
  }, [selectedAccount]);

  return (
    <div className="h-80 mb-6">
      <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Transaction Analysis</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value) => `₦${value.toFixed(2)}`}
            labelStyle={{ color: 'black' }}
          />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#10B981" />
          <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionChart;