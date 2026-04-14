import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="navbar-title">HealthCare<span className="gradient-text">+</span></span>
        </Link>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/doctors" className="nav-link" id="nav-find-doctors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Find Doctors
              </Link>
              <Link to="/dashboard" className="nav-link" id="nav-dashboard">

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Dashboard
              </Link>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
