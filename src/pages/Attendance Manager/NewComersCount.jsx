import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Search, Eye, CheckCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from "../../components/ui/alert";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const NewComersCount = () => {
    const location = useLocation();
    const refCode = location.state?.refCode || location.pathname.split('/returningNewcomers/')[1];
  
    const navigate = useNavigate();
    const [alert, setAlert] = useState({ show: false, message: "", type: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [detailedProfile, setDetailedProfile] = useState(null);
  
    // State for newcomers search
    const [searchParams, setSearchParams] = useState({ name: "" });
    const [noResults, setNoResults] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const [newcomersList, setNewcomersList] = useState({ 
        results: [], 
        next: null, 
        previous: null,
        count: 0,
        limit: 10
    });
    
    const showAlert = (message, type) => {
      setAlert({ show: true, message, type });
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
    };
  
    const fetchDetailedProfile = async (newcomer) => {
        try {
            const response = await axios.get(
                `https://api.thelordsbrethrenchurch.org/api/attendance/${refCode}/newcomers/${newcomer.slug}/admin/`
            );
            setDetailedProfile(response.data);
            setSelectedProfile(newcomer);
        } catch (error) {
            showAlert(error.response?.data?.message || "Error fetching profile details", "error");
        }
    };

// Function to handle pagination
const handlePagination = async (url) => {
    if (!url) return;
    
    try {
        setIsLoading(true);
        const response = await axios.get(url);
        setNewcomersList(response.data);
        setNoResults(response.data.results.length === 0);
    } catch (error) {
        showAlert(error.response?.data?.message || "Error fetching data", "error");
    } finally {
        setIsLoading(false);
    }
};

 // Function to clear results
 const handleClear = () => {
    setNewcomersList({ 
        results: [], 
        next: null, 
        previous: null,
        count: 0,
        limit: 10
    });
    setSearchParams({ name: "" });
    setNoResults(false);
};

    // Newcomers search
    const searchNewcomers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `https://api.thelordsbrethrenchurch.org/api/attendance/${refCode}/newcomers/search/`,
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

    const ProfileModal = ({ newcomer }) => {
        if (!detailedProfile) return null;


        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="min-h-screen w-full flex items-center justify-center py-8">
                <Card className="w-full max-w-4xl relative mx-auto my-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl mt-50">
                 
                {/* Alert Section */}
            {alert.show && (
                <Alert className={`absolute top-0 left-0 right-0 ${alert.type === "success" ? "bg-green-500" : "bg-red-200 text-red-900"}`}>
                                <AlertDescription className="text-sm sm:text-base">
                                    {alert.message}
                                </AlertDescription>
                     </Alert>
            )}
                   <button 
                        onClick={() => {
                            setSelectedProfile(null);
                            setDetailedProfile(null);
                        }}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <CardHeader className="p-6">
                            <CardTitle className="text-xl md:text-2xl font-semibold">
                                {`${detailedProfile.first_name} ${detailedProfile.last_name}'s Profile`}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-600 text-lg">Contact Details</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm md:text-base">Email: {detailedProfile.email}</p>
                                        <p className="text-sm md:text-base">Phone: {detailedProfile.phone_number}</p>
                                        <p className="text-sm md:text-base break-words">Address: {detailedProfile.address}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-600 text-lg">Personal Info</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm md:text-base">Gender: {detailedProfile.gender}</p>
                                        <p className="text-sm md:text-base">Birth Date: {detailedProfile.birth_date}</p>
                                        <p className="text-sm md:text-base">Marital Status: {detailedProfile.marital_status}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-bold text-gray-600 text-lg">Church Info</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm md:text-base font-semibold">First Visit: {detailedProfile.first_visit_date}</p>
                                        <p className="text-sm md:text-base">Invited By: {detailedProfile.invited_by}</p>
                                        <p className="text-sm md:text-base">Want to be Member: {detailedProfile.want_to_be_member ? 'Yes' : 'No'}</p>
                                        <p className="text-sm md:text-base">Department Interest: {detailedProfile.interested_department}</p>
                                    </div>
                                </div>
                            </div>

                        {/* Attendance Events Table */}
                        <div className="mt-8">
                                <h3 className="font-semibold text-gray-600 text-lg mb-4">
                                Attendance History (Attended {detailedProfile.attendances.count} {detailedProfile.attendances.count === 1 ? "meeting" : "meetings"})
                                </h3>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <div className="min-w-full divide-y divide-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Program</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Venue</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {detailedProfile.attendances.events.map((event, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm">{event.program}</td>
                                                        <td className="px-4 py-3 text-sm">{event.name}</td>
                                                        <td className="px-4 py-3 text-sm">{event.venue}</td>
                                                        <td className="px-4 py-3 text-sm">{event.date}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
            </div>
            </div>
        );
    };

    // Modify the eye icon click handler in the results table
    const handleProfileClick = (newcomer) => {
        fetchDetailedProfile(newcomer);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Breadcrumb pageName="New Comers"  className="text-black dark:text-white"  />
        
        <div className="space-y-6">
            {/* Alert Section */}
            {alert.show && (
                <Alert className={`w-full ${alert.type === "success" ? "bg-green-500" : "bg-red-200 text-red-900"}`}>
                        <AlertDescription className="text-sm sm:text-base">
                            {alert.message}
                        </AlertDescription>
                    </Alert>
            )}

            {/* Newcomers Search Section */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-black">
                            Search
                        </h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-4">
                            <div className="w-full">
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enter your Name
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search by name"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-700 dark:text-black"
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
                                    <div className="min-w-full divide-y divide-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    {['Name', 'Email', 'Phone', 'Profile'].map((header) => (
                                                        <th 
                                                            key={header}
                                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-black"
                                                        >
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                                {newcomersList.results.map((newcomer, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-black">
                                                            {`${newcomer.first_name} ${newcomer.last_name}`}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-black">
                                                            {newcomer.email}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-black">
                                                            {newcomer.phone_number}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                            <button 
                                                                onClick={() => handleProfileClick(newcomer)}
                                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                         {/* Pagination Controls */}
                         <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                        onClick={() => handlePagination(newcomersList.previous)}
                        disabled={!newcomersList.previous || isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePagination(newcomersList.next)}
                        disabled={!newcomersList.next || isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>

                <div className="text-sm text-gray-500 text-center w-full sm:w-auto">
                    Showing {newcomersList.results.length} of {newcomersList.count} results
                </div>

                <button
                    onClick={handleClear}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors w-full sm:w-auto"
                >
                    Clear Results
                </button>
            </div>

                    </div>
                </div>
            </div>


       {/* Profile Modal */}
       {selectedProfile && detailedProfile && <ProfileModal newcomer={selectedProfile} />}
       </div>
    );
};

export default NewComersCount;