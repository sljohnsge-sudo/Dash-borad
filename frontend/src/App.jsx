import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import DashboardFyPage from './pages/DashboardFyPage';
import TotalRangeFyPage from './pages/TotalRangeFyPage';
import DisDashboardFyPage from './pages/DisDashboardFyPage';
import DistriRangeFyPage from './pages/DistriRangeFyPage';
import TotalBudgetPage from './pages/TotalBudgetPage';
import DisBudgetPage from './pages/DisBudgetPage';
import InvoiceOutputPage from './pages/InvoiceOutputPage';
import OutstandingOutputPage from './pages/OutstandingOutputPage';
import DashboardCreatePage from './pages/DashboardCreatePage';
import ManageUsersPage from './pages/ManageUsersPage';
import MapDivisionsPage from './pages/MapDivisionsPage';

// Guard requiring user to be logged in
const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
};

// Guard requiring user to be Admin
const RequireAdmin = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard-fy" replace />;
  }
  return children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard-fy" : "/welcome"} replace />} />

      {/* Protected Layout App */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        {/* Accessible to ALL roles (User + Admin) */}
        <Route path="dashboard-fy" element={<DashboardFyPage />} />
        <Route path="total-range-fy" element={<TotalRangeFyPage />} />
        <Route path="dis-dashboard-fy" element={<DisDashboardFyPage />} />
        <Route path="distri-range-fy" element={<DistriRangeFyPage />} />

        {/* ADMIN ONLY Routes */}
        <Route path="total-budget" element={<RequireAdmin><TotalBudgetPage /></RequireAdmin>} />
        <Route path="dis-budget" element={<RequireAdmin><DisBudgetPage /></RequireAdmin>} />
        <Route path="invoice-output" element={<RequireAdmin><InvoiceOutputPage /></RequireAdmin>} />
        <Route path="outstanding-output" element={<RequireAdmin><OutstandingOutputPage /></RequireAdmin>} />
        <Route path="map-divisions" element={<RequireAdmin><MapDivisionsPage /></RequireAdmin>} />
        <Route path="dashboard-create" element={<RequireAdmin><DashboardCreatePage /></RequireAdmin>} />
        <Route path="admin/users" element={<RequireAdmin><ManageUsersPage /></RequireAdmin>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard-fy" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
