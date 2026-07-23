import React, { useState, useEffect } from 'react';
import { matchService, tournamentService, teamService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const MATCH_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Postponed', 'Cancelled'];

const MatchesManagement = () => {
  const { showToast } = useToast();

  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournamentFilter, setTournamentFilter] = useState('');

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
    if (formData.teamOne === formData.teamTwo) {
      showToast('Team 1 and Team 2 must be different teams', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await matchService.update(editingId, formData);
        showToast('Match updated successfully! ⚽', 'success');
      } else {
        await matchService.create(formData);
        showToast('New Match scheduled! ⚽', 'success');
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
    const t = teams.find(item => item.teamId === teamId);
    return t ? t.teamName : `Team #${teamId}`;
  };

  const getTournamentName = (tId) => {
    const t = tournaments.find(item => item.tournamentId === tId);
    return t ? t.tournamentName : `Tournament #${tId}`;
  };

  const filteredMatches = matches.filter(m =>
    !tournamentFilter || String(m.tournamentId) === String(tournamentFilter)
  );

  if (loading && matches.length === 0) {
    return <Spinner fullPage message="Loading match schedules..." />;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>⚽</span>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Matches &amp; Fixtures Schedule</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                Schedule head-to-head fixtures, assign match venues, and update game statuses.
              </p>
            </div>
          </div>

          <button className="btn-primary" onClick={handleOpenAddModal} style={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
            <span>➕</span> Schedule Match
          </button>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '24px', width: '280px' }}>
          <select
            className="form-control"
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
          >
            <option value="">All Tournaments</option>
            {tournaments.map(t => (
              <option key={t.tournamentId} value={t.tournamentId}>
                {t.tournamentName}
              </option>
            ))}
          </select>
        </div>

        {/* Matches List Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredMatches.map((match) => (
            <div
              key={match.matchId}
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
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '10px' }}>
                  🏆 {getTournamentName(match.tournamentId)}
                </div>

                {/* Team Vs Team Box */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  textAlign: 'center',
                  marginBottom: '14px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {getTeamName(match.teamOne)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Team A</div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                    margin: '0 10px'
                  }}>
                    VS
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {getTeamName(match.teamTwo)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Team B</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>📍 <strong>Venue:</strong> {match.venue || 'TBD'}</div>
                  <div>🕒 <strong>Scheduled:</strong> {match.matchDate ? new Date(match.matchDate).toLocaleString() : 'TBD'}</div>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  background: match.status === 'In Progress' ? 'rgba(16, 185, 129, 0.2)' :
                              match.status === 'Scheduled' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                  color: match.status === 'In Progress' ? 'var(--success)' :
                         match.status === 'Scheduled' ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {match.status || 'Scheduled'}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => handleOpenEditModal(match)} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                    ✏️ Edit
                  </button>
                  <button className="btn-secondary" onClick={() => handleDelete(match.matchId)} style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--error)' }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMatches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '10px' }}>⚽</p>
            <p>No matches scheduled yet.</p>
          </div>
        )}
      </div>

      {/* Match Schedule Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>
              {editingId ? '✏️ Update Match' : '➕ Schedule Match'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Tournament</label>
                <select
                  className="form-control"
                  value={formData.tournamentId}
                  onChange={(e) => setFormData({ ...formData, tournamentId: e.target.value })}
                >
                  <option value="">-- Non-Tournament / Friendly --</option>
                  {tournaments.map(t => (
                    <option key={t.tournamentId} value={t.tournamentId}>
                      {t.tournamentName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Team 1 (Home) *</label>
                  <select
                    className="form-control"
                    value={formData.teamOne}
                    onChange={(e) => setFormData({ ...formData, teamOne: e.target.value })}
                    required
                  >
                    {teams.map(t => (
                      <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Team 2 (Away) *</label>
                  <select
                    className="form-control"
                    value={formData.teamTwo}
                    onChange={(e) => setFormData({ ...formData, teamTwo: e.target.value })}
                    required
                  >
                    {teams.map(t => (
                      <option key={t.teamId} value={t.teamId}>{t.teamName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Indoor Court A"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Match Date &amp; Time</label>
                  <input
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
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {MATCH_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting || teams.length < 2}>
                  {submitting ? 'Saving...' : editingId ? 'Update Match' : 'Confirm Fixture'}
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
