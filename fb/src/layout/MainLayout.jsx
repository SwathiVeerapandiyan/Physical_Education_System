import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'User Directory', icon: '👥' },
    { path: '/profile', label: 'User Form', icon: '📝' },
    { path: '/family', label: 'Family Details', icon: '👨‍👩‍👧‍👦' },
    { path: '/documents', label: 'Document Details', icon: '📁' },
    { path: '/sports', label: 'Sports Directory', icon: '🏀' },
    { path: '/tournaments', label: 'Tournaments', icon: '🏆' },
    { path: '/teams', label: 'Teams & Squads', icon: '🛡️' },
    { path: '/matches', label: 'Match Fixtures', icon: '⚽' },
  ];

  // Helper to determine active breadcrumb/page title
  const getPageTitle = () => {
    const current = navItems.find(item => item.path === location.pathname);
    return current ? current.label : 'Management System';
  };

  return (
    <div className="layout-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar Nav */}
      <aside className={`sidebar-container glass-panel ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="logo-icon">🏅</span>
          <h2 className="logo-text">PE Portal</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
            <div className="user-info-text">
              <p className="user-profile-name">{user?.name || 'Guest User'}</p>
              <p className="user-profile-role">{user?.dept || 'Department'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-navbar glass-panel">
          <div className="navbar-left">
            <button className="mobile-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <h1 className="navbar-page-title">{getPageTitle()}</h1>
          </div>

          <div className="navbar-right">
            <span className="user-display-name">
              Welcome, <strong>{user?.name || 'User'}</strong>
            </span>
            <button className="logout-action-btn" onClick={handleLogout}>
              Logout <span>➔</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
