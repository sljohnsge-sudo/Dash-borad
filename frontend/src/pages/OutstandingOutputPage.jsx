import React, { useState, useEffect } from 'react';
import { fetchOutstandingOutput } from '../services/api';
import KpiCard from '../components/KpiCard';
import { Search, Truck, DollarSign, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { ExcelColHeader, ExcelRowNum, ExcelRowHeader } from '../components/ExcelTableHeader';

const COLUMNS = [
  { col: 'B', label: 'Customer No' },
  { col: 'C', label: 'Customer Name', minWidth: '200px' },
  { col: 'D', label: 'Order No' },
  { col: 'I', label: 'Catalog No' },
  { col: 'J', label: 'Description', minWidth: '180px' },
  { col: 'K', label: 'Qty Due', align: 'right' },
  { col: 'M', label: 'Unit Price', align: 'right' },
  { col: 'N', label: 'Delivery Date' },
  { col: 'O', label: 'Backlog Value', align: 'right' },
];

const OutstandingOutputPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(false);
    const result = await fetchOutstandingOutput(page, limit, search);
    if (!result) {
      setError(true);
      setData(null);
    } else {
      setData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [page, limit, search]);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0.00';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className="page-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Outstanding Output Report
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
          Outstanding orders and backlog from <code style={{ background: 'var(--bg-hover)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>Outstanding Output.csv</code> (170 Records) — Excel-style column references (A, B, C...)
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', background: 'rgba(200, 16, 46, 0.08)', border: '1px solid rgba(200, 16, 46, 0.3)', display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--gsh-red)' }}>
          <AlertCircle style={{ width: '22px', height: '22px', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Backend Connection Failed</p>
            <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)' }}>Cannot reach <code>http://localhost:8000</code>. Run <code>python main.py</code> inside <code>backend/</code>.</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <KpiCard
          title="Total Backlog Value"
          value={data ? `LKR ${formatCurrency(data.total_backlog_value)}` : (error ? 'Offline' : 'Loading...')}
          subtext="Total Outstanding Order Backlog (Col O)"
          icon={DollarSign}
          accentColor="#3b82f6"
        />
        <KpiCard
          title="Total Backlog Orders"
          value={data ? `${data.total_count.toLocaleString()} Orders` : (error ? 'Offline' : 'Loading...')}
          subtext="Active Pending Order Lines"
          icon={Truck}
          accentColor="var(--gsh-gold)"
        />
      </div>

      <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="Search Customer No (B), Customer Name (C), Order No (D), Catalog No (I), Description (J)..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Main Datatable with Excel-Style Headers */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <ExcelRowHeader />
                {COLUMNS.map(c => (
                  <ExcelColHeader key={c.col} col={c.col} label={c.label} align={c.align} minWidth={c.minWidth} />
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={COLUMNS.length + 1} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Outstanding Output records...</td></tr>
              ) : data && data.rows && data.rows.length > 0 ? (
                data.rows.map((row, idx) => {
                  const rowNum = (page - 1) * limit + idx + 1;
                  return (
                    <tr
                      key={row.id || idx}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background var(--transition-fast)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <ExcelRowNum num={rowNum} />
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace' }}>{row.customer_no || '-'}</td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>{row.customer_name || '-'}</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace', fontWeight: 600 }}>{row.order_no || '-'}</td>
                      <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace' }}>{row.catalog_no || '-'}</td>
                      <td style={{ padding: '0.65rem 1rem' }}>{row.catalog_desc || '-'}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>{row.buy_qty_due ?? '-'}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>{formatCurrency(row.calculated_unit_price)}</td>
                      <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-subtle)' }}>{row.planned_delivery_date ? row.planned_delivery_date.split(' ')[0] : '-'}</td>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700, color: '#3b82f6' }}>{formatCurrency(row.backlog_value_base_curr)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={COLUMNS.length + 1} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {error ? 'Backend offline.' : 'No records matching search criteria.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Rows per page:</span>
            {[10, 50, 100, 200].map((count) => (
              <button key={count} onClick={() => handleLimitChange(count)}
                style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: limit === count ? 700 : 500, cursor: 'pointer', border: limit === count ? '1px solid var(--gsh-red)' : '1px solid var(--border-color)', background: limit === count ? 'var(--gsh-red)' : 'var(--bg-primary)', color: limit === count ? '#ffffff' : 'var(--text-main)', transition: 'all 0.2s ease-in-out' }}>
                {count}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {data && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page <strong>{data.page}</strong> of <strong>{data.total_pages}</strong> ({data.total_count.toLocaleString()} records)</span>}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button disabled={page <= 1 || loading || error} onClick={() => setPage(p => Math.max(p - 1, 1))} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                <ChevronLeft style={{ width: '16px', height: '16px' }} /> Prev
              </button>
              <button disabled={!data || page >= data.total_pages || loading || error} onClick={() => setPage(p => p + 1)} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                Next <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutstandingOutputPage;
