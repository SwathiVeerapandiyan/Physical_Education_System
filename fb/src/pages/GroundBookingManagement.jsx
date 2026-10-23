import React, { useState, useEffect } from 'react';
import { groundBookingService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Icon from '../components/Icons';

const GroundBookingManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const initialForm = {
    userId: 1,
    groundName: 'Main Oval Ground',
    sportType: 'Cricket',
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '06:00',
    endTime: '08:00',
    durationHours: 2,
    purpose: 'Practice Session',
    bookingStatus: 'Pending',
    approvedBy: '',
    paymentStatus: 'Exempted',
    paymentAmount: 0.0,
    remarks: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const { showToast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await groundBookingService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load ground bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleApprove = async (item) => {
    try {
      const updated = {
        ...item,
        bookingStatus: 'Approved',
        approvedBy: 'Sports Director (Admin)',
      };
      await groundBookingService.update(item.bookingId, updated);
      setItems((prev) => prev.map((i) => (i.bookingId === item.bookingId ? updated : i)));
      showToast(`Ground reservation #${item.bookingId} (${item.groundName}) approved!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve reservation', 'error');
    }
  };

  const handleReject = async (item) => {
    try {
      const updated = {
        ...item,
        bookingStatus: 'Rejected',
        approvedBy: 'Sports Director (Admin)',
      };
      await groundBookingService.update(item.bookingId, updated);
      setItems((prev) => prev.map((i) => (i.bookingId === item.bookingId ? updated : i)));
      showToast(`Ground reservation #${item.bookingId} rejected.`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const updated = await groundBookingService.update(editingItem.bookingId, formData);
        setItems((prev) => prev.map((i) => (i.bookingId === editingItem.bookingId ? updated : i)));
        showToast('Ground booking updated successfully!', 'success');
      } else {
        const created = await groundBookingService.create(formData);
        setItems((prev) => [created, ...prev]);
        showToast('Ground booking created and reserved!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save ground booking', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await groundBookingService.delete(deletingId);
      setItems((prev) => prev.filter((i) => i.bookingId !== deletingId));
      showToast('Ground booking deleted!', 'success');
      setDeletingId(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete booking', 'error');
    }
  };

  const filtered = items.filter((i) => {
    const matchesSearch =
      !searchTerm || (i.groundName && i.groundName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || (i.bookingStatus || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const pendingCount = items.filter((i) => (i.bookingStatus || '').toLowerCase() === 'pending').length;
  const approvedCount = items.filter((i) => (i.bookingStatus || '').toLowerCase() === 'approved').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '24px 28px',
          border: '1px solid rgba(159, 18, 57, 0.12)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9f1239', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <Icon name="badgeCheck" size={15} />
            <span>CAMPUS FACILITY MANAGEMENT</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1a1218', margin: '4px 0 2px 0' }}>
            Ground &amp; Stadium Reservation Administration
          </h2>
          <p style={{ color: '#8a7a8f', fontSize: '0.86rem', margin: 0 }}>
            Authorize pitch, court, and oval stadium reservations for matches, practices, and college trials.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #9f1239 0%, #7b1129 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(159, 18, 57, 0.25)',
          }}
        >
          <span>+ Reserve Sports Ground</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid rgba(159, 18, 57, 0.12)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Filter and Search Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(159, 18, 57, 0.1)',
            paddingBottom: '16px',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All Facilities (${items.length})` },
              { id: 'Pending', label: `Pending Approval (${pendingCount})` },
              { id: 'Approved', label: `Confirmed (${approvedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: statusFilter === tab.id ? '1px solid #9f1239' : '1px solid rgba(159, 18, 57, 0.15)',
                  background: statusFilter === tab.id ? '#9f1239' : '#ffffff',
                  color: statusFilter === tab.id ? '#ffffff' : '#4b3f52',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search ground name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(159, 18, 57, 0.2)',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Spinner message="Loading ground reservations..." />
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8a7a8f' }}>
            <Icon name="ground" size={36} color="#9f1239" />
            <h4 style={{ marginTop: '12px', color: '#1a1218' }}>No ground bookings recorded</h4>
            <p style={{ fontSize: '0.85rem' }}>All sports facilities are currently unreserved.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(159, 18, 57, 0.12)', color: '#8a7a8f', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 14px' }}>Booking #</th>
                  <th style={{ padding: '10px 14px' }}>Ground / Stadium</th>
                  <th style={{ padding: '10px 14px' }}>Sport</th>
                  <th style={{ padding: '10px 14px' }}>Purpose</th>
                  <th style={{ padding: '10px 14px' }}>Date &amp; Slot</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.bookingId} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.04)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#9f1239' }}>#{item.bookingId}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#1a1218' }}>{item.groundName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#8a7a8f' }}>User #{item.userId}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#4b3f52' }}>{item.sportType}</td>
                    <td style={{ padding: '12px 14px', color: '#4b3f52' }}>{item.purpose || 'Match Session'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#1a1218' }}>{item.bookingDate}</div>
                      <div style={{ fontSize: '0.74rem', color: '#8a7a8f' }}>
                        {item.startTime} - {item.endTime} ({item.durationHours || 2}h)
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background:
                            (item.bookingStatus || '').toLowerCase() === 'approved'
                              ? '#dcfce7'
                              : (item.bookingStatus || '').toLowerCase() === 'rejected'
                              ? '#fee2e2'
                              : '#fef3c7',
                          color:
                            (item.bookingStatus || '').toLowerCase() === 'approved'
                              ? '#15803d'
                              : (item.bookingStatus || '').toLowerCase() === 'rejected'
                              ? '#dc2626'
                              : '#b45309',
                        }}
                      >
                        {item.bookingStatus || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {(item.bookingStatus || '').toLowerCase() === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(item)}
                              style={{
                                background: '#059669',
                                color: '#ffffff',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              (done) Approve
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fca5a5',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid rgba(159, 18, 57, 0.2)',
                            color: '#4b3f52',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(item.bookingId)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            color: '#dc2626',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(159, 18, 57, 0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#1a1218', fontSize: '1.25rem' }}>
              {editingItem ? 'Edit Ground Reservation' : 'Reserve Sports Facility'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                  Facility / Ground Name
                </label>
                <select
                  value={formData.groundName}
                  onChange={(e) => setFormData({ ...formData, groundName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                >
                  <option value="Main Athletics Oval">Main Athletics Oval (400m Track)</option>
                  <option value="Cricket Turf Pitch">Cricket Turf Pitch &amp; Pavilion</option>
                  <option value="Football Field #1">Football Field #1 (North Campus)</option>
                  <option value="Indoor Wooden Court">Indoor Wooden Basketball Court</option>
                  <option value="Tennis Hard Court">Tennis Hard Court</option>
                  <option value="Volleyball Court">Volleyball Clay Court</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                    Sport Type
                  </label>
                  <input
                    type="text"
                    value={formData.sportType}
                    onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="06:00"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                    End Time
                  </label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="08:00"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                    Purpose
                  </label>
                  <input
                    type="text"
                    placeholder="Inter-Collegiate Trial / Practice"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={formData.bookingStatus}
                    onChange={(e) => setFormData({ ...formData, bookingStatus: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                  >
                    <option value="Pending">Pending Sign-off</option>
                    <option value="Approved">Approved / Reserved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', background: '#ffffff', color: '#4b3f52', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#9f1239', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  Save Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
          }}
        >
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', textAlign: 'center', maxWidth: '380px', border: '1px solid rgba(159, 18, 57, 0.2)' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1a1218' }}>Confirm Delete</h4>
            <p style={{ color: '#8a7a8f', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
              Are you sure you want to permanently delete ground booking #{deletingId}?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setDeletingId(null)} style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroundBookingManagement;
