import React, { useState, useEffect } from 'react';
import { Network, Search, Plus, Edit2, Trash2, Save, X, CheckCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const MapDivisionsPage = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Edit / Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ sales_group: '', range_name: '' });

  // Inline edit state
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineForm, setInlineForm] = useState({ sales_group: '', range_name: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadMappings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/division-mappings');
      if (res.data && res.data.data) {
        setMappings(res.data.data);
      }
    } catch {
      showToast('Failed to load division mappings.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMappings();
  }, []);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setForm({ sales_group: '', range_name: '' });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setForm({ sales_group: item.sales_group, range_name: item.range_name });
    setModalOpen(true);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!form.sales_group && !form.range_name) {
      showToast('Sales Group or Range name is required.', 'error');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/division-mappings/${editingId}`, form);
        showToast('✅ Division Mapping updated successfully!');
      } else {
        await api.post('/division-mappings', form);
        showToast('✅ New Division Mapping added!');
      }
      setModalOpen(false);
      loadMappings();
    } catch {
      showToast('Failed to save mapping.', 'error');
    }
  };

  const handleStartInlineEdit = (item) => {
    setInlineEditId(item.id);
    setInlineForm({ sales_group: item.sales_group, range_name: item.range_name });
  };

  const handleSaveInlineEdit = async (id) => {
    try {
      await api.put(`/division-mappings/${id}`, inlineForm);
      showToast('✅ Row updated!');
      setInlineEditId(null);
      loadMappings();
    } catch {
      showToast('Failed to update row.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this division mapping entry?')) return;
    try {
      await api.delete(`/division-mappings/${id}`);
      showToast('Mapping deleted.');
      loadMappings();
    } catch {
      showToast('Failed to delete mapping.', 'error');
    }
  };

  const filteredMappings = mappings.filter(m =>
    (m.sales_group || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.range_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMappings.length / pageSize) || 1;
  const paginatedMappings = filteredMappings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="page-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)', background: toast.type === 'success' ? '#10b981' : '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {toast.type === 'success' ? <CheckCircle style={{ width: '18px', height: '18px' }} /> : <AlertCircle style={{ width: '18px', height: '18px' }} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Network style={{ width: '24px', height: '24px', color: 'var(--gsh-red)' }} />
            Map Divisions (Sales Group → Range Mappings)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Manage and edit master mapping between Sales Groups and Range Division names.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={loadMappings} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.95rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
            <RefreshCw style={{ width: '15px', height: '15px' }} /> Refresh
          </button>
          <button onClick={handleOpenAddModal} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(200,16,46,0.25)' }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Add Division Mapping
          </button>
        </div>
      </div>

      {/* Search Bar & Total Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="Search Sales Group or Range..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.4rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.825rem', outline: 'none' }}
          />
        </div>

        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Showing <strong>{paginatedMappings.length}</strong> of <strong>{filteredMappings.length}</strong> mappings (Page {currentPage} of {totalPages})
        </div>
      </div>

      {/* Datatable */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-hover)', borderBottom: '2px solid var(--border-color)' }}>
              <tr style={{ color: 'var(--text-main)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                <th style={{ padding: '0.75rem 1rem', width: '60px' }}>ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Sales Group</th>
                <th style={{ padding: '0.75rem 1rem' }}>Range</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading division mappings...
                  </td>
                </tr>
              ) : paginatedMappings.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No division mappings found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                paginatedMappings.map(row => {
                  const isEditingInline = inlineEditId === row.id;
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)', background: isEditingInline ? 'rgba(200,16,46,0.04)' : 'transparent' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: 'var(--text-subtle)' }}>{row.id}</td>
                      
                      {/* Sales Group Column */}
                      <td style={{ padding: '0.65rem 1rem' }}>
                        {isEditingInline ? (
                          <input
                            type="text"
                            value={inlineForm.sales_group}
                            onChange={e => setInlineForm(f => ({ ...f, sales_group: e.target.value }))}
                            style={{ padding: '0.35rem 0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--gsh-red)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700, outline: 'none', width: '100%' }}
                          />
                        ) : (
                          <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{row.sales_group || <em style={{ color: 'var(--text-subtle)' }}>(blank)</em>}</span>
                        )}
                      </td>

                      {/* Range Column */}
                      <td style={{ padding: '0.65rem 1rem' }}>
                        {isEditingInline ? (
                          <input
                            type="text"
                            value={inlineForm.range_name}
                            onChange={e => setInlineForm(f => ({ ...f, range_name: e.target.value }))}
                            style={{ padding: '0.35rem 0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--gsh-red)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700, outline: 'none', width: '100%' }}
                          />
                        ) : (
                          <span style={{ fontWeight: 700, color: 'var(--gsh-teal)' }}>{row.range_name || <em style={{ color: 'var(--text-subtle)' }}>(blank)</em>}</span>
                        )}
                      </td>

                      {/* Action Column */}
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                        {isEditingInline ? (
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleSaveInlineEdit(row.id)} title="Save Changes" style={{ padding: '0.35rem 0.55rem', background: '#10b981', border: 'none', borderRadius: 'var(--radius-xs)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>
                              Save
                            </button>
                            <button onClick={() => setInlineEditId(null)} title="Cancel" style={{ padding: '0.35rem 0.55rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.75rem' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleStartInlineEdit(row)} title="Quick Edit" style={{ padding: '0.35rem 0.5rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', cursor: 'pointer' }}>
                              <Edit2 style={{ width: '14px', height: '14px' }} />
                            </button>
                            <button onClick={() => handleDelete(row.id)} title="Delete Mapping" style={{ padding: '0.35rem 0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-xs)', color: '#ef4444', cursor: 'pointer' }}>
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-hover)', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                style={{ padding: '0.35rem 0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <ChevronLeft style={{ width: '14px', height: '14px' }} /> Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                style={{ padding: '0.35rem 0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                Next <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <form onSubmit={handleSaveModal} style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Network style={{ width: '20px', height: '20px', color: 'var(--gsh-red)' }} />
                {editingId ? 'Edit Division Mapping' : 'Add New Division Mapping'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-subtle)' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
                Sales Group Name
              </label>
              <input
                type="text"
                value={form.sales_group}
                onChange={e => setForm(f => ({ ...f, sales_group: e.target.value }))}
                placeholder="e.g. ADCOCK, ROCKET SAL, ACCESSORIE..."
                style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
                Range Name
              </label>
              <input
                type="text"
                value={form.range_name}
                onChange={e => setForm(f => ({ ...f, range_name: e.target.value }))}
                placeholder="e.g. OAKNET, ARROWIL A1, B BRAUN..."
                style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '0.6rem 1.2rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" style={{ padding: '0.6rem 1.4rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: 'var(--radius-xs)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(200,16,46,0.25)' }}>
                Save Mapping
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default MapDivisionsPage;
