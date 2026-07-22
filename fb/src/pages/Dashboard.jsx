import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardService, userFormService, familyDetailsService, documentDetailsService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalUsers: 0, totalCandidates: 0, totalMaleStudents: 0, totalFemaleStudents: 0 });
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState({
    profileCreated: false,
    familyAdded: false,
    documentsUploaded: false,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // Safety timeout — if backend is slow/down, never block the UI
      const timeout = setTimeout(() => setLoading(false), 6000);

      try {
        // 1. KPI Stats (ignore errors — gracefully fall back to zeros)
        try {
          const statsData = await dashboardService.getStats();
          setStats(statsData);
        } catch { /* silently ignore */ }

        // 2. Profile completion check
        try {
          const allForms = await userFormService.getAll();
          const myForm = allForms.find((f) => f.email?.toLowerCase() === user?.email?.toLowerCase());

          if (myForm) {
            let familyStatus = false;
            let docStatus = false;

            try {
              const family = await familyDetailsService.getByCandidateId(myForm.id);
              if (family && family.familyId) familyStatus = true;
            } catch { /* not added yet */ }

            try {
              const docs = await documentDetailsService.getByCandidateId(myForm.id);
              if (docs && docs.documentId) docStatus = true;
            } catch { /* not uploaded yet */ }

            setCompletion({ profileCreated: true, familyAdded: familyStatus, documentsUploaded: docStatus });
          }
        } catch { /* backend unreachable — show empty state */ }

      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getCompletionPercent = () => {
    let count = 0;
    if (completion.profileCreated) count += 34;
    if (completion.familyAdded) count += 33;
    if (completion.documentsUploaded) count += 33;
    return count;
  };

  const completionPercent = getCompletionPercent();

  // ── Inline skeleton — sidebar stays clickable during load ──
  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-skeleton animate-fade-in">
          <div className="skeleton-banner skeleton-block" />
          <div className="skeleton-stats">
            <div className="skeleton-block" />
            <div className="skeleton-block" />
            <div className="skeleton-block" />
            <div className="skeleton-block" />
          </div>
          <div className="skeleton-grid">
            <div className="skeleton-block tall" />
            <div className="skeleton-block tall" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Welcome banner */}
      <section className="welcome-banner glass-card animate-fade-in">
        <div className="welcome-text">
          <h2>Welcome Back, {user?.name || 'Candidate'}!</h2>
          <p>Department of Physical Education &amp; Sports Portal</p>
          <div className="badge-grid mt-4">
            <span className="info-badge"><strong>Reg No:</strong> {user?.registerNo || 'N/A'}</span>
            <span className="info-badge"><strong>Department:</strong> {user?.dept || 'N/A'}</span>
            <span className="info-badge"><strong>Email:</strong> {user?.email || 'N/A'}</span>
          </div>
        </div>
        <div className="welcome-icon">🏆</div>
      </section>

      {/* KPI Cards */}
      <section className="stats-grid mt-6">
        <div className="stat-card glass-card">
          <p className="stat-label">Total Users</p>
          <h3 className="stat-value">{stats?.totalUsers ?? 0}</h3>
          <span className="stat-trend green">System accounts</span>
        </div>
        <div className="stat-card glass-card">
          <p className="stat-label">Registered Candidates</p>
          <h3 className="stat-value">{stats?.totalCandidates ?? 0}</h3>
          <span className="stat-trend cyan">Completed profile forms</span>
        </div>
        <div className="stat-card glass-card">
          <p className="stat-label">Male Students</p>
          <h3 className="stat-value">{stats?.totalMaleStudents ?? 0}</h3>
          <span className="stat-trend blue">Athletes</span>
        </div>
        <div className="stat-card glass-card">
          <p className="stat-label">Female Students</p>
          <h3 className="stat-value">{stats?.totalFemaleStudents ?? 0}</h3>
          <span className="stat-trend pink">Athletes</span>
        </div>
      </section>

      {/* Main Grid */}
      <div className="dashboard-grid mt-6">

        {/* Profile Completion */}
        <div className="grid-item-left glass-card">
          <h3 className="grid-item-title">Profile Completion Status</h3>
          <div className="progress-radial-container">
            <div className="progress-bar-linear">
              <div className="linear-label">
                <span>Overall Progress</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="linear-bar">
                <div className="linear-fill" style={{ width: `${completionPercent}%` }} />
              </div>
            </div>
          </div>

          <ul className="completion-list mt-6">
            <li
              className={`completion-item completion-item-clickable ${completion.profileCreated ? 'completed' : 'pending'}`}
              onClick={() => navigate('/profile')}
            >
              <span className="check-box">{completion.profileCreated ? '✓' : '○'}</span>
              <div className="item-details">
                <p className="item-name">Complete Student Profile Form</p>
                <p className="item-desc">Batch, address, and athletic specialty details</p>
              </div>
              <span className="item-action-btn">
                {completion.profileCreated ? 'View' : 'Fill'}
              </span>
            </li>

            <li
              className={`completion-item completion-item-clickable ${completion.familyAdded ? 'completed' : 'pending'}`}
              onClick={() => {
                if (!completion.profileCreated) {
                  showToast('Please complete the Student Profile Form first', 'warning');
                  navigate('/profile');
                } else {
                  navigate('/family');
                }
              }}
            >
              <span className="check-box">{completion.familyAdded ? '✓' : '○'}</span>
              <div className="item-details">
                <p className="item-name">Associate Family Details</p>
                <p className="item-desc">Emergency contacts and siblings occupations</p>
              </div>
              {completion.profileCreated ? (
                <span className="item-action-btn">{completion.familyAdded ? 'View' : 'Add'}</span>
              ) : (
                <span className="locked-badge">Locked</span>
              )}
            </li>

            <li
              className={`completion-item completion-item-clickable ${completion.documentsUploaded ? 'completed' : 'pending'}`}
              onClick={() => {
                if (!completion.profileCreated) {
                  showToast('Please complete the Student Profile Form first', 'warning');
                  navigate('/profile');
                } else {
                  navigate('/documents');
                }
              }}
            >
              <span className="check-box">{completion.documentsUploaded ? '✓' : '○'}</span>
              <div className="item-details">
                <p className="item-name">Upload Required Certificates</p>
                <p className="item-desc">Aadhar card, medical fitness certificates, etc.</p>
              </div>
              {completion.profileCreated ? (
                <span className="item-action-btn">{completion.documentsUploaded ? 'View' : 'Upload'}</span>
              ) : (
                <span className="locked-badge">Locked</span>
              )}
            </li>
          </ul>
        </div>

        {/* Quick Actions + Activity */}
        <div className="grid-item-right flex-col gap-6">
          <div className="glass-card flex-1">
            <h3 className="grid-item-title">Quick Actions</h3>
            <div className="action-button-grid mt-4">
              <button onClick={() => navigate('/profile')} className="action-tile-btn bg-indigo">
                <span className="tile-icon">📝</span>
                <span className="tile-title">Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  if (!completion.profileCreated) {
                    showToast('Please complete your Student Profile Form first', 'warning');
                    navigate('/profile');
                  } else {
                    navigate('/family');
                  }
                }}
                className="action-tile-btn bg-teal"
              >
                <span className="tile-icon">👨‍👩‍👧‍👦</span>
                <span className="tile-title">Family Info</span>
              </button>

              <button
                onClick={() => {
                  if (!completion.profileCreated) {
                    showToast('Please complete your Student Profile Form first', 'warning');
                    navigate('/profile');
                  } else {
                    navigate('/documents');
                  }
                }}
                className="action-tile-btn bg-amber"
              >
                <span className="tile-icon">📂</span>
                <span className="tile-title">Upload Docs</span>
              </button>

              <button onClick={() => navigate('/users')} className="action-tile-btn bg-slate">
                <span className="tile-icon">👥</span>
                <span className="tile-title">View Users</span>
              </button>
            </div>
          </div>

          <div className="glass-card recent-activity">
            <h3 className="grid-item-title">Recent Activity</h3>
            <ul className="activity-list mt-4">
              <li className="activity-item">
                <span className="dot active" />
                <div className="activity-details">
                  <p className="activity-text">Log in successful</p>
                  <p className="activity-time">Just now</p>
                </div>
              </li>
              <li className="activity-item">
                <span className="dot" />
                <div className="activity-details">
                  <p className="activity-text">Database sync complete</p>
                  <p className="activity-time">5 mins ago</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
