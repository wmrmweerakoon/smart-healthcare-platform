import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page" id="home-page">
      {/* Animated Background */}
      <div className="home-bg">
        <div className="home-grid-bg"></div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-layout">
            <div className="hero-content">
              <div className="section-label">
                <span className="label-dot"></span>
                The New Era of Personal Wellness
              </div>
              
              <h1 className="hero-title">
                Your Health Journey,<br />
                <span className="text-gradient">Beautifully Simplified.</span>
              </h1>
              
              <p className="hero-subtitle">
                Experience healthcare that evolves with you. Connect with elite specialists, 
                manage your records, and track your wellness—all from a single, 
                securely encrypted haven.
              </p>

              <div className="hero-actions">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg" id="hero-dashboard">
                    Go to Your Dashboard
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg" id="hero-register">
                      Join for Free
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login">
                      Welcome Back
                    </Link>
                  </>
                )}
              </div>

              <div className="hero-trust">
                <div className="trust-indicator">
                  <div className="trust-rating">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="star-icon">★</span>
                    ))}
                    <strong style={{ marginLeft: '8px', color: 'var(--text-primary)' }}>4.9/5</strong>
                  </div>
                  <p className="trust-text">
                    Join <strong>12,000+</strong> patients trusting us for their care.
                  </p>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-frame">
                <img 
                  src="/hero-photo.png" 
                  alt="Elite Healthcare Experience" 
                  className="hero-photo"
                />
                
                {/* Floating Stats Card */}
                <div className="hero-stats-card">
                  <div className="pulse-icon"></div>
                  <div>
                    <strong>1,200+ Specialists</strong>
                    <p>Verified & Available Now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">
              <span className="label-dot"></span>
              Designed for You
            </div>
            <h2>Healthcare tailored to <span className="text-gradient">your lifestyle</span></h2>
            <p className="section-desc">We've built every feature with one person in mind: you. Experience care that is fast, secure, and deeply personal.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="feature-tag">Efficiency</div>
              <h3>Skip the Wait</h3>
              <p>Instant booking with top specialists. No more endless phone tags or long clinic queues.</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="feature-tag">Security</div>
              <h3>Digital Safe</h3>
              <p>Your medical history is encrypted and accessible only by you and your chosen providers.</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="feature-tag">Access</div>
              <h3>Round the Clock</h3>
              <p>Connect with doctors via video consultation anytime, anywhere. Care that doesn't sleep.</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div className="feature-tag">Insights</div>
              <h3>Smart Analysis</h3>
              <p>AI-powered symptom checking and health tracking to keep you informed about your wellness.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <h2>Start your journey in <span className="text-gradient">3 simple steps</span></h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3>Create Profile</h3>
              <p>Set up your secure medical identity in minutes.</p>
            </div>
            
            <div className="step-connector">
              <svg width="40" height="2" viewBox="0 0 40 2"><line x1="0" y1="1" x2="40" y2="1" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" /></svg>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h3>Consult Experts</h3>
              <p>Book a visit or join a video call with top doctors.</p>
            </div>

            <div className="step-connector">
              <svg width="40" height="2" viewBox="0 0 40 2"><line x1="0" y1="1" x2="40" y2="1" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" /></svg>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3>Better Health</h3>
              <p>Receive prescriptions and manage your wellness long-term.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-card">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Privacy Score</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Doctor Support</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">12k+</span>
                <span className="stat-label">Happy Patients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to transform your care?</h2>
            <p>Join the thousands who have already shifted to a more personal, secure, and modern healthcare experience.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Create Your Account Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-logo">
                <div className="navbar-logo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <span>Antigravity Health</span>
              </div>
              <p className="footer-desc">Building the future of personalized, secure, and accessible healthcare for everyone.</p>
            </div>
            <div className="footer-links-group">
              <h4>Platform</h4>
              <Link to="/doctors" className="footer-link">Find Doctors</Link>
              <Link to="/symptom-checker" className="footer-link">Symptom Checker</Link>
              <Link to="/register" className="footer-link">Join Us</Link>
            </div>
            <div className="footer-links-group">
              <h4>Support</h4>
              <Link to="/" className="footer-link">Privacy Policy</Link>
              <Link to="/" className="footer-link">Terms of Service</Link>
              <Link to="/" className="footer-link">Contact Us</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Antigravity Healthcare Platform. All rights reserved. Premium Experience.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
