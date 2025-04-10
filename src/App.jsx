import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './js/services/AuthContext';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
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
import NewcomerForm2 from './pages/Attendance/NewcomerForm copy';
import FirstTimersFormCopy from './pages/Attendance/FirstTimersForm copy';
import AttendanceDetailsPage from './pages/Attendance/AttendanceDetailsPage';
import ReturningNewComers from './pages/Attendance/ReturningNewComers';
import UserSearchPage from './pages/community/UserSearchPage';
import UserProfileCard from './pages/community/UserProfileCard';
import AdvancedUserSearchPage from './pages/community/AdvancedUserSearchPage';
import ZoneManagement from './pages/Zone and Church Management/ZoneManagement';
import ChurchManagement from './pages/Zone and Church Management/ChurchManagement';
import AccountCreationPage from './pages/finance/AccountCreationPage';
import Transactions from './pages/finance/Transactions';
import FinanceDashboard from './pages/finance/FinanceDashboard';
import ExpensesManagement from './pages/finance/ExpensesManagement';
import FundManagement from './pages/finance/FundManagement';
import RemittanceManagement from './pages/finance/RemittanceManagement';
import TopupManagement from './pages/finance/TopupManagement';
import OnboardUser from './pages/User Management/OnboardUser';
import DeleteUser from './pages/User Management/DeleteUser';
import UserPermissions from './pages/User Permissions/UserPermissions';
import UserSearchAdmin from './pages/User Management/UserSearchAdmin';
import AttendanceReportAdmin from './pages/Attendance Manager/AttendanceReportAdmin';
import AttendanceDetailsPageAdmin from './pages/Attendance Manager/AttendanceDetailsPageAdmin';
import AddMembersForm from './pages/Attendance Manager/AddMembersForm';
import NewComersCount from './pages/Attendance Manager/NewComersCount';
import FirstTimersFormAdmin from './pages/Attendance Manager/FirstTimersFormAdmin';
import AddReturningAdmin from './pages/Attendance Manager/AddReturningAdmin';
import AccountStatement from './pages/finance/AccountStatement';
import EditUserDetailsForm from './pages/User Management/EditUserDetailsForm';
import UserDashboard from './pages/Dashboard/UserDashboard';
import AboutTLBC from './pages/community/AboutTLBC';
import LOLD from './pages/LOLD/LOLD';
import GivingOnline from './pages/Giving/GivingOnline';
import EventsPage from './pages/Events/EventsPage';
import AdminEventUpload from './pages/Events/EventUploadAdmin';
import AdminEventManagement from './pages/Events/EventManagementAdmin';
import EditEvent from './pages/Events/EditEvent';
import CentralAccountDashboard from './pages/Central Finance/CentralAccountDashboard';
import CentralAccountCreationPage from './pages/Central Finance/CentralAccountCreationPage';
import CentralAccountStatement from './pages/Central Finance/CentralAccountStatement';
import CentralTopupManagement from './pages/Central Finance/CentralTopupManagement';
import CentralFundManagement from './pages/Central Finance/CentralFundManagement';
import CentralExpensesManagement from './pages/Central Finance/CentralExpensesManagement';
import CentralRemittanceManagement from './pages/Central Finance/CentralRemittanceManagement';
import AddUserToGroup from './pages/User Permissions/AddUserToGroup';
import RemoveUserFromGroup from './pages/User Permissions/RemoveUserFromGroup';
import CreatePermissionGroup from './pages/User Permissions/CreatePermissionGroup';
import GroupsManagement from './pages/User Permissions/GroupsManagement';
import AssignPermissions from './pages/User Permissions/AssignPermissions';
import ViewPermissions from './pages/User Permissions/ViewPermissions';
import PaymentSuccess from './pages/Giving/PaymentSuccess';
import GiveOffline from './pages/Giving/GiveOffline'
import GivingRecords from './pages/Giving/GivingRecords';
import CentralGivingList from './pages/Central Finance/CentralGivingList';
import GivingList from './pages/finance/GivingList';
import ViewChurchAccounts from './pages/finance/ViewChurchAccounts';
import ViewCentralAccounts from './pages/Central Finance/ViewCentralAccounts';
import FundTransfer from './pages/finance/FundTransfer';
import CentralFundTransfer from './pages/Central Finance/CentralFundTransfer';
import AccountStatementSidebar from './pages/finance/AccountStatementSidebar';
import CentralAccountStatementSidebar from './pages/Central Finance/CentralAccountStatementSidebar';
import TransactionChart from './pages/finance/TransactionChart';
import ChatComponent from './components/Chat/ChatComponent';
import UserChat from './components/Chat/UserChat';

import Registration from './pages/Dashboard/Registration';
import Profiles from './pages/Dashboard/Profiles';
import UploadMessage from './pages/Messages/UploadMessage';
import MessageList from './pages/Messages/MessageList';
import AudioMessageList from './pages/Messages/AudioMessageList';
import VideoMessageList from './pages/Messages/VideoMessageList';
import SuspendUser from './pages/User Management/SuspendUser';
import UnSuspendUser from './pages/User Management/UnSuspendUser';
import MediaPlayer from './pages/Messages/MediaPlayer';
import { MediaProvider } from './pages/Messages/MediaContext';
import AdminMessageList from './pages/Messages/AdminMessageList';
import WorkersMeeting from './pages/Events/WorkersMeeting';
import DepartmentsPage from './pages/community/DepartmentsPage';
import DevotionalReader from './pages/LOLD/DevotionalReader';
import AdminLOLDUpload from './pages/LOLD/AdminLOLDUpload';
import AdminLOLDMgt from './pages/LOLD/AdminLOLDMgt';


function App() {
  const [loading, setLoading] = useState(true); 
  // const { pathname } = useLocation();

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, [pathname]);

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved) : [
    {
      id: 1,
      title: "Night of Glory, January 2025 Edition.",
      Conductor: "Conductor: Pastor Chizoba Okeke",
      date: "Friday, January 31, 2025",
      time: "09:00 PM",
      location: "The Lord's Brethren Place, Awka.",
      description: "Ministry-wide Night of Glory, January 2025 Edition.",
      Contact: "09134445037",
      Email: "info@thelordsbrethrenchurch.org",
      image: "/events/NOG-Jan-2025.jpg",
    },
    {
      id: 2,
      title: "Ministers Refreshers Course, February 2025 Edition.",
      Conductor: "Conductor: Pastor Kenechukwu Chukwukelue",
      date: "Saturday, February 08, 2025",
      time: "9:00 PM",
      location: "The Lord's Brethren Place, Awka.",
      description: "Ministry-wide MRC, February 2025 edition.",
      Contact: "09134445037",
      Email: "info@thelordsbrethrenchurch.org",
      image: "/events/MRC-Feb-2025.jpg",
    },
  ];
});

