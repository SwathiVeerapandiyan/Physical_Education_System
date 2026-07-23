import React, { useState, useEffect } from 'react';
import { equipmentBookingService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const EquipmentBookingManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const initialForm = {
    userId: 1,
    equipmentName: '',
    equipmentCategory: 'Balls',
    quantity: 1,
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    returnDate: '',
    bookingStatus: 'Pending',
    approvedBy: '',
    remarks: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const { showToast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await equipmentBookingService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load equipment bookings', 'error');
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
        const updated = await equipmentBookingService.update(editingItem.bookingId, formData);
        setItems(prev => prev.map(i => i.bookingId === editingItem.bookingId ? updated : i));
        showToast('Equipment booking updated!', 'success');
      } else {
        const created = await equipmentBookingService.create(formData);
        setItems(prev => [created, ...prev]);
        showToast('Equipment booking created!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save booking', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await equipmentBookingService.delete(deletingId);
      setItems(prev => prev.filter(i => i.bookingId !== deletingId));
      showToast('Booking deleted!', 'success');
      setDeletingId(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete booking', 'error');
    }
  };

  const filtered = items.filter(i => {
    const matchesSearch = !searchTerm || (i.equipmentName && i.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || i.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container-inner" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff' }}>🏀 Equipment Booking Management</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>Reserve and manage sports equipment requests.</p>
        </div>
        <button onClick={handleOpenCreate} style={{ padding: '0.75rem 1.4rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
          ➕ New Booking
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search equipment..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#fff', flex: 1 }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#fff' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Returned">Returned</option>
        </select>
      </div>

      {loading ? <Spinner message="Loading equipment bookings..." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {filtered.map(item => (
            <div key={item.bookingId} className="glass-panel" style={{ padding: '1.2rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>{item.equipmentName}</h3>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: item.bookingStatus === 'Approved' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)', color: item.bookingStatus === 'Approved' ? '#4ade80' : '#fde047' }}>
                  {item.bookingStatus}
                </span>
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem' }}>Category: {item.equipmentCategory || 'General'} | Qty: {item.quantity}</p>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>📅 Date: {item.bookingDate} ({item.startTime || '00:00'} - {item.endTime || '00:00'})</p>
              {item.remarks && <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>Note: {item.remarks}</p>}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => handleOpenEdit(item)} style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️ Edit</button>
                <button onClick={() => setDeletingId(item.bookingId)} style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.8rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>{editingItem ? 'Edit Booking' : 'New Equipment Booking'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Equipment Name (e.g. Basketball)" value={formData.equipmentName} onChange={e => setFormData({...formData, equipmentName: e.target.value})} required style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <input type="text" placeholder="Category" value={formData.equipmentCategory} onChange={e => setFormData({...formData, equipmentCategory: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <input type="number" placeholder="Quantity" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <input type="date" value={formData.bookingDate} onChange={e => setFormData({...formData, bookingDate: e.target.value})} required style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <select value={formData.bookingStatus} onChange={e => setFormData({...formData, bookingStatus: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Returned">Returned</option>
              </select>
              <textarea placeholder="Remarks..." value={formData.remarks || ''} onChange={e => setFormData({...formData, remarks: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
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

export default EquipmentBookingManagement;
