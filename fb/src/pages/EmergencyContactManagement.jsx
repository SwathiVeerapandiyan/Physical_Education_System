import React, { useState, useEffect } from 'react';
import { emergencyContactService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const EmergencyContactManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const initialForm = {
    userId: 1,
    contactName: '',
    relationship: 'Parent',
    phoneNumber: '',
    alternatePhone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const { showToast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await emergencyContactService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load emergency contacts', 'error');
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
        const updated = await emergencyContactService.update(editingItem.contactId, formData);
        setItems(prev => prev.map(i => i.contactId === editingItem.contactId ? updated : i));
        showToast('Emergency contact updated!', 'success');
      } else {
        const created = await emergencyContactService.create(formData);
        setItems(prev => [created, ...prev]);
        showToast('Emergency contact added!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save contact', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await emergencyContactService.delete(deletingId);
      setItems(prev => prev.filter(i => i.contactId !== deletingId));
      showToast('Contact deleted!', 'success');
      setDeletingId(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete contact', 'error');
    }
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff' }}>🚨 Emergency Contacts</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>Maintain emergency phone numbers, family contacts, and medical addresses.</p>
        </div>
        <button onClick={handleOpenCreate} style={{ padding: '0.75rem 1.4rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
          ➕ Add Contact
        </button>
      </div>

      {loading ? <Spinner message="Loading emergency contacts..." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {items.map(item => (
            <div key={item.contactId} className="glass-panel" style={{ padding: '1.2rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>{item.contactName}</h3>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                  {item.relationship || 'Contact'}
                </span>
              </div>
              <p style={{ margin: 0, color: '#4ade80', fontSize: '0.95rem', fontWeight: 600 }}>📞 {item.phoneNumber}</p>
              {item.alternatePhone && <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>Alt Phone: {item.alternatePhone}</p>}
              {item.email && <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem' }}>✉️ {item.email}</p>}
              {item.city && <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>📍 {item.city}, {item.state || ''}</p>}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => handleOpenEdit(item)} style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️ Edit</button>
                <button onClick={() => setDeletingId(item.contactId)} style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.8rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>{editingItem ? 'Edit Contact' : 'New Emergency Contact'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Contact Name" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} required style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <input type="text" placeholder="Relationship (e.g. Parent, Doctor)" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="tel" placeholder="Phone Number" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} required style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
                <input type="tel" placeholder="Alt Phone" value={formData.alternatePhone} onChange={e => setFormData({...formData, alternatePhone: e.target.value})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              </div>
              <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
                <input type="text" placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '14px', textAlign: 'center' }}>
            <p style={{ color: '#fff' }}>Are you sure you want to delete this contact?</p>
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

export default EmergencyContactManagement;
