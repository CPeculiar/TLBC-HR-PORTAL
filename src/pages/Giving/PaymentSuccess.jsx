import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Check, X } from 'lucide-react';

const PaymentSuccess = () => {
  const [userRole, setUserRole] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const reference = searchParams.get('reference');
  const isSuccess = status === 'success';

 // Get user role on component mount
   useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
      setUserRole(userInfo.role || '');
    } catch (error) {
      console.error('Error parsing user info:', error);
      setUserRole('');
    }
  }, []);

  // Function to handle navigation based on user role
  const handleDashboardNavigation = () => {
    if (userRole === 'admin' || userRole === 'superadmin') {
      navigate('/admindashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleReturn = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              {isSuccess ? (
                <Check className="h-6 w-6 text-green-600" />
              ) : (
                <X className="h-6 w-6 text-red-600" />
              )}
            </div>
            
            <h2 className="text-2xl font-semibold mb-2">
              {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
            </h2>
            
            <p className="text-gray-600 mb-4">
              {isSuccess 
                ? 'Thank you for your giving. Your transaction has been completed successfully.'
                : 'There was an issue processing your payment. Please try again.'}
            </p>
            
            {reference && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">Reference Number:</p>
                <p className="font-mono text-gray-800">{reference}</p>
              </div>
            )}
            
            <button
              onClick={handleDashboardNavigation}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;