import { useAuth } from '../../context/AuthContext';
import './DashboardStyles.css';

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-page page" id="admin-dashboard">
            <div className="container">
                <div className="dashboard-header slide-up">
                    <div>
                        <h1>Admin Panel ⚙️</h1>
                        <p className="dashboard-subtitle">System overview and management</p>
                    </div>
                    <span className="badge badge-admin">Admin</span>
                </div>

                <div className="dashboard-grid slide-up">
                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon">👥</div>
                        <h3>Users</h3>
                        <p>Manage all platform users</p>
                        <span className="dashboard-card-stat">0 total</span>
                    </div>

                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon">🩺</div>
                        <h3>Doctors</h3>
                        <p>Manage registered doctors</p>
                        <span className="dashboard-card-stat">0 doctors</span>
                    </div>

                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon">📅</div>
                        <h3>Appointments</h3>
                        <p>Monitor all appointments</p>
                        <span className="dashboard-card-stat">0 total</span>
                    </div>

                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon">💰</div>
                        <h3>Revenue</h3>
                        <p>Track platform revenue</p>
                        <span className="dashboard-card-stat">$0.00</span>
                    </div>
                </div>

                {/* System Info */}
                <div className="dashboard-section slide-up">
                    <h2>System Information</h2>
                    <div className="card profile-summary">
                        <div className="profile-info-grid">
                            <div className="profile-info-item">
                                <span className="profile-label">Admin</span>
                                <span className="profile-value">{user?.name}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">Email</span>
                                <span className="profile-value">{user?.email}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">Platform</span>
                                <span className="profile-value">HealthCare+</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">Services</span>
                                <span className="profile-value">7 microservices</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
