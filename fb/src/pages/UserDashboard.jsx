import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  tournamentService,
  matchService,
  liveScoreService,
  noticeBoardService,
  equipmentBookingService,
  groundBookingService,
  tournamentRegistrationService,
  teamService,
} from '../services/api';
import Icon from '../components/Icons';
import Spinner from '../components/Spinner';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data from Admin entries
  const [liveScores, setLiveScores] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [notices, setNotices] = useState([]);

  // User's own bookings summary
  const [myEquipmentBookings, setMyEquipmentBookings] = useState([]);
  const [myGroundBookings, setMyGroundBookings] = useState([]);

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [submittingRegistration, setSubmittingRegistration] = useState(false);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [
        liveRes,
        tourneyRes,
        matchRes,
        teamsRes,
        noticesRes,
        equipRes,
        groundRes,
      ] = await Promise.allSettled([
        liveScoreService.getAll(),
        tournamentService.getAll(),
        matchService.getAll(),
        teamService.getAll(),
        noticeBoardService.getAll(),
        equipmentBookingService.getAll(user?.userId),
        groundBookingService.getAll(user?.userId),
      ]);

      if (liveRes.status === 'fulfilled' && Array.isArray(liveRes.value)) {
        setLiveScores(liveRes.value);
      }
      if (tourneyRes.status === 'fulfilled' && Array.isArray(tourneyRes.value)) {
        setTournaments(tourneyRes.value);
      }
      if (matchRes.status === 'fulfilled' && Array.isArray(matchRes.value)) {
        setMatches(matchRes.value);
      }
      if (teamsRes.status === 'fulfilled' && Array.isArray(teamsRes.value)) {
        setTeams(teamsRes.value);
      }
      if (noticesRes.status === 'fulfilled' && Array.isArray(noticesRes.value)) {
        setNotices(noticesRes.value);
      }
      if (equipRes.status === 'fulfilled' && Array.isArray(equipRes.value)) {
        setMyEquipmentBookings(equipRes.value);
      }
      if (groundRes.status === 'fulfilled' && Array.isArray(groundRes.value)) {
        setMyGroundBookings(groundRes.value);
      }

      if (isManual) {
        showToast('Dashboard synchronized with latest Department updates!', 'info');
      }
    } catch (err) {
      console.error('Failed to load user dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 8 seconds to reflect admin entries immediately
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 8000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Tournament Registration
  const handleOpenRegister = (tournament) => {
    setSelectedTournament(tournament);
    setSelectedTeamId(teams.length > 0 ? String(teams[0].teamId) : '');
    setShowRegisterModal(true);
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    if (!selectedTournament) return;
    setSubmittingRegistration(true);
    try {
      await tournamentRegistrationService.create({
        tournamentId: selectedTournament.tournamentId,
        teamId: selectedTeamId ? Number(selectedTeamId) : 1,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'Registered',
      });
      showToast(`Successfully registered for ${selectedTournament.tournamentName}!`, 'success');
      setShowRegisterModal(false);
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmittingRegistration(false);
    }
  };

  // Helper to get team name by id
  const getTeamName = (id) => {
    if (!id) return 'TBD';
    const found = teams.find((t) => String(t.teamId) === String(id));
    return found ? found.teamName : `Team #${id}`;
  };

  if (loading) {
    return <Spinner fullPage message="Loading your Sports Athlete Dashboard..." />;
  }

  return (
    <div className="user-dashboard-wrapper">
      {/* 1. Candidate Welcome Header Banner */}
      <section className="candidate-welcome-banner">
        <div className="candidate-meta-info">
          <div className="candidate-badge-pill">
            <span className="candidate-pulse-dot"></span>
            STUDENT ATHLETE DASHBOARD
          </div>
          <h2 className="candidate-name-title">
            Welcome back, {user?.name || 'Candidate Athlete'}!
          </h2>
          <p className="candidate-subtitle">
            Madras Christian College (Autonomous) &bull; Department of Physical Education
          </p>

          <div className="candidate-details-chips">
            <span className="detail-chip">
              <strong>Reg No:</strong> {user?.registerNo || 'REG-PENDING'}
            </span>
            <span className="detail-chip">
              <strong>Dept:</strong> {user?.dept || 'Sports Science'}
            </span>
            <span className="detail-chip">
              <strong>Email:</strong> {user?.email || 'student@pe.com'}
            </span>
            <span className="detail-chip status-live">
              <strong>Status:</strong> Active Athlete
            </span>
          </div>
        </div>

        <div className="candidate-quick-actions">
          <button
            className="btn-sync-refresh"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            title="Refresh latest scores, tournaments & announcements"
          >
            <svg
              className={`refresh-icon ${refreshing ? 'spin' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>{refreshing ? 'Syncing...' : 'Sync Live Updates'}</span>
          </button>
          <button onClick={() => navigate('/equipment-bookings')} className="btn-action-primary">
            <Icon name="equipment" size={16} />
            <span>Equipment Loan</span>
          </button>
          <button onClick={() => navigate('/ground-bookings')} className="btn-action-secondary">
            <Icon name="ground" size={16} />
            <span>Reserve Ground</span>
          </button>
        </div>
      </section>

      {/* 2. Official Admin Messages & Department Announcements */}
      <section className="admin-broadcasts-section">
        <div className="section-title-row">
          <div className="title-with-icon">
            <span className="badge-icon-wrap maroon">
              <Icon name="notice" size={18} />
            </span>
            <div>
              <h3 className="section-heading">Official Directorate Announcements &amp; Messages</h3>
              <p className="section-subtext">Direct circulars and broadcasts from Physical Education Officers</p>
            </div>
          </div>
          <button className="btn-text-link" onClick={() => navigate('/notices')}>
            View Notice Board →
          </button>
        </div>

        {notices.length === 0 ? (
          <div className="empty-panel-card">
            <p>No new official announcements posted right now. Check back soon!</p>
          </div>
        ) : (
          <div className="admin-messages-grid">
            {notices.slice(0, 3).map((notice) => (
              <div key={notice.noticeId} className={`admin-notice-card ${notice.priority?.toLowerCase() === 'high' ? 'priority-high' : ''}`}>
                <div className="notice-card-top">
                  <span className={`notice-category-pill ${notice.category?.toLowerCase() || 'general'}`}>
                    {notice.category || 'General'}
                  </span>
                  <span className="notice-date">{notice.publishDate || 'Recent'}</span>
                </div>
                <h4 className="notice-title">{notice.title}</h4>
                <p className="notice-desc">{notice.description}</p>
                <div className="notice-footer">
                  <span className="notice-author">
                    <Icon name="shield" size={13} color="#9f1239" />
                    <span>Posted by {notice.createdBy || 'Directorate'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Live Scoreboard Center (Entered by Admin) */}
      <section className="live-scoreboard-section">
        <div className="section-title-row">
          <div className="title-with-icon">
            <span className="badge-icon-wrap red-pulse">
              <span className="scoreboard-live-dot"></span>
            </span>
            <div>
              <h3 className="section-heading">Live Match Scoreboard</h3>
              <p className="section-subtext">Live scores and official match updates updated in real time</p>
            </div>
          </div>
          <span className="realtime-status-pill">
            <span className="pulsing-radar"></span>
            LIVE BROADCAST
          </span>
        </div>

        {liveScores.length === 0 ? (
          <div className="empty-panel-card">
            <p>No live matches currently in progress. Scheduled fixtures will broadcast here.</p>
          </div>
        ) : (
          <div className="live-scores-grid">
            {liveScores.map((score) => (
              <div key={score.scoreId} className="live-match-card">
                <div className="match-card-header">
                  <div className="sport-type-tag">
                    <Icon name="sports" size={14} />
                    <span>{score.sportType || 'Sport'}</span>
                  </div>
                  <span className={`match-status-badge ${score.matchStatus?.toLowerCase()}`}>
                    {score.matchStatus === 'LIVE' ? '🔴 LIVE' : score.matchStatus}
                  </span>
                </div>

                <h4 className="live-match-name">{score.matchName}</h4>
                <div className="match-venue-time">
                  <span>📍 {score.venue || 'Main Stadium'}</span>
                  {score.matchDate && <span> &bull; {score.matchDate}</span>}
                </div>

                {/* Digital Scoreboard Display */}
                <div className="digital-scoreboard">
                  <div className="team-score-column">
                    <span className="team-label">{score.teamOne}</span>
                    <span className="digital-points points-team1">{score.teamOneScore}</span>
                  </div>

                  <div className="score-divider">
                    <span className="vs-text">VS</span>
                  </div>

                  <div className="team-score-column">
                    <span className="team-label">{score.teamTwo}</span>
                    <span className="digital-points points-team2">{score.teamTwoScore}</span>
                  </div>
                </div>

                {score.winner && (
                  <div className="match-winner-banner">
                    🏆 Winner: <strong>{score.winner}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Active & Upcoming Tournaments (Entered by Admin) */}
      <section className="tournaments-fixtures-section">
        <div className="dashboard-two-col-grid">
          {/* Column A: Tournaments */}
          <div className="dashboard-col-card">
            <div className="col-card-header">
              <div className="header-icon-title">
                <Icon name="trophy" size={20} color="#b45309" />
                <div>
                  <h3 className="col-heading">Tournaments &amp; Championships</h3>
                  <p className="col-sub">Official inter-collegiate and state athletic tournaments</p>
                </div>
              </div>
            </div>

            <div className="tournaments-list-flow">
              {tournaments.length === 0 ? (
                <p className="text-muted text-center py-4">No tournaments published yet.</p>
              ) : (
                tournaments.map((t) => (
                  <div key={t.tournamentId} className="tournament-entry-card">
                    <div className="tournament-entry-main">
                      <div className="tournament-badge-row">
                        <span className={`status-pill ${t.status?.toLowerCase() || 'upcoming'}`}>
                          {t.status || 'Upcoming'}
                        </span>
                        <span className="tournament-id-tag">#{t.tournamentId}</span>
                      </div>
                      <h4 className="tournament-name">{t.tournamentName}</h4>
                      <div className="tournament-details-row">
                        <span>🏛️ {t.organizer || 'PE Dept'}</span>
                        <span>📍 {t.venue || 'Main Ground'}</span>
                        <span>📅 {t.startDate} to {t.endDate}</span>
                      </div>
                    </div>

                    <div className="tournament-action-col">
                      <button
                        className="btn-register-tournament"
                        onClick={() => handleOpenRegister(t)}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column B: Scheduled Team Matches (Entered by Admin) */}
          <div className="dashboard-col-card">
            <div className="col-card-header">
              <div className="header-icon-title">
                <Icon name="calendar" size={20} color="#1e2d5a" />
                <div>
                  <h3 className="col-heading">Team Match Fixtures</h3>
                  <p className="col-sub">Upcoming tournament rounds and scheduled games</p>
                </div>
              </div>
            </div>

            <div className="matches-list-flow">
              {matches.length === 0 ? (
                <p className="text-muted text-center py-4">No match fixtures scheduled yet.</p>
              ) : (
                matches.map((m) => (
                  <div key={m.matchId} className="match-fixture-item">
                    <div className="match-teams-row">
                      <div className="match-team team-left">
                        <span className="match-team-name">{getTeamName(m.teamOne)}</span>
                      </div>
                      <div className="match-vs-badge">VS</div>
                      <div className="match-team team-right">
                        <span className="match-team-name">{getTeamName(m.teamTwo)}</span>
                      </div>
                    </div>

                    <div className="match-fixture-meta">
                      <span>📍 {m.venue || 'Pavilion Ground'}</span>
                      <span>📅 {m.matchDate ? m.matchDate.replace('T', ' ') : 'TBD'}</span>
                      <span className={`fixture-status ${m.status?.toLowerCase() || 'scheduled'}`}>
                        {m.status || 'Scheduled'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Candidate Dossier & Facility Loan Summary */}
      <section className="candidate-services-section">
        <h3 className="section-heading mb-4">My Candidate Portal Summary</h3>
        <div className="services-summary-grid">
          <div className="service-status-card" onClick={() => navigate('/profile')}>
            <div className="service-icon-box maroon">
              <Icon name="userCheck" size={22} />
            </div>
            <div className="service-meta">
              <h4>Candidate Dossier</h4>
              <p>Specialization &amp; Academic Bio</p>
              <span className="service-link">Update Profile →</span>
            </div>
          </div>

          <div className="service-status-card" onClick={() => navigate('/equipment-bookings')}>
            <div className="service-icon-box gold">
              <Icon name="equipment" size={22} />
            </div>
            <div className="service-meta">
              <h4>Equipment Loans</h4>
              <p>{myEquipmentBookings.length} Active Gear Requests</p>
              <span className="service-link">View Loans →</span>
            </div>
          </div>

          <div className="service-status-card" onClick={() => navigate('/ground-bookings')}>
            <div className="service-icon-box navy">
              <Icon name="ground" size={22} />
            </div>
            <div className="service-meta">
              <h4>Ground Bookings</h4>
              <p>{myGroundBookings.length} Reserved Slots</p>
              <span className="service-link">Check Slots →</span>
            </div>
          </div>

          <div className="service-status-card" onClick={() => navigate('/health-fitness')}>
            <div className="service-icon-box crimson">
              <Icon name="health" size={22} />
            </div>
            <div className="service-meta">
              <h4>Health &amp; Fitness</h4>
              <p>Medical Fitness &amp; Vitals</p>
              <span className="service-link">View Vitals →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Registration Modal */}
      {showRegisterModal && selectedTournament && (
        <div className="modal-overlay">
          <div className="modal-box-card">
            <div className="modal-card-header">
              <h3>Register for Tournament</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowRegisterModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRegistration} className="modal-form">
              <div className="modal-tourney-info">
                <h4>{selectedTournament.tournamentName}</h4>
                <p>Venue: {selectedTournament.venue} &bull; Dates: {selectedTournament.startDate} to {selectedTournament.endDate}</p>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Select Your Team / Squad</label>
                <select
                  className="form-control"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  required
                >
                  {teams.length === 0 ? (
                    <option value="1">College Squad #1</option>
                  ) : (
                    teams.map((t) => (
                      <option key={t.teamId} value={t.teamId}>
                        {t.teamName} (Team #{t.teamId})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Candidate Athlete</label>
                <input
                  type="text"
                  className="form-control"
                  value={`${user?.name || 'Candidate'} (${user?.registerNo || 'Reg'})`}
                  disabled
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowRegisterModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingRegistration}
                >
                  {submittingRegistration ? 'Submitting...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
