import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
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
import InstitutionManagement from './pages/Admin/InstitutionManagement';
import ProgramManagement from './pages/Admin/ProgramManagement';
import PaymentTypeManagement from './pages/Admin/PaymentTypeManagement';

// Pages Secretary
import SecretaryDashboard from './pages/Secretary/Dashboard';
import StudentManagement from './pages/Secretary/StudentManagement';
// import QuickPayment from './pages/Secretary/QuickPayment';
import StudentRegistration from './pages/Secretary/StudentRegistration';
import DocumentPrinting from './pages/Secretary/DocumentPrinting';
// Pages Accountant
import AccountantDashboard from './pages/Accountant/Dashboard';
import PaymentManagement from './pages/Accountant/PaymentManagement';
import PaymentStats from './pages/Accountant/PaymentStats';
import FinancialReports from './pages/Accountant/FinancialReports';

// Pages Guard
import GuardDashboard from './pages/Guard/Dashboard';
import ScanCard from './pages/Guard/ScanCard';

// Pages Public
import StudentVerification from './pages/Public/StudentVerification';
import PaymentHistory from './pages/Public/PaymentHistory';

// Composants
import StudentHistoryRedirect from './components/StudentHistoryRedirect';
import { LoadingSpinner } from './components/Common/LoadingSpinner';

// Layout principal
import Layout from './components/Layout/Layout';
import { UserRole } from './types/user';
import InstitutionView from './pages/Admin/InstitutionView';

// Composant pour gérer le routage basé sur le rôle
const RoleBasedRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" text="Chargement de l'application..." />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Déterminer la route de redirection basée sur le rôle
  const getDefaultRoute = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return '/admin/dashboard';
      case 'SECRETARY':
        return '/secretary/dashboard';
      case 'ACCOUNTANT':
        return '/accountant/dashboard';
      case 'GUARD':
        return '/guard/dashboard';
      default:
        return '/admin/dashboard';
    }
  };

  return (
    <Layout role={user.role}>
      <Routes>
        {/* Redirection automatique vers le dashboard selon le rôle */}
        <Route
          path="/"
          element={<Navigate to={getDefaultRoute(user.role)} replace />}
        />

        {/* Routes ADMIN & SUPER_ADMIN */}
        {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users/list" element={<UsersList />} />
            <Route path="/admin/users/create" element={<UserManagement />} />
            <Route path="/admin/users/:id/view" element={<UserView />} />
            <Route path="/admin/users/:id/edit" element={<UserEdit />} />
            <Route path="/admin/students/list" element={<StudentsList />} />
            <Route path="/admin/students/create" element={<CreateStudent />} />
            {/* AJOUTEZ CES DEUX LIGNES */}
            <Route path="/admin/students/:id/view" element={<StudentView />} />
            <Route path="/admin/students/:id/edit" element={<StudentEdit />} />
            <Route path="/admin/payments/list" element={<PaymentsList />} />
            <Route path="/admin/payments/by-student" element={<PaymentsByStudent />} />
            <Route path="/admin/institutions" element={<InstitutionManagement />} />
            <Route path="/admin/programs" element={<ProgramManagement />} />
            <Route path="/admin/payment-types" element={<PaymentTypeManagement />} />
            <Route path="/admin/institutions/:id" element={<InstitutionView />} />
          </>
        )}

        {/* Routes SECRETARY */}
        {user.role === 'SECRETARY' && (
          <>
            <Route path="/secretary/dashboard" element={<SecretaryDashboard />} />
            <Route path="/secretary/student-management" element={<StudentManagement />} />
            {/* <Route path="/secretary/quick-payment" element={<QuickPayment />} /> */}
            <Route path="/secretary/student-registration" element={<StudentRegistration />} />
            <Route path="/secretary/document" element={<DocumentPrinting />}></Route>
          </>
        )}

        {/* Routes ACCOUNTANT */}
        {user.role === 'ACCOUNTANT' && (
          <>
            <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
            <Route path="/accountant/payment-management" element={<PaymentManagement />} />
            <Route path="/accountant/stats" element={<PaymentStats />} />
            <Route path="/accountant/reports" element={<FinancialReports />} />
          </>
        )}

        {/* Routes GUARD */}
        {user.role === 'GUARD' && (
          <>
            <Route path="/guard/dashboard" element={<GuardDashboard />} />
            <Route path="/guard/scan-card" element={<ScanCard />} />
          </>
        )}

        {/* Routes publiques accessibles à tous les utilisateurs authentifiés */}
        <Route path="/verify-student" element={<StudentVerification />} />
        <Route path="/payment-history/:studentId" element={<PaymentHistory />} />
        <Route path="/student-history/:studentId" element={<StudentHistoryRedirect />} />

        {/* Redirection pour les routes non autorisées */}
        <Route
          path="*"
          element={
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h1>
                <p className="text-gray-600 mb-8">
                  Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                </p>
                <button
                  onClick={() => window.location.href = getDefaultRoute(user.role)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retour au tableau de bord
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
};

// Composant principal de l'application
const AppContent: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" text="Chargement de l'application..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Route de login */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Routes publiques */}
      <Route path="/verify-student" element={<StudentVerification />} />
      <Route path="/payment-history/:studentId" element={<PaymentHistory />} />
      <Route path="/student-history/:studentId" element={<StudentHistoryRedirect />} />

      {/* Routes protégées - toutes gérées par RoleBasedRouter */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <RoleBasedRouter />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;