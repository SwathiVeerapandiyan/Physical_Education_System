import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userFormService, familyDetailsService } from '../services/api';
import Spinner from '../components/Spinner';

const FamilyDetails = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    siblings: '',
    siblingOccupation: '',
  });

  const [userFormId, setUserFormId] = useState(null);
  const [existingFamilyId, setExistingFamilyId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initFamilyData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch user profile form to get userFormId
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

        // 2. Fetch existing family details for this candidate ID
        try {
          const familyData = await familyDetailsService.getByCandidateId(myForm.id);
          if (familyData && familyData.familyId) {
            setExistingFamilyId(familyData.familyId);
            setFormData({
              fatherName: familyData.fatherName || '',
              fatherOccupation: familyData.fatherOccupation || '',
              motherName: familyData.motherName || '',
              motherOccupation: familyData.motherOccupation || '',
              siblings: familyData.siblings || '',
              siblingOccupation: familyData.siblingOccupation || '',
            });
          }
        } catch {
          // No family details saved yet
        }
      } catch (err) {
        showToast('Failed to load candidate information', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.email) {
      initFamilyData();
    }
  }, [user, navigate, showToast]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.fatherName.trim()) tempErrors.fatherName = "Father's name is required";
    if (!formData.motherName.trim()) tempErrors.motherName = "Mother's name is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userFormId: userFormId,
        fatherName: formData.fatherName.trim(),
        fatherOccupation: formData.fatherOccupation.trim(),
        motherName: formData.motherName.trim(),
        motherOccupation: formData.motherOccupation.trim(),
        siblings: formData.siblings.trim(),
        siblingOccupation: formData.siblingOccupation.trim(),
      };

      if (existingFamilyId) {
        await familyDetailsService.update(existingFamilyId, payload);
        showToast('Family details updated successfully! ✅', 'success');
      } else {
        const created = await familyDetailsService.create(payload);
        setExistingFamilyId(created.familyId);
        showToast('Family details saved successfully! 🎉', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save family details', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Spinner fullPage message="Loading family details..." />;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <span style={{ fontSize: '32px' }}>👨‍👩‍👧‍👦</span>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Family Association &amp; Details</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
              Keep parent and guardian background information updated for official records.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Father Details */}
            <div className="form-group">
              <label className="form-label" htmlFor="fatherName">
                Father's Name <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                id="fatherName"
                className={`form-control ${errors.fatherName ? 'is-invalid' : ''}`}
                placeholder="Father's full name"
                value={formData.fatherName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.fatherName && <span className="invalid-feedback">{errors.fatherName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fatherOccupation">
                Father's Occupation
              </label>
              <input
                type="text"
                id="fatherOccupation"
                className="form-control"
                placeholder="e.g. Engineer, Business, Farmer"
                value={formData.fatherOccupation}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Mother Details */}
            <div className="form-group">
              <label className="form-label" htmlFor="motherName">
                Mother's Name <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                id="motherName"
                className={`form-control ${errors.motherName ? 'is-invalid' : ''}`}
                placeholder="Mother's full name"
                value={formData.motherName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.motherName && <span className="invalid-feedback">{errors.motherName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="motherOccupation">
                Mother's Occupation
              </label>
              <input
                type="text"
                id="motherOccupation"
                className="form-control"
                placeholder="e.g. Homemaker, Teacher, Doctor"
                value={formData.motherOccupation}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Siblings Details */}
            <div className="form-group">
              <label className="form-label" htmlFor="siblings">
                Siblings (Names &amp; Relation)
              </label>
              <input
                type="text"
                id="siblings"
                className="form-control"
                placeholder="e.g. Elder brother (Ramesh), Younger sister (Priya)"
                value={formData.siblings}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="siblingOccupation">
                Siblings Occupation / Education
              </label>
              <input
                type="text"
                id="siblingOccupation"
                className="form-control"
                placeholder="e.g. Studying B.Tech, Software Engineer"
                value={formData.siblingOccupation}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
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

            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ minWidth: '180px' }}>
              {isSubmitting ? (
                <Spinner message={existingFamilyId ? 'Updating...' : 'Saving...'} />
              ) : (
                <span>{existingFamilyId ? '💾 Update Family Details' : '🚀 Save Family Details'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyDetails;
