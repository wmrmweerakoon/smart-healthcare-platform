import { useAuth } from '../../context/AuthContext';
import './DashboardStyles.css';

const PatientDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page page" id="patient-dashboard">
      <div className="container">
        {/* Welcome Banner */}
        <div className="dashboard-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Welcome, {user?.name} 👋</h1>
              <p className="dashboard-subtitle">Manage your health journey from here</p>
            </div>
            <span className="badge badge-patient">Patient</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card card">
            <div className="dashboard-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3>My Appointments</h3>
            <p>View and manage your upcoming appointments with doctors</p>
            <span className="dashboard-card-stat">0 upcoming</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h3>Medical Records</h3>
            <p>Access your medical history, reports, and prescriptions</p>
            <span className="dashboard-card-stat">0 records</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
            </div>
            <h3>Find a Doctor</h3>
            <p>Search and connect with healthcare professionals</p>
            <span className="dashboard-card-stat">Browse</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <h3>Payments</h3>
            <p>View your payment history and outstanding invoices</p>
            <span className="dashboard-card-stat">$0.00 due</span>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Profile Summary</h2>
          <div className="card profile-summary">
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-label">Name</span>
                <span className="profile-value">{user?.name}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user?.email}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-label">Role</span>
                <span className="profile-value" style={{textTransform: 'capitalize'}}>{user?.role}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-label">Member Since</span>
                <span className="profile-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
