import React, { useState } from 'react';
import { Search, X } from 'lucide-react';



const Transactions = () => {

  const [formData, setFormData] = useState({
    name: '',
    church: '',
    paymentType: '',
    labelCategory: '',
    amount: '',
    status: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };


  return (
    <div className="flex h-screen overflow-hidden">


        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-2">
              {/* Left: Title */}
              <div className="mb-1 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 font-bold mb-3">Finance</h1>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-md mb-4">
        View Transaction history
      </button>

              </div>
            </div>


            <div className="p-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
        <h2 className="text-xl font-bold mb-4">Record New Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-1">Church:</label>
              <input
                type="text"
                name="church"
                value={formData.church}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-1">Payment type:</label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="Tithes">Stewardship</option>
                <option value="Offerings">Offerings</option>
                <option value="First Fruit">First Fruit</option>
                <option value="Seed offering">Seed offering</option>
                <option value="Pledge">Pledge</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">If others, state the Category:</label>
              <input
                type="text"
                name="labelCategory"
                value={formData.labelCategory}
                onChange={handleChange}
                placeholder='Enter the nature of the giving'
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-1">Amount Paid(₦)</label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-1">Payment Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              >
              <option value="" disabled>Please select the payment status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md">
            Add Payment
          </button>
        </form>
      </div>
    </div>






        </div>
    </main>
    </div>
    
  );
};

export default Transactions;