import React from 'react';

const UserManagement = () => {
  return (
    <div className="glass-card text-center" style={{ padding: '60px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
      <h2>User Management Module</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
        This module will display a responsive directory of all registered users with live sorting, pagination, and search capabilities.
      </p>
      <div className="badge-featured mt-4" style={{ display: 'inline-block' }}>
        Next Phase Implementation
      </div>
    </div>
  );
};

export default UserManagement;
