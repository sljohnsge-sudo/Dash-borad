import React, { useState, useEffect } from 'react';
import { fetchDashboardFyOverview } from '../services/api';
import CircularGauge from '../components/common/CircularGauge';
import { AlertCircle, Calendar, Info } from 'lucide-react';

const MONTH_TABS = [
  { key: 'april', label: 'April-26' },
  { key: 'may', label: 'May-26' },
  { key: 'june', label: 'June-26' },
  { key: 'july', label: 'July-26' },
  { key: 'august', label: 'August-26' },
  { key: 'september', label: 'September-26' },
  { key: 'october', label: 'October-26' },
  { key: 'november', label: 'November-26' },
  { key: 'december', label: 'December-26' },
  { key: 'january', label: 'January-27' },
  { key: 'february', label: 'February-27' },
  { key: 'march', label: 'March-27' },
];

const DashboardFyPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('july');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(false);
    const result = await fetchDashboardFyOverview(selectedMonth);
    if (!result) {
      setError(true);
      setData(null);
    } else {
      setData(result);
    }
    setLoading(false);
  };

  // Re-fetch calculations dynamically when selectedMonth changes
  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth]);

  const toMn = (val) => {
    if (val === null || val === undefined) return '0.00 Mn';
    const mn = val / 1000000;
    return `${mn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mn`;
  };

  const toMnInt = (val) => {
    if (val === null || val === undefined) return '0 Mn';
    const mn = Math.round(val / 1000000);
    return `${mn.toLocaleString('en-US')} Mn`;
  };

  return (
    <div className="page-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Executive Dashboard FY 2026/27 Overview ({data?.month_label || 'July 2026'})
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Monthly Targets vs Actuals comparing <code style={{ background: 'var(--bg-hover)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>total_budget</code>, <code style={{ background: 'var(--bg-hover)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>dis_budget</code>, <code style={{ background: 'var(--bg-hover)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>invoice_output</code>, and <code style={{ background: 'var(--bg-hover)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>outstanding_output</code>
          </p>
        </div>

        {/* Hover Formula Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(0, 168, 150, 0.08)',
          padding: '0.4rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(0, 168, 150, 0.3)',
          fontSize: '0.8rem',
          color: 'var(--gsh-teal)'
        }}>
          <Info style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span>Hover over any bar to view exact database calculation formula!</span>
        </div>
      </div>

      {/* Top 12 Month Selector Bar */}
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
                minWidth: '95px',
                padding: '0.5rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                border: isActive ? '1px solid var(--gsh-red)' : '1px solid var(--border-color)',
                background: isActive ? 'var(--gsh-red)' : 'var(--bg-card)',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                fontWeight: isActive ? 800 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease-in-out',
                boxShadow: isActive ? '0 2px 8px rgba(200, 16, 46, 0.25)' : 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Backend Error Alert */}
      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(200, 16, 46, 0.08)',
          border: '1px solid rgba(200, 16, 46, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          color: 'var(--gsh-red)'
        }}>
          <AlertCircle style={{ width: '22px', height: '22px', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Backend Connection Failed</p>
            <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Cannot reach FastAPI server at <code style={{ background: 'rgba(255,255,255,0.7)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>http://localhost:8000</code>. Please run <code style={{ background: 'rgba(255,255,255,0.7)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>python main.py</code> inside your <code style={{ background: 'rgba(255,255,255,0.7)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>backend</code> directory.
            </p>
          </div>
        </div>
      )}

      {/* Responsive Main Layout Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 280px',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* Left 2x2 Monthly Budget Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem'
        }}>
          
          {/* Card 1: TOTAL BUDGET vs ACTUAL - CURRENT MONTH */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 1.25rem 0', color: 'var(--text-main)' }}>
              TOTAL BUDGET vs ACTUAL - CURRENT MONTH
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flex: 1 }}>
              {/* Horizontal Bar Chart */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                {/* Actual Bar with Hover Tooltip */}
                <div title={data?.total_budget?.actual_formula || "Formula: invoice_output.net_dom_amount + outstanding_output.backlog_value_base_curr"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actual</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gsh-teal)' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{
                      width: `${Math.min(((data?.total_budget?.actual || 1253580000) / 1500000000) * 100, 100)}%`,
                      background: '#10b981',
                      height: '100%',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0.5rem',
                      minWidth: '60px'
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {toMn(data?.total_budget?.actual || 1253580000)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Bar with Hover Tooltip */}
                <div title={data?.total_budget?.target_formula || "Formula: SUM(month_col) from total_budget table"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gsh-red)' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{
                      width: `${Math.min(((data?.total_budget?.target || 1092090000) / 1500000000) * 100, 100)}%`,
                      background: 'var(--gsh-red)',
                      height: '100%',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0.5rem',
                      minWidth: '60px'
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {toMn(data?.total_budget?.target || 1092090000)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Circular Gauge */}
              <CircularGauge 
                percentage={data?.total_budget?.pct ?? 115} 
                variance={toMn(data?.total_budget?.variance ?? 161490000)} 
                activeColor="#10b981"
                size={130} 
              />
            </div>
          </div>

          {/* Card 2: DIRECT BUDGET vs ACTUAL - CURRENT MONTH */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 1.25rem 0', color: 'var(--text-main)' }}>
              DIRECT BUDGET vs ACTUAL - CURRENT MONTH
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flex: 1 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                {/* Actual Bar */}
                <div title={data?.direct_budget?.actual_formula || "Formula: Direct Sales Invoiced Net Amount"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actual</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gsh-teal)' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{
                      width: `${Math.min(((data?.direct_budget?.actual || 473690000) / 600000000) * 100, 100)}%`,
                      background: '#10b981',
                      height: '100%',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0.5rem',
                      minWidth: '60px'
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {toMn(data?.direct_budget?.actual || 473690000)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Bar */}
                <div title={data?.direct_budget?.target_formula || "Formula: Direct Sales Allocated Target"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gsh-red)' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{
                      width: `${Math.min(((data?.direct_budget?.target || 338680000) / 600000000) * 100, 100)}%`,
                      background: 'var(--gsh-red)',
                      height: '100%',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0.5rem',
                      minWidth: '60px'
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {toMn(data?.direct_budget?.target || 338680000)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <CircularGauge 
                percentage={data?.direct_budget?.pct ?? 140} 
                variance={toMn(data?.direct_budget?.variance ?? 135020000)} 
                activeColor="#10b981"
                size={130} 
              />
            </div>
          </div>

          {/* Card 3: DIS : PRI BUDGET vs ACTUAL - CURRENT MONTH */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 1.25rem 0', color: 'var(--text-main)' }}>
              DIS : PRI BUDGET vs ACTUAL - CURRENT MONTH
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flex: 1 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                {/* Actual Bar */}
                <div title={data?.dis_pri?.actual_formula || "Formula: SUM(primary_actual) from dis_budget"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actual</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gsh-teal)' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{
                      width: `${Math.min(((data?.dis_pri?.actual || 779880000) / 900000000) * 100, 100)}%`,
                      background: '#10b981',
                      height: '100%',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0.5rem',
                      minWidth: '60px'
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {toMn(data?.dis_pri?.actual || 779880000)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Bar */}
                <div title={data?.dis_pri?.target_formula || "Formula: SUM(primary_target) from dis_budget"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gsh-red)' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{
                      width: `${Math.min(((data?.dis_pri?.target || 753410000) / 900000000) * 100, 100)}%`,
                      background: 'var(--gsh-red)',
                      height: '100%',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0.5rem',
                      minWidth: '60px'
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {toMn(data?.dis_pri?.target || 753410000)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <CircularGauge 
                percentage={data?.dis_pri?.pct ?? 104} 
                variance={toMn(data?.dis_pri?.variance ?? 26470000)} 
                activeColor="#10b981"
                size={130} 
              />
            </div>
          </div>

          {/* Card 4: DIS : RD BUDGET vs ACTUAL - CURRENT MONTH */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 1.25rem 0', color: 'var(--text-main)' }}>
              DIS : RD BUDGET vs ACTUAL - CURRENT MONTH
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flex: 1 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                {/* Actual Bar */}
                <div title={data?.dis_rd?.actual_formula || "Formula: SUM(rd_actual) from dis_budget"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actual</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gsh-teal)' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{
                      width: `${Math.min(((data?.dis_rd?.actual || 645450000) / 1000000000) * 100, 100)}%`,
                      background: '#10b981',
                      height: '100%',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0.5rem',
                      minWidth: '60px'
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {toMn(data?.dis_rd?.actual || 645450000)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Bar */}
                <div title={data?.dis_rd?.target_formula || "Formula: SUM(rd_target) from dis_budget"}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.35rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gsh-red)' }}>Hover for Formula</span>
                  </div>
                  <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: '4px', height: '36px', display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <div style={{
                      width: `${Math.min(((data?.dis_rd?.target || 839740000) / 1000000000) * 100, 100)}%`,
                      background: 'var(--gsh-red)',
                      height: '100%',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0.5rem',
                      minWidth: '60px'
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {toMn(data?.dis_rd?.target || 839740000)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <CircularGauge 
                percentage={data?.dis_rd?.pct ?? 77} 
                variance={toMn(data?.dis_rd?.variance ?? -194290000)} 
                activeColor="#f59e0b"
                size={130} 
              />
            </div>
          </div>

        </div>

        {/* Right Column: ANNUAL BUDGET vs ACTUAL Vertical Bar Chart */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 1.5rem 0', color: 'var(--text-main)', textAlign: 'center' }}>
            ANNUAL BUDGET vs ACTUAL
          </h3>

          {/* Vertical Bar Chart Container */}
          <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '1rem', minHeight: '300px' }}>
            
            {/* Chart Area */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2rem', height: '300px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', position: 'relative' }}>
              
              {/* Target Vertical Column */}
              <div 
                title={data?.annual?.target_formula || "Formula: SUM(total) from total_budget table"}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '65px', cursor: 'help' }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  {toMnInt(data?.annual?.target || 13554000000)}
                </span>
                <div style={{
                  width: '100%',
                  height: '85%',
                  background: 'var(--gsh-red)',
                  borderRadius: '6px 6px 0 0'
                }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-subtle)' }}>Target</span>
              </div>

              {/* Achievement Badge */}
              <div style={{
                position: 'absolute',
                top: '55%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.2rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                background: 'var(--bg-card)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 2
              }}>
                {data?.annual?.pct ?? 38}%
              </div>

              {/* Actual Vertical Column */}
              <div 
                title={data?.annual?.actual_formula || "Formula: Full YTD Invoiced Sales Actual"}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '65px', cursor: 'help' }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#10b981', whiteSpace: 'nowrap' }}>
                  {toMnInt(data?.annual?.actual || 5217000000)}
                </span>
                <div style={{
                  width: '100%',
                  height: '42%',
                  background: '#10b981',
                  borderRadius: '6px 6px 0 0'
                }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '0.5rem', color: '#10b981' }}>Actual</span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardFyPage;
