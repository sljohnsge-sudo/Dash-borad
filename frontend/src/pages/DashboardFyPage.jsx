import React, { useState, useEffect } from 'react';
import { fetchDashboardFyOverview } from '../services/api';
import CircularGauge from '../components/common/CircularGauge';
import { AlertCircle, Calendar, Info, Settings, RefreshCw } from 'lucide-react';
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

const toMn = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00 Mn';
  const mn = val / 1_000_000;
  return `${mn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mn`;
};

const toMnInt = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0 Mn';
  const mn = Math.round(val / 1_000_000);
  return `${mn.toLocaleString('en-US')} Mn`;
};

const DashboardFyPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('july');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError(false);
    const res = await fetchDashboardFyOverview(selectedMonth);
    if (!res) {
      setError(true);
      setData(null);
    } else {
      setData(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  // Data helpers
  const tb = data?.total_budget || { target: 1092090000, actual: 1200681486.76, pct: 110, variance: 108591486.76 };
  const db = data?.direct_budget || { target: 338680000, actual: 473690000, pct: 140, variance: 135010000 };
  const dp = data?.dis_pri || { target: 753410000, actual: 779880000, pct: 104, variance: 26470000 };
  const dr = data?.dis_rd || { target: 839740000, actual: 645450000, pct: 77, variance: -194290000 };
  const an = data?.annual || { target: 1555200000, actual: 5217000000, pct: 335 };

  // Max value for horizontal bars
  const tbMax = Math.max(tb.actual, tb.target) * 1.1;
  const dbMax = Math.max(db.actual, db.target) * 1.1;
  const dpMax = Math.max(dp.actual, dp.target) * 1.1;
  const drMax = Math.max(dr.actual, dr.target) * 1.1;
  const anMax = Math.max(an.actual, an.target) * 1.05;

  return (
    <div className="page-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Executive Dashboard FY 2026/27 Overview ({data?.month_label || 'July 2026'})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Monthly Targets vs Actuals comparing&nbsp;
            <code style={{ background: 'var(--bg-hover)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>total_budget</code>,&nbsp;
            <code style={{ background: 'var(--bg-hover)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>dis_budget</code>,&nbsp;
            <code style={{ background: 'var(--bg-hover)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>invoice_output</code>,&nbsp;
            <code style={{ background: 'var(--bg-hover)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>outstanding_output</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
            <RefreshCw style={{ width: '15px', height: '15px' }} /> Refresh
          </button>
          <button onClick={() => navigate('/dashboard-create')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(200,16,46,0.25)' }}>
            <Settings style={{ width: '15px', height: '15px' }} /> Customize Charts
          </button>
        </div>
      </div>

      {/* ─── Hover Formula Banner ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,168,150,0.08)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,168,150,0.3)', fontSize: '0.8rem', color: 'var(--gsh-teal)' }}>
        <Info style={{ width: '16px', height: '16px', flexShrink: 0 }} />
        <span>Hover over any bar to view exact database calculation formula! Click <strong>Customize Charts</strong> to edit formulas.</span>
      </div>

      {/* ─── Top 12 Month Selector Bar ─── */}
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

      {/* ─── Backend Error Alert ─── */}
      {error && (
        <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', background: 'rgba(200, 16, 46, 0.08)', border: '1px solid rgba(200, 16, 46, 0.3)', display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--gsh-red)' }}>
          <AlertCircle style={{ width: '22px', height: '22px', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Backend Connection Failed</p>
            <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)' }}>Cannot reach FastAPI server at <code>http://localhost:8000</code>.</p>
          </div>
        </div>
      )}

      {/* ─── Main Grid Layout (Exact Match to Mockup Image) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* Left 2x2 Monthly Budget Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* Card 1: TOTAL BUDGET vs ACTUAL - CURRENT MONTH */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 1.25rem 0', color: 'var(--text-main)' }}>
              TOTAL BUDGET vs ACTUAL – CURRENT MONTH
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flex: 1 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                {/* Actual Bar */}
                <div title={tb.actual_formula || "Formula: invoice_output.net_dom_amount + outstanding_output.backlog_value_base_curr"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actual</span>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', cursor: 'help' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{ width: `${Math.min((tb.actual / tbMax) * 100, 100)}%`, background: '#10b981', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', minWidth: '60px', transition: 'width 0.5s ease' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>{toMn(tb.actual)}</span>
                    </div>
                  </div>
                </div>
                {/* Target Bar */}
                <div title={tb.target_formula || "Formula: SUM(month_col) from total_budget table"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target</span>
                    <span style={{ fontSize: '0.7rem', color: '#c8102e', cursor: 'help' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{ width: `${Math.min((tb.target / tbMax) * 100, 100)}%`, background: '#c8102e', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', minWidth: '60px', transition: 'width 0.5s ease' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>{toMn(tb.target)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <CircularGauge percentage={tb.pct} variance={toMn(tb.variance)} size={130} activeColor="#10b981" inactiveColor="var(--bg-hover)" />
              </div>
            </div>
          </div>

          {/* Card 2: DIRECT BUDGET vs ACTUAL - CURRENT MONTH */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 1.25rem 0', color: 'var(--text-main)' }}>
              DIRECT BUDGET vs ACTUAL – CURRENT MONTH
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flex: 1 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                <div title={db.actual_formula || "Formula: Direct Sales Invoiced Net Amount"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actual</span>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', cursor: 'help' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{ width: `${Math.min((db.actual / dbMax) * 100, 100)}%`, background: '#10b981', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', minWidth: '60px', transition: 'width 0.5s ease' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>{toMn(db.actual)}</span>
                    </div>
                  </div>
                </div>
                <div title={db.target_formula || "Formula: Direct Sales Target"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target</span>
                    <span style={{ fontSize: '0.7rem', color: '#c8102e', cursor: 'help' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{ width: `${Math.min((db.target / dbMax) * 100, 100)}%`, background: '#c8102e', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', minWidth: '60px', transition: 'width 0.5s ease' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>{toMn(db.target)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <CircularGauge percentage={db.pct} variance={toMn(db.variance)} size={130} activeColor="#10b981" inactiveColor="var(--bg-hover)" />
              </div>
            </div>
          </div>

          {/* Card 3: DIS : PRI BUDGET vs ACTUAL - CURRENT MONTH */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 1.25rem 0', color: 'var(--text-main)' }}>
              DIS : PRI BUDGET vs ACTUAL – CURRENT MONTH
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flex: 1 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                <div title={dp.actual_formula || "Formula: SUM(primary_actual) from dis_budget"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actual</span>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', cursor: 'help' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{ width: `${Math.min((dp.actual / dpMax) * 100, 100)}%`, background: '#10b981', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', minWidth: '60px', transition: 'width 0.5s ease' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>{toMn(dp.actual)}</span>
                    </div>
                  </div>
                </div>
                <div title={dp.target_formula || "Formula: SUM(primary_target) from dis_budget"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target</span>
                    <span style={{ fontSize: '0.7rem', color: '#c8102e', cursor: 'help' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{ width: `${Math.min((dp.target / dpMax) * 100, 100)}%`, background: '#c8102e', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', minWidth: '60px', transition: 'width 0.5s ease' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>{toMn(dp.target)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <CircularGauge percentage={dp.pct} variance={toMn(dp.variance)} size={130} activeColor="#10b981" inactiveColor="var(--bg-hover)" />
              </div>
            </div>
          </div>

          {/* Card 4: DIS : RD BUDGET vs ACTUAL - CURRENT MONTH */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 1.25rem 0', color: 'var(--text-main)' }}>
              DIS : RD BUDGET vs ACTUAL – CURRENT MONTH
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flex: 1 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                <div title={dr.actual_formula || "Formula: SUM(rd_actual) from dis_budget"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actual</span>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', cursor: 'help' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{ width: `${Math.min((dr.actual / drMax) * 100, 100)}%`, background: '#10b981', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', minWidth: '60px', transition: 'width 0.5s ease' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>{toMn(dr.actual)}</span>
                    </div>
                  </div>
                </div>
                <div title={dr.target_formula || "Formula: SUM(rd_target) from dis_budget"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target</span>
                    <span style={{ fontSize: '0.7rem', color: '#c8102e', cursor: 'help' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{ width: `${Math.min((dr.target / drMax) * 100, 100)}%`, background: '#c8102e', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', minWidth: '60px', transition: 'width 0.5s ease' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>{toMn(dr.target)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <CircularGauge percentage={dr.pct} variance={toMn(dr.variance)} size={130} activeColor="#f59e0b" inactiveColor="var(--bg-hover)" />
              </div>
            </div>
          </div>

        </div>

        {/* Right Tall Column: Card 5: ANNUAL BUDGET vs ACTUAL */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '440px' }}>
          <h3 style={{ fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 1.25rem 0', color: 'var(--text-main)', textAlign: 'center' }}>
            ANNUAL BUDGET vs ACTUAL
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1.5rem', height: '260px', width: '100%' }}>
              {/* Target Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }} title={an.target_formula || "Formula: SUM(total) from total_budget table"}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{toMnInt(an.target)}</span>
                <div style={{ width: '60px', height: `${Math.max((an.target / anMax) * 220, 10)}px`, background: '#c8102e', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target</span>
              </div>
              {/* Actual Bar with % badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative' }} title={an.actual_formula || "Formula: Full YTD Invoiced Sales Actual"}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>{toMnInt(an.actual)}</span>
                <div style={{ width: '60px', height: `${Math.max((an.actual / anMax) * 220, 10)}px`, background: '#10b981', borderRadius: '4px 4px 0 0', position: 'relative', transition: 'height 0.5s ease' }}>
                  {/* White floating badge with 335% */}
                  <div style={{
                    position: 'absolute', top: '40%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '0.35rem 0.85rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                    zIndex: 2,
                    border: '1px solid var(--border-color)'
                  }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#000000' }}>{an.pct}%</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>Actual</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardFyPage;
