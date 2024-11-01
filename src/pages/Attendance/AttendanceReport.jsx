import React, { useState, useRef, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const AttendanceReport = () => {
    const navigate = useNavigate();

    const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  
    // State for newcomers search
    const [searchParams, setSearchParams] = useState({ name: "", refCode: "" });
    const [newcomersList, setNewcomersList] = useState({ results: [], next: null, previous: null });
    
    // State for returning visitors
    const [returningVisitorParams, setReturningVisitorParams] = useState({ refCode: "", church: "" });
    
    // State for update attendance
    const [updateAttendanceParams, setUpdateAttendanceParams] = useState({
      ref_code: "",
      venue: "",
      date: "",
      active: true
    });
    
    // State for attendance lists
    const [attendanceList, setAttendanceList] = useState({ results: [], next: null, previous: null });
    const [allAttendanceList, setAllAttendanceList] = useState({ results: [], next: null, previous: null });
    const [selectedAttendance, setSelectedAttendance] = useState(null);
  
    const churchOptions = {
      "TLBC Awka": "tlbc-awka",
      "TLBC Ekwulobia": "tlbc-ekwulobia",
      "TLBC Ihiala": "tlbc-ihiala",
      "TLBC Nnewi": "tlbc-nnewi",
      "TLBC Onitsha": "tlbc-onitsha",
      "TLBCM Agulu": "tlbcm-agulu",
      "TLBCM FUTO": "tlbcm-futo",
      "TLBCM Igbariam": "tlbcm-coou-igbariam",
      "TLBCM Mbaukwu": "tlbcm-mbaukwu",
      "TLBCM Mgbakwu": "tlbcm-mgbakwu",
      "TLBCM NAU": "tlbcm-nau",
      "TLBCM Nekede": "tlbcm-nekede",
      "TLBCM Oko": "tlbcm-oko",
      "TLBCM Okofia": "tlbcm-okofia",
      "TLBCM Uli": "tlbcm-coou-uli",
      "TLBCM UNILAG": "tlbcm-unilag",
      "TLTN Awka": "tltn-awka",
      "TLTN Agulu": "tltn-agulu"
    };
  
    const showAlert = (message, type) => {
      setAlert({ show: true, message, type });
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
    };
  
    // Newcomers search
    const searchNewcomers = async () => {
      try {
        const response = await axios.get(
          `https://tlbc-platform-api.onrender.com/api/attendance/${searchParams.refCode}/newcomers/search/`
        );
        setNewcomersList(response.data);
      } catch (error) {
        showAlert(error.response?.data?.message || "Error searching newcomers", "error");
      }
    };
  
    // Returning visitors
    const handleReturningVisitor = async () => {
      try {
        const response = await axios.put(
          `https://tlbc-platform-api.onrender.com/api/attendance/${returningVisitorParams.refCode}/newcomers/${returningVisitorParams.church}/`
        );
        showAlert(response.data.message, "success");
        setReturningVisitorParams({ refCode: "", church: "" });
      } catch (error) {
        showAlert(error.response?.data?.message || "Error processing returning visitor", "error");
      }
    };
  
    // Update attendance
    const updateAttendance = async (e) => {
      e.preventDefault();
      try {
        const formData = new FormData();
        Object.keys(updateAttendanceParams).forEach(key => {
          formData.append(key, updateAttendanceParams[key]);
        });
        
        const response = await axios.put(
          `https://tlbc-platform-api.onrender.com/api/attendance/${updateAttendanceParams.ref_code}/update/`,
          formData
        );
        showAlert(response.data.message, "success");
        setUpdateAttendanceParams({ ref_code: "", venue: "", date: "", active: true });
      } catch (error) {
        showAlert(error.response?.data?.message || "Error updating attendance", "error");
      }
    };
  
    // Get attendance list
    const getAttendanceList = async () => {
      try {
        const response = await axios.get("https://tlbc-platform-api.onrender.com/api/attendance/list/");
        setAttendanceList(response.data);
      } catch (error) {
        showAlert(error.response?.data?.message || "Error fetching attendance list", "error");
      }
    };
  
    // Get all attendance lists
    const getAllAttendanceLists = async () => {
      try {
        const response = await axios.get("https://tlbc-platform-api.onrender.com/api/attendance/list/all/");
        setAllAttendanceList(response.data);
      } catch (error) {
        showAlert(error.response?.data?.message || "Error fetching all attendance lists", "error");
      }
    };
  
    // Get attendance details
    const getAttendanceDetails = async (refCode) => {
      try {
        const response = await axios.get(
          `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/`
        );
        setSelectedAttendance(response.data);
      } catch (error) {
        showAlert(error.response?.data?.message || "Error fetching attendance details", "error");
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

  // Function to handle pagination for attendance lists
  const handleAttendancePagination = async (url, setListFunction) => {
    try {
      const response = await axios.get(url);
      setListFunction(response.data);
    } catch (error) {
      showAlert(error.response?.data?.message || "Error fetching attendance", "error");
    }
  };

  return (
    <>
<Breadcrumb pageName="Attendance Report" />

{/* <div className="p-4 md:p-6 2xl:p-10">
  <div className="mx-auto max-w-5xl"> */}

 <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-full">
        <div className="mx-auto max-w-7xl w-full">
          {alert.show && (
            <Alert className={`mb-4  w-full ${alert.type === "success" ? "bg-green-50" : "bg-red-50"}`}>
              <AlertDescription className="text-sm sm:text-base">
              {alert.message}</AlertDescription>
            </Alert>
          )}

          {/* Newcomers Search Section */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <div className="border-b border-stroke py-4 px-4 sm:px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                Newcomers Search
              </h3>
            </div>
            <div className="p-4 sm:p-6.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="w-full">
                  <label className="mb-2 sm:mb-2.5 block text-sm sm:text-base text-black dark:text-white">
                    Enter Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                     value={searchParams.name}
                    onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                  />
                </div>

                <div className="w-full">
                  <label className="mb-2 sm:mb-2.5 block text-sm sm:text-base text-black dark:text-white">
                    Ref Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={searchParams.refCode}
                      onChange={(e) => setSearchParams({ ...searchParams, refCode: e.target.value })}
                    />
                     <button
                      onClick={searchNewcomers}
                      className="flex items-center rounded bg-primary px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-opacity-90 text-sm sm:text-base"
                    >
                      <Search size={16} className="mr-1" /> Search
                    </button>
                  </div>
                </div>
              </div>

              {newcomersList.results.length > 0 && (
                <div className="mt-4 sm:mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm sm:text-base">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Name</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Email</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Phone</th>
                        </tr>
                      </thead>
                      <tbody>

                      {newcomersList.results.map((newcomer, index) => (
                        <tr key={index} className="border-b border-stroke dark:border-strokedark">
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">{`${newcomer.first_name} ${newcomer.last_name}`}</td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">{newcomer.email}</td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">{newcomer.phone_number}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                </div>
              )}
            </div>
          </div>
{/* 
                  <div className="flex justify-end gap-2 mt-4">
                    {newcomersList.previous && (
                      <button
                       
                        className="px-3 py-1 border rounded flex items-center gap-1"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                    )}
                    {newcomersList.next && (
                      <button
                      
                        className="px-3 py-1 border rounded flex items-center gap-1"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}

            </CardContent>
          </Card> */}

 {/* Returning Visitors Section */}
 <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <div className="border-b border-stroke py-4 px-4 sm:px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                Returning Visitors
              </h3>
            </div>
            <div className="p-4 sm:p-6.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="mb-2 sm:mb-2.5 block text-sm sm:text-base text-black dark:text-white">
                    Ref Code
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={returningVisitorParams.refCode}
                    onChange={(e) => setReturningVisitorParams({ ...returningVisitorParams, refCode: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 sm:mb-2.5 block text-sm sm:text-base text-black dark:text-white">
                    Church
                  </label>
                  <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={returningVisitorParams.church}
                    onChange={(e) => setReturningVisitorParams({ ...returningVisitorParams, church: e.target.value })}
                  >
                    <option value="">Select Church</option>
                    {Object.entries(churchOptions).map(([label, value]) => (
                      <option key={value} value={value} className="text-sm sm:text-base">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleReturningVisitor}
                className="mt-3 sm:mt-4 flex w-full justify-center rounded bg-primary p-2 sm:p-3 text-sm sm:text-base font-medium text-gray hover:bg-opacity-90"
              >
                Submit
              </button>
            </div>
          </div>


         {/* Update Attendance Section */}
         <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <div className="border-b border-stroke py-4 px-4 sm:px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                Update Attendance
              </h3>
            </div>
            <form onSubmit={updateAttendance} className="p-4 sm:p-6.5 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Form fields with responsive sizing and spacing */}
                <div>
                  <label className="mb-2 sm:mb-2.5 block text-sm sm:text-base text-black dark:text-white">
                    Ref Code
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={updateAttendanceParams.ref_code}
                      onChange={(e) => setUpdateAttendanceParams({
                        ...updateAttendanceParams,
                        ref_code: e.target.value
                      })}
                    />
                  </div>

                  <div>
                  <label className="mb-2 sm:mb-2.5 block text-sm sm:text-base text-black dark:text-white">
                    Venue
                  </label>
                  <input
                      type="text"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={updateAttendanceParams.venue}
                      onChange={(e) => setUpdateAttendanceParams({
                        ...updateAttendanceParams,
                        venue: e.target.value
                      })}
                    />
                  </div>
                  <div>
                  <label className="mb-2 sm:mb-2.5 block text-sm sm:text-base text-black dark:text-white">
                  Date
                  </label>
                  <input
                      type="date"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={updateAttendanceParams.date}
                      onChange={(e) => setUpdateAttendanceParams({
                        ...updateAttendanceParams,
                        date: e.target.value
                      })}
                    />
                  </div>
                  <div>
                  <label className="mb-2 sm:mb-2.5 block text-sm sm:text-base text-black dark:text-white">
                  Active
                  </label>
                    <select
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={updateAttendanceParams.active}
                      onChange={(e) => setUpdateAttendanceParams({
                        ...updateAttendanceParams,
                        active: e.target.value === "true"
                      })}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-primary p-2 sm:p-3 text-sm sm:text-base font-medium text-gray hover:bg-opacity-90"
                  >
                  Update Attendance
                </button>
              </form>
              </div>


   {/* Attendance Lists Sections */}
          <div className="grid grid-cols-1 gap-6">
            {/* Church Attendance List */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-4 sm:px-6.5 dark:border-strokedark flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                  Church Attendance List
                </h3>
                <button
                  onClick={getAttendanceList}
                 className="flex items-center justify-center rounded bg-primary px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-opacity-90 text-sm sm:text-base"
                    >
                  Get Attendance List
                </button>
              </div>


                {attendanceList.results.length === 0 ? (
                  <div className="mt-4 sm:mt-6 rounded-sm border border-stroke px-4 py-1 bg-white shadow-default dark:border-strokedark dark:bg-boxdark  dark:text-white">
                     {/* <div className="text-center py-8 text-gray-500">No attendance records found</div> */}
                  No attendance records found </div>
                ) : (
                  <>
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm sm:text-base">
                        <thead>
                        <tr className="bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Program</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Name</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Venue</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Date</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Church</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Status</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceList.results.map((attendance, index) => (
                            <tr key={index}  className="border-b border-stroke dark:border-strokedark">
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">{attendance.program}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">{attendance.name}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">{attendance.venue}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">{attendance.date}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">{attendance.church}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                                <span className={`px-2 py-1 rounded-full text-xs  text-black dark:text-white ${
                                  attendance.active ? 'bg-green-100 text-green-800 dark:text-white' : 'bg-red-100 text-red-800 dark:text-white'
                                }`}>
                                  {attendance.active ? 'Active' : 'Inactive'}
                                </span> 
                              </td>
                              <td className="px-4 py-2 text-center  text-black dark:text-white">
                                <button
                                  onClick={() => getAttendanceDetails(attendance.ref_code)}
                                  // className="text-blue-600 hover:text-blue-800"
                                  className="mt-4 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      {attendanceList.previous && (
                        <button
                          onClick={() => handleAttendancePagination(attendanceList.previous, setAttendanceList)}
                          className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                        >
                          <ChevronLeft size={16} /> Previous
                        </button>
                      )}
                      {attendanceList.next && (
                        <button
                          onClick={() => handleAttendancePagination(attendanceList.next, setAttendanceList)}
                          className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </>
                )}
             


           {/* All Attendance Lists */}
           <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                  All Attendance Lists
                </h3>
                <button
                  onClick={getAllAttendanceLists}
                  className="w-full sm:w-auto flex justify-center items-center rounded bg-primary px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-opacity-90 text-sm sm:text-base"
                  >
                  Get All Attendance
                </button>
              </div>

              
                {allAttendanceList.results.length === 0 ? (
                  <div className="mt-6 px-4 py-1 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  No attendance records found</div>
                ) : (
                  <>
                  <div className="overflow-x-auto">
                  <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Program</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Name</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Venue</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Date</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Church</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Status</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allAttendanceList.results.map((attendance, index) => (
                            <tr key={index} className="border-b border-stroke dark:border-strokedark">
                              <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">{attendance.program}</td>
                              <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">{attendance.name}</td>
                              <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">{attendance.venue}</td>
                              <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">{attendance.date}</td>
                              <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">{attendance.church}</td>
                              <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                <span className={`px-2 py-1 rounded-full text-xs text-black dark:text-white ${
                                  attendance.active ? 'bg-green-100 text-green-800 dark:text-white' : 'bg-red-100 text-red-800 dark:text-white'
                                }`}>
                                  {attendance.active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center text-black dark:text-white">
                                <button
                                  onClick={() => getAttendanceDetails(attendance.ref_code)}
                                  className="mt-4 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                  >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      {allAttendanceList.previous && (
                        <button
                          onClick={() => handleAttendancePagination(allAttendanceList.previous, setAllAttendanceList)}
                          className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                        >
                          <ChevronLeft size={16} /> Previous
                        </button>
                      )}
                      {allAttendanceList.next && (
                        <button
                          onClick={() => handleAttendancePagination(allAttendanceList.next, setAllAttendanceList)}
                          className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </>
                )}
   
   
            {/* Selected Attendance Details Modal */}
            {selectedAttendance && (
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mt-2">
                <div className="border-b border-stroke py-4 px-4 sm:px-6.5 dark:border-strokedark flex justify-between items-center">
                {/* <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"> */}
                  <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                    Attendance Details
                  </h3>
                  <button
                      onClick={() => setSelectedAttendance(null)}
                      className="text-black dark:text-white hover:opacity-75"
                      >
                      ×
                    </button>
                    </div>

                    <div className="p-6.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-base sm:text-lg text-black dark:text-white">General Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">Program:</span> {selectedAttendance.program}</p>
                        <p><span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">Name:</span> {selectedAttendance.name}</p>
                        <p><span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">Church:</span> {selectedAttendance.church}</p>
                        <p><span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">Venue:</span> {selectedAttendance.venue}</p>
                        <p><span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">Date:</span> {selectedAttendance.date}</p>
                        <p><span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">Status:</span> {selectedAttendance.active ? 'Active' : 'Inactive'}</p>
                      </div> 
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-base sm:text-lg text-black dark:text-white">Attendance Statistics</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Attendees</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(selectedAttendance.attendees).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-2 rounded">
                                <span className="text-sm text-gray-600 text-black dark:text-white">{key}:</span>
                                <span className="ml-2 font-medium text-black dark:text-white">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1 text-black dark:text-white">Newcomers</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(selectedAttendance.newcomers).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-2 rounded">
                                <span className="text-sm text-gray-600 text-black dark:text-white">{key}:</span>
                                <span className="ml-2 font-medium text-black dark:text-white">{value}</span>
                              </div>
                            ))}

            </div>
            </div>
            </div>
            </div>
            </div>
            </div>
          </div>
      
   
            )}
            </div>
            </div>
            </div>
            </div>
            </div>
    </>
  );
};


export default AttendanceReport