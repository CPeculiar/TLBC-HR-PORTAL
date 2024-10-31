import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const QRCodeHandler = () => {
  const { refCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScan = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          // User is authenticated, navigate to a member page or dashboard
          console.log("Authenticated user scanned. Ref code:", refCode);
          navigate('/dashboard'); // or wherever you want authenticated users to go
        } else {
          // User is not authenticated, save ref code and redirect
          localStorage.setItem("attendance_ref_code", refCode);
          window.location.href = "https://google.com";
        }
      } catch (error) {
        console.error("Error handling QR code scan:", error);
      }
    };

    handleScan();
  }, [refCode, navigate]);

  return <div>Processing QR code...</div>;
};

export default QRCodeHandler;