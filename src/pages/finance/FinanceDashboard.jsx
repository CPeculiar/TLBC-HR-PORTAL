import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';

import Image from '../../assets/images/MOGooficial.jpg';
import { useNavigate } from 'react-router-dom';


const expensesData = [
  { name: 'Fuel', value: 200000 },
  { name: 'Papers', value: 500000 },
  { name: 'Power', value: 300000 },
  { name: 'Water', value: 650000 },
];

const populationData = [
  { name: 'Male', value: 60 },
  { name: 'Female', value: 40 },
];

const COLORS = ['#00C49F', '#FF8042'];

const FinanceDashboard = () => {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentTheme } = useThemeProvider();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert("Access token not found. Please login first.");
      navigate('/login');
    }

  }, [navigate]);





  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-2">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold mb-6">Members</h1>
              </div>
            </div>



<div className="p-6 bg-blue-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card title="Weekly bankings" value="5000" icon="📈" bgColor="bg-gradient-to-r from-orange-300 to-red-400" />
        <Card title="Petty Cash Balance" value="1,000,000" icon="💰" bgColor="bg-gradient-to-r from-blue-300 to-blue-500" />
        <Card title="Total bank amount" value="3,505,000" icon="💎" bgColor="bg-gradient-to-r from-green-300 to-teal-500" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Church Expenses</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Church Population</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={populationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {populationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
    </div>
    </main>
    </div>
    </div>
  );
}; 

const Card = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 text-white`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};



export default FinanceDashboard;