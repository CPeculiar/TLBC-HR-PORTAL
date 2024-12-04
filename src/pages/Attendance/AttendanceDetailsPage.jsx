import React, { useState, useEffect } from 'react';
import { Download, Eye } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf'; 
import 'jspdf-autotable';
import { Alert } from '../../components/ui/alert';

const AttendanceDetailsPage = () => {
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { refCode } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAttendanceDetails = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(
                    `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/`
                );
                setSelectedAttendance(response.data);
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

    const downloadTableAsPDF = (tableType) => {
        if (!selectedAttendance) return;

        const doc = new jsPDF();
        doc.setFontSize(14);
        
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

        doc.text(`${tableType === 'attendees' ? 'Attendees' : 'Newcomers'} List`, 14, 20);
        
        doc.autoTable({
            startY: 30,
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

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Attendance Details Card */}
            <Card className="p-4 md:p-6 bg-white shadow-md rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-500">Program</p>
                        <p className="font-semibold">{selectedAttendance.program}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-semibold">{selectedAttendance.name}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-500">Church</p>
                        <p className="font-semibold">{selectedAttendance.church}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-500">Venue</p>
                        <p className="font-semibold">{selectedAttendance.venue}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold">{selectedAttendance.date}</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs self-start ${
                            selectedAttendance.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {selectedAttendance.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Attendees Table */}
            <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
                    <h2 className="text-lg md:text-xl font-semibold flex flex-col md:flex-row items-start md:items-center">
                        Members' List 
                        <span className="ml-0 md:ml-2 text-sm text-gray-500">
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
                    <p className="text-center text-gray-500">No attendees recorded</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-2 text-left">First Name</th>
                                    <th className="px-2 py-2 text-left">Last Name</th>
                                    <th className="px-2 py-2 text-left">Email</th>
                                    <th className="px-2 py-2 text-left">Gender</th>
                                    <th className="px-2 py-2 text-left">Phone Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedAttendance.attendees.data.map((attendee, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="px-2 py-2">{attendee.first_name}</td>
                                        <td className="px-2 py-2">{attendee.last_name}</td>
                                        <td className="px-2 py-2">{attendee.email}</td>
                                        <td className="px-2 py-2">{attendee.gender}</td>
                                        <td className="px-2 py-2">{attendee.phone_number}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Newcomers Table */}
            <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
                    <h2 className="text-lg md:text-xl font-semibold flex flex-col md:flex-row items-start md:items-center">
                        Newcomers' List 
                        <span className="ml-0 md:ml-2 text-sm text-gray-500">
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
                    <p className="text-center text-gray-500">No newcomers recorded</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-2 text-left">First Name</th>
                                    <th className="px-2 py-2 text-left">Last Name</th>
                                    <th className="px-2 py-2 text-left">Email</th>
                                    <th className="px-2 py-2 text-left">Gender</th>
                                    <th className="px-2 py-2 text-left">Address</th>
                                    <th className="px-2 py-2 text-left">Phone Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedAttendance.newcomers.data.map((newcomer, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="px-2 py-2">{newcomer.first_name}</td>
                                        <td className="px-2 py-2">{newcomer.last_name}</td>
                                        <td className="px-2 py-2">{newcomer.email}</td>
                                        <td className="px-2 py-2">{newcomer.gender}</td>
                                        <td className="px-2 py-2">{newcomer.address}</td>
                                        <td className="px-2 py-2">{newcomer.phone_number}</td>
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
                    <div className="rounded-sm border border-stroke bg-white shadow-default">
                        <div className="border-b border-stroke py-4 px-4 md:px-6.5">
                            <h3 className="font-medium text-black">
                                Attendance Options
                            </h3>
                        </div>
        
                        <div className="p-4 md:p-6.5 space-y-4">
                            <h2 className='font-bold text-black text-center text-xl md:text-2xl'>Welcome!</h2>
                            <p className='text-black text-center text-base md:text-xl'>
                                Please select the option that best applies to you from the options below.
                            </p>
                            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
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
                                    I'm a Newcomer
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
                                    className="flex items-center justify-center rounded bg-secondary p-3 font-medium text-white hover:bg-opacity-90"
                                >
                                    I'm not a Newcomer
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
        </div>
    );
};

export default AttendanceDetailsPage;