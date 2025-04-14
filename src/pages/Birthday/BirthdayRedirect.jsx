// BirthdayRedirect.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const BirthdayRedirect = () => {
  const [showFallback, setShowFallback] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Get phone number from URL parameter or use default
    const searchParams = new URLSearchParams(location.search);
    const phoneNumber = searchParams.get('phone') || '2347065649583'; // Default example number
    
    // Format URLs for different services
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('Happy Birthday! 🎉 Wishing you a wonderful day filled with joy and blessings.')}`;
    
    // Try redirecting to WhatsApp
    const redirectTimer = setTimeout(() => {
      window.location.href = whatsappUrl;
      
      // Show fallback options after a delay
      const fallbackTimer = setTimeout(() => {
        setShowFallback(true);
      }, 2000);
      
      return () => clearTimeout(fallbackTimer);
    }, 1000);
    
    return () => clearTimeout(redirectTimer);
  }, [location.search]);
  
  // Get phone number for the fallback buttons
  const searchParams = new URLSearchParams(location.search);
  const phoneNumber = searchParams.get('phone') || '2347065649583';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('Happy Birthday! 🎉 Wishing you a wonderful day filled with joy and blessings.')}`;
  const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent('Happy Birthday! 🎉 Wishing you a wonderful day filled with joy and blessings.')}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
      <div className="max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">TLBC International</h1>
        <p className="text-lg mb-6">Redirecting you to send birthday wishes...</p>
        
        {!showFallback ? (
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        ) : (
          <div>
            <p className="mb-4">If you're not automatically redirected:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href={whatsappUrl} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Open WhatsApp
              </a>
              <a 
                href={smsUrl} 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Open SMS
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdayRedirect;