import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, PieChart, TrendingUp, Activity, LayoutGrid,
  Plus, Trash2, Settings, Save, Play, Database,
  CheckCircle, AlertCircle, Loader, ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// ─── Constants & Fallback Templates ──────────────────────────────────────────

const CHART_TYPES = [
  { value: 'horizontal_bar', label: 'Horizontal Bar', icon: '▬' },
  { value: 'vertical_bar', label: 'Vertical Bar', icon: '▮' },
  { value: 'circular_gauge', label: 'Ring Gauge', icon: '◎' },
  { value: 'kpi_card', label: 'KPI Stat Card', icon: '▣' },
];

const ACCENT_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#c8102e', '#00a896',
];

const DEFAULT_TEMPLATE_CHARTS = [
  {
    chart_id: 'total_budget_vs_actual',
    chart_title: 'TOTAL BUDGET vs ACTUAL',
    chart_type: 'horizontal_bar',
    target_formula: 'SUM(total_budget.L)',
    actual_formula: 'SUM(invoice_output.P) + SUM(outstanding_output.O)',
    grid_row: 0, grid_col: 0, grid_span_cols: 1, grid_span_rows: 1,
    color_actual: '#10b981', color_target: '#c8102e',
    target_value: 1092090000.0, actual_value: 1200681486.76, pct: 110, variance: 108591486.76
  },
  {
    chart_id: 'direct_budget_vs_actual',
    chart_title: 'DIRECT BUDGET vs ACTUAL',
    chart_type: 'horizontal_bar',
    target_formula: 'SUM(total_budget.L) * 0.31',
    actual_formula: 'SUM(invoice_output.P) * 0.37',
    grid_row: 0, grid_col: 1, grid_span_cols: 1, grid_span_rows: 1,
    color_actual: '#10b981', color_target: '#c8102e',
    target_value: 338680000.0, actual_value: 473690000.0, pct: 140, variance: 135010000.0
  },
  {
    chart_id: 'dis_pri_budget_vs_actual',
    chart_title: 'DIS : PRI BUDGET vs ACTUAL',
    chart_type: 'horizontal_bar',
    target_formula: 'SUM(dis_budget.F)',
    actual_formula: 'SUM(dis_budget.G)',
    grid_row: 1, grid_col: 0, grid_span_cols: 1, grid_span_rows: 1,
    color_actual: '#10b981', color_target: '#c8102e',
    target_value: 753410000.0, actual_value: 779880000.0, pct: 104, variance: 26470000.0
  },
  {
    chart_id: 'dis_rd_budget_vs_actual',
    chart_title: 'DIS : RD BUDGET vs ACTUAL',
    chart_type: 'horizontal_bar',
    target_formula: 'SUM(dis_budget.H)',
    actual_formula: 'SUM(dis_budget.I)',
    grid_row: 1, grid_col: 1, grid_span_cols: 1, grid_span_rows: 1,
    color_actual: '#f59e0b', color_target: '#c8102e',
    target_value: 839740000.0, actual_value: 645450000.0, pct: 77, variance: -194290000.0
  },
  {
    chart_id: 'annual_budget_vs_actual',
    chart_title: 'ANNUAL BUDGET vs ACTUAL',
    chart_type: 'vertical_bar',
    target_formula: 'SUM(total_budget.U)',
    actual_formula: 'SUM(invoice_output.P)',
    grid_row: 0, grid_col: 2, grid_span_cols: 1, grid_span_rows: 2,
    color_actual: '#10b981', color_target: '#c8102e',
    target_value: 1555200000.0, actual_value: 5217000000.0, pct: 335, variance: 3661800000.0
  }
];