// Persist events to localStorage whenever they change
useEffect(() => {
  localStorage.setItem('events', JSON.stringify(events));
}, [events]);


  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Function to add new event
  const handleAddEvent = (newEvent) => {
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };


  // // Helper function to wrap components with DefaultLayout and ProtectedRoute
  // const withDefaultLayout = (component, title) => (
  //   <ProtectedRoute>
  //     <PageTitle title={`${title} | TLBC Portal`} />
  //     <DefaultLayout>{component}</DefaultLayout>
  //  </ProtectedRoute>
  // );

  const withDefaultLayout = (component, title) => {
    return (
      <DefaultLayout>
        {React.cloneElement(component, { 
          events,
          onAddEvent: handleAddEvent,
          title 
        })}
      </DefaultLayout>
    );
  };

  
  if (loading) {
    return <Loader />;
  }


  return (
    <MediaProvider>
    <BrowserRouter>
    <>
      <Routes>

       {/* Auth Routes - Outside DefaultLayout and ProtectedRoute */}
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
            <PageTitle title="Sidebar-copy" />
            <SidebarCopy />
          </>
        }
      />
      
      <Route path="/forms/:ref_code" element={
        <>
        <PageTitle title="First Timer's form" />
        <FirstTimersForm />
        </>
      }
      />

     <Route path="/form/:ref_code" element={
      <>
      <PageTitle title="First Timer's form" />
      <FirstTimersFormCopy />
        </>
     }
       />

     <Route path="/returningNewcomers/:refcode" element={
      <>
      <PageTitle title="Returning NewComer's form" />
      <ReturningNewComers />
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
      

       {/* Dashboard Routes - Inside DefaultLayout. THEY SHOULD ALL BE PROTECTED ROUTES */}
       <Route path="/admindashboard" element= {
         <ProtectedRoute requiredRoles={['superadmin']}>
        {withDefaultLayout(<AdminDashboard />, "Admin Dashboard")} 
        </ProtectedRoute> }
       
        />

<Route path="/dashboard" element= {
         <ProtectedRoute>
        {withDefaultLayout(<UserDashboard />, "User Dashboard")} 
        </ProtectedRoute> }
       
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


       {/* Attendance */}
      <Route path="/createattendance" element={withDefaultLayout(<AttendanceCreationPage />, "Create Attendance")} />
      <Route path="/attendancereport" element={withDefaultLayout(<AttendanceReport />, "Attendance Report")} />
      <Route path="/markattendance" element={withDefaultLayout(<AttendanceMarkerPage />, "Mark Attendance")} />
      <Route path="/form" element={withDefaultLayout(<NewcomerForm />, "First Timer's form")} />
      {/* <Route path="/forms/:ref_code" element={withDefaultLayout(<FirstTimersForm />, "First Timer's form")} /> */}
      <Route path="/forms/" element={withDefaultLayout(<FirstTimersForm />, "First Timer's form")} />
      <Route path="/forms2/" element={withDefaultLayout(<NewcomerForm2 />, "New Comers form")} />
      {/* <Route path="/form/:ref_code" element={withDefaultLayout(<FirstTimersFormCopy />, "First Timer's form copy")} /> */}
      <Route path="/attendanceDetails/:refCode" element={withDefaultLayout(<AttendanceDetailsPage />, "Attendance Details Page")} />
      {/* <Route path="/returningNewcomers/:refcode" element={withDefaultLayout(<ReturningNewComers />, "Returning NewComers")} /> */}

      <Route path="/attendancereportadmin" element={withDefaultLayout(<AttendanceReportAdmin />, "Attendance Admin Report")} />
      <Route path="/attendancedetailspageadmin/:refCode" element={withDefaultLayout(<AttendanceDetailsPageAdmin />, "Attendance Details Admin")} />
      <Route path="/addmembers/:refcode" element={withDefaultLayout(<AddMembersForm />, "Add Members")} />
      <Route path="/newcomerscount/:refcode" element={withDefaultLayout(<NewComersCount />, "NewComers Attendance Count")} />
      <Route path="/firsttimersformadmin/:ref_code" element={withDefaultLayout(<FirstTimersFormAdmin />, "First Timer's form Admin")} />
      <Route path="/addreturningadmin/:ref_code" element={withDefaultLayout(<AddReturningAdmin />, "Add Returning Visitors form Admin")} />
      
      
      {/* Community */}
      <Route path="/UserSearchPage" element={withDefaultLayout(<UserSearchPage />, "Search Members")} />
      <Route path="/UserProfileCard" element={withDefaultLayout(<UserProfileCard />, "User Profile Card")} />
      <Route path="/AboutTLBC" element={withDefaultLayout(<AboutTLBC />, "About TLBC")} />
      <Route path="/departments" element={withDefaultLayout(<DepartmentsPage />, "Departments")} />

      <Route path="/comingsoon" element={withDefaultLayout(<LOLD />, "Coming soon")} />

       {/* LOLD */}
      <Route path="/lold" element={withDefaultLayout(<AdminLOLDUpload />, "LOLD Upload")} />
      <Route path="/loldReader" element={withDefaultLayout(<DevotionalReader />, "LOLD Reader")} />
      <Route path="/devotional/:id" element={withDefaultLayout(<DevotionalReader />, "LOLD Reader")} />
      <Route path="/loldAdminMgt" element={withDefaultLayout(<AdminLOLDMgt />, "LOLD Reader")} />

      
        {/* Zone Management */}
      <Route path="/ZoneManagement" element={withDefaultLayout(<ZoneManagement />, "Zonal Manager")} />
      <Route path="/ChurchManagement" element={withDefaultLayout(<ChurchManagement />, "Church Manager")} />
      <Route path="/accountCreation" element={withDefaultLayout(<AccountCreationPage />, "Create Church Account")} />


        {/* Finance Management */}
      <Route path="/financeDashboard" element={withDefaultLayout(<FinanceDashboard />, "Account Management")} />
      <Route path="/expensesManagement" element={withDefaultLayout(<ExpensesManagement />, "Expenses Management")} />
      <Route path="/fundManagement" element={withDefaultLayout(<FundManagement />, "Fund Management")} />
      <Route path="/remittanceManagement" element={withDefaultLayout(<RemittanceManagement />, "Remittance Management")} />
      <Route path="/topupManagement" element={withDefaultLayout(<TopupManagement />, "Topup Management")} />
      <Route path="/accountstatement" element={withDefaultLayout(<AccountStatement />, "Account Statement")} />
      <Route path="/statementofaccount" element={withDefaultLayout(<AccountStatementSidebar />, "Account Statement")} />
      <Route path="/givinglist" element={withDefaultLayout(<GivingList />, "Church Givings")} />
      <Route path="/churchaccounts" element={withDefaultLayout(<ViewChurchAccounts />, "Church Accounts")} />
      <Route path="/fundtransfer" element={withDefaultLayout(<FundTransfer />, "Fund Transfer")} />
      <Route path="/transactionchart" element={withDefaultLayout(<TransactionChart />, "Transaction chart")} />


        {/* Central Finance Management */}
      <Route path="/central/financeDashboard" element={withDefaultLayout(<CentralAccountDashboard />, "Central Finance Dashboard")} />
      <Route path="/central/accountCreation" element={withDefaultLayout(<CentralAccountCreationPage/>, "Create Central Account")} />
      <Route path="/central/expensesManagement" element={withDefaultLayout(<CentralExpensesManagement />, "Central Expenses Management")} />
      <Route path="/central/fundManagement" element={withDefaultLayout(<CentralFundManagement />, "Central Fund Management")} />
      <Route path="/central/remittanceManagement" element={withDefaultLayout(<CentralRemittanceManagement />, "Central Remittance Management")} />
      <Route path="/central/topupManagement" element={withDefaultLayout(<CentralTopupManagement />, "Central Topup Management")} />
      <Route path="/centralaccountstatement" element={withDefaultLayout(<CentralAccountStatement />, "Central Account Statement")} />
      <Route path="/central/statementofaccount" element={withDefaultLayout(<CentralAccountStatementSidebar />, "Central Account Statement")} />
      <Route path="/central/givinglist" element={withDefaultLayout(<CentralGivingList />, "Central Givings")} />
      <Route path="/central/accounts" element={withDefaultLayout(<ViewCentralAccounts />, "Central Accounts")} />
      <Route path="/central/fundtransfer" element={withDefaultLayout(<CentralFundTransfer />, "Central Fund Transfer")} />
      


          {/* Giving */}
      <Route path="/giving" element={withDefaultLayout(<GivingOnline />, "Giving")} />
      <Route path="/giveoffline" element={withDefaultLayout(<GiveOffline />, "Giving Record")} />
      <Route path="/givingrecords" element={withDefaultLayout(<GivingRecords />, "Giving Record")} />
      <Route path="/PaymentSuccess" element={withDefaultLayout(<PaymentSuccess />, "Payment Successful")} />


         {/* Messages */}
         <Route path="/uploadmessage" element={withDefaultLayout(<UploadMessage />, "Upload Message")} />
         <Route path="/messagelist" element={withDefaultLayout(<MessageList />, "Message List")} />
         <Route path="/adminmessagelist" element={withDefaultLayout(<AdminMessageList />, "Admin Message List")} />
         <Route path="/media-player" element={withDefaultLayout(<MediaPlayer />, "Message List")} />
         
         <Route path="/audiomessagelist" element={withDefaultLayout(<AudioMessageList />, "Audio Message List")} />
         <Route path="/videomessagelist" element={withDefaultLayout(<VideoMessageList />, "Video Message List")} /> 


      
            {/* Events */}
      <Route path="/church-events" element={withDefaultLayout(<EventsPage />, "Events")} />
      <Route path="/admineventupload" element={withDefaultLayout(<AdminEventUpload  />, "Admin Events Upload")} />
      <Route path="/admineventmgt" element={withDefaultLayout(<AdminEventManagement  />, "Admin Events Management")} />
      <Route path="/admineditevent/:id" element={withDefaultLayout(<EditEvent  />, "Admin Edit Event")} />
      <Route path="/workersmeeting" element={withDefaultLayout(<WorkersMeeting  />, "Workers Meeting Event")} />

      <Route path="/reg" element={withDefaultLayout(<Registration  />, "Admin Edit Event")} />
      <Route path="/profiles" element={withDefaultLayout(<Profiles  />, "Admin Edit Event")} />


            {/* User Management */}
      <Route path="/onboardUser" element={withDefaultLayout(<OnboardUser />, "Onboard New User")} />
      <Route path="/deleteUser" element={withDefaultLayout(<DeleteUser />, "Delete User")} />
      <Route path="/suspendUser" element={withDefaultLayout(<SuspendUser />, "Suspend User")} />
      <Route path="/unsuspendUser" element={withDefaultLayout(<UnSuspendUser />, "Unsuspend User")} />
      <Route path="/userPermissions" element={withDefaultLayout(<UserPermissions />, "User Permissions")} />
      <Route path="/userSearchAdmin" element={withDefaultLayout(<UserSearchAdmin />, "Admin User Search")} />
      <Route path="/edituserdetailsform" element={withDefaultLayout(<EditUserDetailsForm />, "Edit User's Details Form")} />
      <Route path="/AdvancedUserSearchPage" element={withDefaultLayout(<AdvancedUserSearchPage />, "User Profile Card")} />
      

      
          {/* Permssion Management */}
      <Route path="/addusertogroup" element={withDefaultLayout(<AddUserToGroup />, "Add User to Group")} />
      <Route path="/removeuserfromgroup" element={withDefaultLayout(<RemoveUserFromGroup />, "Remove User from Group")} />
      <Route path="/createpermissiongroup" element={withDefaultLayout(<CreatePermissionGroup />, "Create Permission Group")} />
      <Route path="/groupsmanagement" element={withDefaultLayout(<GroupsManagement />, "Groups Management")} />
      <Route path="/permissionmanagement" element={withDefaultLayout(<AssignPermissions />, "Permissions Management")} />
      <Route path="/viewpermissions" element={withDefaultLayout(<ViewPermissions />, "View Permissions")} />

            {/* Chat */}
            <Route path="/ChatComponent" element={withDefaultLayout(<ChatComponent />, "Chat")} />
            <Route path="/UserChat" element={withDefaultLayout(<UserChat />, "Chat")} />
       


      <Route path="/transactions" element={withDefaultLayout(<Transactions />, "Create Church Account")} />
      
    </Routes>
    </>
    </BrowserRouter>

    </MediaProvider>
  );
}

export default App;
