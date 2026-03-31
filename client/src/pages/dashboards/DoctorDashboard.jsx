import { useAuth } from '../../context/AuthContext';
import './DashboardStyles.css';

const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page page" id="doctor-dashboard">
      <div className="container">
        {/* Welcome Banner */}
        <div className="dashboard-banner" style={{background: 'linear-gradient(135deg, #0e4b6d 0%, #164e63 50%, var(--bg-tertiary) 100%)'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Welcome, Dr. {user?.name} 🩺</h1>
              <p className="dashboard-subtitle">Manage your practice and patients</p>
            </div>
            <span className="badge badge-doctor">Doctor</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card card">
            <div className="dashboard-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3>Appointments</h3>
            <p>View today's and upcoming appointments with patients</p>
            <span className="dashboard-card-stat">0 today</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3>My Patients</h3>
            <p>View and manage your patient list and histories</p>
            <span className="dashboard-card-stat">0 patients</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>Availability</h3>
            <p>Set your available time slots for appointments</p>
            <span className="dashboard-card-stat">Configure</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <h3>Analytics</h3>
            <p>View your practice performance and insights</p>
            <span className="dashboard-card-stat">Overview</span>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Profile Summary</h2>
          <div className="card profile-summary">
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-label">Name</span>
                <span className="profile-value">Dr. {user?.name}</span>
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

export default DoctorDashboard;
