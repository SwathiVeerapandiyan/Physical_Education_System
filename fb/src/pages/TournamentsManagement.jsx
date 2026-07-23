import React, { useState, useEffect } from 'react';
import { tournamentService, tournamentRegistrationService, teamService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const STATUS_LIST = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

const TournamentsManagement = () => {
  const { showToast } = useToast();

  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Tournament Form Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tournamentName: '',
    organizer: '',
    venue: '',
    startDate: '',
    endDate: '',
    status: 'Upcoming'
  });
  const [submitting, setSubmitting] = useState(false);

  // Register Team Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tData, teamData] = await Promise.all([
        tournamentService.getAll(),
        teamService.getAll().catch(() => [])
      ]);
      setTournaments(tData || []);
      setTeams(teamData || []);
    } catch (err) {
      showToast(err.message || 'Failed to load tournaments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      tournamentName: '',
      organizer: '',
      venue: '',
      startDate: '',
      endDate: '',
      status: 'Upcoming'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (t) => {
    setEditingId(t.tournamentId);
    setFormData({
      tournamentName: t.tournamentName || '',
      organizer: t.organizer || '',
      venue: t.venue || '',
      startDate: t.startDate ? t.startDate.substring(0, 10) : '',
      endDate: t.endDate ? t.endDate.substring(0, 10) : '',
      status: t.status || 'Upcoming'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tournamentName.trim()) {
      showToast('Tournament Name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await tournamentService.update(editingId, formData);
        showToast('Tournament updated successfully! 🏆', 'success');
      } else {
        await tournamentService.create(formData);
        showToast('New Tournament created! 🏆', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to save tournament', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete tournament "${name}"?`)) return;
    try {
      await tournamentService.delete(id);
      showToast(`Tournament "${name}" deleted`, 'info');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete tournament', 'error');
    }
  };

  const handleOpenRegisterModal = (t) => {
    setSelectedTournament(t);
    setSelectedTeamId(teams.length > 0 ? teams[0].teamId : '');
    setShowRegisterModal(true);
  };

  const handleRegisterTeamSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      showToast('Please select a team to register', 'warning');
      return;
    }

    setRegistering(true);
    try {
      await tournamentRegistrationService.create({
        tournamentId: selectedTournament.tournamentId,
        teamId: selectedTeamId,
        status: 'Approved'
      });
      showToast('Team registered for tournament successfully! 🎉', 'success');
      setShowRegisterModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to register team', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = (t.tournamentName && t.tournamentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (t.organizer && t.organizer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (t.venue && t.venue.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && tournaments.length === 0) {
    return <Spinner fullPage message="Loading tournament schedules..." />;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>🏆</span>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Tournament Management</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                Organize inter-college sports meets, register teams, and monitor event status.
              </p>
            </div>
          </div>

          <button className="btn-primary" onClick={handleOpenAddModal} style={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
            <span>➕</span> Create Tournament
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search tournament, venue, organizer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ width: '200px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredTournaments.map((t) => (
            <div
              key={t.tournamentId}
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>{t.tournamentName}</h3>
                  <span style={{
                    background: t.status === 'Ongoing' ? 'rgba(16, 185, 129, 0.2)' :
                                t.status === 'Upcoming' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                    color: t.status === 'Ongoing' ? 'var(--success)' :
                           t.status === 'Upcoming' ? 'var(--primary)' : 'var(--text-muted)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {t.status || 'Upcoming'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>📍 <strong>Venue:</strong> {t.venue || 'TBD'}</div>
                  <div>🏢 <strong>Organizer:</strong> {t.organizer || 'Department'}</div>
                  <div>📅 <strong>Dates:</strong> {t.startDate || 'N/A'} {t.endDate ? `to ${t.endDate}` : ''}</div>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleOpenRegisterModal(t)}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  📝 Register Team
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => handleOpenEditModal(t)} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                    ✏️ Edit
                  </button>
                  <button className="btn-secondary" onClick={() => handleDelete(t.tournamentId, t.tournamentName)} style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--error)' }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '10px' }}>🏆</p>
            <p>No tournaments scheduled yet.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Tournament Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>
              {editingId ? '✏️ Edit Tournament' : '➕ Create Tournament'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Tournament Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. State Level Athletics Meet"
                  value={formData.tournamentName}
                  onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Organizer</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. PE Department"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Main Ground"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Tournament' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Team Modal */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '460px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
              📝 Register Team for Tournament
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Select a team to enroll in <strong>{selectedTournament?.tournamentName}</strong>
            </p>

            {teams.length === 0 ? (
              <p style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>
                No teams registered in system. Please create a Team under Teams Management first.
              </p>
            ) : (
              <form onSubmit={handleRegisterTeamSubmit}>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Select Team</label>
                  <select
                    className="form-control"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                  >
                    {teams.map(team => (
                      <option key={team.teamId} value={team.teamId}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowRegisterModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={registering}>
                    {registering ? 'Registering...' : 'Confirm Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsManagement;
