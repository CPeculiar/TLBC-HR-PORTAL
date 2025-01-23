import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ pageName }) => {
const [userRole, setUserRole] = useState('');

  useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
      setUserRole(userInfo.role || '');
    } catch (error) {
      console.error('Error parsing user info:', error);
      setUserRole('');
    }
  }, []);

  const isSuperAdmin = () => userRole === 'superadmin';

  
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {pageName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
     <Link className="font-medium" to={isSuperAdmin() ? "/admindashboard" : "/dashboard"}>
              Dashboard /
            </Link>
          </li>
          <li className="font-medium text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;