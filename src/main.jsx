import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './css/style.css';
import './css/satoshi.css';
import '/node_modules/jsvectormap/dist/css/jsvectormap.css';
import '/node_modules/flatpickr/dist/flatpickr.min.css';
import { ToastContainer } from 'react-toastify';
import '/node_modules/react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
    <ToastContainer />
  </React.StrictMode>,
);
