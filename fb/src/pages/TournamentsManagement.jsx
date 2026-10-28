import React, { useState, useEffect } from 'react';
import { tournamentService, tournamentRegistrationService, teamService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Icon from '../components/Icons';

const STATUS_LIST = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

const STATUS_CONFIG = {
  Upcoming:  { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1', dot: '#6366f1' },
  Ongoing:   { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', dot: '#10b981' },
  Completed: { bg: 'rgba(100,116,139,0.12)', color: '#64748b', dot: '#64748b' },
  Cancelled: { bg: 'rgba(220,38,38,0.12)',   color: '#dc2626', dot: '#dc2626' },
};

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
        showToast('Tournament updated successfully.', 'success');
      } else {
        await tournamentService.create(formData);
        showToast('New tournament created successfully.', 'success');
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
    setSelectedTeamId(teams.length > 0 ? String(teams[0].teamId) : '');
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
        tournamentId: Number(selectedTournament.tournamentId),
        teamId: Number(selectedTeamId),
        status: 'Approved'
      });
      showToast('Team registered for tournament successfully.', 'success');
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

  const ongoingCount = tournaments.filter(t => t.status === 'Ongoing').length;
  const upcomingCount = tournaments.filter(t => t.status === 'Upcoming').length;

  if (loading && tournaments.length === 0) {
    return <Spinner fullPage message="Loading tournament schedules..." />;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--maroon) 0%, var(--primary) 60%, #be123c 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(159,18,57,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-30px', right: '160px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '80px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', zIndex: 1 }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '16px',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}>
            <Icon name="trophy" size={28} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', margin: 0, color: '#fff', fontWeight: 800 }}>Tournament Management</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', marginTop: '4px' }}>
              Organize inter-college sports meets, register teams, and monitor event status.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', zIndex: 1, flexWrap: 'wrap' }}>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{tournaments.length}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ade80' }}>{ongoingCount}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ongoing</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c7d2fe' }}>{upcomingCount}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upcoming</div>
            </div>
          </div>
          <button
            id="btn-create-tournament"
            className="btn-primary"
            onClick={handleOpenAddModal}
            style={{
              background: '#fff',
              color: 'var(--primary)',
              fontWeight: 700,
              gap: '8px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span> Create Tournament
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        gap: '14px',
        flexWrap: 'wrap',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '16px' }}>🔍</span>
          <input
            id="tournament-search"
            type="text"
            className="form-control"
            placeholder="Search tournament, venue, organizer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <select
            id="tournament-status-filter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
          Showing <strong>{filteredTournaments.length}</strong> of {tournaments.length}
        </div>
      </div>

      {/* Tournaments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filteredTournaments.map((t) => {
          const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.Upcoming;
          return (
            <div
              key={t.tournamentId}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Card accent line */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '4px 4px 0 0' }} />

              <div style={{ padding: '20px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      #{t.tournamentId}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.08rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.35 }}>{t.tournamentName}</h3>
                  </div>
                  <span style={{
                    background: cfg.bg,
                    color: cfg.color,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    flexShrink: 0,
                    marginLeft: '10px',
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                    {t.status || 'Upcoming'}
                  </span>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.845rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '14px' }}>📍</span>
                    <span><strong>Venue:</strong> {t.venue || 'TBD'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '14px' }}>🏛️</span>
                    <span><strong>Organizer:</strong> {t.organizer || 'Department'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '14px' }}>📅</span>
                    <span>
                      {t.startDate || 'N/A'}{t.endDate ? ` → ${t.endDate}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{
                marginTop: 'auto',
                padding: '14px 20px',
                borderTop: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.015)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
              }}>
                <button
                  id={`btn-register-tournament-${t.tournamentId}`}
                  className="btn-primary"
                  onClick={() => handleOpenRegisterModal(t)}
                  style={{ padding: '7px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
                >
                  + Register Team
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    id={`btn-edit-tournament-${t.tournamentId}`}
                    className="btn-secondary"
                    onClick={() => handleOpenEditModal(t)}
                    style={{ padding: '7px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    id={`btn-delete-tournament-${t.tournamentId}`}
                    className="btn-secondary"
                    onClick={() => handleDelete(t.tournamentId, t.tournamentName)}
                    style={{ padding: '7px 12px', fontSize: '0.8rem', borderRadius: '8px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTournaments.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-muted)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--border-color)',
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🏆</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            {searchTerm || statusFilter ? 'No tournaments match your search.' : 'No tournaments scheduled yet.'}
          </p>
          <p style={{ fontSize: '0.875rem' }}>Click "Create Tournament" to get started.</p>
        </div>
      )}

      {/* Add / Edit Tournament Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%', maxWidth: '540px', padding: '32px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            border: '1px solid var(--border-color)',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'var(--primary-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="trophy" size={22} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {editingId ? 'Edit Tournament' : 'Create Tournament'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {editingId ? 'Update tournament details' : 'Schedule a new athletic event'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)', lineHeight: 1 }}
              >✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Tournament Name *</label>
                <input
                  id="tournament-name-input"
                  type="text"
                  className="form-control"
                  placeholder="e.g. State Level Athletics Meet"
                  value={formData.tournamentName}
                  onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Organizer</label>
                  <input
                    id="tournament-organizer-input"
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
                    id="tournament-venue-input"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Main Ground"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    id="tournament-start-date"
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    id="tournament-end-date"
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
                  id="tournament-status-select"
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
                <button type="submit" className="btn-primary" disabled={submitting} style={{ minWidth: '160px' }}>
                  {submitting ? 'Saving...' : editingId ? '✓ Update Tournament' : '+ Create Tournament'}
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
          background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%', maxWidth: '460px', padding: '32px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(181,136,62,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="shield" size={22} color="var(--secondary)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  Register Team
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Enroll a team in <strong>{selectedTournament?.tournamentName}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)' }}
              >✕</button>
            </div>

            {/* Tournament Info */}
            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              marginBottom: '20px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}>
              <div>📍 {selectedTournament?.venue || 'TBD'}</div>
              <div>📅 {selectedTournament?.startDate} → {selectedTournament?.endDate}</div>
            </div>

            {teams.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⚠️</p>
                <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                  No teams available. Please create a Team under Teams Management first.
                </p>
                <button className="btn-secondary" onClick={() => setShowRegisterModal(false)} style={{ marginTop: '14px' }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleRegisterTeamSubmit}>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Select Team</label>
                  <select
                    id="register-team-select"
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
                  <button type="submit" className="btn-primary" disabled={registering} style={{ minWidth: '160px' }}>
                    {registering ? 'Registering...' : '✓ Confirm Registration'}
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
