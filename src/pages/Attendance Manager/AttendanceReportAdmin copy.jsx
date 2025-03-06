import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AttendanceReportAdmin = () => {
  const navigate = useNavigate();

  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // State for newcomers search
  const [searchParams, setSearchParams] = useState({ name: '', refCode: '' });
  const [newcomersList, setNewcomersList] = useState({
    results: [],
    next: null,
    previous: null,
  });
  const [noResults, setNoResults] = useState(false);

  // State for returning visitors
  const [returningVisitorParams, setReturningVisitorParams] = useState({
    refCode: '',
    church: '',
  });

  // State for attendance lists
  const [attendanceList, setAttendanceList] = useState({
    results: [],
    next: null,
    previous: null,
  });
  const [allAttendanceList, setAllAttendanceList] = useState({
    results: [],
    next: null,
    previous: null,
  });
  const [zonalAttendanceList, setZonalAttendanceList] = useState({
    results: [],
    next: null,
    previous: null,
  });
  const [centralAttendanceList, setCentralAttendanceList] = useState({
    results: [],
    next: null,
    previous: null,
  });
  const [localChurchesAttendanceList, setLocalChurchesAttendanceList] = useState({
    results: [],
    next: null,
    previous: null,
  });
  const [myAttendanceList, setMyAttendanceList] = useState({
    results: [],
    next: null,
    previous: null,
  });
  const [selectedAttendance, setSelectedAttendance] = useState(null);
 
  const churchOptions = {
    'Central': 'central',
    'TLBC Awka': 'tlbc-awka',
    'TLBC Ekwulobia': 'tlbc-ekwulobia',
    'TLBC Ihiala': 'tlbc-ihiala',
    'TLBC Nnewi': 'tlbc-nnewi',
    'TLBC Onitsha': 'tlbc-onitsha',
    'TLBCM Agulu': 'tlbcm-agulu',
    'TLBCM COOU Igbariam': 'tlbcm-coou-igbariam',
    'TLBCM COOU Uli': 'tlbcm-coou-uli',
    'TLBCM FUTO': 'tlbcm-futo',
    'TLBCM IMSU': 'tlbcm-imsu',
    'TLBCM Mbaukwu': 'tlbcm-mbaukwu',
    'TLBCM Mgbakwu': 'tlbcm-mgbakwu',
    'TLBCM NAU': 'tlbcm-nau',
    'TLBCM Nekede': 'tlbcm-nekede',
    'TLBCM Oko': 'tlbcm-oko',
    'TLBCM Okofia': 'tlbcm-okofia',
    'TLBCM UNILAG': 'tlbcm-unilag',
    'TLTN Awka': 'tltn-awka',
    'TLTN Agulu': 'tltn-agulu',
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  // Clear methods for different lists
  const clearAttendanceList = () => {
    setAttendanceList({ results: [], next: null, previous: null });
    setNoResults(false);
  };

  const clearZonalAttendanceList = () => {
    setZonalAttendanceList({ results: [], next: null, previous: null });
    setNoResults(false);
  };

  const clearCentralAttendanceList = () => {
    setCentralAttendanceList({ results: [], next: null, previous: null });
    setNoResults(false);
  };

  const clearLocalChurchesAttendanceList = () => {
    setLocalChurchesAttendanceList({ results: [], next: null, previous: null });
    setNoResults(false);
  };

  const clearAllAttendanceList = () => {
    setAllAttendanceList({ results: [], next: null, previous: null });
    setNoResults(false);
  };

  const clearMyAttendanceList = () => {
    setMyAttendanceList({ results: [], next: null, previous: null });
    setNoResults(false);
  };

  // Newcomers search
  const searchNewcomers = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      const response = await axios.get(
        `https://api.thelordsbrethrenchurch.org/api/attendance/${searchParams.refCode}/newcomers/search/`,
        {
          params: {
            s: searchParams.name,
          },
        },
      );
      setNewcomersList(response.data);
      setNoResults(response.data.results.length === 0);
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error searching newcomers',
        'error',
      );
      setNoResults(false);
    }
  };

  // Returning visitors
  const handleReturningVisitor = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      const response = await axios.put(
        `https://api.thelordsbrethrenchurch.org/api/attendance/${returningVisitorParams.refCode}/newcomers/${returningVisitorParams.church}/`,
      );
      showAlert(response.data.message, 'success');
      setReturningVisitorParams({ refCode: '', church: '' });
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error processing returning visitor',
        'error',
      );
    }
  };

  // Get my church's attendance list
  const getAttendanceList = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      const response = await axios.get(
        'https://api.thelordsbrethrenchurch.org/api/attendance/list/',
      );
      setAttendanceList(response.data);
      setNoResults(response.data.results.length === 0);
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error fetching attendance list',
        'error',
      );
      setNoResults(false);
    }
  };

  // Get zonal attendance list
  const getZonalAttendanceList = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      const response = await axios.get(
        'https://api.thelordsbrethrenchurch.org/api/attendance/list/zone/',
      );
      setZonalAttendanceList(response.data);
      setNoResults(response.data.results.length === 0);
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error fetching zonal attendance list',
        'error',
      );
      setNoResults(false);
    }
  };

  // Get Central attendance lists
  const getCentralAttendanceList = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      const response = await axios.get(
        'https://api.thelordsbrethrenchurch.org/api/attendance/list/all/?type=central',
      );
      setCentralAttendanceList(response.data);
      setNoResults(response.data.results.length === 0);
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error fetching central attendance lists',
        'error',
      );
      setNoResults(false);
    }
  };

   // Get Local Churches attendance lists
   const getAllLocalChurchesAttendanceList = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      const response = await axios.get(
        'https://api.thelordsbrethrenchurch.org/api/attendance/list/all/?type=local',
      );
      setLocalChurchesAttendanceList(response.data);
      setNoResults(response.data.results.length === 0);
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error fetching local churches attendance lists',
        'error',
      );
      setNoResults(false);
    }
  };

  // Get all attendance lists
  const getAllAttendanceLists = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      const response = await axios.get(
        'https://api.thelordsbrethrenchurch.org/api/attendance/list/all/',
      );
      setAllAttendanceList(response.data);
      setNoResults(response.data.results.length === 0);
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error fetching all attendance lists',
        'error',
      );
      setNoResults(false);
    }
  };

  // Get My attendance lists
  const getMyAttendanceLists = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      const response = await axios.get(
        'https://api.thelordsbrethrenchurch.org/api/attendance/me/',
      );
      setMyAttendanceList(response.data);
      setNoResults(response.data.results.length === 0);
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error fetching all attendance lists',
        'error',
      );
      setNoResults(false);
    }
  };

  const handleAttendanceDetails = (refCode) => {
    // Navigate to the details page with the ref_code
    console.log('Navigating to:', `/attendanceDetails/${refCode}`);
    navigate(`/attendancedetailspageadmin/${refCode}`);
  };

  // Get attendance details
  const getAttendanceDetails = async (refCode) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      const response = await axios.get(
        `https://api.thelordsbrethrenchurch.org/api/attendance/${refCode}/`,
      );
      setSelectedAttendance(response.data);
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error fetching attendance details',
        'error',
      );
    }
  };

  // Function to handle pagination for newcomers
  const handleNewcomersPagination = async (url) => {
    try {
      const response = await axios.get(url);
      setNewcomersList(response.data);
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error fetching newcomers',
        'error',
      );
    }
  };

  // Function to handle pagination for attendance lists
  const handleAttendancePagination = async (url, setListFunction) => {
    try {
      const response = await axios.get(url);
      setListFunction(response.data);
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Error fetching attendance',
        'error',
      );
    }
  };

  // Function to format the date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};


 // Modified Status Cell Component for better dark mode visibility
 const StatusCell = ({ active }) => (
  <span
    className={`px-2 py-1 rounded-full text-xs ${
      active
        ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300'
    }`}
  >
    {active ? 'Active' : 'Inactive'}
  </span>
);


  return (
    <>
      <Breadcrumb pageName="Attendance Report"  className="text-black dark:text-white"  />

      {/* <div className="p-4 md:p-6 2xl:p-10">
  <div className="mx-auto max-w-5xl"> */}

      <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-full">
        <div className="mx-auto max-w-7xl w-full">
          {alert.show && (
            <Alert
              className={`mb-4  w-full ${alert.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <AlertDescription className="text-sm sm:text-base">
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Attendance Lists Sections */}
          <div className="grid grid-cols-1 gap-6">
            {/* Church Attendance List */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-4 sm:px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-base text-center sm:text-xl text-black dark:text-white">
                  Generate Attendance Reports
                </h3>
              </div>

              <div className="border-b border-stroke py-4 px-4 sm:px-6.5 dark:border-strokedark flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                 My Church's Attendance List
                </h3>
                <button
                  onClick={getAttendanceList}
                  className="flex items-center justify-center rounded bg-primary px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-opacity-90 text-sm sm:text-base"
                >
                  Get Attendance List
                </button>
              </div>

              {noResults && (
                <div className="mt-4 sm:mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4 sm:p-6.5">
                  <p className="text-[red] dark:text-white">
                    {' '}
                    No attendance records found for your Church
                  </p>
                </div>
              )}
              {attendanceList.results.length === 0 ? (
                <div className="mt-4 sm:mt-6 rounded-sm border border-stroke px-4 py-1 bg-white shadow-default dark:border-strokedark dark:bg-boxdark  dark:text-white">
                  {/* <div className="text-center py-8 text-gray-500">No attendance records found</div> */}
                  No attendance records found{' '}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm sm:text-base">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                            Program
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                            Name
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                            Venue
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                           Attendance Date
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                            Church
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                            Created on
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                            Status
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceList.results.map((attendance, index) => (
                          <tr
                            key={index}
                            className="border-b border-stroke dark:border-strokedark"
                          >
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                              {attendance.program}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                              {attendance.name}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                              {attendance.venue}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                              {attendance.date}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                              {attendance.church}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                            {formatDate(attendance.created_at || 'N/A')}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                <StatusCell active={attendance.active} />
                            </td>
                            <td className="px-4 py-2 text-center  text-black dark:text-white">
                              <button
                                onClick={() => {
                                  console.log(
                                    'Captured ref_code:',
                                    attendance.ref_code,
                                  );
                                  handleAttendanceDetails(attendance.ref_code);
                                }}
                                className="mt-4 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Modify this section to put Clear and Pagination buttons on the same row */}
                    <div className="flex justify-end gap-2 mt-4 mr-4 mb-4 items-center">
                      <button
                        onClick={clearAttendanceList}
                        className="flex items-center justify-center rounded bg-red-500 px-3 sm:px-3 py-2 sm:py-2 text-white hover:bg-opacity-90 text-sm sm:text-base mr-2"
                      >
                       Close
                      </button>

                      <div className="flex gap-2">
                        {attendanceList.previous && (
                          <button
                            onClick={() =>
                              handleAttendancePagination(
                                attendanceList.previous,
                                setAttendanceList,
                              )
                            }
                            className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                          >
                            <ChevronLeft size={16} /> Previous
                          </button>
                        )}
                        {attendanceList.next && (
                          <button
                            onClick={() =>
                              handleAttendancePagination(
                                attendanceList.next,
                                setAttendanceList,
                              )
                            }
                            className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                          >
                            Next <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Zonal Attendance Lists */}
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                   My Zone's Attendance List
                  </h3>
                  <button
                    onClick={getZonalAttendanceList}
                    className="w-full sm:w-auto flex justify-center items-center rounded bg-primary px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-opacity-90 text-sm sm:text-base"
                  >
                    Get Zonal Attendance
                  </button>
                </div>

                {noResults && (
                  <div className="mt-4 sm:mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4 sm:p-6.5">
                    <p className="text-[red] dark:text-white">
                      No zonal attendance records found
                    </p>
                  </div>
                )}

                {zonalAttendanceList.results.length === 0 ? (
                  <div className="mt-6 px-4 py-1 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    No zonal attendance records found
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm sm:text-base">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Program
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Name
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Venue
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                             Attendance Date
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Church
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Created on
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Status
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {zonalAttendanceList.results.map(
                            (attendance, index) => (
                              <tr
                                key={index}
                                className="border-b border-stroke dark:border-strokedark"
                              >
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.program}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.name}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.venue}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.date}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.church}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                            {formatDate(attendance.created_at || 'N/A')}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                <StatusCell active={attendance.active} />
                            </td>
                                <td className="px-4 py-2 text-center text-black dark:text-white">
                                  <button
                                    onClick={() => {
                                      console.log(
                                        'Captured ref_code:',
                                        attendance.ref_code,
                                      );
                                      handleAttendanceDetails(
                                        attendance.ref_code,
                                      );
                                    }}
                                    className="mt-4 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                  >
                                    <Eye size={18} />
                                  </button>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>

                      {/* Modify this section to put Clear and Pagination buttons on the same row */}
                      <div className="flex justify-end gap-2 mt-4 mr-4 mb-4 items-center">
                        <button
                          onClick={clearZonalAttendanceList}
                          className="flex items-center justify-center rounded bg-red-500 px-3 sm:px-3 py-2 sm:py-2 text-white hover:bg-opacity-90 text-sm sm:text-base mr-2"
                        >
                         Close
                        </button>

                        <div className="flex gap-2">
                          {zonalAttendanceList.previous && (
                            <button
                              onClick={() =>
                                handleAttendancePagination(
                                  zonalAttendanceList.previous,
                                  setZonalAttendanceList,
                                )
                              }
                              className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                            >
                              <ChevronLeft size={16} /> Previous
                            </button>
                          )}
                          {zonalAttendanceList.next && (
                            <button
                              onClick={() =>
                                handleAttendancePagination(
                                  zonalAttendanceList.next,
                                  setZonalAttendanceList,
                                )
                              }
                              className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                            >
                              Next <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Central Attendance Lists */}
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                    Central Attendance List
                  </h3>
                  <button
                    onClick={getCentralAttendanceList}
                    className="w-full sm:w-auto flex justify-center items-center rounded bg-primary px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-opacity-90 text-sm sm:text-base"
                  >
                    Get Central Attendance
                  </button>
                </div>

                {noResults && (
                  <div className="mt-4 sm:mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4 sm:p-6.5">
                    <p className="text-[red] dark:text-white">
                      No central attendance records found
                    </p>
                  </div>
                )}

                {centralAttendanceList.results.length === 0 ? (
                  <div className="mt-6 px-4 py-1 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    No central attendance records found
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm sm:text-base">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Program
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Name
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Venue
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                             Attendance Date
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Church
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Created on
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Status
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {centralAttendanceList.results.map(
                            (attendance, index) => (
                              <tr
                                key={index}
                                className="border-b border-stroke dark:border-strokedark"
                              >
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.program}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.name}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.venue}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.date}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.church}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                            {formatDate(attendance.created_at || 'N/A')}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                <StatusCell active={attendance.active} />
                            </td>
                                <td className="px-4 py-2 text-center text-black dark:text-white">
                                  <button
                                    onClick={() => {
                                      console.log(
                                        'Captured ref_code:',
                                        attendance.ref_code,
                                      );
                                      handleAttendanceDetails(
                                        attendance.ref_code,
                                      );
                                    }}
                                    className="mt-4 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                  >
                                    <Eye size={18} />
                                  </button>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>

                      {/* Modify this section to put Clear and Pagination buttons on the same row */}
                      <div className="flex justify-end gap-2 mt-4 mr-4 mb-4 items-center">
                        <button
                          onClick={clearCentralAttendanceList}
                          className="flex items-center justify-center rounded bg-red-500 px-3 sm:px-3 py-2 sm:py-2 text-white hover:bg-opacity-90 text-sm sm:text-base mr-2"
                        >
                         Close
                        </button>

                        <div className="flex gap-2">
                          {centralAttendanceList.previous && (
                            <button
                              onClick={() =>
                                handleAttendancePagination(
                                  centralAttendanceList.previous,
                                  setCentralAttendanceList,
                                )
                              }
                              className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                            >
                              <ChevronLeft size={16} /> Previous
                            </button>
                          )}
                          {centralAttendanceList.next && (
                            <button
                              onClick={() =>
                                handleAttendancePagination(
                                  centralAttendanceList.next,
                                  setCentralAttendanceList,
                                )
                              }
                              className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                            >
                              Next <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

  {/* All Local Churches Attendance Lists */}
  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                    All Local Churches Attendance Lists
                  </h3>
                  <button
                    onClick={getAllLocalChurchesAttendanceList}
                    className="w-full sm:w-auto flex justify-center items-center rounded bg-primary px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-opacity-90 text-sm sm:text-base"
                  >
                    Get Local Churches Attendance
                  </button>
                </div>

                {noResults && (
                  <div className="mt-4 sm:mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4 sm:p-6.5">
                    <p className="text-[red] dark:text-white">
                      No local church attendance records found
                    </p>
                  </div>
                )}

                {localChurchesAttendanceList.results.length === 0 ? (
                  <div className="mt-6 px-4 py-1 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    No local church attendance records found
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm sm:text-base">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Program
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Name
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Venue
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                             Attendance Date
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Church
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Created on
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Status
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {localChurchesAttendanceList.results.map(
                            (attendance, index) => (
                              <tr
                                key={index}
                                className="border-b border-stroke dark:border-strokedark"
                              >
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.program}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.name}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.venue}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.date}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.church}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                            {formatDate(attendance.created_at || 'N/A')}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                <StatusCell active={attendance.active} />
                            </td>
                                <td className="px-4 py-2 text-center text-black dark:text-white">
                                  <button
                                    onClick={() => {
                                      console.log(
                                        'Captured ref_code:',
                                        attendance.ref_code,
                                      );
                                      handleAttendanceDetails(
                                        attendance.ref_code,
                                      );
                                    }}
                                    className="mt-4 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                  >
                                    <Eye size={18} />
                                  </button>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>

                      {/* Modify this section to put Clear and Pagination buttons on the same row */}
                      <div className="flex justify-end gap-2 mt-4 mr-4 mb-4 items-center">
                        <button
                          onClick={clearLocalChurchesAttendanceList}
                          className="flex items-center justify-center rounded bg-red-500 px-3 sm:px-3 py-2 sm:py-2 text-white hover:bg-opacity-90 text-sm sm:text-base mr-2"
                        >
                         Close
                        </button>

                        <div className="flex gap-2">
                          {localChurchesAttendanceList.previous && (
                            <button
                              onClick={() =>
                                handleAttendancePagination(
                                  localChurchesAttendanceList.previous,
                                  setLocalChurchesAttendanceList,
                                )
                              }
                              className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                            >
                              <ChevronLeft size={16} /> Previous
                            </button>
                          )}
                          {localChurchesAttendanceList.next && (
                            <button
                              onClick={() =>
                                handleAttendancePagination(
                                  localChurchesAttendanceList.next,
                                  setLocalChurchesAttendanceList,
                                )
                              }
                              className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                            >
                              Next <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>


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

                {noResults && (
                  <div className="mt-4 sm:mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4 sm:p-6.5">
                    <p className="text-[red] dark:text-white">
                      {' '}
                      No attendance records found for your Church
                    </p>
                  </div>
                )}

                {allAttendanceList.results.length === 0 ? (
                  <div className="mt-6 px-4 py-1 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    No attendance records found
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm sm:text-base">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Program
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Name
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Venue
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                             Attendance Date
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Church
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Created on
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Status
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {allAttendanceList.results.map(
                            (attendance, index) => (
                              <tr
                                key={index}
                                className="border-b border-stroke dark:border-strokedark"
                              >
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.program}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.name}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.venue}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.date}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.church}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                            {formatDate(attendance.created_at || 'N/A')}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                <StatusCell active={attendance.active} />
                            </td>
                                <td className="px-4 py-2 text-center text-black dark:text-white">
                                  <button
                                    onClick={() => {
                                      console.log(
                                        'Captured ref_code:',
                                        attendance.ref_code,
                                      );
                                      handleAttendanceDetails(
                                        attendance.ref_code,
                                      );
                                    }}
                                    className="mt-4 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                  >
                                    <Eye size={18} />
                                  </button>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                   
                   {/* Modify this section to put Clear and Pagination buttons on the same row */}
          <div className="flex justify-end gap-2 mt-4 mr-4 mb-4 items-center">
            <button
              onClick={clearAllAttendanceList}
              className="flex items-center justify-center rounded bg-red-500 px-3 sm:px-3 py-2 sm:py-2 text-white hover:bg-opacity-90 text-sm sm:text-base mr-2"
            >
              Close
            </button>


            <div className="flex gap-2">
                      {allAttendanceList.previous && (
                        <button
                          onClick={() =>
                            handleAttendancePagination(
                              allAttendanceList.previous,
                              setAllAttendanceList,
                            )
                          }
                          className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                        >
                          <ChevronLeft size={16} /> Previous
                        </button>
                      )}
                      {allAttendanceList.next && (
                        <button
                          onClick={() =>
                            handleAttendancePagination(
                              allAttendanceList.next,
                              setAllAttendanceList,
                            )
                          }
                          className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                    </div>
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
                          <h3 className="font-semibold mb-2 text-base sm:text-lg text-black dark:text-white">
                            General Information
                          </h3>
                          <div className="space-y-2">
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Program:
                              </span>{' '}
                              {selectedAttendance.program}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Name:
                              </span>{' '}
                              {selectedAttendance.name}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Church:
                              </span>{' '}
                              {selectedAttendance.church}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Attendance Date:
                              </span>{' '}
                              {selectedAttendance.date}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Venue:
                              </span>{' '}
                              {selectedAttendance.venue}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Created on:
                              </span>{' '}
                              {selectedAttendance.created_at || 'N/A'}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Status:
                              </span>{' '}
                              {selectedAttendance.active
                                ? 'Active'
                                : 'Inactive'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2 text-base sm:text-lg text-black dark:text-white">
                            Attendance Statistics
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1">
                                Attendees
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(
                                  selectedAttendance.attendees,
                                ).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="bg-gray-50 p-2 rounded"
                                  >
                                    <span className="text-sm text-gray-600 text-black dark:text-white">
                                      {key}:
                                    </span>
                                    <span className="ml-2 font-medium text-black dark:text-white">
                                      {value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-black dark:text-white">
                                Newcomers
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(
                                  selectedAttendance.newcomers,
                                ).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="bg-gray-50 p-2 rounded"
                                  >
                                    <span className="text-sm text-gray-600 text-black dark:text-white">
                                      {key}:
                                    </span>
                                    <span className="ml-2 font-medium text-black dark:text-white">
                                      {value}
                                    </span>
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
              
                 {/* List of Attendance created by me */}
                 <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                    My Attendance history
                  </h3>
                  <button
                    onClick={getMyAttendanceLists}
                    className="w-full sm:w-auto flex justify-center items-center rounded bg-primary px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-opacity-90 text-sm sm:text-base"
                  >
                    Get my Attendance history
                  </button>
                </div>

                {noResults && (
                  <div className="mt-4 sm:mt-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4 sm:p-6.5">
                    <p className="text-[red] dark:text-white">
                      {' '}
                      No attendance records found for you
                    </p>
                  </div>
                )}

                {myAttendanceList.results.length === 0 ? (
                  <div className="mt-6 px-4 py-1 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    No attendance records found
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm sm:text-base">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Program
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Name
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Venue
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                             Attendance Date
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Church
                            </th>
                            {/* <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Created on
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Status
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                              Action
                            </th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {myAttendanceList.results.map(
                            (attendance, index) => (
                              <tr
                                key={index}
                                className="border-b border-stroke dark:border-strokedark"
                              >
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.program}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.name}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.venue}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.date}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-black dark:text-white">
                                  {attendance.church}
                                </td>
                                {/* <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                            {formatDate(attendance.created_at || 'N/A')}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                <StatusCell active={attendance.active} />
                            </td>
                                <td className="px-4 py-2 text-center text-black dark:text-white">
                                  <button
                                    onClick={() => {
                                      console.log(
                                        'Captured ref_code:',
                                        attendance.ref_code,
                                      );
                                      handleAttendanceDetails(
                                        attendance.ref_code,
                                      );
                                    }}
                                    className="mt-4 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                  >
                                    <Eye size={18} />
                                  </button>
                                </td> */}
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                   
                   {/* Modify this section to put Clear and Pagination buttons on the same row */}
          <div className="flex justify-end gap-2 mt-4 mr-4 mb-4 items-center">
            <button
              onClick={clearMyAttendanceList}
              className="flex items-center justify-center rounded bg-red-500 px-3 sm:px-3 py-2 sm:py-2 text-white hover:bg-opacity-90 text-sm sm:text-base mr-2"
            >
              Close
            </button>


            <div className="flex gap-2">
                      {myAttendanceList.previous && (
                        <button
                          onClick={() =>
                            handleAttendancePagination(
                              myAttendanceList.previous,
                              setMyAttendanceList,
                            )
                          }
                          className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                        >
                          <ChevronLeft size={16} /> Previous
                        </button>
                      )}
                      {myAttendanceList.next && (
                        <button
                          onClick={() =>
                            handleAttendancePagination(
                              myAttendanceList.next,
                              setMyAttendanceList,
                            )
                          }
                          className="px-3 py-1 border rounded flex items-center gap-1 hover:bg-gray-50"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                    </div>
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
                          <h3 className="font-semibold mb-2 text-base sm:text-lg text-black dark:text-white">
                            General Information
                          </h3>
                          <div className="space-y-2">
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Program:
                              </span>{' '}
                              {selectedAttendance.program}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Name:
                              </span>{' '}
                              {selectedAttendance.name}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Church:
                              </span>{' '}
                              {selectedAttendance.church}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Attendance Date:
                              </span>{' '}
                              {selectedAttendance.date}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Venue:
                              </span>{' '}
                              {selectedAttendance.venue}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Created on:
                              </span>{' '}
                              {selectedAttendance.created_at || 'N/A'}
                            </p>
                            <p>
                              <span className="font-medium sm:px-4 text-xs sm:text-sm text-black dark:text-white">
                                Status:
                              </span>{' '}
                              {selectedAttendance.active
                                ? 'Active'
                                : 'Inactive'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2 text-base sm:text-lg text-black dark:text-white">
                            Attendance Statistics
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1">
                                Attendees
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(
                                  selectedAttendance.attendees,
                                ).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="bg-gray-50 p-2 rounded"
                                  >
                                    <span className="text-sm text-gray-600 text-black dark:text-white">
                                      {key}:
                                    </span>
                                    <span className="ml-2 font-medium text-black dark:text-white">
                                      {value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-black dark:text-white">
                                Newcomers
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(
                                  selectedAttendance.newcomers,
                                ).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="bg-gray-50 p-2 rounded"
                                  >
                                    <span className="text-sm text-gray-600 text-black dark:text-white">
                                      {key}:
                                    </span>
                                    <span className="ml-2 font-medium text-black dark:text-white">
                                      {value}
                                    </span>
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

export default AttendanceReportAdmin;
