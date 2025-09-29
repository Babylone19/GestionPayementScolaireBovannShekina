import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import SecretaryDashboard from './pages/Secretary/Dashboard';
import StudentManagement from './pages/Secretary/StudentManagement';
import AccountantDashboard from './pages/Accountant/Dashboard';
import PaymentManagement from './pages/Accountant/PaymentManagement';
import GuardDashboard from './pages/Guard/Dashboard';
import ScanCard from './pages/Guard/ScanCard';
// import ScanResult from './pages/Guard/ScanResult';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/secretary/dashboard" element={<SecretaryDashboard />} />
        <Route path="/secretary/student-management" element={<StudentManagement />} />
        <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
        <Route path="/accountant/payment-management" element={<PaymentManagement />} />
        <Route path="/guard/dashboard" element={<GuardDashboard />} />
        <Route path="/guard/scan-card" element={<ScanCard />} />
        {/* <Route path="/guard/scan-result" element={<ScanResult/>} /> */}
      </Routes>
    </Router>
  );
};

export default App;
