import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardFy27Overview from './components/DashboardFy27Overview';
import InvoiceOutputDashboard from './components/InvoiceOutputDashboard';
import OutstandingOutputDashboard from './components/OutstandingOutputDashboard';
import DatabaseStatus from './components/DatabaseStatus';
import GshLogo from './components/GshLogo';
import { checkDatabaseHealth } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('invoice-output');
  const [theme, setTheme] = useState('light');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbHealth, setDbHealth] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const health = await checkDatabaseHealth();
    setDbHealth(health);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    handleRefresh();
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Area */}
      <div className="main-content">
        {/* Top Header */}
        <Header 
          theme={theme} 
          setTheme={setTheme} 
          onRefresh={handleRefresh} 
          isRefreshing={isRefreshing} 
          setMobileOpen={setMobileOpen}
        />

        {/* Page Content */}
        <main className="page-body">
          {/* Top Brand Banner */}
          <div className="glass-card animate-fade-in main-brand-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ 
                padding: '0.4rem 0.875rem', 
                background: '#ffffff', 
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-color)',
                flexShrink: 0
              }}>
                <GshLogo height={42} showText={true} />
              </div>
              <div>
                <h2 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 800, 
                  color: '#0f172a', 
                  margin: 0
                }}>
                  George Steuart Health Executive Dashboard
                </h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.2rem' }}>
                  XAMPP MySQL &amp; FastAPI Database (`gsh_dashboard`) &bull; Active CSV Data Tables (19,216 Records)
                </p>
              </div>
            </div>
          </div>

          {/* Database Health Monitor Bar */}
          <div style={{ marginBottom: '1.75rem' }}>
            <DatabaseStatus health={dbHealth} onCheckHealth={handleRefresh} />
          </div>

          {/* Dashboard FY 27 Configuration Overview */}
          {activeTab === 'fy27-dashboard' && (
            <DashboardFy27Overview />
          )}

          {/* 1st CSV Report: Invoice Output */}
          {activeTab === 'invoice-output' && (
            <InvoiceOutputDashboard />
          )}

          {/* 2nd CSV Report: Outstanding Output */}
          {activeTab === 'outstanding-output' && (
            <OutstandingOutputDashboard />
          )}

          {/* Database Status View */}
          {activeTab === 'database' && (
            <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>MySQL XAMPP Database Overview</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                All legacy and former tables have been deleted from <code style={{ background: 'var(--bg-hover)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>gsh_dashboard</code> database. The database currently contains ONLY the 2 active data tables built from your Desktop folder <code style={{ background: 'var(--bg-hover)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>New folder (6)</code>.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--gsh-red)', fontSize: '1.1rem' }}>invoice_output</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>From: Invoice Output.csv</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)' }}>19,046 Records</p>
                  <span className="badge badge-primary" style={{ marginTop: '0.5rem' }}>39 SQL Columns</span>
                </div>
                <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontSize: '1.1rem' }}>outstanding_output</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>From: Outstanding Output.csv</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)' }}>170 Records</p>
                  <span className="badge badge-info" style={{ marginTop: '0.5rem' }}>32 SQL Columns</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
