import React, { useState, useEffect, useRef } from 'react';
import { Download, Eye } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf'; 
import 'jspdf-autotable';
import { Alert, AlertDescription } from '../../components/ui/alert';

const AttendanceDetailsPageAdmin = () => {
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { refCode } = useParams();
    const navigate = useNavigate();

    const [qrCode, setQrCode] = useState(null);
    const [newcomerQrCode, setNewcomerQrCode] = useState(null);
    const [newcomerLink, setNewcomerLink] = useState(null);
    const qrRef = useRef(null);
    const newcomerQrRef = useRef(null);

    // New state for update form
    const [updateFields, setUpdateFields] = useState([
        { field: '', value: '' }
    ]);
    const [updateSuccess, setUpdateSuccess] = useState(null);
    const [updateError, setUpdateError] = useState(null);


    useEffect(() => {
        const fetchAttendanceDetails = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

                setIsLoading(true);
                const response = await axios.get(
                    `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                      }
                );
                setSelectedAttendance(response.data);

                // Generate QR codes
                const newcomerLinkUrl = `${window.location.origin}/forms/${refCode}`;
                setNewcomerLink(newcomerLinkUrl);

                // Generate Attendance QR Code
                const attendanceQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(refCode)}`;
                setQrCode(attendanceQrCodeUrl);

                // Generate Newcomer QR Code
                const newcomerQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(newcomerLinkUrl)}`;
                setNewcomerQrCode(newcomerQrCodeUrl);


                setIsLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || "Error fetching attendance details");
                setIsLoading(false);
            }
        };

        if (refCode) {
            fetchAttendanceDetails();
        }
    }, [refCode]);


     // useEffect to handle success message timeout
     useEffect(() => {
        let timeoutId;
        if (updateSuccess) {
            timeoutId = setTimeout(() => {
                setUpdateSuccess(null);
            }, 5000); // 5 seconds
        }

        // Cleanup function to clear timeout
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [updateSuccess]);

    // Similarly, add timeout for error messages
    useEffect(() => {
        let timeoutId;
        if (updateError) {
            timeoutId = setTimeout(() => {
                setUpdateError(null);
            }, 5000); // 5 seconds
        }

        // Cleanup function to clear timeout
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [updateError]);


    // Updated field options to match backend
    const fieldOptions = [
        { value: 'venue', label: 'Venue' },
        { value: 'date', label: 'Date' },
        { value: 'active', label: 'Active Status' }
    ];

    // Handle adding a new field to update
    const addUpdateField = () => {
        setUpdateFields([...updateFields, { field: '', value: '' }]);
    };

    // Handle removing a field
    const removeUpdateField = (indexToRemove) => {
        setUpdateFields(updateFields.filter((_, index) => index !== indexToRemove));
    };

    // Update a specific field in the updateFields array
    const updateFieldValue = (index, key, value) => {
        const newFields = [...updateFields];
        newFields[index][key] = value;
        setUpdateFields(newFields);
    };

  
    // Update attendance
    const updateAttendance = async (e) => {
      e.preventDefault();

      // Reset previous messages
      setUpdateSuccess(null);
      setUpdateError(null);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('ref_code', refCode);

       // Add selected fields to formData
       updateFields.forEach(field => {
        if (field.field && field.value) {
            // Special handling for active field to ensure boolean
            if (field.field === 'active') {
                formData.append(field.field, field.value === 'true');
            }else if (field.field === 'date') {
                    // Ensure date is in correct format
                    formData.append(field.field, field.value);
             } else {
                formData.append(field.field, field.value);
            }
        }
    });      

      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          alert("Access token not found. Please login first.");
          navigate("/");
          return;
        }

        const response = await axios.put(
            `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/update/`,
            formData,
            {
                headers: { 
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data' 
                },
              }
        );

        // Success handling
        setUpdateSuccess("Attendance updated successfully");
        setUpdateFields([{ field: '', value: '' }]);
        alert('Attendance updated successfully')

      } catch (error) {
        // showAlert(error.response?.data?.message || "Error updating attendance", "error");

        // Improved Error Handling
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            let errorMessage = '';

            // Prioritize specific error scenarios
            if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
                errorMessage = errorData.non_field_errors[0];
            } 
            // Handle nested array errors like for 'active'
            else if (Object.keys(errorData).length > 0) {
                const firstKey = Object.keys(errorData)[0];
                if (Array.isArray(errorData[firstKey]) && errorData[firstKey].length > 0) {
                    errorMessage = errorData[firstKey][0];
                }
            }
            
            // Fallback error message
            if (!errorMessage) {
                errorMessage = "Error updating attendance";
            }

            setUpdateError(errorMessage);
        } else {
            setUpdateError("Error updating attendance");
        }
      }
    };

    // Function to format the date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

    const handleDownloadQR = (qrRef, filename) => {
        if (qrRef.current) {
            const img = qrRef.current;
            
            // Create a new Image object to ensure proper loading
            const tempImg = new Image();
            tempImg.crossOrigin = "anonymous";
            tempImg.src = img.src;
            
            tempImg.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
        
                // Set canvas dimensions to match the image
                canvas.width = tempImg.width;
                canvas.height = tempImg.height;
        
                // Draw the image onto the canvas
                ctx.drawImage(tempImg, 0, 0, tempImg.width, tempImg.height);
        
                // Convert to data URL and download
                const link = document.createElement("a");
                link.download = filename;
                link.href = canvas.toDataURL("image/png");
                link.click();
            };
        
            tempImg.onerror = () => {
                console.error("Error loading QR code image");
            };
        }
    };
    
    const downloadTableAsPDF = (tableType) => {
        if (!selectedAttendance) return;

        const doc = new jsPDF();
        doc.setFontSize(14);
        
        // Add header details
    const headerDetails = [
        { label: 'Program', value: selectedAttendance.program },
        { label: 'Name', value: selectedAttendance.name },
        { label: 'Church', value: selectedAttendance.church },
        { label: 'Venue', value: selectedAttendance.venue },
        { label: 'Attendance Date', value: selectedAttendance.date },
        { label: 'Attendance Created on', value: formatDate(selectedAttendance.created_at || 'N/A') },
        { label: 'Attendance Created by', value: selectedAttendance.created_by || 'N/A' },
        { label: 'Status', value: selectedAttendance.active ? 'Active' : 'Inactive' }
    ];

    // Render header details
    let yPosition = 20;
    headerDetails.forEach((detail, index) => {
        doc.setFontSize(10);
        doc.setTextColor(100); // Gray color for labels
        doc.text(`${detail.label}:`, 14, yPosition);
        
        doc.setFontSize(12);
        doc.setTextColor(0); // Black color for values
        doc.text(detail.value, 70, yPosition);
        
        yPosition += 7; // Increment Y position for next line
    });

        const tableData = tableType === 'attendees' 
            ? selectedAttendance.attendees.data 
            : selectedAttendance.newcomers.data;

        const columns = tableType === 'attendees' 
            ? ['First Name', 'Last Name', 'Email', 'Gender', 'Phone Number']
            : ['First Name', 'Last Name', 'Email', 'Gender', 'Address', 'Phone Number'];

        const rows = tableData.map(item => 
            tableType === 'attendees' 
                ? [item.first_name, item.last_name, item.email, item.gender, item.phone_number]
                : [item.first_name, item.last_name, item.email, item.gender, item.address, item.phone_number]
        );

        doc.setFontSize(14);
        // doc.text(`${tableType === 'attendees' ? 'Attendees' : 'Newcomers'} List`, 14, 20);
        doc.text(`${tableType === 'attendees' ? 'Attendees' : 'Newcomers'} List`, 14, yPosition + 10);
   
        
        doc.autoTable({
            startY: yPosition + 20,
            head: [columns],
            body: rows,
            theme: 'striped'
        });

        doc.save(`${tableType}_list.pdf`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading attendance details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Alert variant="destructive">
                    {error}
                </Alert>
            </div>
        );
    }

    if (!selectedAttendance) {
        return (
            <div className="p-4">
                <Alert variant="default">
                    No attendance details found.
                </Alert>
            </div>
        );
    }

    // Modified Status Cell Component for better dark mode visibility
 const StatusCell = ({ active }) => (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs self-start ${
        active
          ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300'
          : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );

    return (
        <div className="container mx-auto px-4 py-6 space-y-6 dark:bg-boxdark dark:text-white">
        {/* Attendance Details Card */}
        <Card className="p-4 md:p-6 bg-white shadow-md rounded-lg dark:bg-boxdark dark:border dark:border-strokedark">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Program</p>
                    <p className="font-semibold text-black dark:text-white">{selectedAttendance.program}</p>
                </div>
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-semibold text-black dark:text-white">{selectedAttendance.name}</p>
                </div>
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Church</p>
                    <p className="font-semibold text-black dark:text-white">{selectedAttendance.church}</p>
                </div>
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Venue</p>
                    <p className="font-semibold text-black dark:text-white">{selectedAttendance.venue}</p>
                </div>
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Date</p>
                    <p className="font-semibold text-black dark:text-white">{selectedAttendance.date}</p>
                </div>
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Created on</p>
                    <p className="font-semibold text-black dark:text-white">{formatDate(selectedAttendance.created_at || 'N/A')}</p>
                </div>
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Created by</p>
                    <p className="font-semibold text-black dark:text-white">{selectedAttendance.created_by || 'N/A'}</p>
                </div>
                <div className="flex flex-col">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    

                    <p className="font-semibold text-black">
                                <StatusCell active={selectedAttendance.active} />
                            </p>
                </div>
            </div>
        </Card>


            {/* Attendees Table */}
             <div className="bg-white shadow-md rounded-lg p-4 md:p-6 dark:bg-boxdark dark:border dark:border-strokedark">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
                    <h2 className="text-lg md:text-xl font-semibold flex flex-col md:flex-row items-start md:items-center text-black dark:text-white">
                        Members' List 
                        <span className="ml-0 md:ml-2 text-sm text-gray-500 dark:text-gray-400">
                            (Total: {selectedAttendance.attendees.count})
                        </span>
                    </h2>
                    <button 
                        onClick={() => downloadTableAsPDF('attendees')}
                        className="flex items-center bg-primary text-white px-3 py-2 rounded hover:bg-opacity-90 self-start md:self-auto"
                    >
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </button>
                </div>
                {selectedAttendance.attendees.count === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">No attendees recorded</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">First Name</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Last Name</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Email</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Gender</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Phone Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedAttendance.attendees.data.map((attendee, index) => (
                                    <tr key={index} className="border-b dark:border-gray-700">
                                        <td className="px-2 py-2 text-black dark:text-white">{attendee.first_name || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{attendee.last_name || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{attendee.email || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{attendee.gender || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{attendee.phone_number || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Newcomers Table */}
            <div className="bg-white shadow-md rounded-lg p-4 md:p-6 dark:bg-boxdark dark:border dark:border-strokedark">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
                    <h2 className="text-lg md:text-xl font-semibold flex flex-col md:flex-row items-start md:items-center text-black dark:text-white">
                        Newcomers' List 
                        <span className="ml-0 md:ml-2 text-sm text-gray-500 dark:text-gray-400">
                            (Total: {selectedAttendance.newcomers.count})
                        </span>
                    </h2>
                    <button 
                        onClick={() => downloadTableAsPDF('newcomers')}
                        className="flex items-center bg-primary text-white px-3 py-2 rounded hover:bg-opacity-90 self-start md:self-auto"
                    >
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </button>
                </div>
                {selectedAttendance.newcomers.count === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">No newcomers recorded</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">First Name</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Last Name</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Email</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Gender</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Address</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Phone Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedAttendance.newcomers.data.map((newcomer, index) => (
                                    <tr key={index} className="border-b dark:border-gray-700">
                                        <td className="px-2 py-2 text-black dark:text-white">{newcomer.first_name || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{newcomer.last_name || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{newcomer.email || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{newcomer.gender || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{newcomer.address || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{newcomer.phone_number || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

             {/* Returning Visitors Table */}
             <div className="bg-white shadow-md rounded-lg p-4 md:p-6 dark:bg-boxdark dark:border dark:border-strokedark">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
                    <h2 className="text-lg md:text-xl font-semibold flex flex-col md:flex-row items-start md:items-center text-black dark:text-white">
                        Returning Visitors' List 
                        <span className="ml-0 md:ml-2 text-sm text-gray-500 dark:text-gray-400">
                            (Total: {selectedAttendance.returnees.count})
                        </span>
                    </h2>
                    <button 
                        onClick={() => downloadTableAsPDF('newcomers')}
                        className="flex items-center bg-primary text-white px-3 py-2 rounded hover:bg-opacity-90 self-start md:self-auto"
                    >
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </button>
                </div>
                {selectedAttendance.returnees.count === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">No Returning Newcomer recorded</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">First Name</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Last Name</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Email</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Gender</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Address</th>
                                    <th className="px-2 py-2 text-left text-gray-600 dark:text-gray-300">Phone Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedAttendance.returnees.data.map((returnees, index) => (
                                    <tr key={index} className="border-b dark:border-gray-700">
                                        <td className="px-2 py-2 text-black dark:text-white">{returnees.first_name || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{returnees.last_name || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{returnees.email || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{returnees.gender || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{returnees.address || 'N/A'}</td>
                                        <td className="px-2 py-2 text-black dark:text-white">{returnees.phone_number || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Attendance Options */}
            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:bg-boxdark dark:border-strokedark">
                        <div className="border-b border-stroke py-4 px-4 md:px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Attendance Options
                            </h3>
                        </div>
        
                        <div className="p-4 md:p-6.5 space-y-4">
                            <h2 className='font-bold text-black dark:text-white text-center text-xl md:text-2xl'>Welcome!</h2>
                            <p className='text-black dark:text-white text-center text-base md:text-xl'>
                                Please select which category of individual you want to add manually.
                            </p>
                            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                                <button
                                    onClick={() => {
                                        if (refCode) {
                                            navigate(`/addmembers/${refCode}`, { state: { refCode } });
                                        } else {
                                            console.error('No reference code found');
                                            alert('No reference code found');
                                        }
                                    }}
                                    className="flex items-center justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                                >
                                    Add a Member
                                </button>

                                <button
                                    onClick={() => {
                                        if (refCode) {
                                            navigate(`/form/${refCode}`, { state: { refCode } });
                                        } else {
                                            console.error('No reference code found');
                                            alert('No reference code found');
                                        }
                                    }}
                                    className="flex items-center justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                                >
                                    Add a Newcomer
                                </button>
                                
                                <button
                                    onClick={() => {
                                        if (refCode) {
                                            navigate(`/returningNewcomers/${refCode}`, { state: { refCode } });
                                        } else {
                                            console.error('No reference code found');
                                            alert('No reference code found');
                                        }
                                    }}
                                    className="flex items-center justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                                >
                                    Add a returning First Timer
                                </button>

                                <button
                                    onClick={() => {
                                        if (refCode) {
                                            navigate(`/newcomerscount/${refCode}`, { state: { refCode } });
                                        } else {
                                            console.error('No reference code found');
                                            alert('No reference code found');
                                        }
                                    }}
                                    className="flex items-center justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                                >
                                    NewComers Attendance Count
                                </button>
                            </div>

                            {/* Back Button */}
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="flex items-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


   {/* Update Attendance Section */}
   <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <div className="border-b border-stroke py-4 px-4 sm:px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-base sm:text-lg text-black dark:text-white">
                Update Attendance
              </h3>
            </div>

                {/* Success Alert with Automatic Timeout */}
                {updateSuccess && (
                    <div className="p-4 transition-opacity duration-500 ease-in-out text-green-500">
                        <Alert variant="success">
                            {updateSuccess}
                        </Alert>
                    </div>
                )}
                
               {/* Error Alert with Automatic Timeout */}
                {updateError && (
                    <div className="p-4 transition-opacity duration-500 ease-in-out text-red-600">
                        <Alert variant="destructive">
                            {updateError}
                        </Alert>
                    </div>
                )}



                    {/* UPDATE ATTENDANCE Section */}
                <form onSubmit={updateAttendance} className="p-4 sm:p-6.5 space-y-3 sm:space-y-4">
                    {updateFields.map((field, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
                            {/* Field Selection Dropdown */}
                            <select
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                value={field.field}
                                onChange={(e) => updateFieldValue(index, 'field', e.target.value)}
                            >
                                <option value="">Select Field to Update</option>
                                {fieldOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Value Input Field (Dynamic based on selected field) */}
                            {field.field === 'active' ? (
                                <select
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    value={field.value}
                                    onChange={(e) => updateFieldValue(index, 'value', e.target.value)}
                                >
                                    <option value="">Select Status</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            ) : field.field === 'date' ? (
                                <input
                                    type="date"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    value={field.value}
                                    onChange={(e) => updateFieldValue(index, 'value', e.target.value)}
                                />
                            ) : (
                                <input
                                    type={field.field === 'venue' ? 'text' : 'text'}
                                    placeholder={`Enter ${field.field}`}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    value={field.value}
                                    onChange={(e) => updateFieldValue(index, 'value', e.target.value)}
                                />
                            )}

                            {/* Remove Field Button */}
                            {updateFields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeUpdateField(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Field Button */}
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={addUpdateField}
                            className="text-primary hover:text-primary-dark"
                        >
                            Add Another Field to Update
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="flex w-full justify-center rounded bg-primary p-2 sm:p-3 text-sm sm:text-base font-medium text-gray hover:bg-opacity-90"
                    >
                        Update Attendance
                    </button>
                </form>

              </div>


                     {/* QR Codes Section */}
                {(qrCode || newcomerQrCode) && (
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {qrCode && (
                        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:bg-boxdark dark:border-strokedark">
                            <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                                Attendance QR Code
                            </h4>
                            <div className="flex flex-col items-center">
                                <img
                                    ref={qrRef}
                                    src={qrCode}
                                    alt="Attendance QR Code"
                                    className="mb-4 max-w-full"
                                />
                                <button
                                    onClick={() => handleDownloadQR(qrRef, "attendance_qr_code.png")}
                                    className="flex items-center rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download QR Code
                                </button>
                            </div>
                        </div>
                    )}

                    {newcomerQrCode && (
                        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                            <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                                Newcomer QR Code
                            </h4>
                            <div className="flex flex-col items-center">
                                <img
                                    ref={newcomerQrRef}
                                    src={newcomerQrCode}
                                    alt="Newcomer QR Code"
                                    className="mb-4 max-w-full"
                                />
                                <button
                                    onClick={() => handleDownloadQR(newcomerQrRef, "newcomer_qr_code.png")}
                                    className="flex items-center rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download QR Code
                                </button>
                                {newcomerLink && (
                                    <div className="mt-4 text-center">
                                        <p className="font-semibold text-black dark:text-white">Newcomer Form Link:</p>
                                        <a
                                            href={newcomerLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline break-all"
                                        >
                                            {newcomerLink}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}


        </div>
    );
};

export default AttendanceDetailsPageAdmin;