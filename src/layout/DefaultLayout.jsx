import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';
import { Mail } from 'lucide-react';
import Loader from '../common/Loader';

const DefaultLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountSuspended, setAccountSuspended] = useState(false);
  const [suspensionMessage, setSuspensionMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check user account status on component mount
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        navigate('/');
        return;
      }

      // Make a lightweight API call to check account status
      // You can use any endpoint that would return a 403 if the account is suspended
      await axios.get('https://tlbc-platform-api.onrender.com/api/users/count/', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      // If we get here, the account is not suspended
      setAccountSuspended(false);
    } catch (err) {
      // Check if error is due to account suspension (403 Forbidden)
      if (err.response?.status === 403) {
        // Extract suspension message from error response
        const detail = err.response?.data?.detail || 'Your account has been suspended. Please contact support for assistance.';
        setSuspensionMessage(detail);
        setAccountSuspended(true);
      } else if (err.response?.status === 401) {
        // Handle expired token
        localStorage.removeItem('accessToken');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactWhatsApp = () => {
    // Open WhatsApp without logging out first
    window.open("https://wa.me/2348064430141", "_blank");
  };

  const handleContactEmail = () => {
    // Open email client without logging out first
    window.open("mailto:support@thelordsbrethrenchurch.org", "_blank");
  };

  // Show loader while checking account status
  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader /></div>;
  }

  // Render suspension modal if account is suspended
  if (accountSuspended) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
              <h2 className="text-2xl font-bold mb-4">Account Suspended</h2>
              <p className="text-lg mb-6">{suspensionMessage}</p>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Contact Support</h3>
            
            <div className="flex flex-col space-y-4 px-2 sm:px-4">
              <button 
                onClick={handleContactWhatsApp}
                className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg w-full"
                aria-label="Contact via WhatsApp"
              >
                <WhatsAppIcon className="mr-1 w-10 md:mr-3 md:w-auto" />
                <span className="font-medium text-base sm:text-lg">Send a Message on WhatsApp</span>
              </button>
              
              <button 
                onClick={handleContactEmail}
                className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg w-full"
                aria-label="Contact via Email"
              >
                <Mail className="mr-3" size={24} />
                <span className="font-medium text-base sm:text-lg">Send an Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* <!-- ===== Header Start ===== --> */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </div>
  );
};

// Custom WhatsApp Icon component
const WhatsAppIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="white"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default DefaultLayout;