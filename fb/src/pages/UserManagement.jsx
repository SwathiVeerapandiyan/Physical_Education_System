﻿import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userFormService, familyDetailsService, documentDetailsService } from '../services/api';
import Spinner from '../components/Spinner';
import Icon from '../components/Icons';
import { useToast } from '../context/ToastContext';

const UserManagement = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [userForms, setUserForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('forms'); // 'forms' or 'accounts'
  const [specializationFilter, setSpecializationFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // 360° Dossier Modal State
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [familyData, setFamilyData] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [dossierTab, setDossierTab] = useState('profile'); // 'profile', 'family', 'documents'

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
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Open 360° Dossier
  const handleOpenDossier = async (candidate) => {
    setSelectedCandidate(candidate);
    setDossierTab('profile');
    setDossierLoading(true);
    setFamilyData(null);
    setDocumentData(null);

    try {
      const [familyRes, docRes] = await Promise.allSettled([
        familyDetailsService.getByCandidateId(candidate.id),
        documentDetailsService.getByCandidateId(candidate.id),
      ]);

      if (familyRes.status === 'fulfilled' && familyRes.value) {
        setFamilyData(familyRes.value);
      }
      if (docRes.status === 'fulfilled' && docRes.value) {
        setDocumentData(docRes.value);
      }
    } catch {
      // Ignored
    } finally {
      setDossierLoading(false);
    }
  };

  const handleVerifyCandidate = () => {
    showToast(`Candidate #${selectedCandidate.id} (${selectedCandidate.name}) marked as Verified!`, 'success');
    setSelectedCandidate(null);
  };

  // Unique batches and specializations for filters
  const batches = Array.from(new Set(userForms.map((f) => f.batch).filter(Boolean)));
  const specializations = Array.from(new Set(userForms.map((f) => f.specialization).filter(Boolean)));

  const filteredForms = userForms.filter((f) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (f.name && f.name.toLowerCase().includes(term)) ||
      (f.email && f.email.toLowerCase().includes(term)) ||
      (f.batch && f.batch.toLowerCase().includes(term)) ||
      (f.specialization && f.specialization.toLowerCase().includes(term));

    const matchesBatch = batchFilter === 'ALL' || f.batch === batchFilter;
    const matchesSpec = specializationFilter === 'ALL' || f.specialization === specializationFilter;

    return matchesSearch && matchesBatch && matchesSpec;
  });

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.registerNo && u.registerNo.toLowerCase().includes(term)) ||
      (u.dept && u.dept.toLowerCase().includes(term))
    );
  });

  if (isLoading) {
    return <Spinner fullPage message="Fetching athlete directory and user accounts..." />;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
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
            <span>ATHLETE AUDIT &amp; ROSTER</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1a1218', margin: '4px 0 2px 0' }}>
            Candidate &amp; User Administration Directory
          </h2>
          <p style={{ color: '#8a7a8f', fontSize: '0.86rem', margin: 0 }}>
            Audit student profiles, verify required certificates, and examine associated family records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/profile')}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#9f1239',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Icon name="userCheck" size={16} />
            <span>New Student Registration</span>
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid rgba(159, 18, 57, 0.12)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Navigation Tabs and Search / Filter Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(159, 18, 57, 0.1)', paddingBottom: '16px', marginBottom: '20px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('forms')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: activeTab === 'forms' ? '1px solid #9f1239' : '1px solid rgba(159, 18, 57, 0.15)',
                background: activeTab === 'forms' ? '#9f1239' : '#ffffff',
                color: activeTab === 'forms' ? '#ffffff' : '#4b3f52',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              Athlete Candidates ({filteredForms.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('accounts')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: activeTab === 'accounts' ? '1px solid #9f1239' : '1px solid rgba(159, 18, 57, 0.15)',
                background: activeTab === 'accounts' ? '#9f1239' : '#ffffff',
                color: activeTab === 'accounts' ? '#ffffff' : '#4b3f52',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              System User Accounts ({filteredUsers.length})
            </button>
          </div>

          {/* Search Bar & Filters */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search name, email, batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 34px',
                  borderRadius: '8px',
                  border: '1px solid rgba(159, 18, 57, 0.2)',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8a7a8f' }}>
                <Icon name="search" size={15} />
              </div>
            </div>

            {activeTab === 'forms' && (
              <>
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(159, 18, 57, 0.2)',
                    fontSize: '0.84rem',
                    color: '#4b3f52',
                    background: '#ffffff',
                  }}
                >
                  <option value="ALL">All Sports</option>
                  {specializations.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(159, 18, 57, 0.2)',
                    fontSize: '0.84rem',
                    color: '#4b3f52',
                    background: '#ffffff',
                  }}
                >
                  <option value="ALL">All Batches</option>
                  {batches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* Candidate Table */}
        {activeTab === 'forms' ? (
          filteredForms.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center', color: '#8a7a8f' }}>
              <Icon name="users" size={36} color="#9f1239" />
              <h4 style={{ marginTop: '12px', color: '#1a1218' }}>No athlete records found</h4>
              <p style={{ fontSize: '0.85rem' }}>No profiles match your current search or filter query.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(159, 18, 57, 0.12)', color: '#8a7a8f', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '10px 14px' }}>Reg ID</th>
                    <th style={{ padding: '10px 14px' }}>Candidate Name</th>
                    <th style={{ padding: '10px 14px' }}>Specialization</th>
                    <th style={{ padding: '10px 14px' }}>Batch</th>
                    <th style={{ padding: '10px 14px' }}>Blood Grp</th>
                    <th style={{ padding: '10px 14px' }}>Contact</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Admin Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.map((form) => (
                    <tr
                      key={form.id}
                      style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.04)', transition: 'background 0.15s ease' }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#9f1239' }}>#{form.id}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#1a1218' }}>{form.name}</div>
                        <div style={{ fontSize: '0.76rem', color: '#8a7a8f' }}>{form.email}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            background: 'rgba(181, 136, 62, 0.12)',
                            color: '#b5883e',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                          }}
                        >
                          {form.specialization || 'General Sports'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            background: '#f5f3ef',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            color: '#4b3f52',
                            fontSize: '0.76rem',
                          }}
                        >
                          {form.batch}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 700, color: '#dc2626' }}>{form.bloodGroup || 'O+'}</span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#4b3f52' }}>{form.mobileNo || 'N/A'}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenDossier(form)}
                          style={{
                            padding: '6px 13px',
                            borderRadius: '6px',
                            background: '#ffffff',
                            border: '1px solid #9f1239',
                            color: '#9f1239',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Icon name="eye" size={14} />
                          <span>360° Dossier</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* User Accounts Table */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(159, 18, 57, 0.12)', color: '#8a7a8f', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 14px' }}>User ID</th>
                  <th style={{ padding: '10px 14px' }}>Full Name</th>
                  <th style={{ padding: '10px 14px' }}>Register / Staff No</th>
                  <th style={{ padding: '10px 14px' }}>Department</th>
                  <th style={{ padding: '10px 14px' }}>Email</th>
                  <th style={{ padding: '10px 14px' }}>Mobile</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.userId}
                    style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.04)', transition: 'background 0.15s ease' }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#9f1239' }}>#{u.userId}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1a1218' }}>{u.name}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#b5883e' }}>{u.registerNo || 'N/A'}</td>
                    <td style={{ padding: '12px 14px' }}>{u.dept || 'Physical Education'}</td>
                    <td style={{ padding: '12px 14px', color: '#4b3f52' }}>{u.email}</td>
                    <td style={{ padding: '12px 14px', color: '#4b3f52' }}>{u.mobileNo || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 360° Athlete Dossier Modal */}
      {selectedCandidate && (
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
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              border: '1px solid rgba(159, 18, 57, 0.2)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, #7b1129 0%, #9f1239 100%)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fce8bd' }}>
                  ATHLETE 360° AUDIT DOSSIER
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', color: '#ffffff' }}>
                  {selectedCandidate.name} (Candidate #{selectedCandidate.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1.4rem' }}
              >
                x
              </button>
            </div>

            {/* Dossier Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid rgba(159, 18, 57, 0.1)',
                background: '#f8f6f2',
                padding: '0 24px',
              }}
            >
              <button
                type="button"
                onClick={() => setDossierTab('profile')}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  background: 'none',
                  borderBottom: dossierTab === 'profile' ? '3px solid #9f1239' : '3px solid transparent',
                  color: dossierTab === 'profile' ? '#9f1239' : '#4b3f52',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                1. Athletic Profile
              </button>
              <button
                type="button"
                onClick={() => setDossierTab('family')}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  background: 'none',
                  borderBottom: dossierTab === 'family' ? '3px solid #9f1239' : '3px solid transparent',
                  color: dossierTab === 'family' ? '#9f1239' : '#4b3f52',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                2. Family &amp; Contacts {familyData ? '' : ''}
              </button>
              <button
                type="button"
                onClick={() => setDossierTab('documents')}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  background: 'none',
                  borderBottom: dossierTab === 'documents' ? '3px solid #9f1239' : '3px solid transparent',
                  color: dossierTab === 'documents' ? '#9f1239' : '#4b3f52',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                3. Certificate Vault {documentData ? '(done)' : ''}
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {dossierLoading ? (
                <Spinner message="Retrieving dossier records..." />
              ) : dossierTab === 'profile' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Full Name</div>
                    <div style={{ fontWeight: 700, color: '#1a1218', marginTop: '2px' }}>{selectedCandidate.name}</div>
                  </div>
                  <div style={{ background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</div>
                    <div style={{ fontWeight: 700, color: '#1a1218', marginTop: '2px' }}>{selectedCandidate.email}</div>
                  </div>
                  <div style={{ background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Batch / Session</div>
                    <div style={{ fontWeight: 700, color: '#1a1218', marginTop: '2px' }}>{selectedCandidate.batch}</div>
                  </div>
                  <div style={{ background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Specialization Sport</div>
                    <div style={{ fontWeight: 700, color: '#b5883e', marginTop: '2px' }}>{selectedCandidate.specialization || 'General Athletics'}</div>
                  </div>
                  <div style={{ background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Gender &amp; Blood Group</div>
                    <div style={{ fontWeight: 700, color: '#1a1218', marginTop: '2px' }}>{selectedCandidate.gender} • {selectedCandidate.bloodGroup || 'Not specified'}</div>
                  </div>
                  <div style={{ background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Date of Birth</div>
                    <div style={{ fontWeight: 700, color: '#1a1218', marginTop: '2px' }}>{selectedCandidate.dob ? selectedCandidate.dob.substring(0, 10) : 'N/A'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2', background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Permanent Address</div>
                    <div style={{ color: '#4b3f52', marginTop: '2px' }}>{selectedCandidate.permanentAddress || 'No address logged.'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2', background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Sports Achievements &amp; Records</div>
                    <div style={{ color: '#4b3f52', marginTop: '2px' }}>{selectedCandidate.sportsAchievement || 'None recorded during admissions.'}</div>
                  </div>
                </div>
              ) : dossierTab === 'family' ? (
                familyData ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Father's Name</div>
                      <div style={{ fontWeight: 700, color: '#1a1218', marginTop: '2px' }}>{familyData.fatherName || 'N/A'}</div>
                    </div>
                    <div style={{ background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Father's Occupation</div>
                      <div style={{ fontWeight: 600, color: '#4b3f52', marginTop: '2px' }}>{familyData.fatherOccupation || 'N/A'}</div>
                    </div>
                    <div style={{ background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Mother's Name</div>
                      <div style={{ fontWeight: 700, color: '#1a1218', marginTop: '2px' }}>{familyData.motherName || 'N/A'}</div>
                    </div>
                    <div style={{ background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Mother's Occupation</div>
                      <div style={{ fontWeight: 600, color: '#4b3f52', marginTop: '2px' }}>{familyData.motherOccupation || 'N/A'}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2', background: '#f8f6f2', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8a7a8f', textTransform: 'uppercase', fontWeight: 700 }}>Siblings Details</div>
                      <div style={{ color: '#4b3f52', marginTop: '2px' }}>{familyData.siblings || 'None'} ({familyData.siblingOccupation || 'N/A'})</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#8a7a8f' }}>
                    <p>No family details have been linked yet for this candidate.</p>
                  </div>
                )
              ) : (
                documentData ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { key: 'aadharCard', label: 'Aadhar Card ID / Document' },
                      { key: 'fitnessMedicalCertificate', label: 'Medical Fitness Certificate' },
                      { key: 'mark12Certificate', label: '12th Standard Marks Certificate' },
                      { key: 'candidateSignature', label: 'Candidate Specimen Signature' },
                    ].map((doc) => (
                      <div
                        key={doc.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: '#f8f6f2',
                          border: '1px solid rgba(159, 18, 57, 0.1)',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#1a1218' }}>{doc.label}</div>
                          <div style={{ fontSize: '0.74rem', color: '#8a7a8f' }}>
                            {documentData[doc.key] ? 'Certificate record on file' : 'Pending submission by student'}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: documentData[doc.key] ? '#dcfce7' : '#fee2e2',
                            color: documentData[doc.key] ? '#15803d' : '#dc2626',
                          }}
                        >
                          {documentData[doc.key] ? 'Uploaded' : 'Missing'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#8a7a8f' }}>
                    <p>No certificates or documents have been uploaded yet for this candidate.</p>
                  </div>
                )
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(159, 18, 57, 0.1)',
                background: '#fafaf8',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(159, 18, 57, 0.2)',
                  background: '#ffffff',
                  color: '#4b3f52',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Close Dossier
              </button>

              <button
                type="button"
                onClick={handleVerifyCandidate}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon name="badgeCheck" size={16} />
                <span>Verify &amp; Endorse Athlete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
