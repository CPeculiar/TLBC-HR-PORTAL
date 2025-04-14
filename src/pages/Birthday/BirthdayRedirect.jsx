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
    const birthdayMessage = 'Happy Birthday Peculiar 🎉. This is your year of Exponential Growth. We are grateful to God for the gift you are to us. Happy birthday to you. We love you';
    
    // Format URLs for different services (using the api.whatsapp.com format)
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(birthdayMessage)}&type=phone_number&app_absent=0`;
    
    // Create a clickable link that we'll programmatically click
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Show fallback after a delay regardless
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true);
    }, 2000);
    
    // Attempt to open WhatsApp
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return () => clearTimeout(fallbackTimer);
  }, [location.search]);
  
  // Get phone number for the fallback buttons
  const searchParams = new URLSearchParams(location.search);
  const phoneNumber = searchParams.get('phone') || '2347065649583';
  const birthdayMessage = 'Happy Birthday! 🎉 Wishing you a wonderful day filled with joy and blessings.';
  
//   const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(birthdayMessage)}&type=phone_number&app_absent=0`;
const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(birthdayMessage)}`;
  const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(birthdayMessage)}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
      <div className="max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">TLBC International</h1>
        <p className="text-lg mb-6">Attempting to open WhatsApp...</p>
        
        {!showFallback ? (
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        ) : (
          <div>
            <p className="mb-4">Please choose how you'd like to send your birthday message:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                // href={whatsappUrl}
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => {
                  // Track click if needed
                  console.log('WhatsApp button clicked');
                }}
              >
                Open in WhatsApp
              </a>
              <a 
                href={smsUrl}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  // Track click if needed
                  console.log('SMS button clicked');
                }}
              >
                Send SMS Instead
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdayRedirect;