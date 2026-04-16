import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import Loader from '../../components/Loader';
import './DashboardStyles.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, aptsRes, paymentsRes] = await Promise.all([
                axios.get('/admin/users'),
                axios.get('/admin/appointments').catch(e => ({ data: { data: [] } })),
                axios.get('/admin/payments').catch(e => ({ data: { data: [] } }))
            ]);
            
            setUsers(usersRes.data.data || []);
            setAppointments(aptsRes.data.data || []);
            setPayments(paymentsRes.data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError('Failed to load system data. Please check if the Admin Service is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        
        try {
            setActionLoading(userId);
            await axios.delete(`/admin/user/${userId}`);
            setUsers(users.filter((u) => u._id !== userId));
        } catch (err) {
            alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleVerifyDoctor = async (userId) => {
        try {
            setActionLoading(userId);
            const res = await axios.put(`/admin/verify-doctor/${userId}`);
            setUsers(users.map((u) => (u._id === userId ? { ...u, isVerified: true } : u)));
        } catch (err) {
            alert('Failed to verify doctor: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const doctors = users.filter((u) => u.role === 'doctor');
    const patients = users.filter((u) => u.role === 'patient');

    return (
        <div className="dashboard-page page" id="admin-dashboard">
            <div className="container">
                {/* Welcome Banner */}
                <div className="dashboard-banner" style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, var(--bg-tertiary) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1>Admin Panel ⚙️</h1>
                            <p className="dashboard-subtitle">Platform-wide management and oversight</p>
                        </div>
                        <span className="badge badge-admin">Administrator</span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="dashboard-grid">
                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <h3>Total Users</h3>
                        <p>Total registered accounts on the platform</p>
                        <span className="dashboard-card-stat">{users.length} active</span>
                    </div>

                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/><path d="M14 6h.01"/><path d="M18 10h.01"/><path d="M10 14h.01"/><path d="M14 18h.01"/></svg>
                        </div>
                        <h3>Doctors</h3>
                        <p>Total doctor profiles across all specialties</p>
                        <span className="dashboard-card-stat">{doctors.length} onboarded</span>
                    </div>

                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </div>
                        <h3>Appointments</h3>
                        <p>Platform-wide appointment monitoring</p>
                        <span className="dashboard-card-stat">Live monitoring active</span>
                    </div>

                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        </div>
                        <h3>Security</h3>
                        <p>System security and access control</p>
                        <span className="dashboard-card-stat">JWT Protected</span>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                        <p>{error}</p>
                    </div>
                )}

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <Loader size="lg" text="Fetching platform data..." />
                    </div>
                ) : (
                    <>
                        {/* User Management Section */}
                        <div className="dashboard-section">
                            <h2>User Management</h2>
                            <div className="card admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((item) => (
                                            <tr key={item._id}>
                                                <td style={{ fontWeight: 600 }}>{item.name}</td>
                                                <td>{item.email}</td>
                                                <td>
                                                    <span className={`badge badge-${item.role}`}>
                                                        {item.role}
                                                    </span>
                                                </td>
                                                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button 
                                                        className="btn-icon btn-danger-icon" 
                                                        title="Delete User"
                                                        onClick={() => handleDeleteUser(item._id)}
                                                        disabled={actionLoading === item._id || item._id === user?._id}
                                                    >
                                                        {actionLoading === item._id ? <Loader size="sm" /> : '🗑️'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Doctor Verification Section */}
                        <div className="dashboard-section">
                            <h2>Doctor Verification</h2>
                            <div className="card admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Doctor Name</th>
                                            <th>Specialty</th>
                                            <th>Status</th>
                                            <th>Verification Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doctors.map((doc) => (
                                            <tr key={doc._id}>
                                                <td style={{ fontWeight: 600 }}>Dr. {doc.name}</td>
                                                <td>{doc.specialty || 'General'}</td>
                                                <td>
                                                    <span className={`status-badge ${doc.isVerified ? 'status-verified' : 'status-pending'}`}>
                                                        {doc.isVerified ? 'Verified' : 'Pending Verification'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {!doc.isVerified && (
                                                        <button 
                                                            className="btn btn-sm btn-outline"
                                                            onClick={() => handleVerifyDoctor(doc._id)}
                                                            disabled={actionLoading === doc._id}
                                                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                                        >
                                                            {actionLoading === doc._id ? <Loader size="sm" /> : 'Confirm Credentials'}
                                                        </button>
                                                    )}
                                                    {doc.isVerified && <span>✅ Verified</span>}
                                                </td>
                                            </tr>
                                        ))}
                                        {doctors.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                                                    No doctors currently pending verification.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Appointments Section */}
                        <div className="dashboard-section">
                            <h2>Platform Appointments</h2>
                            <div className="card admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Doctor</th>
                                            <th>Date & Time</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((apt) => (
                                            <tr key={apt._id}>
                                                <td style={{ fontWeight: 600 }}>{apt.patientName || 'N/A'}</td>
                                                <td>Dr. {apt.doctorName || 'N/A'}</td>
                                                <td>{new Date(apt.date).toLocaleDateString()} {apt.timeSlot?.startTime} - {apt.timeSlot?.endTime}</td>
                                                <td>
                                                    <span className={`badge badge-${apt.type === 'video' ? 'admin' : 'patient'}`}>
                                                        {apt.type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${apt.status}`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {appointments.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                                                    No appointments recorded on the platform.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payments Section */}
                        <div className="dashboard-section">
                            <h2>Platform Transactions (Payments)</h2>
                            <div className="card admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Transaction ID</th>
                                            <th>Amount</th>
                                            <th>Method</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr key={payment._id}>
                                                <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{payment._id}</td>
                                                <td style={{ fontWeight: 600, color: '#312e81' }}>
                                                    ${(payment.amount).toFixed(2)} {payment.currency?.toUpperCase() || 'USD'}
                                                </td>
                                                <td>
                                                    <span className="badge badge-admin">
                                                        {payment.paymentMethod || 'Stripe'}
                                                    </span>
                                                </td>
                                                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge status-${payment.status}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {payments.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                                                    No financial transactions recorded.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
