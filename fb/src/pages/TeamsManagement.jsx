import React, { useState, useEffect } from 'react';
import { teamService, sportsService, userFormService, teamMemberService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Icon from '../components/Icons';

const SPORT_COLORS = [
  { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
  { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  { bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },
  { bg: 'rgba(20,184,166,0.12)', color: '#14b8a6' },
];

const TeamsManagement = () => {
  const { showToast } = useToast();

  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('');

  // Team Form Modal
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamForm, setTeamForm] = useState({ teamName: '', sportId: '' });
  const [submittingTeam, setSubmittingTeam] = useState(false);

  // Manage Members Modal
  const [activeTeam, setActiveTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsData, sportsData, candidateForms] = await Promise.all([
        teamService.getAll().catch(() => []),
        sportsService.getAll().catch(() => []),
        userFormService.getAll().catch(() => [])
      ]);
      setTeams(teamsData || []);
      setSports(sportsData || []);
      setCandidates(candidateForms || []);

      if (sportsData && sportsData.length > 0) {
        setTeamForm(prev => ({ ...prev, sportId: sportsData[0].sportId }));
      }
    } catch (err) {
      showToast('Failed to load team data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddTeam = () => {
    setEditingTeamId(null);
    setTeamForm({ teamName: '', sportId: sports.length > 0 ? sports[0].sportId : '' });
    setShowTeamModal(true);
  };

  const handleOpenEditTeam = (team) => {
    setEditingTeamId(team.teamId);
    setTeamForm({ teamName: team.teamName || '', sportId: team.sportId || '' });
    setShowTeamModal(true);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.teamName.trim() || !teamForm.sportId) {
      showToast('Team Name and Sport selection are required', 'warning');
      return;
    }

    setSubmittingTeam(true);
    try {
      if (editingTeamId) {
        await teamService.update(editingTeamId, teamForm);
        showToast('Team updated successfully.', 'success');
      } else {
        await teamService.create(teamForm);
        showToast('New team created successfully.', 'success');
      }
      setShowTeamModal(false);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to save team', 'error');
    } finally {
      setSubmittingTeam(false);
    }
  };

  const handleDeleteTeam = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete team "${name}"?`)) return;
    try {
      await teamService.delete(id);
      showToast(`Team "${name}" deleted`, 'info');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete team', 'error');
    }
  };

  // Manage Team Members
  const handleOpenMembersModal = async (team) => {
    setActiveTeam(team);
    setShowMembersModal(true);
    fetchTeamMembers(team.teamId);
  };

  const fetchTeamMembers = async (teamId) => {
    try {
      const members = await teamMemberService.getByTeamId(teamId);
      setTeamMembers(members || []);
    } catch (err) {
      setTeamMembers([]);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('Please select a student candidate', 'warning');
      return;
    }

    setAddingMember(true);
    try {
      await teamMemberService.create({
        teamId: activeTeam.teamId,
        studentId: selectedStudentId
      });
      showToast('Member added to team.', 'success');
      setSelectedStudentId('');
      fetchTeamMembers(activeTeam.teamId);
    } catch (err) {
      showToast(err.message || 'Failed to add member to team', 'error');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await teamMemberService.delete(memberId);
      showToast('Member removed from team', 'info');
      fetchTeamMembers(activeTeam.teamId);
    } catch (err) {
      showToast(err.message || 'Failed to remove member', 'error');
    }
  };

  const getSportName = (sportId) => {
    const s = sports.find(sp => sp.sportId === sportId);
    return s ? s.sportName : `Sport #${sportId}`;
  };

  const getSportColor = (sportId) => {
    const idx = sports.findIndex(sp => sp.sportId === sportId);
    return SPORT_COLORS[idx % SPORT_COLORS.length] || SPORT_COLORS[0];
  };

  const getCandidateName = (studentId) => {
    const c = candidates.find(form => form.id === studentId);
    return c ? `${c.name} (${c.batch || 'Batch'})` : `Candidate ID #${studentId}`;
  };

  const filteredTeams = teams.filter(t => {
    const matchesName = t.teamName && t.teamName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = !sportFilter || String(t.sportId) === String(sportFilter);
    return matchesName && matchesSport;
  });

  if (loading && teams.length === 0) {
    return <Spinner fullPage message="Loading teams directory..." />;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #2d3f7a 60%, #3d5299 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(30,45,90,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
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
            <Icon name="shield" size={28} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', margin: 0, color: '#fff', fontWeight: 800 }}>Teams & Squad Rosters</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', marginTop: '4px' }}>
              Form teams for official sports disciplines and manage student candidate memberships.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', zIndex: 1, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{teams.length}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teams</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c7d2fe' }}>{sports.length}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sports</div>
            </div>
          </div>
          <button
            id="btn-create-team"
            className="btn-primary"
            onClick={handleOpenAddTeam}
            style={{
              background: '#fff',
              color: 'var(--navy)',
              fontWeight: 700,
              gap: '8px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span> Create New Team
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
            id="team-search"
            type="text"
            className="form-control"
            placeholder="Search team by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <div style={{ minWidth: '200px' }}>
          <select
            id="team-sport-filter"
            className="form-control"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
          >
            <option value="">All Sports</option>
            {sports.map(s => (
              <option key={s.sportId} value={s.sportId}>{s.sportName}</option>
            ))}
          </select>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
          Showing <strong>{filteredTeams.length}</strong> of {teams.length}
        </div>
      </div>

      {/* Teams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredTeams.map((team) => {
          const sportCfg = getSportColor(team.sportId);
          const sportName = getSportName(team.sportId);
          return (
            <div
              key={team.teamId}
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
              {/* Card top accent */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--navy), #3d5299)' }} />

              <div style={{ padding: '20px', flex: 1 }}>
                {/* Team Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    {/* Team avatar */}
                    <div style={{
                      width: '48px', height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--navy), #3d5299)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '10px',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(30,45,90,0.2)',
                    }}>
                      🛡️
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>{team.teamName}</h3>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Team #{team.teamId}</div>
                  </div>
                  <span style={{
                    background: sportCfg.bg,
                    color: sportCfg.color,
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginLeft: '10px',
                    marginTop: '4px',
                  }}>
                    {sportName}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.015)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
              }}>
                <button
                  id={`btn-roster-team-${team.teamId}`}
                  className="btn-primary"
                  onClick={() => handleOpenMembersModal(team)}
                  style={{ padding: '7px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  👥 Manage Roster
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    id={`btn-edit-team-${team.teamId}`}
                    className="btn-secondary"
                    onClick={() => handleOpenEditTeam(team)}
                    style={{ padding: '7px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    id={`btn-delete-team-${team.teamId}`}
                    className="btn-secondary"
                    onClick={() => handleDeleteTeam(team.teamId, team.teamName)}
                    style={{ padding: '7px 12px', fontSize: '0.8rem', borderRadius: '8px', color: 'var(--error)' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-muted)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--border-color)',
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🛡️</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            {searchTerm || sportFilter ? 'No teams match your search.' : 'No teams created yet.'}
          </p>
          <p style={{ fontSize: '0.875rem' }}>Click "Create New Team" to get started.</p>
        </div>
      )}

      {/* Add / Edit Team Modal */}
      {showTeamModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%', maxWidth: '480px', padding: '32px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(30,45,90,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="shield" size={22} color="var(--navy)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {editingTeamId ? 'Edit Team' : 'Create New Team'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {editingTeamId ? 'Update team details' : 'Register a new sports squad'}
                </p>
              </div>
              <button
                onClick={() => setShowTeamModal(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)' }}
              >✕</button>
            </div>

            <form onSubmit={handleSaveTeam}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Team Name *</label>
                <input
                  id="team-name-input"
                  type="text"
                  className="form-control"
                  placeholder="e.g. PE Strikers, Blue Panthers"
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Associated Sport Discipline *</label>
                {sports.length === 0 ? (
                  <div style={{
                    padding: '14px',
                    background: 'rgba(245,158,11,0.08)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    color: '#b45309',
                    fontSize: '0.875rem',
                  }}>
                    ⚠️ No sports found. Please add a sport in Sports Management first.
                  </div>
                ) : (
                  <select
                    id="team-sport-select"
                    className="form-control"
                    value={teamForm.sportId}
                    onChange={(e) => setTeamForm({ ...teamForm, sportId: e.target.value })}
                  >
                    {sports.map(s => (
                      <option key={s.sportId} value={s.sportId}>
                        {s.sportName} ({s.category || 'General'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowTeamModal(false)} disabled={submittingTeam}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submittingTeam || sports.length === 0} style={{ minWidth: '140px' }}>
                  {submittingTeam ? 'Saving...' : editingTeamId ? '✓ Update Team' : '+ Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roster Management Modal */}
      {showMembersModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%', maxWidth: '600px', padding: '32px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(30,45,90,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  👥
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {activeTeam?.teamName}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {getSportName(activeTeam?.sportId)} • {teamMembers.length} Members
                  </p>
                </div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setShowMembersModal(false)}
                style={{ padding: '6px 14px', borderRadius: '8px' }}
              >
                ✕ Close
              </button>
            </div>

            {/* Add Member Bar */}
            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              marginBottom: '20px',
              border: '1px solid var(--border-color)',
            }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Add Member to Roster
              </p>
              <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px' }}>
                <select
                  id="team-member-select"
                  className="form-control"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">-- Select Candidate to Add --</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.batch || 'General'})
                    </option>
                  ))}
                </select>
                <button
                  id="btn-add-team-member"
                  type="submit"
                  className="btn-primary"
                  disabled={addingMember}
                  style={{ whiteSpace: 'nowrap', borderRadius: '8px', padding: '8px 16px' }}
                >
                  {addingMember ? 'Adding...' : '+ Add'}
                </button>
              </form>
            </div>

            {/* Members List Table */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {teamMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>👥</p>
                  <p>No members added to this team yet.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student Candidate</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined Date</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map(m => (
                      <tr key={m.teamMemberId} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '30px', height: '30px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--navy), #3d5299)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                            }}>
                              {getCandidateName(m.studentId).charAt(0)}
                            </div>
                            {getCandidateName(m.studentId)}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {m.joinedDate || 'Today'}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => handleRemoveMember(m.teamMemberId)}
                            style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--error)', borderRadius: '6px' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsManagement;
