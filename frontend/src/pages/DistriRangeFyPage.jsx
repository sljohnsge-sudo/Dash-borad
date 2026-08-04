import React, { useState } from 'react';
import { Calendar, BarChart2, RefreshCw, Settings, Search } from 'lucide-react';
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

const SAMPLE_DISTRI_RANGE_DATA = [
  { no: 1, division: 'AEROMED', p_tgt: 19825, p_act: 27185, p_pct: 137, rd_tgt: 21411, rd_act: 19291, rd_pct: 90, c_p_tgt: 78660, c_p_act: 89080, c_p_pct: 113, c_rd_tgt: 84694, c_rd_act: 79476, c_rd_pct: 94 },
  { no: 2, division: 'ALPAYA', p_tgt: 13784, p_act: 14780, p_pct: 107, rd_tgt: 17789, rd_act: 15424, rd_pct: 87, c_p_tgt: 54955, c_p_act: 53427, c_p_pct: 97, c_rd_tgt: 70924, c_rd_act: 60972, c_rd_pct: 86 },
  { no: 3, division: 'ALTIVON', p_tgt: 9850, p_act: 19724, p_pct: 200, rd_tgt: 10940, rd_act: 8349, rd_pct: 76, c_p_tgt: 35586, c_p_act: 34450, c_p_pct: 97, c_rd_tgt: 39637, c_rd_act: 27954, c_rd_pct: 71 },
  { no: 4, division: 'ARROWIL A1', p_tgt: 121142, p_act: 170829, p_pct: 141, rd_tgt: 130916, rd_act: 108653, rd_pct: 83, c_p_tgt: 522045, c_p_act: 687182, c_p_pct: 132, c_rd_tgt: 564158, c_rd_act: 575854, c_rd_pct: 102 },
  { no: 5, division: 'ARROWIL A2', p_tgt: 38484, p_act: 17768, p_pct: 46, rd_tgt: 41563, rd_act: 24307, rd_pct: 58, c_p_tgt: 151130, c_p_act: 128319, c_p_pct: 85, c_rd_tgt: 163221, c_rd_act: 128497, c_rd_pct: 79 },
  { no: 6, division: 'ARROWIL A3', p_tgt: 0, p_act: 0, p_pct: 0, rd_tgt: 0, rd_act: -13, rd_pct: 0, c_p_tgt: 0, c_p_act: 0, c_p_pct: 0, c_rd_tgt: 0, c_rd_act: -15, c_rd_pct: 0 },
  { no: 7, division: 'ARROWIL A4', p_tgt: 4371, p_act: 4698, p_pct: 107, rd_tgt: 5641, rd_act: 3975, rd_pct: 70, c_p_tgt: 17484, c_p_act: 20128, c_p_pct: 115, c_rd_tgt: 22564, c_rd_act: 19055, c_rd_pct: 84 },
  { no: 8, division: 'ARROWIL B1', p_tgt: 97163, p_act: 108226, p_pct: 111, rd_tgt: 104935, rd_act: 81978, rd_pct: 78, c_p_tgt: 388653, c_p_act: 413353, c_p_pct: 106, c_rd_tgt: 419741, c_rd_act: 358984, c_rd_pct: 86 },
  { no: 9, division: 'ARROWIL B2', p_tgt: 34854, p_act: 22116, p_pct: 63, rd_tgt: 37642, rd_act: 21730, rd_pct: 58, c_p_tgt: 139415, c_p_act: 96210, c_p_pct: 69, c_rd_tgt: 150568, c_rd_act: 113741, c_rd_pct: 76 },
  { no: 10, division: 'ARROWIL B7', p_tgt: 1800, p_act: 8181, p_pct: 454, rd_tgt: 1944, rd_act: 3588, rd_pct: 185, c_p_tgt: 7200, c_p_act: 8181, c_p_pct: 114, c_rd_tgt: 7776, c_rd_act: 3588, c_rd_pct: 46 },
  { no: 11, division: 'B BRAUN SUTURES', p_tgt: 0, p_act: 0, p_pct: 0, rd_tgt: 0, rd_act: 0, rd_pct: 0, c_p_tgt: 0, c_p_act: 0, c_p_pct: 0, c_rd_tgt: 0, c_rd_act: 0, c_rd_pct: 0 },
  { no: 12, division: 'BL DIVISION', p_tgt: 52448, p_act: 55788, p_pct: 106, rd_tgt: 56796, rd_act: 41553, rd_pct: 73, c_p_tgt: 209762, c_p_act: 211715, c_p_pct: 101, c_rd_tgt: 227151, c_rd_act: 183740, c_rd_pct: 81 },
  { no: 13, division: 'CENTAUR', p_tgt: 15808, p_act: 31177, p_pct: 197, rd_tgt: 17117, rd_act: 21345, rd_pct: 125, c_p_tgt: 63233, c_p_act: 109091, c_p_pct: 173, c_rd_tgt: 68292, c_rd_act: 93679, c_rd_pct: 137 },
  { no: 14, division: 'DENTAIDS - DENTAL DIVISION', p_tgt: 1689, p_act: 108, p_pct: 6, rd_tgt: 2142, rd_act: 642, rd_pct: 30, c_p_tgt: 6531, c_p_act: 1251, c_p_pct: 19, c_rd_tgt: 8429, c_rd_act: 3972, c_rd_pct: 47 },
  { no: 15, division: 'DIAGNOSTIC', p_tgt: 0, p_act: -1047, p_pct: 0, rd_tgt: 0, rd_act: 798, rd_pct: 0, c_p_tgt: 0, c_p_act: 4158, c_p_pct: 0, c_rd_tgt: 0, c_rd_act: 3770, c_rd_pct: 0 },
  { no: 16, division: 'DON VALLEY', p_tgt: 0, p_act: -154, p_pct: 0, rd_tgt: 0, rd_act: 14, rd_pct: 0, c_p_tgt: 0, c_p_act: -13, c_p_pct: 0, c_rd_tgt: 0, c_rd_act: 204, c_rd_pct: 0 },
  { no: 17, division: 'EYECARE', p_tgt: 0, p_act: -58, p_pct: 0, rd_tgt: 0, rd_act: 16, rd_pct: 0, c_p_tgt: 0, c_p_act: -743, c_p_pct: 0, c_rd_tgt: 0, c_rd_act: -822, c_rd_pct: 0 },
  { no: 18, division: 'FREDUN', p_tgt: 36522, p_act: 25742, p_pct: 70, rd_tgt: 39444, rd_act: 17690, rd_pct: 45, c_p_tgt: 156027, c_p_act: 90737, c_p_pct: 58, c_rd_tgt: 168509, c_rd_act: 84141, c_rd_pct: 50 },
  { no: 19, division: 'ICPA -DENTAL DIVISION', p_tgt: 18697, p_act: 16996, p_pct: 91, rd_tgt: 21852, rd_act: 13678, rd_pct: 63, c_p_tgt: 73863, c_p_act: 69504, c_p_pct: 94, c_rd_tgt: 86264, c_rd_act: 68950, c_rd_pct: 80 },
  { no: 20, division: 'LACTONOVA', p_tgt: 14186, p_act: 13508, p_pct: 95, rd_tgt: 17673, rd_act: 20275, p_pct: 115, c_p_tgt: 56742, c_p_act: 81493, c_p_pct: 144, c_rd_tgt: 70691, c_rd_act: 89767, c_rd_pct: 127 },
  { no: 21, division: 'LANMED', p_tgt: 14562, p_act: 5847, p_pct: 40, rd_tgt: 15747, rd_act: 6711, rd_pct: 43, c_p_tgt: 38670, c_p_act: 34284, c_p_pct: 89, c_rd_tgt: 41782, c_rd_act: 30962, c_rd_pct: 74 },
  { no: 22, division: 'LEPU', p_tgt: 0, p_act: 0, p_pct: 0, rd_tgt: 0, rd_act: 0, rd_pct: 0, c_p_tgt: 0, c_p_act: 0, c_p_pct: 0, c_rd_tgt: 0, c_rd_act: 0, c_rd_pct: 0 },
  { no: 23, division: 'MEDICAL EQUIPMENTS & WOUND CARE', p_tgt: 0, p_act: 0, p_pct: 0, rd_tgt: 0, rd_act: 0, rd_pct: 0, c_p_tgt: 0, c_p_act: 0, c_p_pct: 0, c_rd_tgt: 0, c_rd_act: 0, c_rd_pct: 0 },
  { no: 24, division: 'MEDOCHEMIE', p_tgt: 5170, p_act: 7784, p_pct: 151, rd_tgt: 5583, rd_act: 7404, rd_pct: 133, c_p_tgt: 20678, c_p_act: 24805, c_p_pct: 120, c_rd_tgt: 22332, c_rd_act: 20137, c_rd_pct: 90 },
];

