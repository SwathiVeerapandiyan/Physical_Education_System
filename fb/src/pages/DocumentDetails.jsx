import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userFormService, documentDetailsService } from '../services/api';
import Spinner from '../components/Spinner';

const DOC_TYPES = [
  { id: 'aadharCard', label: 'Aadhar Card', icon: '🪪', req: true },
  { id: 'fitnessMedicalCertificate', label: 'Medical Fitness Certificate', icon: '🩺', req: true },
  { id: 'mark12Certificate', label: '12th Mark Certificate', icon: '📜', req: true },
  { id: 'transferCertificate', label: 'Transfer Certificate (TC)', icon: '📑', req: false },
  { id: 'communityCertificate', label: 'Community Certificate', icon: '🏛️', req: false },
  { id: 'sportsCertificate', label: 'Sports Achievement Certificate', icon: '🏆', req: false },
  { id: 'candidateSignature', label: 'Candidate Signature Image', icon: '✍️', req: true },
  { id: 'parentSignature', label: 'Parent / Guardian Signature', icon: '✍️', req: false },
  { id: 'admissionCard', label: 'Admission Card / Allotment', icon: '🪪', req: false },
  { id: 'feeReceipt', label: 'Fee Payment Receipt', icon: '🧾', req: false },
  { id: 'incomeCertificate', label: 'Income Certificate', icon: '💵', req: false },
  { id: 'eligibilityCertificate', label: 'Eligibility Certificate', icon: '📋', req: false },
];

const DocumentDetails = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    aadharCard: '',
    fitnessMedicalCertificate: '',
    mark12Certificate: '',
    transferCertificate: '',
    communityCertificate: '',
    sportsCertificate: '',
    candidateSignature: '',
    parentSignature: '',
    admissionCard: '',
    feeReceipt: '',
    incomeCertificate: '',
    eligibilityCertificate: '',
  });

  const [userFormId, setUserFormId] = useState(null);
  const [existingDocId, setExistingDocId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initDocData = async () => {
      setIsLoading(true);
      try {
        const allForms = await userFormService.getAll();
        const myForm = allForms.find(
          (f) => f.email?.toLowerCase() === user?.email?.toLowerCase()
        );

        if (!myForm) {
          showToast('Please complete your Student Profile Form first', 'warning');
          navigate('/profile');
          return;
        }

        setUserFormId(myForm.id);

        try {
          const docData = await documentDetailsService.getByCandidateId(myForm.id);
          if (docData && docData.documentId) {
            setExistingDocId(docData.documentId);
            setFormData({
              aadharCard: docData.aadharCard || '',
              fitnessMedicalCertificate: docData.fitnessMedicalCertificate || '',
              mark12Certificate: docData.mark12Certificate || '',
              transferCertificate: docData.transferCertificate || '',
              communityCertificate: docData.communityCertificate || '',
              sportsCertificate: docData.sportsCertificate || '',
              candidateSignature: docData.candidateSignature || '',
              parentSignature: docData.parentSignature || '',
              admissionCard: docData.admissionCard || '',
              feeReceipt: docData.feeReceipt || '',
              incomeCertificate: docData.incomeCertificate || '',
              eligibilityCertificate: docData.eligibilityCertificate || '',
            });
          }
        } catch {
          // No doc details saved yet
        }
      } catch (err) {
        showToast('Failed to load candidate document details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.email) {
      initDocData();
    }
  }, [user, navigate, showToast]);

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleFileUpload = (field, file) => {
    if (!file) return;
    // Store simulated path / file name in string field matching backend model
    const mockPath = `uploads/${user?.registerNo || 'DOC'}_${field}_${file.name}`;
    setFormData((prev) => ({ ...prev, [field]: mockPath }));
    showToast(`Attached ${file.name} for ${field}`, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const payload = {
        userFormId: userFormId,
        ...formData,
      };

      if (existingDocId) {
        await documentDetailsService.update(existingDocId, payload);
        showToast('Document submission updated successfully! ✅', 'success');
      } else {
        const created = await documentDetailsService.create(payload);
        setExistingDocId(created.documentId);
        showToast('Document submission uploaded successfully! 🎉', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save document details', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Spinner fullPage message="Loading document details..." />;
  }

  const uploadedCount = DOC_TYPES.filter((d) => formData[d.id] && formData[d.id].trim() !== '').length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>📁</span>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Document Submission &amp; Verification</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                Upload or manage required certificates and signatures for physical education enrollment.
              </p>
            </div>
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
            Uploaded: {uploadedCount} / {DOC_TYPES.length}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
            {DOC_TYPES.map((doc) => {
              const hasFile = Boolean(formData[doc.id] && formData[doc.id].trim() !== '');
              return (
                <div
                  key={doc.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: hasFile ? 'rgba(16, 185, 129, 0.05)' : 'rgba(15, 23, 42, 0.3)',
                    border: hasFile ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{doc.icon}</span> {doc.label}
                      {doc.req && <span style={{ color: 'var(--error)' }}>*</span>}
                    </span>
                    {hasFile ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                        ✓ Attached
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="File path or certificate URL / number"
                      value={formData[doc.id]}
                      onChange={(e) => handleInputChange(doc.id, e.target.value)}
                      disabled={isSubmitting}
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    />

                    <label
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      📎 Upload
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                        disabled={isSubmitting}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
            >
              ← Back to Dashboard
            </button>

            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ minWidth: '200px' }}>
              {isSubmitting ? (
                <Spinner message={existingDocId ? 'Updating...' : 'Submitting...'} />
              ) : (
                <span>{existingDocId ? '💾 Update Certificates' : '🚀 Submit Documents'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentDetails;
