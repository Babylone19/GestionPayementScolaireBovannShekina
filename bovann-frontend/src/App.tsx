import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages Admin
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import UsersList from './pages/Admin/UsersList';
import UserView from './pages/Admin/UserView';
import UserEdit from './pages/Admin/UserEdit';
import StudentsList from './pages/Admin/StudentsList';
import CreateStudent from './pages/Admin/CreateStudent';
import StudentView from './pages/Admin/StudentView';
import StudentEdit from './pages/Admin/StudentEdit';
import PaymentsList from './pages/Admin/PaymentsList';
import PaymentsByStudent from './pages/Admin/PaymentsByStudent';

// Pages Secretary
import SecretaryDashboard from './pages/Secretary/Dashboard';
import StudentManagement from './pages/Secretary/StudentManagement';

// Pages Accountant
import AccountantDashboard from './pages/Accountant/Dashboard';
import PaymentManagement from './pages/Accountant/PaymentManagement';

// Pages Guard
import GuardDashboard from './pages/Guard/Dashboard';
import ScanCard from './pages/Guard/ScanCard';

// Composant de redirection
import StudentHistoryRedirect from './components/StudentHistoryRedirect';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* ==================== ROUTE POUR STUDENT-HISTORY ==================== */}
        <Route path="/student-history/:studentId" element={<StudentHistoryRedirect />} />
        
        {/* ==================== ADMIN ROUTES ==================== */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Gestion des Utilisateurs */}
        <Route 
          path="/admin/users/list" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <UsersList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users/create" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users/view" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <UserView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users/edit" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <UserEdit />
            </ProtectedRoute>
          } 
        />
        
        {/* Gestion des Étudiants */}
        <Route 
          path="/admin/students/list" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <StudentsList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/students/create" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <CreateStudent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/students/view" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <StudentView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/students/edit" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <StudentEdit />
            </ProtectedRoute>
          } 
        />
        
        {/* Gestion des Paiements */}
        <Route 
          path="/admin/payments/list" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <PaymentsList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/payments/by-student" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <PaymentsByStudent />
            </ProtectedRoute>
          } 
        />
        
        {/* ==================== SECRETARY ROUTES ==================== */}
        <Route 
          path="/secretary/dashboard" 
          element={
            <ProtectedRoute requiredRole="SECRETARY">
              <SecretaryDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/secretary/student-management" 
          element={
            <ProtectedRoute requiredRole="SECRETARY">
              <StudentManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* ==================== ACCOUNTANT ROUTES ==================== */}
        <Route 
          path="/accountant/dashboard" 
          element={
            <ProtectedRoute requiredRole="ACCOUNTANT">
              <AccountantDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/accountant/payment-management" 
          element={
            <ProtectedRoute requiredRole="ACCOUNTANT">
              <PaymentManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* ==================== GUARD ROUTES ==================== */}
        <Route 
          path="/guard/dashboard" 
          element={
            <ProtectedRoute requiredRole="GUARD">
              <GuardDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guard/scan-card" 
          element={
            <ProtectedRoute requiredRole="GUARD">
              <ScanCard />
            </ProtectedRoute>
          } 
        />
        
        {/* Route de redirection par défaut */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;