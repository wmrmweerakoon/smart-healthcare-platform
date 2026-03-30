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
                    <span className="navbar-icon">🏥</span>
                    <span className="navbar-title">HealthCare<span className="gradient-text">+</span></span>
                </Link>

                <div className="navbar-links">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="nav-link" id="nav-dashboard">
                                Dashboard
                            </Link>
                            <div className="nav-user">
                                <span className={`badge badge-${user?.role}`}>{user?.role}</span>
                                <span className="nav-user-name">{user?.name}</span>
                            </div>
                            <button onClick={handleLogout} className="btn btn-sm btn-secondary" id="nav-logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link" id="nav-login">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-sm btn-primary" id="nav-register">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
