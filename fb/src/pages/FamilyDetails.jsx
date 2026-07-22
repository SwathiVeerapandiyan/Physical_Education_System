import React from 'react';

const FamilyDetails = () => {
  return (
    <div className="glass-card text-center" style={{ padding: '60px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>👨‍👩‍👧‍👦</div>
      <h2>Family Details Manager</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
        This module will manage parent/guardian occupations, sibling details, and background info.
      </p>
      <div className="badge-featured mt-4" style={{ display: 'inline-block' }}>
        Next Phase Implementation
      </div>
    </div>
  );
};

export default FamilyDetails;
