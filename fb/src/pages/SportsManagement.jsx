import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sportsService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const CATEGORIES = ['Indoor', 'Outdoor', 'Aquatics', 'Martial Arts', 'Track & Field', 'Fitness'];

const SportsManagement = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sportName: '',
    category: 'Outdoor',
    coachName: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    setLoading(true);
    try {
      const data = await sportsService.getAll();
      setSports(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load sports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ sportName: '', category: 'Outdoor', coachName: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (sport) => {
    setEditingId(sport.sportId);
    setFormData({
      sportName: sport.sportName || '',
      category: sport.category || 'Outdoor',
      coachName: sport.coachName || '',
      description: sport.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sportName.trim()) {
      showToast('Sport Name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await sportsService.update(editingId, formData);
        showToast('Sport updated successfully! ⚽', 'success');
      } else {
        await sportsService.create(formData);
        showToast('New Sport added successfully! 🏅', 'success');
      }
      setShowModal(false);
      fetchSports();
    } catch (err) {
      showToast(err.message || 'Failed to save sport', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await sportsService.delete(id);
      showToast(`Sport "${name}" deleted successfully`, 'info');
      fetchSports();
    } catch (err) {
      showToast(err.message || 'Failed to delete sport', 'error');
    }
  };

  const filteredSports = sports.filter(s => {
    const matchesSearch = (s.sportName && s.sportName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (s.coachName && s.coachName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = !categoryFilter || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading && sports.length === 0) {
    return <Spinner fullPage message="Loading sports directory..." />;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>🏀</span>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Sports Directory &amp; Discipline</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                Manage sports, athletic disciplines, category assignments, and appointed coaches.
              </p>
            </div>
          </div>

          <button className="btn-primary" onClick={handleOpenAddModal} style={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
            <span>➕</span> Add New Sport
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search sport or coach name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ width: '200px' }}>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Sports Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredSports.map((sport) => (
            <div
              key={sport.sportId}
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              className="sport-card"
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{sport.sportName}</h3>
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--primary)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {sport.category || 'General'}
                  </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '14px', minHeight: '38px', lineHeight: 1.4 }}>
                  {sport.description || 'No detailed description available.'}
                </p>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🧢 Coach:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{sport.coachName || 'Unassigned'}</strong>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleOpenEditModal(sport)}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleDelete(sport.sportId, sport.sportName)}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'rgba(244,63,94,0.3)' }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSports.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '10px' }}>🏃</p>
            <p>No sports found. Click "Add New Sport" to create one.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Overlay */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>
              {editingId ? '✏️ Edit Sport' : '➕ Add New Sport'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Sport Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Basketball, Cricket, Athletics"
                  value={formData.sportName}
                  onChange={(e) => setFormData({ ...formData, sportName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Coach Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Appointed Head Coach"
                  value={formData.coachName}
                  onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Brief description of rules, team size, or rules."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Sport' : 'Create Sport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsManagement;
