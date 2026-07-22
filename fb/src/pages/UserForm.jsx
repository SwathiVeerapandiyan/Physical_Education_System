import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userFormService } from '../services/api';
import Spinner from '../components/Spinner';
import './UserForm.css';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const BATCH_OPTIONS = ['2022-2024', '2023-2025', '2024-2026', '2025-2027', '2026-2028'];
const COMMUNITY_OPTIONS = ['OC', 'BC', 'MBC', 'SC', 'ST'];
const SPECIALIZATION_OPTIONS = [
  'Athletics', 'Basketball', 'Cricket', 'Football', 'Volleyball', 'Kabaddi',
  'Swimming', 'Badminton', 'Tennis', 'Wrestling', 'Boxing', 'Yoga', 'Gymnastics', 'Other',
];

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'academic', label: 'Academic Info', icon: '🎓' },
  { id: 'address', label: 'Address', icon: '🏠' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
];

const EMPTY_FORM = {
  name: '', email: '', password: '', batch: '', gender: '', dob: '',
  region: '', community: '', mobileNo: '', bloodGroup: '', nationality: '',
  specialization: '', permanentAddress: '', guardianAddress: '',
  purposeOfStudyingCourse: '', sportsAchievement: '', extraCurricular: '',
  onlineCourse: '', referredBy: '',
};

