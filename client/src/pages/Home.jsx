import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page" id="home-page">
      {/* Animated Background */}
      <div className="home-bg">
        <div className="home-orb home-orb-1"></div>
        <div className="home-orb home-orb-2"></div>
        <div className="home-orb home-orb-3"></div>
        <div className="home-grid-bg"></div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-layout">
          <div className="hero-content">
            <div className="section-label">
              <span className="label-dot"></span>
              Smart Healthcare Platform
            </div>
            <h1 className="hero-title">
              Your Health,{' '}
              <span className="gradient-text">Reimagined</span>
              <br />
              <span className="gradient-text">Digitally</span>
            </h1>
            <p className="hero-subtitle">
              Book appointments, consult with doctors, manage your medical records,
              and take full control of your healthcare journey — all from one secure platform.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg" id="hero-dashboard">
                  Go to Dashboard
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg" id="hero-register">
                    Get Started Free
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="hero-trust">
              <div className="trust-avatars">
                <div className="trust-avatar" style={{background: 'linear-gradient(135deg, #6366f1, #818cf8)'}}>J</div>
                <div className="trust-avatar" style={{background: 'linear-gradient(135deg, #06b6d4, #22d3ee)'}}>S</div>
                <div className="trust-avatar" style={{background: 'linear-gradient(135deg, #10b981, #34d399)'}}>M</div>
                <div className="trust-avatar" style={{background: 'linear-gradient(135deg, #f59e0b, #fbbf24)'}}>A</div>
              </div>
              <span className="trust-text">Trusted by <strong>10,000+</strong> patients</span>
            </div>
          </div>

          {/* Hero Visual — Illustration */}
          <div className="hero-visual">
            <img
              src="/hero-illustration.png"
              alt="Healthcare platform illustration"
              className="hero-illustration"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">
              <span className="label-dot"></span>
              Platform Features
            </div>
            <h2>Everything you need for <span className="gradient-text">modern healthcare</span></h2>
            <p className="section-desc">Our platform provides a comprehensive suite of tools designed to streamline your healthcare experience.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3>Easy Appointments</h3>
              <p>Book and manage appointments with your preferred doctors in just a few clicks.</p>
              <div className="feature-tag">Scheduling</div>
            </div>
            <div className="feature-card card">
              <div className="feature-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3>Expert Doctors</h3>
              <p>Connect with qualified healthcare professionals across multiple specialties.</p>
              <div className="feature-tag">Consultation</div>
            </div>
            <div className="feature-card card">
              <div className="feature-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3>Medical Records</h3>
              <p>Securely store and access your medical history, reports, and prescriptions anytime.</p>
              <div className="feature-tag">Records</div>
            </div>
            <div className="feature-card card">
              <div className="feature-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3>Secure & Private</h3>
              <p>Your data is protected with industry-standard encryption and JWT authentication.</p>
              <div className="feature-tag">Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">
              <span className="label-dot"></span>
              How It Works
            </div>
            <h2>Get started in <span className="gradient-text">3 simple steps</span></h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </div>
              <h3>Create Account</h3>
              <p>Register as a patient or doctor with your details in under a minute.</p>
            </div>
            <div className="step-connector">
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeDasharray="4 4"><path d="M0 12h40"/><path d="M34 6l6 6-6 6"/></svg>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h3>Find a Doctor</h3>
              <p>Search and browse doctors by specialty, availability, and ratings.</p>
            </div>
            <div className="step-connector">
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeDasharray="4 4"><path d="M0 12h40"/><path d="M34 6l6 6-6 6"/></svg>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3>Book & Consult</h3>
              <p>Select a time slot, confirm your appointment, and consult online or in-person.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-card card card-glow">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Verified Doctors</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Active Patients</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Appointments</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">99%</span>
                <span className="stat-label">Satisfaction Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg-orb"></div>
            <h2>Ready to take control of your health?</h2>
            <p>Join thousands of patients and doctors already using HealthCare+ for a better healthcare experience.</p>
            <div className="cta-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg" id="cta-dashboard">Go to Dashboard</Link>
              ) : (
                <Link to="/register" className="btn btn-primary btn-lg" id="cta-register">
                  Create Free Account
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                HealthCare<span className="gradient-text">+</span>
              </span>
              <p className="footer-desc">Modern healthcare platform built with microservices architecture for reliable, scalable care.</p>
            </div>
            <div className="footer-links-group">
              <h4>Platform</h4>
              <a href="#" className="footer-link">Features</a>
              <a href="#" className="footer-link">How it Works</a>
              <a href="#" className="footer-link">Pricing</a>
            </div>
            <div className="footer-links-group">
              <h4>Support</h4>
              <a href="#" className="footer-link">Help Center</a>
              <a href="#" className="footer-link">Contact Us</a>
              <a href="#" className="footer-link">Privacy Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2024 HealthCare+. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
