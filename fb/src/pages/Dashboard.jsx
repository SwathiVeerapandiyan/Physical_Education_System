import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  dashboardService,
  equipmentBookingService,
  groundBookingService,
  tournamentService,
  userFormService,
  liveScoreService,
  matchService,
  teamService,
  noticeBoardService,
  authService,
} from '../services/api';
import Icon from '../components/Icons';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCandidates: 0,
    totalMaleStudents: 0,
    totalFemaleStudents: 0,
  });
  const [equipmentBookings, setEquipmentBookings] = useState([]);
  const [groundBookings, setGroundBookings] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [liveScores, setLiveScores] = useState([]);
  const [teams, setTeams] = useState([]);
  const [notices, setNotices] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  const [activeApprovalTab, setActiveApprovalTab] = useState('equipment'); // 'equipment' or 'ground'
  const [processingId, setProcessingId] = useState(null);

  // Sports Operations Center Active Tab: 'liveScore' | 'tournament' | 'match' | 'notice'
  const [opsTab, setOpsTab] = useState('liveScore');
  const [isSubmittingOps, setIsSubmittingOps] = useState(false);

  // Form states for Operations
  const [liveScoreForm, setLiveScoreForm] = useState({
    matchName: '',
    sportType: 'Cricket',
    teamOne: 'MCC Stallions',
    teamTwo: 'Loyola Lions',
    teamOneScore: 120,
    teamTwoScore: 98,
    matchStatus: 'LIVE',
    venue: 'Pavilion Stadium',
    winner: '',
  });

  const [tournamentForm, setTournamentForm] = useState({
    tournamentName: '',
    organizer: 'Department of Physical Education',
    venue: 'Main Ground',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'Upcoming',
  });

  const [matchForm, setMatchForm] = useState({
    tournamentId: '',
    teamOne: '',
    teamTwo: '',
    venue: 'Pavilion Ground',
    matchDate: new Date().toISOString().split('T')[0] + 'T14:30',
    status: 'Scheduled',
  });

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    description: '',
    category: 'Tournament',
    priority: 'Normal',
  });

  const fetchDashboardData = async () => {
    try {
      const [
        statsRes,
        equipRes,
        groundRes,
        tourneyRes,
        formsRes,
        matchesRes,
        liveScoresRes,
        teamsRes,
        noticesRes,
        usersRes,
      ] = await Promise.allSettled([
        dashboardService.getStats(),
        equipmentBookingService.getAll(),
        groundBookingService.getAll(),
        tournamentService.getAll(),
        userFormService.getAll(),
        matchService.getAll(),
        liveScoreService.getAll(),
        teamService.getAll(),
        noticeBoardService.getAll(),
        authService.getAllUsers(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      }
      if (equipRes.status === 'fulfilled' && Array.isArray(equipRes.value)) {
        setEquipmentBookings(equipRes.value);
      }
      if (groundRes.status === 'fulfilled' && Array.isArray(groundRes.value)) {
        setGroundBookings(groundRes.value);
      }
      if (tourneyRes.status === 'fulfilled' && Array.isArray(tourneyRes.value)) {
        setTournaments(tourneyRes.value);
        if (tourneyRes.value.length > 0 && !matchForm.tournamentId) {
          setMatchForm((prev) => ({ ...prev, tournamentId: tourneyRes.value[0].tournamentId }));
        }
      }
      if (matchesRes.status === 'fulfilled' && Array.isArray(matchesRes.value)) {
        setMatches(matchesRes.value);
      }
      if (liveScoresRes.status === 'fulfilled' && Array.isArray(liveScoresRes.value)) {
        setLiveScores(liveScoresRes.value);
      }
      if (teamsRes.status === 'fulfilled' && Array.isArray(teamsRes.value)) {
        setTeams(teamsRes.value);
        if (teamsRes.value.length >= 2 && !matchForm.teamOne) {
          setMatchForm((prev) => ({
            ...prev,
            teamOne: teamsRes.value[0].teamId,
            teamTwo: teamsRes.value[1].teamId,
          }));
        }
      }
      if (noticesRes.status === 'fulfilled' && Array.isArray(noticesRes.value)) {
        setNotices(noticesRes.value);
      }
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        setRegisteredUsers(usersRes.value);
      }

      if (formsRes.status === 'fulfilled' && Array.isArray(formsRes.value)) {
        const specMap = {};
        formsRes.value.forEach((f) => {
          if (f.specialization) {
            specMap[f.specialization] = (specMap[f.specialization] || 0) + 1;
          }
        });
        const sortedSpecs = Object.entries(specMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setSpecializations(sortedSpecs);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto sync every 10 seconds to reflect immediate candidate entries
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Quick Approval Handlers
  const handleApproveEquipment = async (item) => {
    try {
      setProcessingId(`eq-${item.bookingId}`);
      const updated = {
        ...item,
        bookingStatus: 'Approved',
        approvedBy: user?.name || 'Sports Officer',
      };
      await equipmentBookingService.update(item.bookingId, updated);
      setEquipmentBookings((prev) =>
        prev.map((b) => (b.bookingId === item.bookingId ? updated : b))
      );
      showToast(`Equipment loan #${item.bookingId} (${item.equipmentName}) approved!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve booking', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectEquipment = async (item) => {
    try {
      setProcessingId(`eq-${item.bookingId}`);
      const updated = {
        ...item,
        bookingStatus: 'Rejected',
        approvedBy: user?.name || 'Sports Officer',
      };
      await equipmentBookingService.update(item.bookingId, updated);
      setEquipmentBookings((prev) =>
        prev.map((b) => (b.bookingId === item.bookingId ? updated : b))
      );
      showToast(`Equipment loan #${item.bookingId} rejected.`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveGround = async (item) => {
    try {
      setProcessingId(`gr-${item.bookingId}`);
      const updated = {
        ...item,
        bookingStatus: 'Approved',
        approvedBy: user?.name || 'Sports Officer',
      };
      await groundBookingService.update(item.bookingId, updated);
      setGroundBookings((prev) =>
        prev.map((b) => (b.bookingId === item.bookingId ? updated : b))
      );
      showToast(`Ground booking #${item.bookingId} (${item.groundName}) approved!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve booking', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectGround = async (item) => {
    try {
      setProcessingId(`gr-${item.bookingId}`);
      const updated = {
        ...item,
        bookingStatus: 'Rejected',
        approvedBy: user?.name || 'Sports Officer',
      };
      await groundBookingService.update(item.bookingId, updated);
      setGroundBookings((prev) =>
        prev.map((b) => (b.bookingId === item.bookingId ? updated : b))
      );
      showToast(`Ground booking #${item.bookingId} rejected.`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Operations Hub Handlers: 1. Live Score
  const handleSaveLiveScore = async (e) => {
    e.preventDefault();
    if (!liveScoreForm.matchName.trim()) {
      showToast('Please enter match name', 'error');
      return;
    }
    setIsSubmittingOps(true);
    try {
      const payload = {
        matchName: liveScoreForm.matchName,
        sportType: liveScoreForm.sportType,
        teamOne: liveScoreForm.teamOne,
        teamTwo: liveScoreForm.teamTwo,
        teamOneScore: Number(liveScoreForm.teamOneScore),
        teamTwoScore: Number(liveScoreForm.teamTwoScore),
        matchStatus: liveScoreForm.matchStatus,
        venue: liveScoreForm.venue,
        winner: liveScoreForm.winner,
        matchDate: new Date().toISOString().split('T')[0],
        startTime: '14:00:00',
      };

      const res = await liveScoreService.create(payload);
      setLiveScores((prev) => [res, ...prev]);
      showToast('Live score broadcasted! Immediately reflecting on User Dashboard.', 'success');
      // Reset form
      setLiveScoreForm({
        matchName: '',
        sportType: 'Cricket',
        teamOne: 'MCC Stallions',
        teamTwo: 'Loyola Lions',
        teamOneScore: 0,
        teamTwoScore: 0,
        matchStatus: 'LIVE',
        venue: 'Pavilion Stadium',
        winner: '',
      });
    } catch (err) {
      showToast(err.message || 'Failed to save live score', 'error');
    } finally {
      setIsSubmittingOps(false);
    }
  };

  const handleAutoFillDemoScore = () => {
    setLiveScoreForm({
      matchName: 'Championship T20 Finals: MCC vs Loyola',
      sportType: 'Cricket',
      teamOne: 'MCC Lions',
      teamTwo: 'Loyola Warriors',
      teamOneScore: 168,
      teamTwoScore: 142,
      matchStatus: 'LIVE',
      venue: 'Main Athletics Pavilion',
      winner: '',
    });
    showToast('Demo live score details filled! Click Broadcast to post.', 'info');
  };

  // 2. Tournament
  const handleSaveTournament = async (e) => {
    e.preventDefault();
    if (!tournamentForm.tournamentName.trim()) {
      showToast('Please enter tournament name', 'error');
      return;
    }
    setIsSubmittingOps(true);
    try {
      const res = await tournamentService.create(tournamentForm);
      setTournaments((prev) => [res, ...prev]);
      showToast(`Tournament "${res.tournamentName}" published! Immediately reflecting on User Dashboard.`, 'success');
      setTournamentForm({
        tournamentName: '',
        organizer: 'Department of Physical Education',
        venue: 'Main Ground',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'Upcoming',
      });
    } catch (err) {
      showToast(err.message || 'Failed to save tournament', 'error');
    } finally {
      setIsSubmittingOps(false);
    }
  };

  const handleAutoFillDemoTournament = () => {
    setTournamentForm({
      tournamentName: 'State Inter-University Athletics Meet 2026',
      organizer: 'Directorate of Sports & PE',
      venue: 'Olympic Standard Track Oval',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      status: 'Upcoming',
    });
    showToast('Demo tournament details filled! Click Publish to post.', 'info');
  };

  // 3. Team Match
  const handleSaveMatch = async (e) => {
    e.preventDefault();
    if (!matchForm.tournamentId) {
      showToast('Please select a tournament', 'error');
      return;
    }
    setIsSubmittingOps(true);
    try {
      const payload = {
        tournamentId: Number(matchForm.tournamentId),
        teamOne: matchForm.teamOne,
        teamTwo: matchForm.teamTwo,
        venue: matchForm.venue,
        matchDate: matchForm.matchDate,
        status: matchForm.status,
      };
      const res = await matchService.create(payload);
      setMatches((prev) => [res, ...prev]);
      showToast('Match fixture scheduled! Immediately reflecting on User Dashboard.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to schedule match', 'error');
    } finally {
      setIsSubmittingOps(false);
    }
  };

  const handleAutoFillDemoMatch = () => {
    setMatchForm({
      tournamentId: tournaments.length > 0 ? tournaments[0].tournamentId : 1,
      teamOne: teams.length > 0 ? teams[0].teamId : 1,
      teamTwo: teams.length > 1 ? teams[1].teamId : 2,
      venue: 'North Campus Football Arena',
      matchDate: new Date().toISOString().split('T')[0] + 'T16:00',
      status: 'Scheduled',
    });
    showToast('Demo match fixture details filled! Click Schedule to save.', 'info');
  };

  // 4. Directorate Announcement / Notice
  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.description.trim()) {
      showToast('Please enter notice title and description', 'error');
      return;
    }
    setIsSubmittingOps(true);
    try {
      const payload = {
        title: noticeForm.title,
        description: noticeForm.description,
        category: noticeForm.category,
        priority: noticeForm.priority,
        publishDate: new Date().toISOString().split('T')[0],
        createdBy: user?.name || 'Admin Directorate',
        isActive: true,
      };
      const res = await noticeBoardService.create(payload);
      setNotices((prev) => [res, ...prev]);
      showToast('Notice broadcasted! Immediately reflecting on User Dashboard.', 'success');
      setNoticeForm({
        title: '',
        description: '',
        category: 'Tournament',
        priority: 'Normal',
      });
    } catch (err) {
      showToast(err.message || 'Failed to broadcast notice', 'error');
    } finally {
      setIsSubmittingOps(false);
    }
  };

  const handleAutoFillDemoNotice = () => {
    setNoticeForm({
      title: 'Urgent: Selection Trials for State Basketball Championship',
      description: 'All candidates with specialization in Basketball are requested to report to the Indoor Wooden Court tomorrow at 6:30 AM in proper sporting gear.',
      category: 'Tournament',
      priority: 'High',
    });
    showToast('Demo announcement filled! Click Broadcast to post.', 'info');
  };

  // Helper team names
  const getTeamName = (id) => {
    if (!id) return 'TBD';
    const found = teams.find((t) => String(t.teamId) === String(id));
    return found ? found.teamName : `Team #${id}`;
  };

  const pendingEquipment = equipmentBookings.filter(
    (b) => (b.bookingStatus || '').toLowerCase() === 'pending'
  );
  const pendingGround = groundBookings.filter(
    (b) => (b.bookingStatus || '').toLowerCase() === 'pending'
  );
  const totalPendingActions = pendingEquipment.length + pendingGround.length;

  return (
    <div className="dashboard-wrapper">
      {/* 1. Executive Admin Banner */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <div className="admin-console-pill">
            <span className="live-dot" />
            ADMINISTRATIVE COMMAND COCKPIT
          </div>
          <h2>Department of Physical Education &amp; Sports</h2>
          <p className="admin-dept-subtitle">
            Madras Christian College (Autonomous) — Central Administrative Console
          </p>
          <div className="badge-grid mt-4">
            <span className="info-badge">
              <strong>Admin:</strong> {user?.name || 'Dr. S. Kumar (Sports Director)'}
            </span>
            <span className="info-badge">
              <strong>Staff ID:</strong> {user?.registerNo || 'PE-ADMIN-01'}
            </span>
            <span className="info-badge">
              <strong>Session:</strong> Academic Year 2024–2025
            </span>
            <span className="info-badge-alert">
              <strong>Action Queue:</strong> {totalPendingActions} Pending Sign-offs
            </span>
          </div>
        </div>

        <div className="admin-quick-actions-banner">
          <button onClick={() => navigate('/users')} className="btn-banner-action">
            <Icon name="users" size={16} />
            <span>Athlete Roster ({registeredUsers.length})</span>
          </button>
          <button onClick={() => navigate('/equipment-bookings')} className="btn-banner-action">
            <Icon name="equipment" size={16} />
            <span>Gear Inventory</span>
          </button>
          <button onClick={() => setOpsTab('tournament')} className="btn-banner-action primary">
            <Icon name="trophy" size={16} />
            <span>New Tournament</span>
          </button>
        </div>
      </section>

      {/* 2. Executive KPI Cards */}
      <section className="stats-grid mt-6">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Registered Athletes</span>
            <span className="stat-icon-badge maroon">
              <Icon name="users" size={18} />
            </span>
          </div>
          <h3 className="stat-value">{registeredUsers.length || stats?.totalCandidates || 0}</h3>
          <div className="stat-footer">
            <span className="stat-split-pill">
              M: {stats?.totalMaleStudents ?? 0} Male
            </span>
            <span className="stat-split-pill">
              F: {stats?.totalFemaleStudents ?? 0} Female
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Equipment Loans</span>
            <span className="stat-icon-badge gold">
              <Icon name="equipment" size={18} />
            </span>
          </div>
          <h3 className="stat-value">{equipmentBookings.length}</h3>
          <div className="stat-footer">
            {pendingEquipment.length > 0 ? (
              <span className="stat-trend warning">
                {pendingEquipment.length} Approvals Pending
              </span>
            ) : (
              <span className="stat-trend green">All loans signed off</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Ground Bookings</span>
            <span className="stat-icon-badge navy">
              <Icon name="ground" size={18} />
            </span>
          </div>
          <h3 className="stat-value">{groundBookings.length}</h3>
          <div className="stat-footer">
            {pendingGround.length > 0 ? (
              <span className="stat-trend warning">
                {pendingGround.length} Reservation Requests
              </span>
            ) : (
              <span className="stat-trend green">Facilities on schedule</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Tournaments &amp; Events</span>
            <span className="stat-icon-badge crimson">
              <Icon name="trophy" size={18} />
            </span>
          </div>
          <h3 className="stat-value">{tournaments.length}</h3>
          <div className="stat-footer">
            <span className="stat-trend green">
              {liveScores.length} Live Matches Active
            </span>
          </div>
        </div>
      </section>

      {/* 3. SPORTS OPERATIONS & LIVE BROADCAST COMMAND CENTER */}
      {/* (Where Admin enters Tournaments, Team Matches, Live Scoreboard & Announcements that reflect immediately on User Dashboard) */}
      <section className="ops-command-card mt-6">
        <div className="ops-card-header">
          <div className="ops-header-title-box">
            <div className="ops-live-pill">
              <span className="live-pulse-dot" />
              DIRECTORATE BROADCAST CONTROLLER
            </div>
            <h3 className="ops-title">Sports Operational Hub &amp; Live Feeds</h3>
            <p className="ops-subtitle">
              Enter Tournament schedules, Team matches, Live scores, and Announcements. All entries reflect <strong>instantly</strong> on candidate User Dashboards.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="ops-tab-nav">
            <button
              type="button"
              className={`ops-nav-btn ${opsTab === 'liveScore' ? 'active' : ''}`}
              onClick={() => setOpsTab('liveScore')}
            >
              <span className="dot-red" />
              <span>Live Scoreboard ({liveScores.length})</span>
            </button>
            <button
              type="button"
              className={`ops-nav-btn ${opsTab === 'tournament' ? 'active' : ''}`}
              onClick={() => setOpsTab('tournament')}
            >
              <Icon name="trophy" size={15} />
              <span>Tournaments ({tournaments.length})</span>
            </button>
            <button
              type="button"
              className={`ops-nav-btn ${opsTab === 'match' ? 'active' : ''}`}
              onClick={() => setOpsTab('match')}
            >
              <Icon name="calendar" size={15} />
              <span>Team Matches ({matches.length})</span>
            </button>
            <button
              type="button"
              className={`ops-nav-btn ${opsTab === 'notice' ? 'active' : ''}`}
              onClick={() => setOpsTab('notice')}
            >
              <Icon name="notice" size={15} />
              <span>Broadcast Messages ({notices.length})</span>
            </button>
          </div>
        </div>

        <div className="ops-card-body">
          {/* TAB 1: LIVE SCOREBOARD */}
          {opsTab === 'liveScore' && (
            <div className="ops-tab-content">
              <div className="ops-form-panel">
                <div className="panel-header-row">
                  <h4>Broadcast / Update Live Match Scoreboard</h4>
                  <button
                    type="button"
                    className="btn-autofill-demo"
                    onClick={handleAutoFillDemoScore}
                  >
                    Auto-Fill Demo Score
                  </button>
                </div>

                <form onSubmit={handleSaveLiveScore} className="ops-form-grid">
                  <div className="form-col-span-2">
                    <label className="form-label">Match Title / Fixture Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Finals: MCC Lions vs Loyola Warriors"
                      value={liveScoreForm.matchName}
                      onChange={(e) => setLiveScoreForm({ ...liveScoreForm, matchName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Sport Category</label>
                    <select
                      className="form-control"
                      value={liveScoreForm.sportType}
                      onChange={(e) => setLiveScoreForm({ ...liveScoreForm, sportType: e.target.value })}
                    >
                      <option value="Cricket">Cricket</option>
                      <option value="Football">Football</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Volleyball">Volleyball</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Badminton">Badminton</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Match Status</label>
                    <select
                      className="form-control"
                      value={liveScoreForm.matchStatus}
                      onChange={(e) => setLiveScoreForm({ ...liveScoreForm, matchStatus: e.target.value })}
                    >
                      <option value="LIVE">🔴 LIVE</option>
                      <option value="Halftime">Halftime</option>
                      <option value="Break">Break</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Team One Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={liveScoreForm.teamOne}
                      onChange={(e) => setLiveScoreForm({ ...liveScoreForm, teamOne: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Team One Score / Points</label>
                    <div className="score-input-stepper">
                      <input
                        type="number"
                        className="form-control"
                        value={liveScoreForm.teamOneScore}
                        onChange={(e) => setLiveScoreForm({ ...liveScoreForm, teamOneScore: Number(e.target.value) })}
                      />
                      <button
                        type="button"
                        className="btn-stepper"
                        onClick={() => setLiveScoreForm((p) => ({ ...p, teamOneScore: p.teamOneScore + 1 }))}
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        className="btn-stepper"
                        onClick={() => setLiveScoreForm((p) => ({ ...p, teamOneScore: p.teamOneScore + 4 }))}
                      >
                        +4
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Team Two Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={liveScoreForm.teamTwo}
                      onChange={(e) => setLiveScoreForm({ ...liveScoreForm, teamTwo: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Team Two Score / Points</label>
                    <div className="score-input-stepper">
                      <input
                        type="number"
                        className="form-control"
                        value={liveScoreForm.teamTwoScore}
                        onChange={(e) => setLiveScoreForm({ ...liveScoreForm, teamTwoScore: Number(e.target.value) })}
                      />
                      <button
                        type="button"
                        className="btn-stepper"
                        onClick={() => setLiveScoreForm((p) => ({ ...p, teamTwoScore: p.teamTwoScore + 1 }))}
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        className="btn-stepper"
                        onClick={() => setLiveScoreForm((p) => ({ ...p, teamTwoScore: p.teamTwoScore + 4 }))}
                      >
                        +4
                      </button>
                    </div>
                  </div>

                  <div className="form-col-span-2">
                    <label className="form-label">Venue / Stadium</label>
                    <input
                      type="text"
                      className="form-control"
                      value={liveScoreForm.venue}
                      onChange={(e) => setLiveScoreForm({ ...liveScoreForm, venue: e.target.value })}
                    />
                  </div>

                  <div className="form-col-span-2 ops-submit-row">
                    <button
                      type="submit"
                      className="btn-ops-submit"
                      disabled={isSubmittingOps}
                    >
                      {isSubmittingOps ? 'Broadcasting...' : 'Broadcast Live Score to Users'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Table of Live Scores */}
              <div className="ops-records-preview">
                <h5 className="preview-heading">Active Live Scoreboards ({liveScores.length})</h5>
                <div className="ops-table-wrap">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Fixture</th>
                        <th>Sport</th>
                        <th>Scores</th>
                        <th>Status</th>
                        <th>Venue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveScores.map((sc) => (
                        <tr key={sc.scoreId}>
                          <td><strong>{sc.matchName}</strong></td>
                          <td>{sc.sportType}</td>
                          <td>
                            <span className="live-score-pill">
                              {sc.teamOne}: <strong>{sc.teamOneScore}</strong> &bull; {sc.teamTwo}: <strong>{sc.teamTwoScore}</strong>
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${sc.matchStatus?.toLowerCase()}`}>
                              {sc.matchStatus === 'LIVE' ? '🔴 LIVE' : sc.matchStatus}
                            </span>
                          </td>
                          <td>{sc.venue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOURNAMENTS */}
          {opsTab === 'tournament' && (
            <div className="ops-tab-content">
              <div className="ops-form-panel">
                <div className="panel-header-row">
                  <h4>Create &amp; Publish New Athletic Tournament</h4>
                  <button
                    type="button"
                    className="btn-autofill-demo"
                    onClick={handleAutoFillDemoTournament}
                  >
                    Auto-Fill Demo Tournament
                  </button>
                </div>

                <form onSubmit={handleSaveTournament} className="ops-form-grid">
                  <div className="form-col-span-2">
                    <label className="form-label">Tournament Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. South Zone Inter-Collegiate Cricket Trophy 2026"
                      value={tournamentForm.tournamentName}
                      onChange={(e) => setTournamentForm({ ...tournamentForm, tournamentName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Organizer Body</label>
                    <input
                      type="text"
                      className="form-control"
                      value={tournamentForm.organizer}
                      onChange={(e) => setTournamentForm({ ...tournamentForm, organizer: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Ground / Venue</label>
                    <input
                      type="text"
                      className="form-control"
                      value={tournamentForm.venue}
                      onChange={(e) => setTournamentForm({ ...tournamentForm, venue: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={tournamentForm.startDate}
                      onChange={(e) => setTournamentForm({ ...tournamentForm, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={tournamentForm.endDate}
                      onChange={(e) => setTournamentForm({ ...tournamentForm, endDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Tournament Status</label>
                    <select
                      className="form-control"
                      value={tournamentForm.status}
                      onChange={(e) => setTournamentForm({ ...tournamentForm, status: e.target.value })}
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-col-span-2 ops-submit-row">
                    <button
                      type="submit"
                      className="btn-ops-submit"
                      disabled={isSubmittingOps}
                    >
                      {isSubmittingOps ? 'Publishing...' : 'Publish Tournament to User Dashboard'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Table of Tournaments */}
              <div className="ops-records-preview">
                <h5 className="preview-heading">Published Tournaments ({tournaments.length})</h5>
                <div className="ops-table-wrap">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tournament</th>
                        <th>Venue</th>
                        <th>Dates</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tournaments.map((t) => (
                        <tr key={t.tournamentId}>
                          <td className="fw-bold">#{t.tournamentId}</td>
                          <td><strong>{t.tournamentName}</strong></td>
                          <td>{t.venue}</td>
                          <td>{t.startDate} to {t.endDate}</td>
                          <td>
                            <span className={`status-pill ${t.status?.toLowerCase()}`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM MATCHES */}
          {opsTab === 'match' && (
            <div className="ops-tab-content">
              <div className="ops-form-panel">
                <div className="panel-header-row">
                  <h4>Schedule Team Match Fixture</h4>
                  <button
                    type="button"
                    className="btn-autofill-demo"
                    onClick={handleAutoFillDemoMatch}
                  >
                    Auto-Fill Demo Match
                  </button>
                </div>

                <form onSubmit={handleSaveMatch} className="ops-form-grid">
                  <div className="form-col-span-2">
                    <label className="form-label">Associated Tournament</label>
                    <select
                      className="form-control"
                      value={matchForm.tournamentId}
                      onChange={(e) => setMatchForm({ ...matchForm, tournamentId: e.target.value })}
                      required
                    >
                      {tournaments.map((t) => (
                        <option key={t.tournamentId} value={t.tournamentId}>
                          #{t.tournamentId} — {t.tournamentName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Team One</label>
                    <select
                      className="form-control"
                      value={matchForm.teamOne}
                      onChange={(e) => setMatchForm({ ...matchForm, teamOne: e.target.value })}
                      required
                    >
                      {teams.map((tm) => (
                        <option key={tm.teamId} value={tm.teamId}>
                          {tm.teamName} (Team #{tm.teamId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Team Two</label>
                    <select
                      className="form-control"
                      value={matchForm.teamTwo}
                      onChange={(e) => setMatchForm({ ...matchForm, teamTwo: e.target.value })}
                      required
                    >
                      {teams.map((tm) => (
                        <option key={tm.teamId} value={tm.teamId}>
                          {tm.teamName} (Team #{tm.teamId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={matchForm.matchDate}
                      onChange={(e) => setMatchForm({ ...matchForm, matchDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Venue</label>
                    <input
                      type="text"
                      className="form-control"
                      value={matchForm.venue}
                      onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-col-span-2 ops-submit-row">
                    <button
                      type="submit"
                      className="btn-ops-submit"
                      disabled={isSubmittingOps}
                    >
                      {isSubmittingOps ? 'Scheduling...' : 'Schedule Match for User Dashboard'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Table of Matches */}
              <div className="ops-records-preview">
                <h5 className="preview-heading">Scheduled Fixtures ({matches.length})</h5>
                <div className="ops-table-wrap">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Match #</th>
                        <th>Teams</th>
                        <th>Date &amp; Time</th>
                        <th>Venue</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((m) => (
                        <tr key={m.matchId}>
                          <td className="fw-bold">#{m.matchId}</td>
                          <td>
                            <strong>{getTeamName(m.teamOne)}</strong> vs <strong>{getTeamName(m.teamTwo)}</strong>
                          </td>
                          <td>{m.matchDate?.replace('T', ' ')}</td>
                          <td>{m.venue}</td>
                          <td>
                            <span className="status-pill upcoming">{m.status || 'Scheduled'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BROADCAST MESSAGES / NOTICES */}
          {opsTab === 'notice' && (
            <div className="ops-tab-content">
              <div className="ops-form-panel">
                <div className="panel-header-row">
                  <h4>Broadcast Directorate Notice / Announcement</h4>
                  <button
                    type="button"
                    className="btn-autofill-demo"
                    onClick={handleAutoFillDemoNotice}
                  >
                    Auto-Fill Demo Notice
                  </button>
                </div>

                <form onSubmit={handleSaveNotice} className="ops-form-grid">
                  <div className="form-col-span-2">
                    <label className="form-label">Announcement Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Schedule for Annual Athletics Meet 2026"
                      value={noticeForm.title}
                      onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={noticeForm.category}
                      onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    >
                      <option value="Tournament">Tournament</option>
                      <option value="Trials">Selection Trials</option>
                      <option value="General">General Notice</option>
                      <option value="Emergency">Urgent Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control"
                      value={noticeForm.priority}
                      onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="form-col-span-2">
                    <label className="form-label">Message / Details</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Enter detailed message to broadcast to all students..."
                      value={noticeForm.description}
                      onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-col-span-2 ops-submit-row">
                    <button
                      type="submit"
                      className="btn-ops-submit"
                      disabled={isSubmittingOps}
                    >
                      {isSubmittingOps ? 'Broadcasting...' : 'Broadcast to User Dashboard'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Table of Notices */}
              <div className="ops-records-preview">
                <h5 className="preview-heading">Recent Announcements ({notices.length})</h5>
                <div className="ops-table-wrap">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notices.map((n) => (
                        <tr key={n.noticeId}>
                          <td><strong>{n.title}</strong></td>
                          <td>
                            <span className="notice-category-pill">{n.category}</span>
                          </td>
                          <td>{n.publishDate}</td>
                          <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {n.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. REAL-TIME USER DETAILS & CANDIDATE REGISTRATIONS FEED */}
      {/* (Immediate reflection of users and candidate entries in Admin page) */}
      <section className="admin-card mt-6">
        <div className="admin-card-header">
          <div>
            <div className="admin-badge-sub">LIVE CANDIDATE ACTIVITY FEED</div>
            <h3 className="admin-card-title">Enrolled Athlete Accounts &amp; Profiles ({registeredUsers.length})</h3>
            <p className="text-muted small mt-1">
              Real-time synchronization of candidates registering and submitting profile data.
            </p>
          </div>
          <button
            className="btn-view-all"
            onClick={() => navigate('/users')}
          >
            Open 360° Athlete Dossier →
          </button>
        </div>

        <div className="admin-card-body">
          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Candidate Name</th>
                  <th>Register Number</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Joined Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.slice(0, 8).map((u) => (
                  <tr key={u.userId}>
                    <td className="fw-bold">#{u.userId}</td>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>
                      <span className="qty-chip">{u.registerNo}</span>
                    </td>
                    <td>{u.dept}</td>
                    <td>{u.email}</td>
                    <td>{u.mobileNo}</td>
                    <td>
                      <span className="text-muted small">
                        {u.createdTime ? String(u.createdTime).split('T')[0] : 'Active'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        className="btn-approve-sm"
                        onClick={() => navigate('/users')}
                        title="View Full Profile in Dossier"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Core Administrative Flow: Action Center & Facility Schedules */}
      <div className="admin-flow-grid mt-6">
        {/* Left Column: Pending Approvals Queue */}
        <div className="admin-card action-center-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-badge-sub">APPROVAL WORKFLOW</div>
              <h3 className="admin-card-title">Pending Action Center</h3>
            </div>
            <div className="approval-tab-switcher">
              <button
                type="button"
                className={`tab-btn ${activeApprovalTab === 'equipment' ? 'active' : ''}`}
                onClick={() => setActiveApprovalTab('equipment')}
              >
                Equipment ({pendingEquipment.length})
              </button>
              <button
                type="button"
                className={`tab-btn ${activeApprovalTab === 'ground' ? 'active' : ''}`}
                onClick={() => setActiveApprovalTab('ground')}
              >
                Grounds ({pendingGround.length})
              </button>
            </div>
          </div>

          <div className="admin-card-body">
            {activeApprovalTab === 'equipment' ? (
              pendingEquipment.length === 0 ? (
                <div className="empty-action-queue">
                  <div className="empty-icon-wrap">
                    <Icon name="badgeCheck" size={32} color="#059669" />
                  </div>
                  <h4>No Pending Equipment Requests</h4>
                  <p>All student equipment checkouts have been approved or processed.</p>
                  <button
                    onClick={() => navigate('/equipment-bookings')}
                    className="btn-view-all"
                  >
                    View All Loan Records
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Req #</th>
                        <th>Equipment Name</th>
                        <th>Qty</th>
                        <th>Date &amp; Slot</th>
                        <th>Status</th>
                        <th className="text-right">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingEquipment.slice(0, 5).map((item) => (
                        <tr key={item.bookingId}>
                          <td className="fw-bold">#{item.bookingId}</td>
                          <td>
                            <strong>{item.equipmentName}</strong>
                            <div className="text-muted small">
                              Cat: {item.equipmentCategory || 'General'}
                            </div>
                          </td>
                          <td>
                            <span className="qty-chip">{item.quantity || 1}</span>
                          </td>
                          <td>
                            <div className="date-slot-text">
                              {item.bookingDate || 'N/A'}
                            </div>
                            <div className="text-muted small">
                              {item.startTime} - {item.endTime}
                            </div>
                          </td>
                          <td>
                            <span className="status-pill pending">Pending Sign-off</span>
                          </td>
                          <td className="text-right">
                            <div className="action-btn-group">
                              <button
                                className="btn-approve-sm"
                                disabled={processingId === `eq-${item.bookingId}`}
                                onClick={() => handleApproveEquipment(item)}
                                title="Approve Request"
                              >
                                Approve
                              </button>
                              <button
                                className="btn-reject-sm"
                                disabled={processingId === `eq-${item.bookingId}`}
                                onClick={() => handleRejectEquipment(item)}
                                title="Reject Request"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              pendingGround.length === 0 ? (
                <div className="empty-action-queue">
                  <div className="empty-icon-wrap">
                    <Icon name="badgeCheck" size={32} color="#059669" />
                  </div>
                  <h4>No Pending Ground Reservations</h4>
                  <p>All tournament and practice grounds are cleared.</p>
                  <button
                    onClick={() => navigate('/ground-bookings')}
                    className="btn-view-all"
                  >
                    View All Ground Bookings
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Req #</th>
                        <th>Ground / Court</th>
                        <th>Event Type</th>
                        <th>Booking Date</th>
                        <th>Status</th>
                        <th className="text-right">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingGround.slice(0, 5).map((item) => (
                        <tr key={item.bookingId}>
                          <td className="fw-bold">#{item.bookingId}</td>
                          <td>
                            <strong>{item.groundName}</strong>
                            <div className="text-muted small">ID: User #{item.userId}</div>
                          </td>
                          <td>{item.purpose || 'Match Practice'}</td>
                          <td>
                            <div className="date-slot-text">{item.bookingDate}</div>
                            <div className="text-muted small">
                              {item.startTime} - {item.endTime}
                            </div>
                          </td>
                          <td>
                            <span className="status-pill pending">Pending Sign-off</span>
                          </td>
                          <td className="text-right">
                            <div className="action-btn-group">
                              <button
                                className="btn-approve-sm"
                                disabled={processingId === `gr-${item.bookingId}`}
                                onClick={() => handleApproveGround(item)}
                                title="Approve Reservation"
                              >
                                Approve
                              </button>
                              <button
                                className="btn-reject-sm"
                                disabled={processingId === `gr-${item.bookingId}`}
                                onClick={() => handleRejectGround(item)}
                                title="Reject Reservation"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Column: Facility Status & Athletic Distribution */}
        <div className="admin-sidebar-widgets">
          {/* Widget 1: Ground Facilities Schedule */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <div className="admin-badge-sub">GROUND AVAILABILITY</div>
                <h3 className="admin-card-title">Sports Facilities</h3>
              </div>
              <button
                className="btn-link-action"
                onClick={() => navigate('/ground-bookings')}
              >
                Schedule →
              </button>
            </div>
            <div className="facility-status-list">
              <div className="facility-row">
                <div className="facility-info">
                  <div className="facility-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                  </div>
                  <div>
                    <h5 className="facility-name">Main Athletics Oval</h5>
                    <p className="facility-sub">400m Track &amp; Field Pavilion</p>
                  </div>
                </div>
                <span className="facility-badge open">Available</span>
              </div>

              <div className="facility-row">
                <div className="facility-info">
                  <div className="facility-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                  </div>
                  <div>
                    <h5 className="facility-name">Cricket Turf Pitch</h5>
                    <p className="facility-sub">Main Pavilion Ground</p>
                  </div>
                </div>
                <span className="facility-badge reserved">Reserved 4-6 PM</span>
              </div>

              <div className="facility-row">
                <div className="facility-info">
                  <div className="facility-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                  </div>
                  <div>
                    <h5 className="facility-name">Indoor Wooden Court</h5>
                    <p className="facility-sub">Basketball &amp; Badminton</p>
                  </div>
                </div>
                <span className="facility-badge open">Available</span>
              </div>
            </div>
          </div>

          {/* Widget 2: Athlete Specialization Breakdown */}
          <div className="admin-card mt-6">
            <div className="admin-card-header">
              <div>
                <div className="admin-badge-sub">ATHLETIC ROSTER</div>
                <h3 className="admin-card-title">Enrolled Specializations</h3>
              </div>
              <button
                className="btn-link-action"
                onClick={() => navigate('/users')}
              >
                Directory →
              </button>
            </div>

            <div className="spec-pills-container">
              {specializations.length > 0 ? (
                specializations.map((spec) => (
                  <div key={spec.name} className="spec-pill-item">
                    <span className="spec-name">{spec.name}</span>
                    <span className="spec-count">{spec.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted small p-2">
                  No candidate profiles recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
