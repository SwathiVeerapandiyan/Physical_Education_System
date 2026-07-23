import React, { useState, useEffect } from 'react';
import { teamService, sportsService, userFormService, teamMemberService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const TeamsManagement = () => {
  const { showToast } = useToast();

  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        showToast('Team updated successfully! 🛡️', 'success');
      } else {
        await teamService.create(teamForm);
        showToast('New Team created! 🛡️', 'success');
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
      showToast('Member added to team! 👤', 'success');
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

  const getCandidateName = (studentId) => {
    const c = candidates.find(form => form.id === studentId);
    return c ? `${c.name} (${c.batch || 'Batch'})` : `Candidate ID #${studentId}`;
  };

  const filteredTeams = teams.filter(t =>
    t.teamName && t.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && teams.length === 0) {
    return <Spinner fullPage message="Loading teams directory..." />;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>🛡️</span>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Teams &amp; Squad Rosters</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                Form teams for official sports disciplines and manage student candidate memberships.
              </p>
            </div>
          </div>

          <button className="btn-primary" onClick={handleOpenAddTeam} style={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
            <span>➕</span> Create New Team
          </button>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search team by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '360px' }}
          />
        </div>

        {/* Teams Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredTeams.map((team) => (
            <div
              key={team.teamId}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{team.teamName}</h3>
                  <span style={{
                    background: 'rgba(20, 184, 166, 0.15)',
                    color: 'var(--secondary)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {getSportName(team.sportId)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleOpenMembersModal(team)}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  👥 Manage Roster
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => handleOpenEditTeam(team)} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                    ✏️
                  </button>
                  <button className="btn-secondary" onClick={() => handleDeleteTeam(team.teamId, team.teamName)} style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--error)' }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '10px' }}>🛡️</p>
            <p>No teams created yet.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Team Modal */}
      {showTeamModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '460px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>
              {editingTeamId ? '✏️ Edit Team' : '➕ Create New Team'}
            </h3>

            <form onSubmit={handleSaveTeam}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Team Name *</label>
                <input
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
                  <p style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>
                    No sports found. Please add a sport in Sports Management first.
                  </p>
                ) : (
                  <select
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
                <button type="submit" className="btn-primary" disabled={submittingTeam || sports.length === 0}>
                  {submittingTeam ? 'Saving...' : editingTeamId ? 'Update Team' : 'Create Team'}
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
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '580px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                👥 {activeTeam?.teamName} Roster
              </h3>
              <button className="btn-secondary" onClick={() => setShowMembersModal(false)} style={{ padding: '4px 10px' }}>
                ✕
              </button>
            </div>

            {/* Add Member Bar */}
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <select
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
              <button type="submit" className="btn-primary" disabled={addingMember} style={{ whiteSpace: 'nowrap' }}>
                {addingMember ? 'Adding...' : '➕ Add Member'}
              </button>
            </form>

            {/* Members List Table */}
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {teamMembers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                  No members added to this team yet.
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Student Candidate</th>
                      <th style={{ padding: '8px' }}>Joined Date</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map(m => (
                      <tr key={m.teamMemberId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{getCandidateName(m.studentId)}</td>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{m.joinedDate || 'Today'}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => handleRemoveMember(m.teamMemberId)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--error)' }}
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
