import React, { useState, useRef, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";

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
    <div className="flex h-screen overflow-hidden">

    {/* <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden"> */}
      

      <main className="p-4 sm:p-6 space-y-6">
          {alert.show && (
            <Alert className={`mb-4 ${alert.type === "success" ? "bg-green-50" : "bg-red-50"}`}>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          {/* Newcomers Search Section */}
          <Card>
            <CardHeader>
              <CardTitle>Newcomers Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={searchParams.name}
                    onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ref Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border rounded-lg"
                      value={searchParams.refCode}
                      onChange={(e) => setSearchParams({ ...searchParams, refCode: e.target.value })}
                    />
                    <button
                      onClick={searchNewcomers}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    >
                      <Search size={18} /> Search
                    </button>
                  </div>
                </div>
              </div>

              {newcomersList.results.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newcomersList.results.map((newcomer, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2">{`${newcomer.first_name} ${newcomer.last_name}`}</td>
                          <td className="px-4 py-2">{newcomer.email}</td>
                          <td className="px-4 py-2">{newcomer.phone_number}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end gap-2 mt-4">
                    {newcomersList.previous && (
                      <button
                        // onClick={() => /* Handle previous */}
                        className="px-3 py-1 border rounded flex items-center gap-1"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                    )}
                    {newcomersList.next && (
                      <button
                        // onClick={() => /* Handle next */}
                        className="px-3 py-1 border rounded flex items-center gap-1"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

{/* Returning Visitors Section */}
<Card>
            <CardHeader>
              <CardTitle>Returning Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ref Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={returningVisitorParams.refCode}
                    onChange={(e) => setReturningVisitorParams({ ...returningVisitorParams, refCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Church</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={returningVisitorParams.church}
                    onChange={(e) => setReturningVisitorParams({ ...returningVisitorParams, church: e.target.value })}
                  >
                    <option value="">Select Church</option>
                    {Object.entries(churchOptions).map(([label, value]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleReturningVisitor}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </CardContent>
          </Card>

          {/* Update Attendance Section */}
          <Card>
            <CardHeader>
              <CardTitle>Update Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateAttendance} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ref Code</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={updateAttendanceParams.ref_code}
                      onChange={(e) => setUpdateAttendanceParams({
                        ...updateAttendanceParams,
                        ref_code: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Venue</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={updateAttendanceParams.venue}
                      onChange={(e) => setUpdateAttendanceParams({
                        ...updateAttendanceParams,
                        venue: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={updateAttendanceParams.date}
                      onChange={(e) => setUpdateAttendanceParams({
                        ...updateAttendanceParams,
                        date: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Active</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Attendance
                </button>
              </form>
            </CardContent>
          </Card>

  {/* Attendance Lists Section */}
  <div className="grid grid-cols-1 gap-6">
            {/* Church Attendance List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Church Attendance List</CardTitle>
                <button
                  onClick={getAttendanceList}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Get Attendance List
                </button>
              </CardHeader>
              <CardContent>
                {attendanceList.results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No attendance records found</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left">Program</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Venue</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Church</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceList.results.map((attendance, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{attendance.program}</td>
                              <td className="px-4 py-2">{attendance.name}</td>
                              <td className="px-4 py-2">{attendance.venue}</td>
                              <td className="px-4 py-2">{attendance.date}</td>
                              <td className="px-4 py-2">{attendance.church}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  attendance.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {attendance.active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => getAttendanceDetails(attendance.ref_code)}
                                  className="text-blue-600 hover:text-blue-800"
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
              </CardContent>
            </Card>

            {/* All Attendance Lists */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>All Attendance Lists</CardTitle>
                <button
                  onClick={getAllAttendanceLists}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Get All Attendance
                </button>
              </CardHeader>
              <CardContent>
                {allAttendanceList.results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No attendance records found</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left">Program</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Venue</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Church</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allAttendanceList.results.map((attendance, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{attendance.program}</td>
                              <td className="px-4 py-2">{attendance.name}</td>
                              <td className="px-4 py-2">{attendance.venue}</td>
                              <td className="px-4 py-2">{attendance.date}</td>
                              <td className="px-4 py-2">{attendance.church}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  attendance.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {attendance.active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => getAttendanceDetails(attendance.ref_code)}
                                  className="text-blue-600 hover:text-blue-800"
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
              </CardContent>
            </Card>

            {/* Selected Attendance Details Modal */}
            {selectedAttendance && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Attendance Details
                    <button
                      onClick={() => setSelectedAttendance(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">General Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Program:</span> {selectedAttendance.program}</p>
                        <p><span className="font-medium">Name:</span> {selectedAttendance.name}</p>
                        <p><span className="font-medium">Church:</span> {selectedAttendance.church}</p>
                        <p><span className="font-medium">Venue:</span> {selectedAttendance.venue}</p>
                        <p><span className="font-medium">Date:</span> {selectedAttendance.date}</p>
                        <p><span className="font-medium">Status:</span> {selectedAttendance.active ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Attendance Statistics</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Attendees</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(selectedAttendance.attendees).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-2 rounded">
                                <span className="text-sm text-gray-600">{key}:</span>
                                <span className="ml-2 font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Newcomers</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(selectedAttendance.newcomers).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-2 rounded">
                                <span className="text-sm text-gray-600">{key}:</span>
                                <span className="ml-2 font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    // </div>
  );
};


export default AttendanceReport