const DEFAULT_SCHEMA = {
  invoice_output: [
    { col: 'F', field: 'invoice_no', label: 'Invoice No', numeric: false },
    { col: 'R', field: 'order_no', label: 'Order No', numeric: false },
    { col: 'C', field: 'delivery_customer_name', label: 'Customer Name', numeric: false },
    { col: 'K', field: 'invoiced_qty', label: 'Invoiced Qty', numeric: true },
    { col: 'N', field: 'calculated_unit_price', label: 'Unit Price', numeric: true },
    { col: 'P', field: 'net_dom_amount', label: 'Net Domestic Amount', numeric: true }
  ],
  outstanding_output: [
    { col: 'B', field: 'customer_no', label: 'Customer No', numeric: false },
    { col: 'D', field: 'order_no', label: 'Order No', numeric: false },
    { col: 'K', field: 'buy_qty_due', label: 'Qty Due', numeric: true },
    { col: 'M', field: 'calculated_unit_price', label: 'Unit Price', numeric: true },
    { col: 'O', field: 'backlog_value_base_curr', label: 'Backlog Value', numeric: true }
  ],
  total_budget: [
    { col: 'C', field: 'cost_center', label: 'Cost Center', numeric: false },
    { col: 'G', field: 'product_sku', label: 'Product SKU', numeric: false },
    { col: 'I', field: 'april', label: 'April', numeric: true },
    { col: 'J', field: 'may', label: 'May', numeric: true },
    { col: 'K', field: 'june', label: 'June', numeric: true },
    { col: 'L', field: 'july', label: 'July', numeric: true },
    { col: 'M', field: 'august', label: 'August', numeric: true },
    { col: 'U', field: 'total', label: 'Total Budget', numeric: true }
  ],
  dis_budget: [
    { col: 'B', field: 'month', label: 'Month', numeric: false },
    { col: 'D', field: 'product', label: 'Product', numeric: false },
    { col: 'F', field: 'primary_target', label: 'Primary Target', numeric: true },
    { col: 'G', field: 'primary_actual', label: 'Primary Actual', numeric: true },
    { col: 'H', field: 'rd_target', label: 'RD Target', numeric: true },
    { col: 'I', field: 'rd_actual', label: 'RD Actual', numeric: true }
  ]
};

// ─── Formula Input with Column Browser ─────────────────────────────────────

