import React, { useState, useEffect } from 'react';
import { liveScoreService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const LiveScoreManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const initialForm = {
    matchName: '',
    sportType: 'Cricket',
    teamOne: 'Team Red',
    teamTwo: 'Team Blue',
    teamOneScore: 0,
    teamTwoScore: 0,
    matchStatus: 'LIVE',
    venue: 'Main Stadium',
    matchDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    winner: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const { showToast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await liveScoreService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load live scores', 'error');
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
        const updated = await liveScoreService.update(editingItem.scoreId, formData);
        setItems(prev => prev.map(i => i.scoreId === editingItem.scoreId ? updated : i));
        showToast('Live score updated!', 'success');
      } else {
        const created = await liveScoreService.create(formData);
        setItems(prev => [created, ...prev]);
        showToast('Live match score initialized!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save live score', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await liveScoreService.delete(deletingId);
      setItems(prev => prev.filter(i => i.scoreId !== deletingId));
      showToast('Live score record deleted!', 'success');
      setDeletingId(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete score', 'error');
    }
  };

  const filtered = items.filter(i =>
    !searchTerm || (i.matchName && i.matchName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff' }}>⚡ Live Match Scores</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>Real-time match scoring and tournament scoreboard update.</p>
        </div>
        <button onClick={handleOpenCreate} style={{ padding: '0.75rem 1.4rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
          ➕ New Live Match
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', borderRadius: '12px' }}>
        <input
          type="text"
          placeholder="Search match or team..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: '#fff' }}
        />
      </div>

      {loading ? <Spinner message="Loading live scores..." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
          {filtered.map(item => (
            <div key={item.scoreId} className="glass-panel" style={{ padding: '1.2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: item.matchStatus === 'LIVE' ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(15,23,42,0.8))' : 'rgba(30,41,59,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#a78bfa', fontWeight: 600 }}>{item.sportType || 'Sport'}</span>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: item.matchStatus === 'LIVE' ? '#ef4444' : 'rgba(255,255,255,0.1)', color: '#fff' }}>
                  {item.matchStatus === 'LIVE' ? '🔴 LIVE' : item.matchStatus}
                </span>
              </div>

              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', textAlign: 'center' }}>{item.matchName || 'Match'}</h3>

              {/* Score Display Board */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'rgba(15,23,42,0.7)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>{item.teamOne}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa' }}>{item.teamOneScore}</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#64748b' }}>VS</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>{item.teamTwo}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{item.teamTwoScore}</div>
                </div>
              </div>

              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center' }}>
                📍 {item.venue || 'Venue'} | 📅 {item.matchDate} {item.startTime ? `at ${item.startTime}` : ''}
              </p>

              {item.winner && <p style={{ margin: 0, color: '#4ade80', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>🏆 Winner: {item.winner}</p>}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => handleOpenEdit(item)} style={{ flex: 1, padding: '0.4rem 0.8rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>⚡ Update Score</button>
                <button onClick={() => setDeletingId(item.scoreId)} style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.8rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>{editingItem ? 'Update Live Score' : 'New Live Match'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Match Title (e.g. Semi Finals Game 1)" value={formData.matchName} onChange={e => setFormData({...formData, matchName: e.target.value})} required style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <input type="text" placeholder="Sport Type (e.g. Cricket, Basketball)" value={formData.sportType} onChange={e => setFormData({...formData, sportType: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Team 1 Name" value={formData.teamOne} onChange={e => setFormData({...formData, teamOne: e.target.value})} required style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
                <input type="number" placeholder="Team 1 Score" value={formData.teamOneScore} onChange={e => setFormData({...formData, teamOneScore: parseInt(e.target.value) || 0})} style={{ width: '110px', padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Team 2 Name" value={formData.teamTwo} onChange={e => setFormData({...formData, teamTwo: e.target.value})} required style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
                <input type="number" placeholder="Team 2 Score" value={formData.teamTwoScore} onChange={e => setFormData({...formData, teamTwoScore: parseInt(e.target.value) || 0})} style={{ width: '110px', padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              </div>
              <select value={formData.matchStatus} onChange={e => setFormData({...formData, matchStatus: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}>
                <option value="LIVE">LIVE</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>
              <input type="text" placeholder="Winner (if completed)" value={formData.winner || ''} onChange={e => setFormData({...formData, winner: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.4rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save Score</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '14px', textAlign: 'center' }}>
            <p style={{ color: '#fff' }}>Are you sure you want to delete this live score record?</p>
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

export default LiveScoreManagement;
