import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardFyPage from './pages/DashboardFyPage';
import TotalBudgetPage from './pages/TotalBudgetPage';
import DisBudgetPage from './pages/DisBudgetPage';
import InvoiceOutputPage from './pages/InvoiceOutputPage';
import OutstandingOutputPage from './pages/OutstandingOutputPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard-fy" replace />} />
        <Route path="dashboard-fy" element={<DashboardFyPage />} />
        <Route path="total-budget" element={<TotalBudgetPage />} />
        <Route path="dis-budget" element={<DisBudgetPage />} />
        <Route path="invoice-output" element={<InvoiceOutputPage />} />
        <Route path="outstanding-output" element={<OutstandingOutputPage />} />
        <Route path="*" element={<Navigate to="/dashboard-fy" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
