import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, X, Download } from "lucide-react";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

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

      localStorage.setItem("attendance_ref_code", ref_code);
      setQrCode(qrcode);

      // Generate QR code for newcomers
      // Use the full URL of your deployed application
      const newcomerLinkUrl = `${window.location.origin}/forms/${ref_code}`;
      setNewcomerLink(newcomerLinkUrl);
            
      const newcomerLink = `${window.location.origin}/forms/${ref_code}`;
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

    <>

<Breadcrumb pageName="Create Attendance" />

    <div className="p-4 md:p-6 2xl:p-10">
    <div className="mx-auto max-w-5xl">


        {/* Main Form Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Create Attendance form
            </h3>
          </div>

                <form onSubmit={handleSubmit}>
                  <div className="p-6.5">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Program
                </label>
                      <select
                        id="program"
                        name="program"
                        value={attendanceData.program}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                      <option value="" disabled>Select meeting</option>
                        <option value="SUNDAY">Sunday Service</option>
                        <option value="MIDWEEK">Midweek Service</option>
                        <option value="OTHER">Other Meetings</option>
                      </select>
                      {errors.program && (
                  <p className="mt-1 text-sm text-red-500">{errors.program}</p>
                )}
                    </div>


                    <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Name
                </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={attendanceData.name}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                       {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
                    </div>


                    <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Venue
                </label>
                      <input
                        id="venue"
                        type="text"
                        name="venue"
                        value={attendanceData.venue}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                {errors.venue && (
                  <p className="mt-1 text-sm text-red-500">{errors.venue}</p>
                )}
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Date
                </label>
                      <input
                        id="date"
                        type="date"
                        name="date"
                        value={attendanceData.date}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                )}
              </div>


                       <div className="mb-5.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Active
                </label>
                      <select
                        id="active"
                        name="active"
                        value={attendanceData.active}
                        onChange={handleInputChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        required
                      >
                        <option value={true}>True</option>
                        <option value={false}>False</option>
                      </select>
                      {errors.active && (
                  <p className="mt-1 text-sm text-red-500">{errors.active}</p>
                )}
              </div>

              {errors.message && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">
                  {errors.message}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-500">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
              >
                {isLoading ? "Creating..." : "Create Attendance"}
              </button>
            </div>
          </form>
        </div>

                  {/* QR Codes Section */}
        {(qrCode || newcomerQrCode) && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {qrCode && (
              <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
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
    </div>

    </>
  );
};

export default AttendanceCreationPage;
