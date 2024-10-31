import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, X, Download } from "lucide-react";

const AttendanceCreationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState(null);
  const [newcomerQrCode, setNewcomerQrCode] = useState(null);
  const [newcomerLink, setNewcomerLink] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const qrRef = useRef(null);
  const newcomerQrRef = useRef(null);

  const [attendanceData, setAttendanceData] = useState({
    program: "",
    name: "",
    venue: "",
    date: "",
    active: true,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAttendanceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setQrCode(null);
    setNewcomerQrCode(null);
    setNewcomerLink(null);
    setSuccessMessage("");

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "https://tlbc-platform-api.onrender.com/api/attendance/create/",
        attendanceData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const { ref_code, qrcode, message } = response.data;

      // Save ref_code to local storage
      localStorage.setItem("attendance_ref_code", ref_code);

      // Set QR code image
      setQrCode(qrcode);

      // Generate QR code for newcomers
      // Use the full URL of your deployed application
      const newcomerLinkUrl = `${window.location.origin}/form/${ref_code}`;
      setNewcomerLink(newcomerLinkUrl);
            
      const newcomerLink = `${window.location.origin}/form/${ref_code}`;
      const newcomerQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(newcomerLink)}`;
      setNewcomerQrCode(newcomerQrCodeUrl);


      // Extract date from message and set success message
      const dateMatch = message.match(/'([^']+)'/);
      const extractedDate = dateMatch ? dateMatch[1] : "unknown date";
      setSuccessMessage(`Attendance created successfully for ${extractedDate}`);

      setAttendanceData({
        program: "",
        name: "",
        venue: "",
        date: "",
        active: true,
      });
    } catch (error) {
      console.error("Error creating attendance:", error);

      // Set errors from backend response
      if (error.response?.data?.detail) {
        setErrors({ message: error.response.data.detail });
      } else if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ message: "An unexpected error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = (qrRef, filename) => {
    if (qrRef.current) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = qrRef.current;

      // Ensure the crossOrigin attribute is set for the image
      img.crossOrigin = "anonymous";

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
  

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">
                  Create Attendance
                </h1>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-sm border border-slate-200">
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="program"
                      >
                        Program
                      </label>
                      <select
                        id="program"
                        className="form-input w-full"
                        name="program"
                        value={attendanceData.program}
                        onChange={handleInputChange}
                        required
                      >
                      <option value="" disabled>Select meeting</option>
                        <option value="SUNDAY">Sunday Service</option>
                        <option value="MIDWEEK">Midweek Service</option>
                        <option value="OTHER">Other Meetings</option>
                      </select>
                      {errors.program && (
                        <div className="text-sm text-red-600 mt-1">
                          {errors.program}
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="name"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        className="form-input w-full"
                        type="text"
                        name="name"
                        value={attendanceData.name}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.name && (
                        <div className="text-sm text-red-600 mt-1">
                          {errors.name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="venue"
                      >
                        Venue
                      </label>
                      <input
                        id="venue"
                        className="form-input w-full"
                        type="text"
                        name="venue"
                        value={attendanceData.venue}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.venue && (
                        <div className="text-sm text-red-600 mt-1">
                          {errors.venue}
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="date"
                      >
                        Date
                      </label>
                      <input
                        id="date"
                        className="form-input w-full"
                        type="date"
                        name="date"
                        value={attendanceData.date}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.date && (
                        <div className="text-sm text-red-600 mt-1">
                          {errors.date}
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="active"
                      >
                        Active
                      </label>
                      <select
                        id="active"
                        className="form-select w-full"
                        name="active"
                        value={attendanceData.active}
                        onChange={handleInputChange}
                        required
                      >
                        <option value={true}>True</option>
                        <option value={false}>False</option>
                      </select>
                      {errors.active && (
                        <div className="text-sm text-red-600 mt-1">
                          {errors.active}
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.message && (
                    <div className="mt-4 text-sm text-red-600">
                      {errors.message}
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Attendance"}
                    </button>
                  </div>
                </form>

                {successMessage && (
                  <div className="mt-4 text-sm text-green-600">
                    {successMessage}
                  </div>
                )}

                {qrCode && (
                  <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">Attendance QR Code</h2>
                    <img
                      ref={qrRef}
                      src={qrCode}
                      alt="Attendance QR Code"
                      className="mx-auto"
                    />
                    <button
                      onClick={() => handleDownloadQR(qrRef, "attendance_qr_code.png")}
                      className="mt-4 btn bg-green-500 hover:bg-green-600 text-white flex items-center justify-center mx-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Attendance QR Code
                    </button>
                  </div>
                )}

                {newcomerQrCode && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Newcomer QR Code</h2>
                <img
                  ref={newcomerQrRef}
                  src={newcomerQrCode}
                  alt="Newcomer QR Code"
                  className="mx-auto"
                />
                <button
                  onClick={() => handleDownloadQR(newcomerQrRef, "newcomer_qr_code.png")}
                  className="mt-4 btn bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center mx-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Newcomer QR Code
                </button>
                {newcomerLink && (
                  <div className="mt-4 text-center">
                    <p className="font-semibold">Newcomer Form Link:</p>
                    <a href={newcomerLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                      {newcomerLink}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
            </div>
          </div>
        </main>
      </div>
  );
};

export default AttendanceCreationPage;
