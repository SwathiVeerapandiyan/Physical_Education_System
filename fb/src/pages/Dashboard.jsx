﻿import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  dashboardService,
  equipmentBookingService,
  groundBookingService,
  tournamentService,
  userFormService,
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
  const [specializations, setSpecializations] = useState([]);
  const [activeApprovalTab, setActiveApprovalTab] = useState('equipment'); // 'equipment' or 'ground'
  const [processingId, setProcessingId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, equipRes, groundRes, tourneyRes, formsRes] = await Promise.allSettled([
        dashboardService.getStats(),
        equipmentBookingService.getAll(),
        groundBookingService.getAll(),
        tournamentService.getAll(),
        userFormService.getAll(),
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
      // Fallbacks kept intact
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick Approval Handler for Equipment
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

  // Quick Reject Handler for Equipment
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

  // Quick Approval Handler for Ground
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

  // Quick Reject Handler for Ground
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

  // Computations
  const pendingEquipment = equipmentBookings.filter(
    (b) => (b.bookingStatus || '').toLowerCase() === 'pending'
  );
  const pendingGround = groundBookings.filter(
    (b) => (b.bookingStatus || '').toLowerCase() === 'pending'
  );
  const totalPendingActions = pendingEquipment.length + pendingGround.length;

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-skeleton">
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
              <strong>Admin:</strong> {user?.name || 'Sports Officer'}
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
            <span>Athlete Roster</span>
          </button>
          <button onClick={() => navigate('/equipment-bookings')} className="btn-banner-action">
            <Icon name="equipment" size={16} />
            <span>Manage Inventory</span>
          </button>
          <button onClick={() => navigate('/tournaments')} className="btn-banner-action primary">
            <Icon name="trophy" size={16} />
            <span>New Tournament</span>
          </button>
        </div>
      </section>

      {/* 2. Executive KPI Cards */}
      <section className="stats-grid mt-6">
        {/* Card 1: Total Athletes */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Registered Athletes</span>
            <span className="stat-icon-badge maroon">
              <Icon name="users" size={18} />
            </span>
          </div>
          <h3 className="stat-value">{stats?.totalCandidates ?? 0}</h3>
          <div className="stat-footer">
            <span className="stat-split-pill">
              M: {stats?.totalMaleStudents ?? 0} Male
            </span>
            <span className="stat-split-pill">
              F: {stats?.totalFemaleStudents ?? 0} Female
            </span>
          </div>
        </div>

        {/* Card 2: Equipment Loans */}
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
              <span className="stat-trend green">All loan requests signed off</span>
            )}
          </div>
        </div>

        {/* Card 3: Ground Reservations */}
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

        {/* Card 4: Active Tournaments */}
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
              Inter-Collegiate &amp; State Leagues
            </span>
          </div>
        </div>
      </section>

      {/* 3. Core Administrative Flow: Action Center & Facility Schedules */}
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
                  {pendingEquipment.length > 5 && (
                    <div className="table-footer-more">
                      <Link to="/equipment-bookings">
                        +{pendingEquipment.length - 5} more pending in Equipment Bookings
                      </Link>
                    </div>
                  )}
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
                  {pendingGround.length > 5 && (
                    <div className="table-footer-more">
                      <Link to="/ground-bookings">
                        +{pendingGround.length - 5} more pending in Ground Bookings
                      </Link>
                    </div>
                  )}
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
                Schedule 
              </button>
            </div>
            <div className="facility-status-list">
              <div className="facility-row">
                <div className="facility-info">
                  <div className="facility-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg></div>
                  <div>
                    <h5 className="facility-name">Main Athletics Oval</h5>
                    <p className="facility-sub">400m Track &amp; Field Pavilion</p>
                  </div>
                </div>
                <span className="facility-badge open">Available</span>
              </div>

              <div className="facility-row">
                <div className="facility-info">
                  <div className="facility-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg></div>
                  <div>
                    <h5 className="facility-name">Cricket Turf Pitch</h5>
                    <p className="facility-sub">Main Pavilion Ground</p>
                  </div>
                </div>
                <span className="facility-badge reserved">Reserved 4-6 PM</span>
              </div>

              <div className="facility-row">
                <div className="facility-info">
                  <div className="facility-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg></div>
                  <div>
                    <h5 className="facility-name">Indoor Wooden Court</h5>
                    <p className="facility-sub">Basketball &amp; Badminton</p>
                  </div>
                </div>
                <span className="facility-badge open">Available</span>
              </div>

              <div className="facility-row">
                <div className="facility-info">
                  <div className="facility-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg></div>
                  <div>
                    <h5 className="facility-name">Football Field #1</h5>
                    <p className="facility-sub">North Campus Stadium</p>
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
                Directory 
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

      {/* 4. Quick Administration Shortcuts Grid */}
      <section className="admin-shortcuts-section mt-6">
        <h3 className="shortcuts-section-title">Department Management Portals</h3>
        <div className="shortcuts-grid">
          <div
            className="shortcut-card"
            onClick={() => navigate('/users')}
          >
            <div className="shortcut-icon-box maroon">
              <Icon name="users" size={24} />
            </div>
            <div className="shortcut-meta">
              <h4>Candidate Verification</h4>
              <p>Audit student dossiers, documents &amp; family records.</p>
            </div>
          </div>

          <div
            className="shortcut-card"
            onClick={() => navigate('/equipment-bookings')}
          >
            <div className="shortcut-icon-box gold">
              <Icon name="equipment" size={24} />
            </div>
            <div className="shortcut-meta">
              <h4>Equipment Inventory</h4>
              <p>Monitor gear checkouts, loan approvals &amp; returns.</p>
            </div>
          </div>

          <div
            className="shortcut-card"
            onClick={() => navigate('/tournaments')}
          >
            <div className="shortcut-icon-box navy">
              <Icon name="trophy" size={24} />
            </div>
            <div className="shortcut-meta">
              <h4>Tournaments &amp; Draws</h4>
              <p>Schedule fixtures, team rosters &amp; live scoring.</p>
            </div>
          </div>

          <div
            className="shortcut-card"
            onClick={() => navigate('/notices')}
          >
            <div className="shortcut-icon-box crimson">
              <Icon name="notice" size={24} />
            </div>
            <div className="shortcut-meta">
              <h4>Official Notice Board</h4>
              <p>Broadcast trials, circulars &amp; tournament schedules.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
