import React, { useState, useEffect } from 'react';
import { noticeBoardService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const NoticeBoardManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialForm = {
    title: '',
    description: '',
    category: 'General',
    priority: 'Normal',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    attachmentUrl: '',
    createdBy: 'Admin',
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);
  const { showToast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await noticeBoardService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load notices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const updated = await noticeBoardService.update(editingItem.noticeId, formData);
        setItems(prev => prev.map(i => i.noticeId === editingItem.noticeId ? updated : i));
        showToast('Notice updated!', 'success');
      } else {
        const created = await noticeBoardService.create(formData);
        setItems(prev => [created, ...prev]);
        showToast('Notice posted!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save notice', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await noticeBoardService.delete(deletingId);
      setItems(prev => prev.filter(i => i.noticeId !== deletingId));
      showToast('Notice deleted!', 'success');
      setDeletingId(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete notice', 'error');
    }
  };

  const filtered = items.filter(i =>
    !searchTerm || (i.title && i.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff' }}>📢 Notice Board</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>Publish announcements, alerts, and tournament news.</p>
        </div>
        <button onClick={handleOpenCreate} style={{ padding: '0.75rem 1.4rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
          ➕ Post Notice
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', borderRadius: '12px' }}>
        <input
          type="text"
          placeholder="Search notices..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#fff' }}
        />
      </div>

      {loading ? <Spinner message="Loading notices..." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
          {filtered.map(item => (
            <div key={item.noticeId} className="glass-panel" style={{ padding: '1.2rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>{item.title}</h3>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, background: item.priority === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)', color: item.priority === 'High' ? '#f87171' : '#818cf8' }}>
                  {item.priority || 'Normal'}
                </span>
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem' }}>{item.description}</p>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.82rem' }}>🏷️ Category: {item.category || 'General'} | 📅 Date: {item.publishDate}</p>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => handleOpenEdit(item)} style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️ Edit</button>
                <button onClick={() => setDeletingId(item.noticeId)} style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.8rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>{editingItem ? 'Edit Notice' : 'Post New Notice'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Notice Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <textarea placeholder="Notice Description..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows="4" style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}>
                  <option value="General">General</option>
                  <option value="Tournament">Tournament</option>
                  <option value="Emergency">Emergency</option>
                </select>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '14px', textAlign: 'center' }}>
            <p style={{ color: '#fff' }}>Are you sure you want to delete this notice?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setDeletingId(null)} style={{ padding: '0.5rem 1rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoardManagement;
