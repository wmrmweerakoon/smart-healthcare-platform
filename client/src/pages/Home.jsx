import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home-page" id="home-page">
            {/* Background decorations */}
            <div className="home-bg-glow home-bg-glow-1"></div>
            <div className="home-bg-glow home-bg-glow-2"></div>

            {/* Hero Section */}
            <section className="hero container">
                <div className="hero-content slide-up">
                    <div className="hero-badge">🏥 Smart Healthcare Platform</div>
                    <h1 className="hero-title">
                        Your Health, <br />
                        <span className="gradient-text">Reimagined Digitally</span>
                    </h1>
                    <p className="hero-subtitle">
                        Book appointments, consult with doctors, manage your medical records,
                        and take control of your healthcare journey — all in one place.
                    </p>
                    <div className="hero-actions">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary btn-lg" id="hero-dashboard">
                                Go to Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg" id="hero-register">
                                    Get Started Free →
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Features Grid */}
                <div className="features-grid slide-up">
                    <div className="feature-card card">
                        <div className="feature-icon">📅</div>
                        <h3>Easy Appointments</h3>
                        <p>Book and manage appointments with your preferred doctors in just a few clicks.</p>
                    </div>
                    <div className="feature-card card">
                        <div className="feature-icon">👨‍⚕️</div>
                        <h3>Expert Doctors</h3>
                        <p>Connect with qualified healthcare professionals across multiple specialties.</p>
                    </div>
                    <div className="feature-card card">
                        <div className="feature-icon">📋</div>
                        <h3>Medical Records</h3>
                        <p>Securely store and access your medical history, reports, and prescriptions.</p>
                    </div>
                    <div className="feature-card card">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure & Private</h3>
                        <p>Your data is protected with industry-standard encryption and authentication.</p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section container">
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-number gradient-text">500+</span>
                        <span className="stat-label">Doctors</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number gradient-text">10K+</span>
                        <span className="stat-label">Patients</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number gradient-text">50K+</span>
                        <span className="stat-label">Appointments</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number gradient-text">99%</span>
                        <span className="stat-label">Satisfaction</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
