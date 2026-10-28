import React, { useState, useEffect } from 'react';
import { matchService, tournamentService, teamService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Icon from '../components/Icons';

const MATCH_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Postponed', 'Cancelled'];

const STATUS_CONFIG = {
  'Scheduled':   { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1',  icon: '📅' },
  'In Progress': { bg: 'rgba(16,185,129,0.12)',  color: '#10b981',  icon: '🔴' },
  'Completed':   { bg: 'rgba(100,116,139,0.12)', color: '#64748b',  icon: '✅' },
  'Postponed':   { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b',  icon: '⏸️' },
  'Cancelled':   { bg: 'rgba(220,38,38,0.12)',   color: '#dc2626',  icon: '❌' },
};

const MatchesManagement = () => {
  const { showToast } = useToast();

  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournamentFilter, setTournamentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Match Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tournamentId: '',
    teamOne: '',
    teamTwo: '',
    venue: '',
    matchDate: '',
    status: 'Scheduled'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matchesData, tData, teamData] = await Promise.all([
        matchService.getAll().catch(() => []),
        tournamentService.getAll().catch(() => []),
        teamService.getAll().catch(() => [])
      ]);
      setMatches(matchesData || []);
      setTournaments(tData || []);
      setTeams(teamData || []);

      if (tData && tData.length > 0) {
        setFormData(prev => ({
          ...prev,
          tournamentId: tData[0].tournamentId,
          teamOne: teamData.length > 0 ? teamData[0].teamId : '',
          teamTwo: teamData.length > 1 ? teamData[1].teamId : (teamData.length > 0 ? teamData[0].teamId : '')
        }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to load match schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      tournamentId: tournaments.length > 0 ? tournaments[0].tournamentId : '',
      teamOne: teams.length > 0 ? teams[0].teamId : '',
      teamTwo: teams.length > 1 ? teams[1].teamId : (teams.length > 0 ? teams[0].teamId : ''),
      venue: '',
      matchDate: '',
      status: 'Scheduled'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (match) => {
    setEditingId(match.matchId);
    setFormData({
      tournamentId: match.tournamentId || '',
      teamOne: match.teamOne || '',
      teamTwo: match.teamTwo || '',
      venue: match.venue || '',
      matchDate: match.matchDate ? match.matchDate.substring(0, 16) : '',
      status: match.status || 'Scheduled'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teamOne || !formData.teamTwo) {
      showToast('Both teams must be selected for the match', 'warning');
      return;
    }
    if (String(formData.teamOne) === String(formData.teamTwo)) {
      showToast('Team 1 and Team 2 must be different teams', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        tournamentId: formData.tournamentId ? Number(formData.tournamentId) : null,
        teamOne: Number(formData.teamOne),
        teamTwo: Number(formData.teamTwo),
      };

      if (editingId) {
        await matchService.update(editingId, payload);
        showToast('Match updated successfully.', 'success');
      } else {
        await matchService.create(payload);
        showToast('New Match scheduled! 🎉', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to save match schedule', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this match?')) return;
    try {
      await matchService.delete(id);
      showToast('Match record deleted', 'info');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete match', 'error');
    }
  };

  const getTeamName = (teamId) => {
    const t = teams.find(item => String(item.teamId) === String(teamId));
    return t ? t.teamName : `Team #${teamId}`;
  };

  const getTournamentName = (tId) => {
    const t = tournaments.find(item => String(item.tournamentId) === String(tId));
    return t ? t.tournamentName : `Tournament #${tId}`;
  };

  const filteredMatches = matches.filter(m => {
    const matchesTournament = !tournamentFilter || String(m.tournamentId) === String(tournamentFilter);
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesTournament && matchesStatus;
  });

  const scheduledCount = matches.filter(m => m.status === 'Scheduled').length;
  const liveCount = matches.filter(m => m.status === 'In Progress').length;

  if (loading && matches.length === 0) {
    return <Spinner fullPage message="Loading match schedules..." />;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2a4a 0%, #1e3a6e 50%, #1a4a8a 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(26,42,74,0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '200px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
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
            fontSize: '28px',
          }}>
            ⚽
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', margin: 0, color: '#fff', fontWeight: 800 }}>Matches & Fixtures</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', marginTop: '4px' }}>
              Schedule head-to-head fixtures, assign match venues, and update game statuses.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', zIndex: 1, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{matches.length}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
            </div>
            {liveCount > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.25)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', backdropFilter: 'blur(4px)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fca5a5' }}>{liveCount}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔴 Live</div>
              </div>
            )}
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c7d2fe' }}>{scheduledCount}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upcoming</div>
            </div>
          </div>
          <button
            id="btn-schedule-match"
            className="btn-primary"
            onClick={handleOpenAddModal}
            style={{
              background: '#fff',
              color: '#1a2a4a',
              fontWeight: 700,
              gap: '8px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span> Schedule Match
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
        <div style={{ flex: 1, minWidth: '200px' }}>
          <select
            id="match-tournament-filter"
            className="form-control"
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
          >
            <option value="">🏆 All Tournaments</option>
            {tournaments.map(t => (
              <option key={t.tournamentId} value={t.tournamentId}>
                {t.tournamentName}
              </option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: '180px' }}>
          <select
            id="match-status-filter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {MATCH_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
          Showing <strong>{filteredMatches.length}</strong> of {matches.length}
        </div>
      </div>

      {/* Matches Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filteredMatches.map((match) => {
          const cfg = STATUS_CONFIG[match.status] || STATUS_CONFIG['Scheduled'];
          return (
            <div
              key={match.matchId}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Card top accent with gradient */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #1a2a4a, #1e3a6e, #6366f1)' }} />

              <div style={{ padding: '18px' }}>
                {/* Tournament + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🏆 <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {match.tournamentId ? getTournamentName(match.tournamentId) : 'Friendly Match'}
                    </span>
                  </div>
                  <span style={{
                    background: cfg.bg,
                    color: cfg.color,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}>
                    {cfg.icon} {match.status || 'Scheduled'}
                  </span>
                </div>

                {/* VS Box */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(26,42,74,0.06) 0%, rgba(30,58,110,0.08) 100%)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '18px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  textAlign: 'center',
                  marginBottom: '16px',
                  border: '1px solid var(--border-color)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      width: '40px', height: '40px',
                      background: 'linear-gradient(135deg, #1a2a4a, #1e3a6e)',
                      borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                      margin: '0 auto 8px',
                    }}>
                      {getTeamName(match.teamOne).charAt(0)}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {getTeamName(match.teamOne)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>HOME</div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #1a2a4a, #6366f1)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                    margin: '0 12px',
                    boxShadow: '0 4px 12px rgba(26,42,74,0.3)',
                    letterSpacing: '1px',
                  }}>
                    VS
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      width: '40px', height: '40px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                      margin: '0 auto 8px',
                    }}>
                      {getTeamName(match.teamTwo).charAt(0)}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {getTeamName(match.teamTwo)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>AWAY</div>
                  </div>
                </div>

                {/* Match Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.835rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span>📍</span>
                    <span><strong>Venue:</strong> {match.venue || 'TBD'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span>📅</span>
                    <span><strong>Date:</strong> {match.matchDate ? new Date(match.matchDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{
                marginTop: 'auto',
                padding: '12px 18px',
                borderTop: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.015)',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '8px',
              }}>
                <button
                  id={`btn-edit-match-${match.matchId}`}
                  className="btn-secondary"
                  onClick={() => handleOpenEditModal(match)}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  ✏️ Edit
                </button>
                <button
                  id={`btn-delete-match-${match.matchId}`}
                  className="btn-secondary"
                  onClick={() => handleDelete(match.matchId)}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-muted)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--border-color)',
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '12px' }}>⚽</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            {tournamentFilter || statusFilter ? 'No matches match your filters.' : 'No matches scheduled yet.'}
          </p>
          <p style={{ fontSize: '0.875rem' }}>Click "Schedule Match" to create a fixture.</p>
        </div>
      )}

      {/* Match Schedule Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
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
                background: 'rgba(26,42,74,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
              }}>
                ⚽
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {editingId ? 'Update Match' : 'Schedule Match'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {editingId ? 'Edit match details' : 'Create a new match fixture'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)' }}
              >✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Tournament</label>
                <select
                  id="match-tournament-select"
                  className="form-control"
                  value={formData.tournamentId}
                  onChange={(e) => setFormData({ ...formData, tournamentId: e.target.value })}
                >
                  <option value="">-- Non-Tournament / Friendly Match --</option>
                  {tournaments.map(t => (
                    <option key={t.tournamentId} value={t.tournamentId}>
                      {t.tournamentName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Team 1 (Home) *</label>
                  <select
                    id="match-team-one-select"
                    className="form-control"
                    value={formData.teamOne}
                    onChange={(e) => setFormData({ ...formData, teamOne: e.target.value })}
                    required
                  >
                    <option value="">Select Team</option>
                    {teams.map(t => (
                      <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Team 2 (Away) *</label>
                  <select
                    id="match-team-two-select"
                    className="form-control"
                    value={formData.teamTwo}
                    onChange={(e) => setFormData({ ...formData, teamTwo: e.target.value })}
                    required
                  >
                    <option value="">Select Team</option>
                    {teams.map(t => (
                      <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input
                    id="match-venue-input"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Indoor Court A"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Match Date & Time</label>
                  <input
                    id="match-date-input"
                    type="datetime-local"
                    className="form-control"
                    value={formData.matchDate}
                    onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Status</label>
                <select
                  id="match-status-select"
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {MATCH_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {teams.length < 2 && (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#b45309',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}>
                  ⚠️ You need at least 2 teams to schedule a match. Please create teams under Teams Management.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button
                  id="btn-submit-match"
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || teams.length < 2}
                  style={{ minWidth: '160px' }}
                >
                  {submitting ? 'Saving...' : editingId ? '✓ Update Match' : '⚽ Confirm Fixture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesManagement;
