import React, { useState } from 'react';
import { Calendar, Info, Layers, Settings, RefreshCw, Search } from 'lucide-react';
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

const SAMPLE_TOTAL_RANGE_DATA = [
  { no: 1, division: 'AEROMED', m_budget: 20796, m_actual: 27417, cur_pct: 132, c_budget: 79631, c_actual: 90438, cum_pct: 114, a_budget: 269237, a_actual: 90438, tot_pct: 34 },
  { no: 2, division: 'ALPAYA', m_budget: 14527, m_actual: 15930, cur_pct: 110, c_budget: 57927, c_actual: 58384, cum_pct: 101, a_budget: 173487, a_actual: 58384, tot_pct: 34 },
  { no: 3, division: 'ALTIVON', m_budget: 12242, m_actual: 20077, cur_pct: 164, c_budget: 41053, c_actual: 35113, cum_pct: 86, a_budget: 130189, a_actual: 35113, tot_pct: 27 },
  { no: 4, division: 'ARROWIL A1', m_budget: 129476, m_actual: 178110, cur_pct: 138, c_budget: 555380, c_actual: 735692, cum_pct: 132, a_budget: 1569372, a_actual: 735692, tot_pct: 47 },
  { no: 5, division: 'ARROWIL A2', m_budget: 18517, m_actual: 18517, cur_pct: 100, c_budget: 153697, c_actual: 132863, cum_pct: 86, a_budget: 455380, a_actual: 132863, tot_pct: 29 },
  { no: 6, division: 'ARROWIL A3', m_budget: 18, m_actual: 18, cur_pct: 100, c_budget: 2180, c_actual: 77, cum_pct: 4, a_budget: 6540, a_actual: 77, tot_pct: 1 },
  { no: 7, division: 'ARROWIL B1', m_budget: 124100, m_actual: 130840, cur_pct: 105, c_budget: 496739, c_actual: 528043, cum_pct: 106, a_budget: 1511097, a_actual: 528043, tot_pct: 35 },
  { no: 8, division: 'ARROWIL B2', m_budget: 36779, m_actual: 82081, cur_pct: 223, c_budget: 147116, c_actual: 186088, cum_pct: 126, a_budget: 515016, a_actual: 186088, tot_pct: 36 },
  { no: 9, division: 'ARROWIL B4', m_budget: 3480, m_actual: 985, cur_pct: 28, c_budget: 13920, c_actual: 76755, cum_pct: 551, a_budget: 204029, a_actual: 76755, tot_pct: 38 },
  { no: 10, division: 'ARROWIL B7', m_budget: 1800, m_actual: 8313, cur_pct: 462, c_budget: 7200, c_actual: 8313, cum_pct: 115, a_budget: 21600, a_actual: 8313, tot_pct: 38 },
  { no: 11, division: 'B BRAUN 3PL', m_budget: 58333, m_actual: 84307, cur_pct: 145, c_budget: 233333, c_actual: 308618, cum_pct: 132, a_budget: 700000, a_actual: 308618, tot_pct: 44 },
  { no: 12, division: 'B BRAUN HAEM & ACCESS PORTS', m_budget: 6644, m_actual: 7818, cur_pct: 118, c_budget: 25494, c_actual: 36128, cum_pct: 142, a_budget: 80506, a_actual: 36128, tot_pct: 45 },
  { no: 13, division: 'B BRAUN STENTS & CATHLAB', m_budget: 13255, m_actual: 18031, cur_pct: 136, c_budget: 51447, c_actual: 67839, cum_pct: 132, a_budget: 157517, a_actual: 67839, tot_pct: 43 },
  { no: 14, division: 'B BRAUN SUTURES', m_budget: 12000, m_actual: 14265, cur_pct: 119, c_budget: 41500, c_actual: 53061, cum_pct: 128, a_budget: 150000, a_actual: 53061, tot_pct: 35 },
  { no: 15, division: 'B BRAUN WOUND CARE', m_budget: 3822, m_actual: 5793, cur_pct: 152, c_budget: 15689, c_actual: 21812, cum_pct: 139, a_budget: 47904, a_actual: 21812, tot_pct: 46 },
  { no: 16, division: 'BL - MENARINI', m_budget: 55518, m_actual: 60513, cur_pct: 109, c_budget: 234149, c_actual: 233815, cum_pct: 100, a_budget: 689626, a_actual: 233815, tot_pct: 34 },
  { no: 17, division: 'CELLTRION - VIRCHOW', m_budget: 6700, m_actual: 1932, cur_pct: 29, c_budget: 21272, c_actual: 17149, cum_pct: 81, a_budget: 73843, a_actual: 17149, tot_pct: 23 },
  { no: 18, division: 'CENTAUR', m_budget: 15808, m_actual: 31446, cur_pct: 199, c_budget: 63233, c_actual: 113851, cum_pct: 180, a_budget: 208033, a_actual: 113851, tot_pct: 55 },
  { no: 19, division: 'DENTAL', m_budget: 25017, m_actual: 18800, cur_pct: 75, c_budget: 99271, c_actual: 101166, cum_pct: 102, a_budget: 296781, a_actual: 101166, tot_pct: 34 },
];

