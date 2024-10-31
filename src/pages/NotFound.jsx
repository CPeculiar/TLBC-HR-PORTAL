import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#7987a1] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-blue-600 text-8xl font-bold mb-4">404</h1>
        <h2 className="text-slate-600 text-3xl font-semibold mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-500 mb-8">
          Sorry, the page you are looking for could not be found.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-400 transition-colors duration-300 flex items-center justify-center gap-2 mx-auto"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;