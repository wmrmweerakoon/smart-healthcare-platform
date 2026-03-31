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
            <div className="dashboard-card-icon">📅</div>
            <h3>Appointments</h3>
            <p>View today's and upcoming appointments with patients</p>
            <span className="dashboard-card-stat">0 today</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">👥</div>
            <h3>My Patients</h3>
            <p>View and manage your patient list and histories</p>
            <span className="dashboard-card-stat">0 patients</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">🕐</div>
            <h3>Availability</h3>
            <p>Set your available time slots for appointments</p>
            <span className="dashboard-card-stat">Configure</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">📊</div>
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
