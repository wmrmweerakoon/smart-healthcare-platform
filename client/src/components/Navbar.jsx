import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notification/my-notifications?limit=5');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/notification/read/${id}`);
      // Optimistic update
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="navbar-title">HealthCare<span className="gradient-text">+</span></span>
        </Link>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/doctors" className="nav-link" id="nav-find-doctors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                Find Doctors
              </Link>
              <Link to="/symptom-checker" className="nav-link" id="nav-symptom-checker">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                AI Checker
              </Link>
              <Link to="/payments" className="nav-link" id="nav-payments">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                Payments
              </Link>
              <Link to="/dashboard" className="nav-link" id="nav-dashboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                Dashboard
              </Link>
              
              <div className="nav-divider"></div>
              
              {/* Notification Bell */}
              <div className="nav-notification-container" ref={dropdownRef}>
                <button className="nav-notification-btn" onClick={() => setShowDropdown(!showDropdown)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                
                {showDropdown && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h4>Notifications</h4>
                    </div>
                    <div className="notification-body">
                      {notifications.length === 0 ? (
                        <div className="notification-empty">No new notifications</div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif._id);
                            }}
                          >
                            <div className="notification-content">
                              <strong>{notif.category?.replace('_', ' ').toUpperCase()}</strong>
                              <p>{notif.message}</p>
                              <span className="notification-time">
                                {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            {!notif.isRead && <div className="notification-dot"></div>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="nav-divider"></div>
              <div className="nav-user">
                <div className="nav-user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="nav-user-info">
                  <span className="nav-user-name">{user?.name}</span>
                  <span className={`badge badge-${user?.role}`}>{user?.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-sm btn-outline" id="nav-logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" id="nav-login">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary" id="nav-register">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
