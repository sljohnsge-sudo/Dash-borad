import React, { useState, useEffect } from 'react';
import { fetchInvoiceOutput } from '../services/api';
import KpiCard from '../components/KpiCard';
import { Search, FileText, DollarSign, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const InvoiceOutputPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(false);
    const result = await fetchInvoiceOutput(page, limit, search);
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
      {/* Title Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Invoice Output Report
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
          Historical invoiced sales records from <code style={{ background: 'var(--bg-hover)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>Invoice Output.csv</code> (19,046 Records)
        </p>
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

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <KpiCard 
          title="Total Net Amount"
          value={data ? `LKR ${formatCurrency(data.total_net_amount)}` : (error ? 'Offline' : 'Loading...')}
          subtext="Net Domestic Invoiced Amount"
          icon={DollarSign}
          accentColor="var(--gsh-red)"
        />
        <KpiCard 
          title="Total Invoice Rows"
          value={data ? `${data.total_count.toLocaleString()} Rows` : (error ? 'Offline' : 'Loading...')}
          subtext="Unique Invoiced Transactions"
          icon={FileText}
          accentColor="var(--gsh-teal)"
        />
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search style={{
            position: 'absolute',
            left: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
            color: 'var(--text-subtle)'
          }} />
          <input 
            type="text" 
            placeholder="Search Invoice No, Order No, Customer, Catalog No, Description..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.5rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main Datatable */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 700, position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Invoice No</th>
                <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Order No</th>
                <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', minWidth: '220px' }}>Customer Name</th>
                <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Catalog No</th>
                <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', minWidth: '200px' }}>Description</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Invoiced Qty</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Unit Price</th>
                <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Invoice Date</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap', color: 'var(--gsh-red)' }}>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading Invoice Output records...
                  </td>
                </tr>
              ) : data && data.rows && data.rows.length > 0 ? (
                data.rows.map((row, idx) => (
                  <tr 
                    key={row.id || idx}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background var(--transition-fast)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace', fontWeight: 600 }}>{row.invoice_no || '-'}</td>
                    <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace' }}>{row.order_no || '-'}</td>
                    <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>{row.delivery_customer_name || '-'}</td>
                    <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace' }}>{row.catalog_no || '-'}</td>
                    <td style={{ padding: '0.65rem 1rem' }}>{row.description || '-'}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>{row.invoiced_qty ?? '-'}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>{formatCurrency(row.calculated_unit_price)}</td>
                    <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-subtle)' }}>
                      {row.invoice_date ? row.invoice_date.split(' ')[0] : '-'}
                    </td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--gsh-red)' }}>
                      {formatCurrency(row.net_dom_amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {error ? 'Backend API offline. Please start backend with: python main.py' : 'No records matching search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Navigation Bar */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Left Side: Quick Row Count Selector Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
              Rows per page:
            </span>
            {[10, 50, 100, 200].map((count) => (
              <button
                key={count}
                onClick={() => handleLimitChange(count)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: limit === count ? 700 : 500,
                  cursor: 'pointer',
                  border: limit === count ? '1px solid var(--gsh-red)' : '1px solid var(--border-color)',
                  background: limit === count ? 'var(--gsh-red)' : 'var(--bg-primary)',
                  color: limit === count ? '#ffffff' : 'var(--text-main)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {count}
              </button>
            ))}
          </div>

          {/* Right Side: Page Indicator & Prev/Next Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {data && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Page <strong>{data.page}</strong> of <strong>{data.total_pages}</strong> ({data.total_count.toLocaleString()} total records)
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button 
                disabled={page <= 1 || loading || error}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} /> Prev
              </button>
              <button 
                disabled={!data || page >= data.total_pages || loading || error}
                onClick={() => setPage(prev => prev + 1)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
              >
                Next <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceOutputPage;