const UserForm = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [existingId, setExistingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const loadExistingForm = async () => {
      setIsLoading(true);
      try {
        const allForms = await userFormService.getAll();
        const myForm = allForms.find(
          (f) => f.email?.toLowerCase() === user?.email?.toLowerCase()
        );
        if (myForm) {
          setExistingId(myForm.id);
          setFormData({
            name: myForm.name || '',
            email: myForm.email || '',
            password: myForm.password || '',
            batch: myForm.batch || '',
            gender: myForm.gender || '',
            dob: myForm.dob ? myForm.dob.substring(0, 10) : '',
            region: myForm.region || '',
            community: myForm.community || '',
            mobileNo: myForm.mobileNo ? String(myForm.mobileNo) : '',
            bloodGroup: myForm.bloodGroup || '',
            nationality: myForm.nationality || '',
            specialization: myForm.specialization || '',
            permanentAddress: myForm.permanentAddress || '',
            guardianAddress: myForm.guardianAddress || '',
            purposeOfStudyingCourse: myForm.purposeOfStudyingCourse || '',
            sportsAchievement: myForm.sportsAchievement || '',
            extraCurricular: myForm.extraCurricular || '',
            onlineCourse: myForm.onlineCourse || '',
            referredBy: myForm.referredBy || '',
          });
          if (myForm.updatedTime) {
            setLastSaved(new Date(myForm.updatedTime).toLocaleString());
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            name: user?.name || '',
            email: user?.email || '',
            mobileNo: user?.mobileNo ? String(user.mobileNo) : '',
          }));
        }
      } catch (err) {
        showToast('Failed to load profile data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.email) loadExistingForm();
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: null }));
  };

  const validateSection = (sectionId) => {
    const tempErrors = {};
    if (sectionId === 'personal') {
      if (!formData.name.trim()) tempErrors.name = 'Full name is required';
      if (!formData.email.trim()) tempErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) tempErrors.email = 'Invalid email format';
      if (!formData.password) tempErrors.password = 'Password is required';
      else if (formData.password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
      if (!formData.gender) tempErrors.gender = 'Gender is required';
      if (!formData.dob) tempErrors.dob = 'Date of birth is required';
      if (!formData.mobileNo.trim()) tempErrors.mobileNo = 'Mobile number is required';
      else if (!/^\d{10}$/.test(formData.mobileNo)) tempErrors.mobileNo = 'Must be a 10-digit number';
    }
    if (sectionId === 'academic') {
      if (!formData.batch) tempErrors.batch = 'Batch is required';
    }
    return tempErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allErrors = { ...validateSection('personal'), ...validateSection('academic') };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      if (allErrors.name || allErrors.email || allErrors.password || allErrors.gender || allErrors.dob || allErrors.mobileNo) {
        setActiveSection('personal');
      } else if (allErrors.batch) {
        setActiveSection('academic');
      }
      showToast('Please fix the highlighted errors', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, mobileNo: parseInt(formData.mobileNo, 10) };
      let result;
      if (existingId) {
        result = await userFormService.update(existingId, payload);
        showToast('Profile updated successfully! ✅', 'success');
      } else {
        result = await userFormService.create(payload);
        setExistingId(result.id);
        showToast('Profile created successfully! 🎉', 'success');
      }
      setLastSaved(new Date().toLocaleString());
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Spinner fullPage message="Loading your profile..." />;

  const completionCount = () => {
    const fields = ['name', 'email', 'gender', 'dob', 'mobileNo', 'batch', 'region', 'community',
      'bloodGroup', 'nationality', 'specialization', 'permanentAddress', 'guardianAddress',
      'purposeOfStudyingCourse', 'sportsAchievement', 'extraCurricular', 'onlineCourse', 'referredBy'];
    const filled = fields.filter((k) => formData[k] && String(formData[k]).trim() !== '');
    return Math.round((filled.length / fields.length) * 100);
  };

  const pct = completionCount();
  const currentIdx = SECTIONS.findIndex((s) => s.id === activeSection);

  return (
    <div className="userform-wrapper animate-fade-in">
      <div className="userform-header">
        <div className="userform-header-left">
          <span className="userform-page-icon">📝</span>
          <div>
            <h2>Student Profile Form</h2>
            <p className="userform-subtitle">
              {existingId ? `Last saved: ${lastSaved || 'Previously saved'}` : 'Fill in your complete profile to proceed'}
            </p>
          </div>
        </div>
        <div className="userform-completion-ring">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="26" fill="none"
              stroke={pct === 100 ? 'var(--success)' : 'var(--primary)'}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <span className="ring-label">{pct}%</span>
        </div>
      </div>

      <div className="userform-body">
        <nav className="userform-nav glass-card">
          {SECTIONS.map((sec) => {
            const secErrors = validateSection(sec.id);
            const hasErrors = Object.keys(secErrors).length > 0;
            return (
              <button
                key={sec.id}
                type="button"
                className={`userform-nav-item ${activeSection === sec.id ? 'active' : ''}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <span className="nav-icon">{sec.icon}</span>
                <span>{sec.label}</span>
                {hasErrors && <span className="nav-error-dot" title="Has required fields" />}
              </button>
            );
          })}
          {existingId && (
            <div className="nav-status-badge">
              <span className="status-dot green" />
              Profile Saved
            </div>
          )}
        </nav>

        <form className="userform-content glass-card" onSubmit={handleSubmit} noValidate>

          {activeSection === 'personal' && (
            <div className="form-section animate-fade-in">
              <h3 className="section-title"><span>👤</span> Personal Information</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name <span className="req">*</span></label>
                  <input type="text" id="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g., Arjun Kumar" value={formData.name} onChange={handleChange} disabled={isSubmitting} />
                  {errors.name && <span className="invalid-feedback">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address <span className="req">*</span></label>
                  <input type="email" id="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={isSubmitting} />
                  {errors.email && <span className="invalid-feedback">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password <span className="req">*</span></label>
                  <input type="password" id="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="At least 6 characters" value={formData.password} onChange={handleChange} disabled={isSubmitting} />
                  {errors.password && <span className="invalid-feedback">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mobileNo">Mobile Number <span className="req">*</span></label>
                  <input type="text" id="mobileNo" className={`form-control ${errors.mobileNo ? 'is-invalid' : ''}`}
                    placeholder="10-digit number" value={formData.mobileNo} onChange={handleChange} disabled={isSubmitting} maxLength={10} />
                  {errors.mobileNo && <span className="invalid-feedback">{errors.mobileNo}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gender">Gender <span className="req">*</span></label>
                  <select id="gender" className={`form-control ${errors.gender ? 'is-invalid' : ''}`}
                    value={formData.gender} onChange={handleChange} disabled={isSubmitting}>
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {errors.gender && <span className="invalid-feedback">{errors.gender}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="dob">Date of Birth <span className="req">*</span></label>
                  <input type="date" id="dob" className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                    value={formData.dob} onChange={handleChange} disabled={isSubmitting}
                    max={new Date().toISOString().substring(0, 10)} />
                  {errors.dob && <span className="invalid-feedback">{errors.dob}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="bloodGroup">Blood Group</label>
                  <select id="bloodGroup" className="form-control" value={formData.bloodGroup} onChange={handleChange} disabled={isSubmitting}>
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="nationality">Nationality</label>
                  <input type="text" id="nationality" className="form-control"
                    placeholder="e.g., Indian" value={formData.nationality} onChange={handleChange} disabled={isSubmitting} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="community">Community</label>
                  <select id="community" className="form-control" value={formData.community} onChange={handleChange} disabled={isSubmitting}>
                    <option value="">Select community</option>
                    {COMMUNITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="region">Region</label>
                  <input type="text" id="region" className="form-control"
                    placeholder="e.g., Tamil Nadu" value={formData.region} onChange={handleChange} disabled={isSubmitting} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'academic' && (
            <div className="form-section animate-fade-in">
              <h3 className="section-title"><span>🎓</span> Academic Information</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="batch">Batch <span className="req">*</span></label>
                  <select id="batch" className={`form-control ${errors.batch ? 'is-invalid' : ''}`}
                    value={formData.batch} onChange={handleChange} disabled={isSubmitting}>
                    <option value="">Select batch</option>
                    {BATCH_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.batch && <span className="invalid-feedback">{errors.batch}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="specialization">Sports Specialization</label>
                  <select id="specialization" className="form-control" value={formData.specialization} onChange={handleChange} disabled={isSubmitting}>
                    <option value="">Select specialization</option>
                    {SPECIALIZATION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="referredBy">Referred By</label>
                  <input type="text" id="referredBy" className="form-control"
                    placeholder="Name of referee (optional)" value={formData.referredBy} onChange={handleChange} disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-group mt-4">
                <label className="form-label" htmlFor="purposeOfStudyingCourse">Purpose of Studying This Course</label>
                <textarea id="purposeOfStudyingCourse" className="form-control textarea-md"
                  placeholder="Describe your motivation and goals for joining this program..."
                  value={formData.purposeOfStudyingCourse} onChange={handleChange} disabled={isSubmitting} rows={4} />
              </div>
            </div>
          )}

          {activeSection === 'address' && (
            <div className="form-section animate-fade-in">
              <h3 className="section-title"><span>🏠</span> Address Details</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="permanentAddress">Permanent Address</label>
                <textarea id="permanentAddress" className="form-control textarea-md"
                  placeholder="Door No, Street, City, State, PIN..."
                  value={formData.permanentAddress} onChange={handleChange} disabled={isSubmitting} rows={5} />
              </div>
              <div className="form-group mt-4">
                <label className="form-label" htmlFor="guardianAddress">Guardian's Address</label>
                <textarea id="guardianAddress" className="form-control textarea-md"
                  placeholder="Guardian's address if different from above..."
                  value={formData.guardianAddress} onChange={handleChange} disabled={isSubmitting} rows={5} />
              </div>
            </div>
          )}

          {activeSection === 'achievements' && (
            <div className="form-section animate-fade-in">
              <h3 className="section-title"><span>🏆</span> Achievements & Activities</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="sportsAchievement">Sports Achievements</label>
                <textarea id="sportsAchievement" className="form-control textarea-md"
                  placeholder="List your sports achievements, medals, district/state/national level competitions..."
                  value={formData.sportsAchievement} onChange={handleChange} disabled={isSubmitting} rows={4} />
              </div>
              <div className="form-group mt-4">
                <label className="form-label" htmlFor="extraCurricular">Extra Curricular Activities</label>
                <textarea id="extraCurricular" className="form-control textarea-md"
                  placeholder="Clubs, events, volunteer activities, NSS, NCC, etc..."
                  value={formData.extraCurricular} onChange={handleChange} disabled={isSubmitting} rows={4} />
              </div>
              <div className="form-group mt-4">
                <label className="form-label" htmlFor="onlineCourse">Online Courses / Certifications</label>
                <textarea id="onlineCourse" className="form-control textarea-md"
                  placeholder="Any online courses or certifications you have completed..."
                  value={formData.onlineCourse} onChange={handleChange} disabled={isSubmitting} rows={4} />
              </div>
            </div>
          )}

          <div className="userform-actions">
            <div className="section-nav-buttons">
              {currentIdx > 0 && (
                <button type="button" className="btn-secondary" disabled={isSubmitting}
                  onClick={() => setActiveSection(SECTIONS[currentIdx - 1].id)}>
                  ← Previous
                </button>
              )}
              {currentIdx < SECTIONS.length - 1 && (
                <button type="button" className="btn-secondary" disabled={isSubmitting}
                  onClick={() => setActiveSection(SECTIONS[currentIdx + 1].id)}>
                  Next →
                </button>
              )}
            </div>

            <button type="submit" className="btn-primary save-btn" disabled={isSubmitting}>
              {isSubmitting
                ? <Spinner message={existingId ? 'Updating...' : 'Saving...'} />
                : <span>{existingId ? '💾 Update Profile' : '🚀 Create Profile'}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
