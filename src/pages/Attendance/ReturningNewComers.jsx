import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Search,  CheckCircle } from "lucide-react";
import { Card } from '../../components/ui/card';
import { Alert, AlertDescription } from "../../components/ui/alert";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const ReturningNewComers = () => {
    const location = useLocation();
    const refCode = location.state?.refCode || location.pathname.split('/returningNewcomers/')[1];
  
    const navigate = useNavigate();
    const [alert, setAlert] = useState({ show: false, message: "", type: "" });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  
    // State for newcomers search
    const [searchParams, setSearchParams] = useState({ name: "" });
    const [noResults, setNoResults] = useState(false);
    

    const showAlert = (message, type) => {
      setAlert({ show: true, message, type });
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
    };
  
    // Newcomers search
    const searchNewcomers = async () => {
      try {

        setIsLoading(true);
        const response = await axios.get(
          `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/newcomers/search/`,
          {
            params: {
              s: searchParams.name,
              ref_code: refCode
            }
          }
        );
        setNewcomersList(response.data);
        setNoResults(response.data.results.length === 0);
      } catch (error) {
        showAlert(error.response?.data?.message || "Error searching newcomers", "error");
        setNoResults(false);
    } finally {
        setIsLoading(false);
      }
    };
  
    const [newcomersList, setNewcomersList] = useState({ 
        results: [], 
        next: null, 
        previous: null 
      });
    
      const markAttendance = async (slug, isAttendanceTaken) => {
        if (isAttendanceTaken) {
          showAlert("Attendance has already been taken for this person", "error");
          return;
        }
    
        try {
          
          const response = await axios.put(
            `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/newcomers/${slug}/`
          );
          
          // Update the local state to mark attendance as taken
          setNewcomersList(prevState => ({
            ...prevState,
            results: prevState.results.map(newcomer => 
              newcomer.slug === slug 
                ? { ...newcomer, attendance_taken: true } 
                : newcomer
            )
          }));
    
          showAlert("Attendance successfully taken for this service", "success");
        } catch (error) {
          showAlert(error.response?.data?.message || "Error marking attendance", "error");
        }
      };
    

    
     // Function to handle pagination for newcomers
  const handleNewcomersPagination = async (url) => {
    try {
      const response = await axios.get(url);
      setNewcomersList(response.data);
    } catch (error) {
      showAlert(error.response?.data?.message || "Error fetching newcomers", "error");
    }
  };


    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <Breadcrumb pageName="Returning Members" />
      
      <div className="space-y-6">
          {/* Alert Section */}
          {alert.show && (
              <Alert className={`w-full ${alert.type === "success" ? "bg-green-50" : "bg-red-50"}`}>
                  <AlertDescription className="text-sm sm:text-base">
                      {alert.message}
                  </AlertDescription>
              </Alert>
          )}

          {/* Newcomers Search Section */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Search
                  </h3>
              </div>
              <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                      <div className="w-full">
                          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Enter your Name
                          </label>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                              <input
                                  type="text"
                                  placeholder="Search by name"
                                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                  value={searchParams.name}
                                  onChange={(e) => setSearchParams({ name: e.target.value })}
                              />
                              <button
                                  onClick={searchNewcomers}
                                  disabled={isLoading}
                                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                              >
                                  <Search className="mr-2 h-4 w-4" />
                                  Search
                              </button>
                          </div>
                      </div>

                      {/* No Results Message */}
                      {noResults && (
                          <div className="mt-4 rounded-md bg-gray-100 p-4 text-center dark:bg-gray-700">
                              <p className="text-red-500 dark:text-red-300">No results found</p>
                          </div>
                      )}

                      {/* Results Table */}
                      {newcomersList.results.length > 0 && (
                          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-50 dark:bg-gray-800">
                                      <tr>
                                          {['Name', 'Email', 'Phone', 'Attendance'].map((header) => (
                                              <th 
                                                  key={header}
                                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                              >
                                                  {header}
                                              </th>
                                          ))}
                                      </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                      {newcomersList.results.map((newcomer, index) => (
                                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                  {`${newcomer.first_name} ${newcomer.last_name}`}
                                              </td>
                                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                  {newcomer.email}
                                              </td>
                                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                  {newcomer.phone_number}
                                              </td>
                                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                  <button 
                                                      onClick={() => markAttendance(newcomer.slug)}
                                                      disabled={newcomer.attendance_taken}
                                                      className={`
                                                          w-full sm:w-auto inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm 
                                                          ${newcomer.attendance_taken 
                                                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                                                          }
                                                      `}
                                                  >
                                                      <CheckCircle className="mr-1.5 h-4 w-4" />
                                                      {newcomer.attendance_taken ? 'Taken' : 'Mark'}
                                                  </button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  </div>
    
  );
};



export default ReturningNewComers