const fmt = (v) => (v || 0).toLocaleString('en-US');

const DistriRangeFyPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('july');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredData = SAMPLE_DISTRI_RANGE_DATA.filter(d =>
    d.division.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 style={{ width: '24px', height: '24px', color: 'var(--gsh-red)' }} />
            DISTRI-Range wise fy (Primary & RD Division Breakdown)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Current Month and Cumulative Primary & RD Performance by Division.
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

      {/* Datatable Matching Image 3 Format */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              {/* Grouped Super Header Row */}
              <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase' }}>
                <th colSpan="2" style={{ padding: '0.65rem 0.85rem', borderRight: '1px solid var(--border-color)' }}>Division</th>
                <th colSpan="6" style={{ padding: '0.65rem 0.85rem', textAlign: 'center', borderRight: '1px solid var(--border-color)', background: 'rgba(6, 182, 212, 0.08)', color: '#06b6d4' }}>
                  Division wise Sales Update - Current Month
                </th>
                <th colSpan="6" style={{ padding: '0.65rem 0.85rem', textAlign: 'center', background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
                  Division wise Sales Update - Cumulative
                </th>
              </tr>
              {/* Sub-Header Row */}
              <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border-color)', fontSize: '0.725rem', fontWeight: 800, color: 'var(--text-subtle)' }}>
                <th style={{ padding: '0.5rem 0.75rem', width: '40px' }}>No</th>
                <th style={{ padding: '0.5rem 0.75rem', borderRight: '1px solid var(--border-color)' }}>Division Names</th>
                
                {/* Current Month */}
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Primary-Target</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Primary-Actual</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Pri - %</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>RD-Target</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>RD-Actual</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', borderRight: '1px solid var(--border-color)' }}>RD - %</th>

                {/* Cumulative */}
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Primary-Target</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Primary-Actual</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Pri : %</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>RD-Target</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>RD-Actual</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>RD : %</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.no} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: 'var(--gsh-red)' }}>{row.no}</td>
                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: 'var(--text-main)', borderRight: '1px solid var(--border-color)' }}>{row.division}</td>
                  
                  {/* Current Month Values */}
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>{fmt(row.p_tgt)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#06b6d4' }}>{fmt(row.p_act)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                    <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, background: row.p_pct >= 100 ? 'rgba(6,182,212,0.15)' : 'rgba(239,68,68,0.15)', color: row.p_pct >= 100 ? '#06b6d4' : '#ef4444' }}>
                      {row.p_pct}%
                    </span>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>{fmt(row.rd_tgt)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#3b82f6' }}>{fmt(row.rd_act)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', borderRight: '1px solid var(--border-color)' }}>
                    <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, background: row.rd_pct >= 100 ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', color: row.rd_pct >= 100 ? '#3b82f6' : '#f59e0b' }}>
                      {row.rd_pct}%
                    </span>
                  </td>

                  {/* Cumulative Values */}
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>{fmt(row.c_p_tgt)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#06b6d4' }}>{fmt(row.c_p_act)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                    <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, background: row.c_p_pct >= 100 ? 'rgba(6,182,212,0.15)' : 'rgba(239,68,68,0.15)', color: row.c_p_pct >= 100 ? '#06b6d4' : '#ef4444' }}>
                      {row.c_p_pct}%
                    </span>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>{fmt(row.c_rd_tgt)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#3b82f6' }}>{fmt(row.c_rd_act)}</td>
                  <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                    <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, background: row.c_rd_pct >= 100 ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', color: row.c_rd_pct >= 100 ? '#3b82f6' : '#f59e0b' }}>
                      {row.c_rd_pct}%
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

export default DistriRangeFyPage;
