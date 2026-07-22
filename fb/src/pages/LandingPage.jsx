import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      {/* Background ambient glows */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      {/* Navigation */}
      <header className="landing-header glass-panel">
        <div className="header-logo">
          <span className="logo-emoji">🏅</span>
          <span className="logo-title">PE Department</span>
        </div>
        <div className="header-actions">
          <Link to="/login" className="btn-link-sec">Sign In</Link>
          <Link to="/register" className="btn-link-prim">Register Now</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content animate-fade-in">
            <span className="badge-featured">Physical Education & Sports Management</span>
            <h1 className="hero-title">
              Empowering Athletes, <br />
              <span className="glow-text">Optimizing Performance</span>
            </h1>
            <p className="hero-subtitle">
              Access the sports administration portal to complete your candidate registration, 
              manage family data, and submit medical evaluation records directly online.
            </p>
            <div className="hero-ctas">
              <Link to="/register" className="btn-primary lg animate-pulse-glow">
                Get Started ➔
              </Link>
              <Link to="/login" className="btn-secondary lg">
                Candidate Login
              </Link>
            </div>
          </div>

          <div className="hero-visual animate-slide-in">
            <div className="visual-card glass-card">
              <div className="visual-header">
                <span className="visual-dot dot-red"></span>
                <span className="visual-dot dot-yellow"></span>
                <span className="visual-dot dot-green"></span>
              </div>
              <div className="visual-body">
                <div className="stat-row">
                  <div className="stat-circle">
                    <span className="circle-number">100%</span>
                    <span className="circle-label">Secure API</span>
                  </div>
                  <div className="stat-list">
                    <div className="stat-bar-item">
                      <span>Student Enrollment</span>
                      <div className="progress-bar"><div className="fill" style={{ width: '85%' }}></div></div>
                    </div>
                    <div className="stat-bar-item">
                      <span>Profile Auditing</span>
                      <div className="progress-bar"><div className="fill" style={{ width: '92%' }}></div></div>
                    </div>
                  </div>
                </div>
                <div className="mock-activity-card">
                  <p className="activity-title">🏆 Recent Achievements</p>
                  <p className="activity-desc">National Tournament Enrollments closed successfully with record stats.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="features-section">
          <h2 className="section-title">Department Modules</h2>
          <div className="features-grid">
            <div className="feature-card glass-card">
              <div className="card-icon">📝</div>
              <h3>Student Profile</h3>
              <p>Complete your official physical education profile form detailing your batch, dob, address, and specialty.</p>
            </div>
            <div className="feature-card glass-card">
              <div className="card-icon">👨‍👩‍👧‍👦</div>
              <h3>Family Association</h3>
              <p>Keep the department updated with emergency contacts and parents/guardians occupations for notifications.</p>
            </div>
            <div className="feature-card glass-card">
              <div className="card-icon">📂</div>
              <h3>Document Submission</h3>
              <p>Upload and inspect required documents including fitness certificates, transfer records, and admission cards.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Physical Education & Sports Department. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
