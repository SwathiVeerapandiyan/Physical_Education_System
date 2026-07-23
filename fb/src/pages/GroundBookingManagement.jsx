import React, { useState, useEffect } from 'react';
import { groundBookingService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const GroundBookingManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialForm = {
    userId: 1,
    groundName: '',
    sportType: 'Football',
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    durationHours: 2.0,
    bookingStatus: 'Pending',
    paymentAmount: 0.00,
    paymentStatus: 'Pending',
    approvedBy: '',
    remarks: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const { showToast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await groundBookingService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load ground bookings', 'error');
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
        const updated = await groundBookingService.update(editingItem.bookingId, formData);
        setItems(prev => prev.map(i => i.bookingId === editingItem.bookingId ? updated : i));
        showToast('Ground booking updated!', 'success');
      } else {
        const created = await groundBookingService.create(formData);
        setItems(prev => [created, ...prev]);
        showToast('Ground booking created!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save booking', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await groundBookingService.delete(deletingId);
      setItems(prev => prev.filter(i => i.bookingId !== deletingId));
      showToast('Booking deleted!', 'success');
      setDeletingId(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete booking', 'error');
    }
  };

  const filtered = items.filter(i =>
    !searchTerm || (i.groundName && i.groundName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff' }}>🏟️ Ground Booking Management</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>Book sports grounds, turf, and stadium facilities.</p>
        </div>
        <button onClick={handleOpenCreate} style={{ padding: '0.75rem 1.4rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
          ➕ Book Ground
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', borderRadius: '12px' }}>
        <input
          type="text"
          placeholder="Search ground name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#fff' }}
        />
      </div>

      {loading ? <Spinner message="Loading ground bookings..." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {filtered.map(item => (
            <div key={item.bookingId} className="glass-panel" style={{ padding: '1.2rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>{item.groundName}</h3>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: item.bookingStatus === 'Approved' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)', color: item.bookingStatus === 'Approved' ? '#4ade80' : '#fde047' }}>
                  {item.bookingStatus}
                </span>
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem' }}>Sport: {item.sportType} | Duration: {item.durationHours || 1} hrs</p>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>📅 Date: {item.bookingDate} ({item.startTime || '00:00'} - {item.endTime || '00:00'})</p>
              <p style={{ margin: 0, color: '#38bdf8', fontSize: '0.85rem' }}>💳 Payment: ${item.paymentAmount || 0} ({item.paymentStatus})</p>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => handleOpenEdit(item)} style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️ Edit</button>
                <button onClick={() => setDeletingId(item.bookingId)} style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.8rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>{editingItem ? 'Edit Ground Booking' : 'New Ground Booking'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Ground Name (e.g. Main Turf Stadium)" value={formData.groundName} onChange={e => setFormData({...formData, groundName: e.target.value})} required style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <input type="text" placeholder="Sport Type (e.g. Football)" value={formData.sportType} onChange={e => setFormData({...formData, sportType: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <input type="date" value={formData.bookingDate} onChange={e => setFormData({...formData, bookingDate: e.target.value})} required style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
                <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              </div>
              <select value={formData.bookingStatus} onChange={e => setFormData({...formData, bookingStatus: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '14px', textAlign: 'center' }}>
            <p style={{ color: '#fff' }}>Are you sure you want to delete this booking?</p>
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

export default GroundBookingManagement;
