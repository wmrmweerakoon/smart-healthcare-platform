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
            <div className="dashboard-card-icon">📅</div>
            <h3>My Appointments</h3>
            <p>View and manage your upcoming appointments with doctors</p>
            <span className="dashboard-card-stat">0 upcoming</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">📋</div>
            <h3>Medical Records</h3>
            <p>Access your medical history, reports, and prescriptions</p>
            <span className="dashboard-card-stat">0 records</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">🔍</div>
            <h3>Find a Doctor</h3>
            <p>Search and connect with healthcare professionals</p>
            <span className="dashboard-card-stat">Browse</span>
          </div>

          <div className="dashboard-card card">
            <div className="dashboard-card-icon">💳</div>
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
