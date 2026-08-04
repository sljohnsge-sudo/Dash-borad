import React, { useState } from 'react';
import { Calendar, PieChart, RefreshCw, Settings } from 'lucide-react';
import CircularGauge from '../components/common/CircularGauge';
import { useNavigate } from 'react-router-dom';

const MONTH_TABS = [
  { key: 'april', label: 'Apr-26' },
  { key: 'may', label: 'May-26' },
  { key: 'june', label: 'Jun-26' },
  { key: 'july', label: 'Jul-26' },
  { key: 'august', label: 'Aug-26' },
  { key: 'september', label: 'Sep-26' },
  { key: 'october', label: 'Oct-26' },
  { key: 'november', label: 'Nov-26' },
  { key: 'december', label: 'Dec-26' },
  { key: 'january', label: 'Jan-27' },
  { key: 'february', label: 'Feb-27' },
  { key: 'march', label: 'Mar-27' },
];

const QUARTERS = [
  { name: 'Apr', qtr: '1st QTR', pri: 780, rd: 720 },
  { name: 'May', qtr: '1st QTR', pri: 760, rd: 690 },
  { name: 'Jun', qtr: '1st QTR', pri: 770, rd: 740 },
  { name: 'Jul', qtr: '2nd QTR', pri: 780, rd: 645 },
  { name: 'Aug', qtr: '2nd QTR', pri: 0, rd: 0 },
  { name: 'Sep', qtr: '2nd QTR', pri: 0, rd: 0 },
  { name: 'Oct', qtr: '3rd QTR', pri: 0, rd: 0 },
  { name: 'Nov', qtr: '3rd QTR', pri: 0, rd: 0 },
  { name: 'Dec', qtr: '3rd QTR', pri: 0, rd: 0 },
  { name: 'Jan', qtr: '4th QTR', pri: 0, rd: 0 },
  { name: 'Feb', qtr: '4th QTR', pri: 0, rd: 0 },
  { name: 'Mar', qtr: '4th QTR', pri: 0, rd: 0 },
];

const DisDashboardFyPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('july');
  const navigate = useNavigate();

  return (
    <div className="page-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart style={{ width: '24px', height: '24px', color: 'var(--gsh-teal)' }} />
            Dis-Dashboard fy (Primary & RD Sales Analytics)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Executive Overview comparing Primary Targets vs Actuals & RD Targets vs Actuals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
            <RefreshCw style={{ width: '15px', height: '15px' }} /> Refresh
          </button>
          <button
            onClick={() => navigate('/dashboard-create')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              background: 'var(--accent-gradient)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(200, 16, 46, 0.25)'
            }}
          >
            <Settings style={{ width: '15px', height: '15px' }} />
            Customize in Studio
          </button>
        </div>
      </div>

      {/* Month Selector Bar */}
      <div className="glass-card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 0.5rem', flexShrink: 0 }}>
          <Calendar style={{ width: '18px', height: '18px', color: 'var(--gsh-red)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Month:</span>
        </div>
        {MONTH_TABS.map((tab) => {
          const isActive = selectedMonth === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedMonth(tab.key)}
              style={{
                flex: 1,
                minWidth: '78px',
                padding: '0.5rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                border: isActive ? '1px solid var(--gsh-red)' : '1px solid var(--border-color)',
                background: isActive ? 'var(--gsh-red)' : 'var(--bg-card)',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                fontWeight: isActive ? 800 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease-in-out',
                boxShadow: isActive ? '0 2px 8px rgba(200,16,46,0.25)' : 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3-Column Layout Matching Image 2 Format */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', alignItems: 'stretch' }}>
        
        {/* CARD 1: Primary Sales Details (Top Left) */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', margin: '0 0 1rem 0' }}>
            Primary Sales Details
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flex: 1 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Pri:Act</div>
                <div style={{ background: 'var(--bg-hover)', borderRadius: '4px', height: '32px', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '78%', background: '#06b6d4', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>779.9 M</span>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Pri:Tgt</div>
                <div style={{ background: 'var(--bg-hover)', borderRadius: '4px', height: '32px', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '75%', background: '#00a896', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>753.4 M</span>
                  </div>
                </div>
              </div>
            </div>
            <CircularGauge percentage={104} variance="26.47 Mn" size={110} activeColor="#06b6d4" />
          </div>
        </div>

        {/* CARD 2: RD Sales Details (Top Middle) */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', margin: '0 0 1rem 0' }}>
            RD Sales Details
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flex: 1 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>RD:Act</div>
                <div style={{ background: 'var(--bg-hover)', borderRadius: '4px', height: '32px', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '65%', background: '#3b82f6', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>645.4 M</span>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>RD:Tgt</div>
                <div style={{ background: 'var(--bg-hover)', borderRadius: '4px', height: '32px', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '84%', background: '#1e3a8a', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>839.7 M</span>
                  </div>
                </div>
              </div>
            </div>
            <CircularGauge percentage={77} variance="-194.29 Mn" size={110} activeColor="#f59e0b" />
          </div>
        </div>

        {/* CARD 3: Distributor Total Budget vs Actual FY 27' (Tall Right Column) */}
        <div className="glass-card" style={{ padding: '1.25rem', gridRow: 'span 2', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', margin: '0 0 1.25rem 0', textAlign: 'center' }}>
            Distributor Total Budget vs Actual FY 27'
          </h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', alignItems: 'flex-end', height: '240px', padding: '0 0.5rem' }}>
              {/* Pri:Tgt */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)' }}>8,896 Mn</span>
                <div style={{ width: '100%', height: '180px', background: '#00a896', borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-subtle)' }}>Pri:Tgt</span>
              </div>
              {/* Pri:Act */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#06b6d4' }}>3,105 Mn</span>
                <div style={{ width: '100%', height: '100px', background: '#06b6d4', borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#06b6d4' }}>Pri:Act</span>
              </div>
              {/* RD:Tgt */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)' }}>9,913 Mn</span>
                <div style={{ width: '100%', height: '200px', background: '#1e3a8a', borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-subtle)' }}>RD:Tgt</span>
              </div>
              {/* RD:Act */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#3b82f6' }}>2,899 Mn</span>
                <div style={{ width: '100%', height: '90px', background: '#3b82f6', borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3b82f6' }}>RD:Act</span>
              </div>
            </div>

            {/* Achievement Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ padding: '0.4rem 1rem', background: 'rgba(6,182,212,0.12)', borderRadius: '20px', border: '1px solid rgba(6,182,212,0.3)', color: '#06b6d4', fontWeight: 800, fontSize: '0.85rem' }}>
                Primary: 35%
              </div>
              <div style={{ padding: '0.4rem 1rem', background: 'rgba(59,130,246,0.12)', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', fontWeight: 800, fontSize: '0.85rem' }}>
                RD: 29%
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Primary Update of the Quarter wise (Bottom Left) */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', margin: '0 0 1rem 0' }}>
            Primary Update of the Quarter wise
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.35rem', height: '140px', padding: '0 0.25rem' }}>
            {QUARTERS.map((q, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ width: '100%', height: `${(q.pri / 800) * 110}px`, background: q.pri > 0 ? '#06b6d4' : 'var(--bg-hover)', borderRadius: '2px 2px 0 0' }} />
                <span style={{ fontSize: '0.6rem', color: 'var(--text-subtle)' }}>{q.name}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'between', fontSize: '0.65rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <span>1st QTR</span><span>2nd QTR</span><span>3rd QTR</span><span>4th QTR</span>
          </div>
        </div>

        {/* CARD 5: RD Update of the Quarter wise (Bottom Middle) */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', margin: '0 0 1rem 0' }}>
            RD Update of the Quarter wise
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.35rem', height: '140px', padding: '0 0.25rem' }}>
            {QUARTERS.map((q, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ width: '100%', height: `${(q.rd / 800) * 110}px`, background: q.rd > 0 ? '#3b82f6' : 'var(--bg-hover)', borderRadius: '2px 2px 0 0' }} />
                <span style={{ fontSize: '0.6rem', color: 'var(--text-subtle)' }}>{q.name}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'between', fontSize: '0.65rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <span>1st QTR</span><span>2nd QTR</span><span>3rd QTR</span><span>4th QTR</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DisDashboardFyPage;
