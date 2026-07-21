import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import './RegisterPage.css';

const RegisterPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    registerNo: '',
    dept: '',
    email: '',
    mobileNo: '',
    password: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Full name is required';
    if (!formData.registerNo.trim()) tempErrors.registerNo = 'Register number is required';
    if (!formData.dept.trim()) tempErrors.dept = 'Department is required';
    
    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Invalid email format';
    }

    // Mobile check
    if (!formData.mobileNo.trim()) {
      tempErrors.mobileNo = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNo)) {
      tempErrors.mobileNo = 'Mobile number must be a 10-digit number';
    }

    // Password check
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password check
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Build User entity payload matching backend
      const payload = {
        name: formData.name.trim(),
        registerNo: formData.registerNo.trim(),
        dept: formData.dept.trim(),
        email: formData.email.trim(),
        mobileNo: parseInt(formData.mobileNo, 10),
        password: formData.password,
      };

      await authService.register(payload);
      showToast('Account created successfully!', 'success');

      // Auto login using login context
      showToast('Logging in...', 'info');
      const loginResult = await login(payload.email, formData.password);

      if (loginResult.success) {
        showToast('Auto-login successful!', 'success');
        // Let the PublicRoute's automatic redirect handle navigation to dashboard
      } else {
        showToast('Registration successful! Please login.', 'warning');
        navigate('/login');
      }
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-wrapper">
      {/* Background ambient glows */}
      <div className="register-ambient-glow register-glow-1"></div>
      <div className="register-ambient-glow register-glow-2"></div>

      <div className="register-container glass-card">
        <div className="register-header">
          <span className="register-logo-emoji">📝</span>
          <h2>Candidate Registration</h2>
          <p>Create an account to register in the PE Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.name && <span className="invalid-feedback">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="registerNo">Register Number</label>
              <input
                type="text"
                id="registerNo"
                className={`form-control ${errors.registerNo ? 'is-invalid' : ''}`}
                placeholder="REG12345"
                value={formData.registerNo}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.registerNo && <span className="invalid-feedback">{errors.registerNo}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dept">Department</label>
              <input
                type="text"
                id="dept"
                className={`form-control ${errors.dept ? 'is-invalid' : ''}`}
                placeholder="Physical Education"
                value={formData.dept}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.dept && <span className="invalid-feedback">{errors.dept}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="johndoe@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.email && <span className="invalid-feedback">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobileNo">Mobile Number</label>
              <input
                type="text"
                id="mobileNo"
                className={`form-control ${errors.mobileNo ? 'is-invalid' : ''}`}
                placeholder="10-digit number"
                value={formData.mobileNo}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.mobileNo && <span className="invalid-feedback">{errors.mobileNo}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="At least 6 chars"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.password && <span className="invalid-feedback">{errors.password}</span>}
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && <span className="invalid-feedback">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? <Spinner message="Registering candidate..." /> : 'Register Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          <div className="back-link">
            <Link to="/">← Back to Landing Page</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
