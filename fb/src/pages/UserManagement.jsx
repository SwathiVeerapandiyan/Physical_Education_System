import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userFormService } from '../services/api';
import Spinner from '../components/Spinner';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userForms, setUserForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('forms'); // 'forms' or 'accounts'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersData, formsData] = await Promise.all([
          authService.getAllUsers().catch(() => []),
          userFormService.getAll().catch(() => []),
        ]);
        setUsers(usersData || []);
        setUserForms(formsData || []);
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredForms = userForms.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      (f.name && f.name.toLowerCase().includes(term)) ||
      (f.email && f.email.toLowerCase().includes(term)) ||
      (f.batch && f.batch.toLowerCase().includes(term)) ||
      (f.specialization && f.specialization.toLowerCase().includes(term))
    );
  });

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.registerNo && u.registerNo.toLowerCase().includes(term)) ||
      (u.dept && u.dept.toLowerCase().includes(term))
    );
  });

  if (isLoading) {
    return <Spinner fullPage message="Fetching user directory..." />;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>👥</span>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Candidate &amp; User Directory</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                View all registered accounts and completed physical education candidate profiles.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ minWidth: '280px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search candidate name, email, reg no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <button
            type="button"
            className={activeTab === 'forms' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('forms')}
            style={{ padding: '8px 18px', fontSize: '0.875rem' }}
          >
            📋 Candidate Profiles ({filteredForms.length})
          </button>
          <button
            type="button"
            className={activeTab === 'accounts' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('accounts')}
            style={{ padding: '8px 18px', fontSize: '0.875rem' }}
          >
            👤 User Accounts ({filteredUsers.length})
          </button>
        </div>

        {/* Table View */}
        {activeTab === 'forms' ? (
          filteredForms.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No candidate profiles found matching "{searchTerm}"
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 16px' }}>ID</th>
                    <th style={{ padding: '12px 16px' }}>Candidate Name</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Batch</th>
                    <th style={{ padding: '12px 16px' }}>Gender</th>
                    <th style={{ padding: '12px 16px' }}>Specialization</th>
                    <th style={{ padding: '12px 16px' }}>Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.map((form) => (
                    <tr
                      key={form.id}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--primary)' }}>#{form.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{form.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{form.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px', color: 'var(--primary)', fontSize: '0.8rem' }}>
                          {form.batch}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{form.gender}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--secondary)' }}>{form.specialization || 'General Sports'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{form.mobileNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No user accounts found matching "{searchTerm}"
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>User ID</th>
                  <th style={{ padding: '12px 16px' }}>Full Name</th>
                  <th style={{ padding: '12px 16px' }}>Register No</th>
                  <th style={{ padding: '12px 16px' }}>Department</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Mobile</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.userId}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--primary)' }}>#{u.userId}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--secondary)' }}>{u.registerNo || 'N/A'}</td>
                    <td style={{ padding: '12px 16px' }}>{u.dept || 'Physical Education'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.mobileNo || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
