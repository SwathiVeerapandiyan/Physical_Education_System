import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Icon from '../components/Icons';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'admin' (default) or 'student'
  const initialMode = location.state?.defaultTab || 'admin';
  const [loginMode, setLoginMode] = useState(initialMode);

  const [username, setUsername] = useState(loginMode === 'admin' ? 'admin' : '');
  const [password, setPassword] = useState(loginMode === 'admin' ? 'admin123' : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleTabSwitch = (mode) => {
    setLoginMode(mode);
    setErrors({});
    if (mode === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('');
      setPassword('');
    }
  };

  const handleFillAdminDemo = () => {
    setLoginMode('admin');
    setUsername('admin');
    setPassword('admin123');
    setErrors({});
  };

  const validate = () => {
    const tempErrors = {};
    if (!username.trim()) {
      tempErrors.username =
        loginMode === 'admin' ? 'Admin username or email is required' : 'Email or Register number is required';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await login(username, password, loginMode === 'admin');
    setIsSubmitting(false);

    if (result.success) {
      showToast(
        loginMode === 'admin'
          ? 'Administrator authenticated! Welcome to Executive Dashboard.'
          : 'Signed in successfully!',
        'success'
      );
      // Admin goes directly to dashboard, students go to their profile form
      const targetPath = loginMode === 'admin' ? '/dashboard' : '/profile';
      navigate(targetPath, { replace: true });
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-ambient-glow login-glow-1"></div>
      <div className="login-ambient-glow login-glow-2"></div>

      <div className="login-container">
        {/* Role Mode Switcher Tabs */}
        <div className="login-mode-switcher">
          <button
            type="button"
            className={`mode-tab-btn ${loginMode === 'admin' ? 'active admin-active' : ''}`}
            onClick={() => handleTabSwitch('admin')}
          >
            <Icon name="shield" size={16} />
            <span>Administrator Sign In</span>
          </button>
          <button
            type="button"
            className={`mode-tab-btn ${loginMode === 'student' ? 'active student-active' : ''}`}
            onClick={() => handleTabSwitch('student')}
          >
            <Icon name="users" size={16} />
            <span>Candidate Sign In</span>
          </button>
        </div>

        {/* Header */}
        <div className="login-header">
          <div className="login-badge-seal">
            <Icon name={loginMode === 'admin' ? 'shield' : 'user'} size={26} color="#ffffff" />
          </div>

          <h2>{loginMode === 'admin' ? 'Executive Admin Portal' : 'Student Candidate Sign In'}</h2>
          <p>
            {loginMode === 'admin'
              ? 'Authorized Sports Directorate & Faculty Dashboard Login'
              : 'Enter your registered email or register number to access student records'}
          </p>
        </div>

        {/* Quick Demo Helper Box for Admin */}
        {loginMode === 'admin' && (
          <div className="admin-demo-callout">
            <div className="demo-info-text">
              <span className="demo-tag">DEFAULT ADMIN LOGIN</span>
              <p>
                Username: <strong>admin</strong> &bull; Password: <strong>admin123</strong>
              </p>
            </div>
            <button
              type="button"
              className="btn-auto-fill"
              onClick={handleFillAdminDemo}
              title="Auto-fill credentials"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              {loginMode === 'admin' ? 'Administrator ID or Email' : 'Email or Register Number'}
            </label>
            <input
              type="text"
              id="username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder={loginMode === 'admin' ? 'admin or admin@pe.com' : 'candidate@pe.com or REG12345'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.username && <span className="invalid-feedback">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.password && <span className="invalid-feedback">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className={`btn-primary w-full mt-4 ${loginMode === 'admin' ? 'admin-submit-btn' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner message="Authenticating..." />
            ) : loginMode === 'admin' ? (
              'Enter Admin Dashboard'
            ) : (
              'Sign In to Student Portal'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          {loginMode === 'student' ? (
            <p>
              New Candidate? <Link to="/register">Register here</Link>
            </p>
          ) : (
            <p className="admin-security-note">
              Department Administrative Access is logged and audited.
            </p>
          )}

          <div className="back-link">
            <Link to="/"> Back to Landing Page</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