const FormulaInput = ({ value, onChange, schema, label, colorHint }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(Object.keys(schema)[0] || 'invoice_output');

  const insert = (table, col) => {
    const token = `SUM(${table}.${col})`;
    onChange(prev => prev ? `${prev} + ${token}` : token);
  };

  return (
    <div style={{ marginBottom: '0.85rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: colorHint || 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. SUM(invoice_output.P) + SUM(outstanding_output.O)"
          style={{ flex: 1, padding: '0.5rem 0.65rem', background: 'var(--bg-primary)', border: `1.5px solid ${colorHint || 'var(--border-color)'}`, borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.78rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
        />
        <button onClick={() => setOpen(o => !o)} style={{ padding: '0.5rem 0.6rem', background: open ? colorHint || 'var(--gsh-red)' : 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: open ? '#fff' : 'var(--text-main)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Database style={{ width: '13px', height: '13px' }} /> Cols
        </button>
      </div>

      {open && (
        <div style={{ marginTop: '0.4rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', padding: '0.65rem', maxHeight: '220px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {Object.keys(schema).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '0.2rem 0.45rem', fontSize: '0.68rem', fontWeight: tab === t ? 700 : 500, border: tab === t ? `1px solid ${colorHint || '#c8102e'}` : '1px solid var(--border-color)', background: tab === t ? (colorHint || '#c8102e') : 'var(--bg-primary)', color: tab === t ? '#fff' : 'var(--text-main)', borderRadius: 'var(--radius-xs)', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {(schema[tab] || []).filter(c => c.numeric).map(col => (
              <button key={col.col} onClick={() => insert(tab, col.col)} title={`Insert SUM(${tab}.${col.col}) — ${col.label}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.45rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                <span style={{ minWidth: '18px', height: '18px', background: colorHint || '#10b981', color: '#fff', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{col.col}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-main)', fontFamily: 'monospace', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Chart Section Preview Card ─────────────────────────────────────────────

const SectionPreview = ({ chart, selected, onClick }) => {
  const { chart_title, chart_type, target_value = 0, actual_value = 0, pct = 0, variance = 0, color_actual = '#10b981', color_target = '#c8102e' } = chart;
  const toMn = v => `${(v / 1_000_000).toFixed(2)} Mn`;
  const maxVal = Math.max(target_value, actual_value) * 1.1 || 1;

  return (
    <div onClick={onClick} style={{
      border: selected ? '2px solid var(--gsh-red)' : '1px solid var(--border-color)',
      borderRadius: 'var(--radius-sm)',
      background: selected ? 'rgba(200,16,46,0.04)' : 'var(--bg-card)',
      padding: '0.85rem',
      cursor: 'pointer',
      transition: 'all 0.15s',
      gridColumn: `span ${Math.min(chart.grid_span_cols || 1, 3)}`,
      gridRow: `span ${chart.grid_span_rows || 1}`,
      position: 'relative',
      boxShadow: selected ? '0 0 0 3px rgba(200,16,46,0.15)' : 'var(--shadow-sm)',
      minHeight: chart.grid_span_rows > 1 ? '240px' : '150px',
    }}>
      {selected && (
        <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'var(--gsh-red)', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '0.12rem 0.4rem', borderRadius: '10px' }}>✏️ Editing</div>
      )}

      <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-main)', marginBottom: '0.65rem' }}>{chart_title}</div>

      {chart_type === 'vertical_bar' ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1rem', height: '90px' }}>
          {[{ v: target_value, c: color_target, l: 'Target' }, { v: actual_value, c: color_actual, l: 'Actual' }].map(({ v, c, l }) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: c }}>{toMn(v)}</span>
              <div style={{ width: '28px', height: `${Math.max((v / maxVal) * 80, 4)}px`, background: c, borderRadius: '3px 3px 0 0' }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-subtle)' }}>{l}</span>
            </div>
          ))}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 900 }}>{pct}%</span>
          </div>
        </div>
      ) : chart_type === 'kpi_card' ? (
        <div style={{ textAlign: 'center', padding: '0.25rem' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: color_actual }}>{toMn(actual_value)}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Target: {toMn(target_value)} | {pct}%</div>
        </div>
      ) : (
        /* Horizontal bars */
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
            {[{ v: actual_value, c: color_actual, l: 'Actual' }, { v: target_value, c: color_target, l: 'Target' }].map(({ v, c, l }) => (
              <div key={l}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-subtle)', marginBottom: '0.15rem' }}>{l}</div>
                <div style={{ background: 'var(--bg-hover)', borderRadius: '3px', height: '18px' }}>
                  <div style={{ width: `${Math.min((v / maxVal) * 100, 100)}%`, background: c, height: '100%', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.3rem', minWidth: '40px' }}>
                    <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>{toMn(v)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: '0.62rem', color: 'var(--text-subtle)', textAlign: 'right' }}>
              {pct}% | Var: <span style={{ color: variance >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{toMn(variance)}</span>
            </div>
          </div>
          {/* Mini gauge */}
          <div style={{ flexShrink: 0, width: '56px', height: '56px', position: 'relative' }}>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="var(--bg-hover)" strokeWidth="6" />
              <circle cx="28" cy="28" r="22" fill="none" stroke={color_actual} strokeWidth="6"
                strokeDasharray={2 * Math.PI * 22} strokeDashoffset={2 * Math.PI * 22 * (1 - Math.min(pct, 100) / 100)}
                strokeLinecap="round" transform="rotate(-90 28 28)" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-main)' }}>{pct}%</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Dashboard Create Page ───────────────────────────────────────────────────

const DashboardCreatePage = () => {
  const navigate = useNavigate();
  const [schema, setSchema] = useState(DEFAULT_SCHEMA);
  const [charts, setCharts] = useState(DEFAULT_TEMPLATE_CHARTS);
  const [selectedId, setSelectedId] = useState('total_budget_vs_actual');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const [form, setForm] = useState({
    chart_id: DEFAULT_TEMPLATE_CHARTS[0].chart_id,
    chart_title: DEFAULT_TEMPLATE_CHARTS[0].chart_title,
    chart_type: DEFAULT_TEMPLATE_CHARTS[0].chart_type,
    target_formula: DEFAULT_TEMPLATE_CHARTS[0].target_formula,
    actual_formula: DEFAULT_TEMPLATE_CHARTS[0].actual_formula,
    grid_row: 0, grid_col: 0, grid_span_cols: 1, grid_span_rows: 1,
    color_actual: '#10b981', color_target: '#c8102e',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelect = useCallback((chart) => {
    setSelectedId(chart.chart_id);
    setTestResult(null);
    setForm({
      chart_id: chart.chart_id,
      chart_title: chart.chart_title,
      chart_type: chart.chart_type || 'horizontal_bar',
      target_formula: chart.target_formula || '',
      actual_formula: chart.actual_formula || '',
      grid_row: chart.grid_row ?? 0,
      grid_col: chart.grid_col ?? 0,
      grid_span_cols: chart.grid_span_cols ?? 1,
      grid_span_rows: chart.grid_span_rows ?? 1,
      color_actual: chart.color_actual || '#10b981',
      color_target: chart.color_target || '#c8102e',
    });
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [schemaRes, chartsRes] = await Promise.all([
        api.get('/custom-dashboard/schema').catch(() => null),
        api.get('/custom-dashboard/computed-chart-data').catch(() => null),
      ]);

      if (schemaRes?.data?.tables && Object.keys(schemaRes.data.tables).length > 0) {
        setSchema(schemaRes.data.tables);
      }

      if (chartsRes?.data?.charts && chartsRes.data.charts.length > 0) {
        setCharts(chartsRes.data.charts);
        handleSelect(chartsRes.data.charts[0]);
      } else {
        setCharts(DEFAULT_TEMPLATE_CHARTS);
        handleSelect(DEFAULT_TEMPLATE_CHARTS[0]);
      }
    } catch {
      setCharts(DEFAULT_TEMPLATE_CHARTS);
      handleSelect(DEFAULT_TEMPLATE_CHARTS[0]);
    }
  }, [handleSelect]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleAddNew = () => {
    const newId = `chart_${Date.now()}`;
    const newChart = {
      chart_id: newId, chart_title: 'New Section', chart_type: 'horizontal_bar',
      target_formula: 'SUM(total_budget.L)', actual_formula: 'SUM(invoice_output.P)',
      grid_row: charts.length, grid_col: 0, grid_span_cols: 1, grid_span_rows: 1,
      color_actual: '#10b981', color_target: '#c8102e',
      target_value: 100000000, actual_value: 120000000, pct: 120, variance: 20000000,
    };
    setCharts(prev => [...prev, newChart]);
    handleSelect(newChart);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const [tRes, aRes] = await Promise.all([
        api.post('/custom-dashboard/evaluate', { formula: form.target_formula }),
        api.post('/custom-dashboard/evaluate', { formula: form.actual_formula }),
      ]);
      const t = tRes.data.result || 0;
      const a = aRes.data.result || 0;
      const pct = t ? Math.round((a / t) * 100) : 0;
      setTestResult({ target: t, actual: a, pct, variance: a - t });
      showToast(`✅ Formula OK — Actual: ${(a / 1_000_000).toFixed(2)} Mn | Target: ${(t / 1_000_000).toFixed(2)} Mn`, 'success');
    } catch {
      showToast('Formula evaluation failed.', 'error');
    }
    setTesting(false);
  };

  const handleSave = async () => {
    if (!form.chart_id || !form.chart_title) {
      showToast('Chart ID and Title are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/custom-dashboard/charts', form);
      showToast('✅ Saved! Dashboard FY is updated.', 'success');
      await loadAll();
    } catch {
      showToast('Save failed.', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (chartId) => {
    if (!window.confirm('Delete this chart section?')) return;
    try {
      await api.delete(`/custom-dashboard/charts/${chartId}`);
      showToast('Chart deleted.', 'success');
      await loadAll();
    } catch {
      showToast('Delete failed.', 'error');
    }
  };

  const sortedCharts = [...charts].sort((a, b) => {
    if ((a.grid_row || 0) !== (b.grid_row || 0)) return (a.grid_row || 0) - (b.grid_row || 0);
    return (a.grid_col || 0) - (b.grid_col || 0);
  });

  return (
    <div className="page-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)', background: toast.type === 'success' ? '#10b981' : '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '420px' }}>
          {toast.type === 'success' ? <CheckCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} /> : <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutGrid style={{ width: '24px', height: '24px', color: 'var(--gsh-red)' }} />
            Dashboard Create Page — Studio
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Click any section on the right to edit its formulas, chart types, and layout. All changes sync to <strong>Dashboard FY</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/dashboard-fy')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> View Dashboard FY
          </button>
          <button onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(200,16,46,0.25)' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Add New Chart Section
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0,1fr)', gap: '1.25rem', alignItems: 'start' }}>

        {/* Left Config Form Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Settings style={{ width: '15px', height: '15px', color: 'var(--gsh-red)' }} />
                Configure: {form.chart_title}
              </span>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Chart Section Title</label>
              <input value={form.chart_title} onChange={e => setForm(f => ({ ...f, chart_title: e.target.value }))}
                style={{ width: '100%', padding: '0.45rem 0.6rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Chart Type */}
            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Chart Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
                {CHART_TYPES.map(t => (
                  <button key={t.value} onClick={() => setForm(f => ({ ...f, chart_type: t.value }))}
                    style={{ padding: '0.4rem 0.5rem', fontSize: '0.72rem', fontWeight: form.chart_type === t.value ? 700 : 500, border: form.chart_type === t.value ? '1.5px solid var(--gsh-red)' : '1px solid var(--border-color)', background: form.chart_type === t.value ? 'rgba(200,16,46,0.07)' : 'var(--bg-primary)', color: 'var(--text-main)', borderRadius: 'var(--radius-xs)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '1rem' }}>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Position */}
            <div style={{ marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Grid Layout (Row · Col · Span Cols · Span Rows)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem' }}>
                {[['grid_row','Row'],['grid_col','Col'],['grid_span_cols','Cols'],['grid_span_rows','Rows']].map(([key, label]) => (
                  <div key={key}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', marginBottom: '0.15rem' }}>{label}</div>
                    <input type="number" min="0" max="8" value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value, 10) || 0 }))}
                      style={{ width: '100%', padding: '0.35rem 0.4rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', textAlign: 'center', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>Colors</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[['color_actual', 'Actual Color'], ['color_target', 'Target Color']].map(([key, lbl]) => (
                  <div key={key}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>{lbl}</div>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {ACCENT_COLORS.map(c => (
                        <button key={c} onClick={() => setForm(f => ({ ...f, [key]: c }))}
                          style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: form[key] === c ? '2.5px solid var(--text-main)' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Database style={{ width: '14px', height: '14px', color: 'var(--gsh-teal)' }} /> Excel-Style Formula Builder
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '0.3rem 0.5rem', borderRadius: '4px', marginBottom: '0.6rem' }}>
                📊 Use <code style={{ fontFamily: 'monospace' }}>SUM(table.Col)</code> — e.g. <code style={{ fontFamily: 'monospace' }}>SUM(invoice_output.P) + SUM(outstanding_output.O)</code>
              </div>

              <FormulaInput
                label="📌 Actual Formula (Green Bar)"
                value={form.actual_formula}
                onChange={v => setForm(f => ({ ...f, actual_formula: typeof v === 'function' ? v(f.actual_formula) : v }))}
                schema={schema} colorHint={form.color_actual}
              />
              <FormulaInput
                label="🎯 Target Formula (Red Bar)"
                value={form.target_formula}
                onChange={v => setForm(f => ({ ...f, target_formula: typeof v === 'function' ? v(f.target_formula) : v }))}
                schema={schema} colorHint={form.color_target}
              />
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div style={{ marginBottom: '0.65rem', padding: '0.5rem 0.65rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.25rem' }}>✅ Formula Test Result</div>
                <div>Actual: <strong>{(testResult.actual / 1_000_000).toFixed(2)} Mn</strong></div>
                <div>Target: <strong>{(testResult.target / 1_000_000).toFixed(2)} Mn</strong></div>
                <div>Achievement: <strong style={{ color: testResult.pct >= 100 ? '#10b981' : '#f59e0b' }}>{testResult.pct}%</strong></div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleTest} disabled={testing}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.6rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.78rem', cursor: testing ? 'not-allowed' : 'pointer' }}>
                {testing ? <Loader style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> : '▶'} Test
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.6rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: 'var(--radius-xs)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(200,16,46,0.2)' }}>
                {saving ? <Loader style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '13px', height: '13px' }} />} Save & Sync FY
              </button>
            </div>
          </div>

          {/* Delete Button */}
          {selectedId && (
            <button onClick={() => handleDelete(selectedId)}
              style={{ width: '100%', padding: '0.55rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: '#ef4444', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Trash2 style={{ width: '15px', height: '15px' }} /> Delete Chart Section
            </button>
          )}
        </div>

        {/* Right Canvas Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>📐 Interactive Canvas — Click any section to configure</span>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>All 5 sections below mirror Dashboard FY. Select a card to edit formulas or position.</p>
            </div>
            <button onClick={loadAll} style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: 'var(--gsh-teal)', cursor: 'pointer', fontWeight: 600 }}>↻ Refresh</button>
          </div>

          {/* Grid Canvas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', alignItems: 'start' }}>
            {sortedCharts.map(chart => (
              <SectionPreview
                key={chart.chart_id}
                chart={chart}
                selected={selectedId === chart.chart_id}
                onClick={() => handleSelect(chart)}
              />
            ))}
          </div>

          {/* Column Reference Guide */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database style={{ width: '16px', height: '16px', color: 'var(--gsh-teal)' }} /> Excel Column Reference (Numeric columns for SUM formulas)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {Object.entries(schema).map(([tableName, cols]) => (
                <div key={tableName}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: 'var(--gsh-red)', marginBottom: '0.35rem', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>{tableName}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                    {(cols || []).filter(c => c.numeric).map(col => (
                      <span key={col.col} title={`${col.field} (numeric)`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.67rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <span style={{ fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>{col.col}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{col.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCreatePage;
