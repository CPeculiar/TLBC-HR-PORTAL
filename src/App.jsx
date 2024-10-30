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

function App() {
  const [loading, setLoading] = useState(true); // Removed type annotation
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
      <PageTitle title={`${title} | TailAdmin - Tailwind CSS Admin Dashboard Template`} />
      <DefaultLayout>{component}</DefaultLayout>
    </>
  );

  if (loading) {
    return <Loader />;
  }


  return (
      <Routes>

       {/* Auth Routes - Outside DefaultLayout */}
       <Route
        path="/auth/signin"
        element={
          <>
            <PageTitle title="Signin | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <SignIn />
          </>
        }
      />
      <Route
        path="/auth/signup"
        element={
          <>
            <PageTitle title="Signup | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <SignUp />
          </>
        }
      />
      <Route
        path="/forgotpassword"
        element={
          <>
            <PageTitle title="Forgot-Password | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <ForgotPassword />
          </>
        }
      />
           <Route
        path="/resetpassword"
        element={
          <>
            <PageTitle title="Reset-Password | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <ResetPassword />
          </>
        }
      />
      <Route
        path="/"
        element={
          <>
            <PageTitle title="Signin | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <SignIn />
          </>
        }
      />
      

       {/* Dashboard Routes - Inside DefaultLayout */}
       <Route path="/dashboard" element={withDefaultLayout(<ECommerce />, "eCommerce Dashboard")} />
      <Route path="/calendar" element={withDefaultLayout(<Calendar />, "Calendar")} />
      <Route path="/profile" element={withDefaultLayout(<Profile />, "Profile")} />
      <Route path="/forms/form-elements" element={withDefaultLayout(<FormElements />, "Form Elements")} />
      <Route path="/forms/form-layout" element={withDefaultLayout(<FormLayout />, "Form Layout")} />
      <Route path="/tables" element={withDefaultLayout(<Tables />, "Tables")} />
      <Route path="/settings" element={withDefaultLayout(<Settings />, "Settings")} />
      <Route path="/chart" element={withDefaultLayout(<Chart />, "Basic Chart")} />
      <Route path="/ui/alerts" element={withDefaultLayout(<Alerts />, "Alerts")} />
      <Route path="/ui/buttons" element={withDefaultLayout(<Buttons />, "Buttons")} />
    </Routes>
    
  );
}

export default App;
