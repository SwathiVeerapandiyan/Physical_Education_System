import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!username.trim()) {
      tempErrors.username = 'Email or Register number is required';
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
    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.success) {
      showToast('Logged in successfully!', 'success');
      navigate('/dashboard');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="login-wrapper">
      {/* Background ambient glows */}
      <div className="login-ambient-glow login-glow-1"></div>
      <div className="login-ambient-glow login-glow-2"></div>

      <div className="login-container glass-card">
        <div className="login-header">
          <span className="login-logo-emoji">🎖️</span>
          <h2>Candidate Sign In</h2>
          <p>Enter your email or register number to access the portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Email or Register Number</label>
            <input
              type="text"
              id="username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder="e.g., candidate@pe.com or REG12345"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.username && <span className="invalid-feedback">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
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

          <button type="submit" className="btn-primary w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? <Spinner message="Authenticating..." /> : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
          <div className="back-link">
            <Link to="/">← Back to Landing Page</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
