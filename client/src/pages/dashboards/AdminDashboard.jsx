import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import Loader from '../../components/Loader';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import './DashboardStyles.css';


const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [analyticsData, setAnalyticsData] = useState(null);

    // User Management State
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userFormData, setUserFormData] = useState({ name: '', email: '', role: 'patient', password: '' });

    // Appointment Management State
    const [showAptModal, setShowAptModal] = useState(false);
    const [reschedulingApt, setReschedulingApt] = useState(null);
    const [aptFormData, setAptFormData] = useState({ date: '', startTime: '', endTime: '' });



    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, aptsRes, paymentsRes, statsRes, analyticsRes] = await Promise.all([
                axios.get('/admin/users'),
                axios.get('/admin/appointments').catch(e => ({ data: { data: [] } })),
                axios.get('/admin/payments').catch(e => ({ data: { data: [] } })),
                axios.get('/admin/stats').catch(e => ({ data: { data: null } })),
                axios.get('/admin/analytics').catch(e => ({ data: { data: null } }))
            ]);
            
            setUsers(usersRes.data.data || []);
            setAppointments(aptsRes.data.data || []);
            setPayments(paymentsRes.data.data || []);
            setStats(statsRes.data.data);
            setAnalyticsData(analyticsRes.data.data);
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

    // --- User Actions ---
    const openAddUser = () => {
        setEditingUser(null);
        setUserFormData({ name: '', email: '', role: 'patient', password: '' });
        setShowUserModal(true);
    };

    const openEditUser = (u) => {
        setEditingUser(u);
        setUserFormData({ name: u.name, email: u.email, role: u.role, password: '' });
        setShowUserModal(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingUser) {
                const res = await axios.put(`/admin/user/${editingUser._id}`, userFormData);
                setUsers(users.map(u => u._id === editingUser._id ? res.data.data : u));
            } else {
                const res = await axios.post('/admin/user', userFormData);
                setUsers([res.data.data, ...users]);
            }
            setShowUserModal(false);
        } catch (err) {
            alert('Error saving user: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // --- Appointment Actions ---
    const handleCancelApt = async (aptId) => {
        if (!window.confirm('Cancel this appointment?')) return;
        try {
            setActionLoading(aptId);
            await axios.put(`/admin/appointment/cancel/${aptId}`);
            setAppointments(appointments.map(a => a._id === aptId ? { ...a, status: 'cancelled' } : a));
        } catch (err) {
            alert('Error cancelling: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const openReschedule = (apt) => {
        setReschedulingApt(apt);
        setAptFormData({ 
            date: new Date(apt.date).toISOString().split('T')[0], 
            startTime: apt.timeSlot.startTime, 
            endTime: apt.timeSlot.endTime 
        });
        setShowAptModal(true);
    };

    const handleSaveReschedule = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = { 
                date: aptFormData.date, 
                timeSlot: { startTime: aptFormData.startTime, endTime: aptFormData.endTime } 
            };
            const res = await axios.put(`/admin/appointment/reschedule/${reschedulingApt._id}`, payload);
            setAppointments(appointments.map(a => a._id === reschedulingApt._id ? res.data.data : a));
            setShowAptModal(false);
        } catch (err) {
            alert('Error rescheduling: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
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
                        <div className="dashboard-card-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <h3>Total Patients</h3>
                        <p>Registered patients on the platform</p>
                        <span className="dashboard-card-stat">{stats?.users?.patients || patients.length} active</span>
                    </div>

                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon" style={{ background: '#dcfce7', color: '#166534' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                        </div>
                        <h3>Verified Doctors</h3>
                        <p>Doctors with confirmed credentials</p>
                        <span className="dashboard-card-stat">{stats?.users?.verifiedDoctors || 0} verified</span>
                    </div>

                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </div>
                        <h3>Appointments</h3>
                        <p>Total platform bookings processed</p>
                        <span className="dashboard-card-stat">{stats?.appointments?.total || appointments.length} total</span>
                    </div>

                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon" style={{ background: '#f5f3ff', color: '#5b21b6' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </div>
                        <h3>Revenue</h3>
                        <p>Total successful consultation fees</p>
                        <span className="dashboard-card-stat">${(stats?.financials?.totalRevenue || 0).toFixed(2)} USD</span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="dashboard-tabs" style={{ marginBottom: '24px', display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <button 
                        className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('overview')}
                        style={{ borderRadius: '20px', padding: '8px 20px' }}
                    >
                        📋 Management Overview
                    </button>
                    <button 
                        className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('analytics')}
                        style={{ borderRadius: '20px', padding: '8px 20px' }}
                    >
                        📊 Platform Analytics
                    </button>
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
                        {activeTab === 'overview' && (
                            <div className="scale-in">
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
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button 
                                                            className="btn-icon" 
                                                            title="Edit User"
                                                            onClick={() => openEditUser(item)}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            className="btn-icon btn-danger-icon" 
                                                            title="Delete User"
                                                            onClick={() => handleDeleteUser(item._id)}
                                                            disabled={actionLoading === item._id || item._id === user?._id}
                                                        >
                                                            {actionLoading === item._id ? <Loader size="sm" /> : '🗑️'}
                                                        </button>
                                                    </div>
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
                                            <th>Management</th>
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
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {['pending', 'accepted'].includes(apt.status) && (
                                                            <>
                                                                <button 
                                                                    className="btn btn-sm btn-outline" 
                                                                    style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                                    onClick={() => openReschedule(apt)}
                                                                >
                                                                    Reschedule
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-danger" 
                                                                    style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                                    onClick={() => handleCancelApt(apt._id)}
                                                                    disabled={actionLoading === apt._id}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
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
                    </div>
                )}



                        {activeTab === 'analytics' && (

                            <div className="scale-in">
                                <div className="dashboard-grid">
                                    {/* Appointment Trend Chart */}
                                    <div className="card" style={{ padding: '20px', gridColumn: 'span 2' }}>
                                        <h3 style={{ marginBottom: '20px' }}>📈 Appointment Volume (Last 7 Days)</h3>
                                        <div style={{ height: '300px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={analyticsData?.appointments?.daily || []}>
                                                    <defs>
                                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="_id" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Revenue Trend Chart */}
                                    <div className="card" style={{ padding: '20px', gridColumn: 'span 2' }}>
                                        <h3 style={{ marginBottom: '20px' }}>💰 Revenue Growth ($)</h3>
                                        <div style={{ height: '300px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={analyticsData?.revenue || []}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="_id" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="total" name="Revenue (USD)" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Specialty Distribution Pie Chart */}
                                    <div className="card" style={{ padding: '20px', gridColumn: 'span 2' }}>
                                        <h3 style={{ marginBottom: '20px' }}>🩺 Specialty Distribution</h3>
                                        <div style={{ height: '350px', display: 'flex', alignItems: 'center' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={analyticsData?.appointments?.specialty || []}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        paddingAngle={5}
                                                        dataKey="count"
                                                        nameKey="_id"
                                                        label
                                                    >
                                                        {(analyticsData?.appointments?.specialty || []).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    
                                    {/* System Metrics Table Summary */}
                                    <div className="card" style={{ padding: '20px', gridColumn: 'span 2' }}>
                                        <h3 style={{ marginBottom: '15px' }}>⚡ System Performance Overview</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                                            <div style={{ textAlign: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Avg. Appts / Day</p>
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                    {(analyticsData?.appointments?.daily?.reduce((acc, curr) => acc + curr.count, 0) / 7 || 0).toFixed(1)}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Top Specialty</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                    {analyticsData?.appointments?.specialty?.[0]?._id || 'N/A'}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Stripe Health</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>🟢 Active</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* MODAL: Add/Edit User */}
                {showUserModal && (
                    <div className="modal-overlay">
                        <div className="modal-card card scale-in" style={{ maxWidth: '500px', width: '90%' }}>
                            <div className="modal-header">
                                <h2>{editingUser ? 'Edit User Details' : 'Register New User'}</h2>
                                <button className="btn-close" onClick={() => setShowUserModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleSaveUser} className="modal-body">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="form-control"
                                        value={userFormData.name}
                                        onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input 
                                        type="email" 
                                        required 
                                        className="form-control"
                                        value={userFormData.email}
                                        onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                                    />
                                </div>
                                {!editingUser && (
                                    <div className="form-group">
                                        <label>Initial Password</label>
                                        <input 
                                            type="text" 
                                            placeholder="Leave blank for default 'Welcome123!'"
                                            className="form-control"
                                            value={userFormData.password}
                                            onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Role</label>
                                    <select 
                                        className="form-control"
                                        value={userFormData.role}
                                        onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                                    >
                                        <option value="patient">Patient</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowUserModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? <Loader size="sm" /> : (editingUser ? 'Update User' : 'Create User')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: Reschedule Appointment */}
                {showAptModal && (
                    <div className="modal-overlay">
                        <div className="modal-card card scale-in" style={{ maxWidth: '500px', width: '90%' }}>
                            <div className="modal-header">
                                <h2>Reschedule Appointment</h2>
                                <button className="btn-close" onClick={() => setShowAptModal(false)}>×</button>
                            </div>
                            {reschedulingApt && (
                                <form onSubmit={handleSaveReschedule} className="modal-body">
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                                        Changing date/time for <strong>{reschedulingApt.patientName}</strong> with <strong>Dr. {reschedulingApt.doctorName}</strong>.
                                    </p>
                                    <div className="form-group">
                                        <label>New Date</label>
                                        <input 
                                            type="date" 
                                            required 
                                            className="form-control"
                                            value={aptFormData.date}
                                            onChange={(e) => setAptFormData({...aptFormData, date: e.target.value})}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-group">
                                            <label>Start Time</label>
                                            <input 
                                                type="time" 
                                                required 
                                                className="form-control"
                                                value={aptFormData.startTime}
                                                onChange={(e) => setAptFormData({...aptFormData, startTime: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>End Time</label>
                                            <input 
                                                type="time" 
                                                required 
                                                className="form-control"
                                                value={aptFormData.endTime}
                                                onChange={(e) => setAptFormData({...aptFormData, endTime: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button type="button" className="btn btn-outline" onClick={() => setShowAptModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? <Loader size="sm" /> : 'Confirm Reschedule'}
                                        </button>
                                    </div>
                                </form>
                            )}

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};


export default AdminDashboard;
