import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import ECommerce from './pages/Dashboard/ECommerce';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import ResetPassword from './pages/Authentication/ResetPassword';
import ProtectedRoute from './pages/Authentication/ProtectedRoute';
import NotFound from './pages/NotFound';
import ChangePassword from './pages/Authentication/ChangePassword';
import AttendanceCreationPage from "./pages/Attendance/CreateAttendance";
import AttendanceReport from './pages/Attendance/AttendanceReport';
import AttendanceMarkerPage from "./pages/Attendance/MarkAttendance";
import SidebarCopy from "./components/Sidebar/index copy";
import NewcomerForm from './pages/Attendance/NewcomerForm';
import FirstTimersForm from './pages/Attendance/FirstTimersForm';



function App() {
  const [loading, setLoading] = useState(true); 
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);


  // Helper function to wrap components with DefaultLayout
  const withDefaultLayout = (component, title) => (
    <>
      <PageTitle title={`${title} | TLBC Portal`} />
      <DefaultLayout>{component}</DefaultLayout>
    </>
  );

  if (loading) {
    return <Loader />;
  }


  return (
    <>
      <Routes>

       {/* Auth Routes - Outside DefaultLayout */}
       <Route path="/signin" element={
          <>
            <PageTitle title="Signin | TLBC Portal" />
            <SignIn />
          </>
        }
      />
      <Route path="/signup" element={
          <>
            <PageTitle title="Signup | TLBC Portal" />
            <SignUp />
          </>
        }
      />
      <Route path="/forgotpassword" element={
          <>
            <PageTitle title="Forgot-Password | TLBC Portal" />
            <ForgotPassword />
          </>
        }
      />
      <Route path="/resetpassword" element={
          <>
            <PageTitle title="Reset-Password | TLBC Portal" />
            <ResetPassword />
          </>
        }
      />
      <Route path="/"  element={
          <>
            <PageTitle title="Signin | TLBC Portal" />
            <SignIn />
          </>
        }
      />
           <Route path="/sidebarcopy"  element={
          <>
            <PageTitle title="Sidebar-copy | TLBC Portal" />
            <SidebarCopy />
          </>
        }
      />
     <Route path="*" element={
          <>
            <PageTitle title="NotFound | TLBC Portal" />
            <NotFound />
          </>
        }
      />
      

       {/* Dashboard Routes - Inside DefaultLayout */}
       <Route path="/dashboard" element=
        //  <ProtectedRoute>
        {withDefaultLayout(<ECommerce />, "Dashboard")} 
        // </ProtectedRoute>
       
        />
      <Route path="/calendar" element={withDefaultLayout(<Calendar />, "Calendar")} />
      <Route path="/profile" element={withDefaultLayout(<Profile />, "Profile")} />
      <Route path="/forms/form-elements" element={withDefaultLayout(<FormElements />, "Form Elements")} />
      <Route path="/forms/form-layout" element={withDefaultLayout(<FormLayout />, "Form Layout")} />
      <Route path="/tables" element={withDefaultLayout(<Tables />, "Tables")} />
      <Route path="/settings" element={withDefaultLayout(<Settings />, "Settings")} />
      <Route path="/chart" element={withDefaultLayout(<Chart />, "Basic Chart")} />
      <Route path="/ui/alerts" element={withDefaultLayout(<Alerts />, "Alerts")} />
      <Route path="/ui/buttons" element={withDefaultLayout(<Buttons />, "Buttons")} />
      <Route path="/changepassword" element={withDefaultLayout(<ChangePassword />, "Buttons")} />
      <Route path="/createattendance" element={withDefaultLayout(<AttendanceCreationPage />, "Create Attendance")} />
      <Route path="/attendancereport" element={withDefaultLayout(<AttendanceReport />, "Attendance Report")} />
      <Route path="/markattendance" element={withDefaultLayout(<AttendanceMarkerPage />, "Mark Attendance")} />
      <Route path="/form" element={withDefaultLayout(<NewcomerForm />, "First Timer's form")} />
      <Route path="/forms/:ref_code" element={withDefaultLayout(<FirstTimersForm />, "First Timer's form")} />
      <Route path="/forms/" element={withDefaultLayout(<FirstTimersForm />, "First Timer's form")} />
    </Routes>
    
    </>
  );
}

export default App;
