import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ChatbotWidget from '../components/ChatbotWidget';
import Icon from '../components/Icons';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Role-based sidebar navigation
  const navGroups = isAdmin
    ? [
        {
          title: 'Executive',
          items: [
            {
              path: '/dashboard',
              label: 'Executive Dashboard',
              icon: 'dashboard',
              badge: 'Live',
            },
          ],
        },
        {
          title: 'Candidate Athletes',
          items: [
            { path: '/users', label: 'Athlete Directory', icon: 'users' },
            { path: '/health-fitness', label: 'Health & Fitness', icon: 'health' },
          ],
        },
        {
          title: 'Facilities & Logistics',
          items: [
            { path: '/equipment-bookings', label: 'Equipment Loans', icon: 'equipment' },
            { path: '/ground-bookings', label: 'Ground Bookings', icon: 'ground' },
          ],
        },
        {
          title: 'Administration',
          items: [
            { path: '/notices', label: 'Notice Board & Alerts', icon: 'notice' },
            { path: '/feedback', label: 'Feedback & Reviews', icon: 'feedback' },
            { path: '/emergency-contacts', label: 'Emergency Contacts', icon: 'emergency' },
            { path: '/gallery', label: 'Media Gallery', icon: 'gallery' },
          ],
        },
      ]
    : [
        {
          title: 'Portal',
          items: [
            {
              path: '/dashboard',
              label: 'Athlete Dashboard',
              icon: 'dashboard',
              badge: 'Live',
            },
          ],
        },
        {
          title: 'Student Dossier',
          items: [
            { path: '/profile', label: 'Student Profile Form', icon: 'userCheck' },
            { path: '/family', label: 'Family Records', icon: 'family' },
            { path: '/documents', label: 'Document Vault', icon: 'document' },
            { path: '/health-fitness', label: 'Health & Fitness', icon: 'health' },
          ],
        },
        {
          title: 'Facilities & Logistics',
          items: [
            { path: '/equipment-bookings', label: 'Equipment Loans', icon: 'equipment' },
            { path: '/ground-bookings', label: 'Ground Bookings', icon: 'ground' },
          ],
        },
        {
          title: 'Campus & Support',
          items: [
            { path: '/notices', label: 'Notice Board', icon: 'notice' },
            { path: '/feedback', label: 'Feedback & Reviews', icon: 'feedback' },
            { path: '/emergency-contacts', label: 'Emergency Contacts', icon: 'emergency' },
            { path: '/gallery', label: 'Media Gallery', icon: 'gallery' },
          ],
        },
      ];

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  // Find active group and item for breadcrumb
  let activeCategory = 'Management';
  let activeTitle = 'Portal';

  for (const group of navGroups) {
    const found = group.items.find((item) => item.path === location.pathname);
    if (found) {
      activeCategory = group.title;
      activeTitle = found.label;
      break;
    }
  }

  return (
    <div className="layout-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar Nav */}
      <aside className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-badge">
            <Icon name="shield" size={22} color="#ffffff" />
          </div>
          <div className="logo-meta">
            <h2 className="logo-text">MCC SPORTS</h2>
            <span className="logo-subtext">
              {isAdmin ? 'ADMINISTRATION PORTAL' : 'STUDENT ATHLETE PORTAL'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.title} className="nav-group-section">
              <div className="nav-group-title">{group.title}</div>
              <div className="nav-group-links">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-icon-wrap">
                      <Icon name={item.icon} size={18} />
                    </span>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span
                        className="nav-pill-badge"
                        style={{
                          background: item.badge === 'Admin Only'
                            ? '#fef3c7'
                            : 'rgba(159, 18, 57, 0.12)',
                          color: item.badge === 'Admin Only' ? '#b45309' : '#9f1239',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
            <div className="user-info-text">
              <p className="user-profile-name">{user?.name || 'User'}</p>
              <div className="admin-status-indicator">
                <span
                  className="pulse-dot"
                  style={{ background: isAdmin ? '#10b981' : '#3b82f6' }}
                ></span>
                <span className="admin-role-title">
                  {isAdmin ? 'Sports Officer (Admin)' : 'Candidate Athlete'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-navbar">
          <div className="navbar-left">
            <button
              className="mobile-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="breadcrumb-nav">
              <span className="breadcrumb-root">{isAdmin ? 'Admin Console' : 'Portal'}</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-cat">{activeCategory}</span>
              <span className="breadcrumb-sep">/</span>
              <h1 className="navbar-page-title">{activeTitle}</h1>
            </div>
          </div>

          <div className="navbar-right">
            <div
              className="admin-portal-chip"
              style={{
                background: isAdmin ? 'rgba(159, 18, 57, 0.07)' : 'rgba(30, 45, 90, 0.07)',
                color: isAdmin ? '#7b1129' : '#1e2d5a',
              }}
            >
              <Icon name="badgeCheck" size={15} color={isAdmin ? '#9f1239' : '#1e2d5a'} />
              <span>{isAdmin ? 'Admin Mode: Directorate' : 'Student Access'}</span>
            </div>

            <div className="navbar-user-info">
              <span className="user-display-name">
                Logged in as <strong>{user?.name || 'User'}</strong>
              </span>
            </div>

            <button className="logout-action-btn" onClick={handleLogout} title="Sign out">
              <Icon name="logout" size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-container">{children}</main>

        {/* Chatbot Widget - Available solely in Student / Candidate Login */}
        {!isAdmin && <ChatbotWidget />}
      </div>
    </div>
  );
};

export default MainLayout;
