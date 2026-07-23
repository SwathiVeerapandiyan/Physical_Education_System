import React, { useState, useEffect } from 'react';
import { healthFitnessService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const HealthFitnessManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const initialForm = {
    userId: 1,
    heightCm: 175.0,
    weightKg: 70.0,
    bmi: 22.86,
    bloodGroup: 'O+',
    heartRate: 72,
    fitnessLevel: 'Intermediate',
    medicalConditions: 'None',
    allergies: 'None',
    emergencyNotes: 'Fit for active sports',
    lastCheckup: new Date().toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState(initialForm);
  const { showToast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await healthFitnessService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load health & fitness records', 'error');
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
        const updated = await healthFitnessService.update(editingItem.recordId, formData);
        setItems(prev => prev.map(i => i.recordId === editingItem.recordId ? updated : i));
        showToast('Health record updated!', 'success');
      } else {
        const created = await healthFitnessService.create(formData);
        setItems(prev => [created, ...prev]);
        showToast('Health record added!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save health record', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await healthFitnessService.delete(deletingId);
      setItems(prev => prev.filter(i => i.recordId !== deletingId));
      showToast('Health record deleted!', 'success');
      setDeletingId(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete health record', 'error');
    }
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff' }}>🩺 Health & Fitness Trackers</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>Monitor student health metrics, BMI, and medical records.</p>
        </div>
        <button onClick={handleOpenCreate} style={{ padding: '0.75rem 1.4rem', background: '#06b6d4', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
          ➕ Add Health Record
        </button>
      </div>

      {loading ? <Spinner message="Loading health records..." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
          {items.map(item => (
            <div key={item.recordId} className="glass-panel" style={{ padding: '1.2rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>User #{item.userId}</h3>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(6,182,212,0.2)', color: '#22d3ee' }}>
                  {item.bloodGroup || 'N/A'}
                </span>
              </div>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.88rem' }}>📏 Height: {item.heightCm} cm | ⚖️ Weight: {item.weightKg} kg</p>
              <p style={{ margin: 0, color: '#38bdf8', fontSize: '0.88rem', fontWeight: 600 }}>📊 BMI: {item.bmi || 'N/A'} | ❤️ Heart Rate: {item.heartRate || 'N/A'} bpm</p>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>Fitness: {item.fitnessLevel || 'Standard'} | Last Checkup: {item.lastCheckup || 'N/A'}</p>
              {item.emergencyNotes && <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>Notes: {item.emergencyNotes}</p>}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => handleOpenEdit(item)} style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️ Edit</button>
                <button onClick={() => setDeletingId(item.recordId)} style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.8rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>{editingItem ? 'Edit Health Record' : 'New Health Record'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="number" placeholder="User ID" value={formData.userId} onChange={e => setFormData({...formData, userId: parseInt(e.target.value) || 1})} required style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="number" step="0.1" placeholder="Height (cm)" value={formData.heightCm} onChange={e => setFormData({...formData, heightCm: parseFloat(e.target.value)})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
                <input type="number" step="0.1" placeholder="Weight (kg)" value={formData.weightKg} onChange={e => setFormData({...formData, weightKg: parseFloat(e.target.value)})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Blood Group (e.g. O+)" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
                <input type="number" placeholder="Heart Rate (bpm)" value={formData.heartRate} onChange={e => setFormData({...formData, heartRate: parseInt(e.target.value) || 72})} style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              </div>
              <input type="text" placeholder="Fitness Level" value={formData.fitnessLevel} onChange={e => setFormData({...formData, fitnessLevel: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', background: '#06b6d4', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '14px', textAlign: 'center' }}>
            <p style={{ color: '#fff' }}>Are you sure you want to delete this record?</p>
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

export default HealthFitnessManagement;
