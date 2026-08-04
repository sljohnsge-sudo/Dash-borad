import React from 'react';
import { NavLink } from 'react-router-dom';
import GshLogo from '../GshLogo';
import { 
  LayoutDashboard,
  Calculator,
  PieChart,
  FileText,
  Truck,
  ShieldCheck, 
  X,
  LayoutGrid
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const menuItems = [
    { path: '/dashboard-fy', label: 'Dashboard FY', sub: 'Executive Dashboard Overview', icon: LayoutDashboard },
    { path: '/total-budget', label: 'Total Budget', sub: 'total_budget (649 records)', icon: Calculator },
    { path: '/dis-budget', label: 'Dis Budget', sub: 'dis_budget (9,644 records)', icon: PieChart },
    { path: '/invoice-output', label: 'Invoice Output Report', sub: 'invoice_output (19,046 records)', icon: FileText },
    { path: '/outstanding-output', label: 'Outstanding Output Report', sub: 'outstanding_output (170 records)', icon: Truck },
    { path: '/dashboard-create', label: 'Dashboard Create Page', sub: 'Studio — Build custom charts', icon: LayoutGrid, divider: true },
  ];

  const handleClose = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={handleClose}
          className="sidebar-backdrop"
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`sidebar-container ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Mobile Close Button */}
        <div className="mobile-close-bar">
          <button 
            onClick={handleClose}
            className="btn btn-secondary mobile-close-btn"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Brand Header with Authentic GSH Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          padding: '0.5rem 0',
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <GshLogo height={44} showText={true} />
        </div>

        {/* Decorative Gold Accent Bar */}
        <div style={{
          height: '3px',
          width: '100%',
          background: 'linear-gradient(90deg, #c8102e 0%, #f4c430 50%, #00a896 100%)',
          borderRadius: 'var(--radius-full)',
          marginBottom: '1.0rem'
        }} />

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.path}>
              {item.divider && (
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }} />
              )}
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1.0rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  justifyContent: 'flex-start',
                  width: '100%',
                  textAlign: 'left',
                  textDecoration: 'none',
                  boxShadow: isActive ? '0 4px 14px rgba(200, 16, 46, 0.25)' : 'none'
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon style={{ 
                      width: '20px', 
                      height: '20px', 
                      flexShrink: 0,
                      color: isActive ? '#ffffff' : 'inherit'
                    }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.7rem', color: isActive ? 'rgba(255,255,255,0.85)' : 'var(--text-subtle)' }}>
                        {item.sub}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div style={{
          padding: '0.875rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <ShieldCheck style={{ width: '20px', height: '20px', color: 'var(--gsh-teal)' }} />
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              GSH XAMPP MySQL
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', margin: 0, whiteSpace: 'nowrap' }}>
              DB: gsh_dashboard (5 Active Tables)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