const fmt = (v) => (v || 0).toLocaleString('en-US');

const TotalRangeFyPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('july');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredData = SAMPLE_TOTAL_RANGE_DATA.filter(d => 
    d.division.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers style={{ width: '24px', height: '24px', color: 'var(--gsh-red)' }} />
            Total- Range wise fy (Division-wise Sales Update)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Monthly, Cumulative, and Annual Sales Breakdown by Division (Values in 000' LKR).
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

      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="Search Division Name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.45rem 0.75rem 0.45rem 2.4rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.825rem', outline: 'none' }}
          />
        </div>
      </div>

      {/* Datatable Matching Image 1 Format */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              {/* Grouped Super Header Row */}
              <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase' }}>
                <th colSpan="2" style={{ padding: '0.65rem 0.85rem', borderRight: '1px solid var(--border-color)' }}>Division</th>
                <th colSpan="3" style={{ padding: '0.65rem 0.85rem', textAlign: 'center', borderRight: '1px solid var(--border-color)', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>TOTAL - CURRENT MONTH DETAILS</th>
                <th colSpan="3" style={{ padding: '0.65rem 0.85rem', textAlign: 'center', borderRight: '1px solid var(--border-color)', background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>CUMULATIVE - SALES UPDATE</th>
                <th colSpan="3" style={{ padding: '0.65rem 0.85rem', textAlign: 'center', background: 'rgba(200, 16, 46, 0.08)', color: 'var(--gsh-red)' }}>ANNUAL - SALES UPDATE (Values 000')</th>
              </tr>
              {/* Sub-Header Row */}
              <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border-color)', fontSize: '0.725rem', fontWeight: 800, color: 'var(--text-subtle)' }}>
                <th style={{ padding: '0.5rem 0.75rem', width: '40px' }}>No</th>
                <th style={{ padding: '0.5rem 0.75rem', borderRight: '1px solid var(--border-color)' }}>DIVISION</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>MONTHLY-BUDGET</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>MONTHLY-ACTUAL</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', borderRight: '1px solid var(--border-color)' }}>CUR - %</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>CUM-BUDGET</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>CUM-ACTUAL</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', borderRight: '1px solid var(--border-color)' }}>CUM - %</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>ANNUAL-BUDGET</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>CUMULATIVE-ACTUAL</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>TOTAL - %</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.no} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: 'var(--gsh-red)' }}>{row.no}</td>
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: 'var(--text-main)', borderRight: '1px solid var(--border-color)' }}>{row.division}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>{fmt(row.m_budget)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{fmt(row.m_actual)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', borderRight: '1px solid var(--border-color)' }}>
                    <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, background: row.cur_pct >= 100 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: row.cur_pct >= 100 ? '#10b981' : '#ef4444' }}>
                      {row.cur_pct}%
                    </span>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>{fmt(row.c_budget)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#3b82f6' }}>{fmt(row.c_actual)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', borderRight: '1px solid var(--border-color)' }}>
                    <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, background: row.cum_pct >= 100 ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', color: row.cum_pct >= 100 ? '#3b82f6' : '#f59e0b' }}>
                      {row.cum_pct}%
                    </span>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>{fmt(row.a_budget)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>{fmt(row.a_actual)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                    <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, background: 'rgba(200,16,46,0.12)', color: 'var(--gsh-red)' }}>
                      {row.tot_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TotalRangeFyPage;
