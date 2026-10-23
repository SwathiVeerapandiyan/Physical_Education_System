﻿import React, { useState, useEffect } from 'react';
import { equipmentBookingService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Icon from '../components/Icons';

const EquipmentBookingManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const initialForm = {
    userId: 1,
    equipmentName: '',
    equipmentCategory: 'Balls',
    quantity: 1,
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    returnDate: '',
    bookingStatus: 'Pending',
    approvedBy: '',
    remarks: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const { showToast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await equipmentBookingService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load equipment bookings', 'error');
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
      await equipmentBookingService.update(item.bookingId, updated);
      setItems((prev) => prev.map((i) => (i.bookingId === item.bookingId ? updated : i)));
      showToast(`Equipment loan #${item.bookingId} (${item.equipmentName}) approved!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve booking', 'error');
    }
  };

  const handleReject = async (item) => {
    try {
      const updated = {
        ...item,
        bookingStatus: 'Rejected',
        approvedBy: 'Sports Director (Admin)',
      };
      await equipmentBookingService.update(item.bookingId, updated);
      setItems((prev) => prev.map((i) => (i.bookingId === item.bookingId ? updated : i)));
      showToast(`Equipment loan #${item.bookingId} rejected.`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to reject booking', 'error');
    }
  };

  const handleMarkReturned = async (item) => {
    try {
      const updated = {
        ...item,
        bookingStatus: 'Returned',
        returnDate: new Date().toISOString().split('T')[0],
      };
      await equipmentBookingService.update(item.bookingId, updated);
      setItems((prev) => prev.map((i) => (i.bookingId === item.bookingId ? updated : i)));
      showToast(`Equipment #${item.bookingId} returned to inventory stock!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to mark returned', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const updated = await equipmentBookingService.update(editingItem.bookingId, formData);
        setItems((prev) => prev.map((i) => (i.bookingId === editingItem.bookingId ? updated : i)));
        showToast('Equipment booking record updated!', 'success');
      } else {
        const created = await equipmentBookingService.create(formData);
        setItems((prev) => [created, ...prev]);
        showToast('Equipment loan created and registered!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save booking', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await equipmentBookingService.delete(deletingId);
      setItems((prev) => prev.filter((i) => i.bookingId !== deletingId));
      showToast('Booking log deleted!', 'success');
      setDeletingId(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete booking', 'error');
    }
  };

  const filtered = items.filter((i) => {
    const matchesSearch =
      !searchTerm || (i.equipmentName && i.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || (i.bookingStatus || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const pendingCount = items.filter((i) => (i.bookingStatus || '').toLowerCase() === 'pending').length;
  const approvedCount = items.filter((i) => (i.bookingStatus || '').toLowerCase() === 'approved').length;
  const returnedCount = items.filter((i) => (i.bookingStatus || '').toLowerCase() === 'returned').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Admin Header */}
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
            <span>INVENTORY &amp; ASSET MANAGEMENT</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1a1218', margin: '4px 0 2px 0' }}>
            Equipment Loan &amp; Checkout Administration
          </h2>
          <p style={{ color: '#8a7a8f', fontSize: '0.86rem', margin: 0 }}>
            Authorize student equipment loans, manage return condition, and maintain sports gear stock.
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
          <span>+ Issue Equipment Loan</span>
        </button>
      </div>

      {/* KPI Stats Chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', border: '1px solid rgba(159, 18, 57, 0.12)', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: '#8a7a8f', fontWeight: 700, textTransform: 'uppercase' }}>Total Loans Logged</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1218', marginTop: '4px' }}>{items.length}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid rgba(217, 119, 6, 0.3)', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>Pending Approvals</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{pendingCount}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>Active On Loan</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{approvedCount}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid rgba(159, 18, 57, 0.12)', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: '#8a7a8f', fontWeight: 700, textTransform: 'uppercase' }}>Returned / Restocked</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4b3f52', marginTop: '4px' }}>{returnedCount}</div>
        </div>
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
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All (${items.length})` },
              { id: 'Pending', label: `Pending (${pendingCount})` },
              { id: 'Approved', label: `On Loan (${approvedCount})` },
              { id: 'Returned', label: `Returned (${returnedCount})` },
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
              placeholder="Search gear name..."
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

        {/* Content Table */}
        {loading ? (
          <Spinner message="Loading equipment loans..." />
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8a7a8f' }}>
            <Icon name="equipment" size={36} color="#9f1239" />
            <h4 style={{ marginTop: '12px', color: '#1a1218' }}>No loan records found</h4>
            <p style={{ fontSize: '0.85rem' }}>No equipment matches the chosen filter or search.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(159, 18, 57, 0.12)', color: '#8a7a8f', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 14px' }}>Loan #</th>
                  <th style={{ padding: '10px 14px' }}>Equipment Item</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Qty</th>
                  <th style={{ padding: '10px 14px' }}>Loan Date &amp; Slot</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Admin Operations</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.bookingId} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.04)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#9f1239' }}>#{item.bookingId}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#1a1218' }}>{item.equipmentName}</div>
                      {item.remarks && <div style={{ fontSize: '0.74rem', color: '#8a7a8f' }}>Note: {item.remarks}</div>}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#4b3f52' }}>{item.equipmentCategory || 'Balls'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: '#ede9e3', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#1a1218' }}>{item.bookingDate}</div>
                      <div style={{ fontSize: '0.74rem', color: '#8a7a8f' }}>{item.startTime} - {item.endTime}</div>
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
                              : (item.bookingStatus || '').toLowerCase() === 'returned'
                              ? '#f1f5f9'
                              : (item.bookingStatus || '').toLowerCase() === 'rejected'
                              ? '#fee2e2'
                              : '#fef3c7',
                          color:
                            (item.bookingStatus || '').toLowerCase() === 'approved'
                              ? '#15803d'
                              : (item.bookingStatus || '').toLowerCase() === 'returned'
                              ? '#475569'
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

                        {(item.bookingStatus || '').toLowerCase() === 'approved' && (
                          <button
                            onClick={() => handleMarkReturned(item)}
                            style={{
                              background: '#b5883e',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                             Returned
                          </button>
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

      {/* Modal - Light Theme Palette */}
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
              {editingItem ? 'Edit Equipment Loan Record' : 'Register New Equipment Loan'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                  Equipment Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wilson Match Basketball #7"
                  value={formData.equipmentName}
                  onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={formData.equipmentCategory}
                    onChange={(e) => setFormData({ ...formData, equipmentCategory: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                  >
                    <option value="Balls">Balls</option>
                    <option value="Racquets &amp; Bats">Racquets &amp; Bats</option>
                    <option value="Protective Gear">Protective Gear</option>
                    <option value="Track &amp; Field">Track &amp; Field</option>
                    <option value="Nets &amp; Posts">Nets &amp; Posts</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                    Loan Date
                  </label>
                  <input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                    Approval Status
                  </label>
                  <select
                    value={formData.bookingStatus}
                    onChange={(e) => setFormData({ ...formData, bookingStatus: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem' }}
                  >
                    <option value="Pending">Pending Sign-off</option>
                    <option value="Approved">Approved / Issued</option>
                    <option value="Returned">Returned to Stock</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b3f52', display: 'block', marginBottom: '4px' }}>
                  Admin Remarks / Equipment Condition
                </label>
                <textarea
                  placeholder="Note equipment condition upon issue or return..."
                  value={formData.remarks || ''}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(159, 18, 57, 0.2)', fontSize: '0.85rem', minHeight: '60px' }}
                />
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
                  Save Loan Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
              Are you sure you want to permanently delete equipment booking #{deletingId}?
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

export default EquipmentBookingManagement;
