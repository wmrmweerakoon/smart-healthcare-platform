import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import './DashboardStyles.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: 'O+',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    allergies: '',
    chronicConditions: ''
  });

  // Report Upload State
  const [reportForm, setReportForm] = useState({
    title: '',
    description: ''
  });
  const fileInputRef = useRef(null);
  const [isRescheduling, setIsRescheduling] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', startTime: '', endTime: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for better performance
      const [profileRes, reportsRes, prescriptionsRes, appointmentsRes] = await Promise.all([
        API.get('/patient/profile').catch(() => ({ data: { success: false } })),
        API.get('/patient/reports').catch(() => ({ data: { data: [] } })),
        API.get('/doctor/my-prescriptions').catch(() => ({ data: { data: [] } })),
        API.get('/appointment/my-appointments').catch(() => ({ data: { data: [] } }))
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
        const p = profileRes.data.data;
        setProfileForm({
          phone: p.phone || '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
          gender: p.gender || 'male',
          bloodGroup: p.bloodGroup || 'O+',
          address: p.address || { street: '', city: '', state: '', zipCode: '', country: '' },
          emergencyContact: p.emergencyContact || { name: '', relationship: '', phone: '' },
          allergies: p.allergies?.join(', ') || '',
          chronicConditions: p.chronicConditions?.join(', ') || ''
        });
      }

      setReports(reportsRes.data.data || []);
      setPrescriptions(prescriptionsRes.data.data || []);
      setAppointments(appointmentsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const formattedData = {
        ...profileForm,
        allergies: profileForm.allergies.split(',').map(s => s.trim()).filter(s => s),
        chronicConditions: profileForm.chronicConditions.split(',').map(s => s.trim()).filter(s => s)
      };

      const res = await API.put('/patient/profile', formattedData);
      setProfile(res.data.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    if (!fileInputRef.current.files[0]) {
      return setMessage({ type: 'error', text: 'Please select a file' });
    }

    setActionLoading(true);
    const formData = new FormData();
    formData.append('report', fileInputRef.current.files[0]);
    formData.append('title', reportForm.title);
    formData.append('description', reportForm.description);

    try {
      await API.post('/patient/upload-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Report uploaded successfully!' });
      setReportForm({ title: '', description: '' });
      fileInputRef.current.value = '';
      fetchDashboardData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await API.delete(`/patient/reports/${id}`);
      setReports(reports.filter(r => r._id !== id));
      setMessage({ type: 'success', text: 'Report deleted' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete report' });
    }
  };

  const viewReport = async (report) => {
    try {
      const res = await API.get(`/patient${report.fileUrl}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: report.fileType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to view report' });
    }
  };

  const startVideoCall = async (appointment) => {
    try {
      const res = await API.post('/video/create-session', {
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
      });
      const session = res.data.data;
      window.open(`/video/${session.roomId}`, '_blank');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to start video call' });
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await API.put(`/appointment/cancel/${id}`);
      setAppointments(appointments.map(apt => apt._id === id ? { ...apt, status: 'cancelled' } : apt));
      setMessage({ type: 'success', text: 'Appointment cancelled successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to cancel appointment' });
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await API.put(`/appointment/${isRescheduling._id}`, {
        date: rescheduleForm.date,
        timeSlot: {
          startTime: rescheduleForm.startTime,
          endTime: rescheduleForm.endTime || rescheduleForm.startTime // Default if end time not provided
        }
      });
      
      setAppointments(appointments.map(apt => apt._id === isRescheduling._id ? res.data.data : apt));
      setMessage({ type: 'success', text: 'Appointment rescheduled successfully!' });
      setIsRescheduling(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Rescheduling failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading your health records...</p>
        </div>
      </div>
    );
  }

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

        {/* Navigation Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >Overview</button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >My Profile</button>
          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >Appointments</button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >Medical Reports</button>
          <button
            className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('prescriptions')}
          >Prescriptions</button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '24px' }}>
            {message.type === 'error' ? '❌' : '✅'} {message.text}
          </div>
        )}

        {/* Tab Content: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card card" onClick={() => setActiveTab('reports')}>
                <div className="dashboard-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                </div>
                <h3>Medical Records</h3>
                <p>Access your uploaded medical reports and history</p>
                <span className="dashboard-card-stat">{reports.length} Reports</span>
              </div>

              <div className="dashboard-card card" onClick={() => setActiveTab('appointments')}>
                <div className="dashboard-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h3>Appointments</h3>
                <p>Track your consultation requests and visit history</p>
                <span className="dashboard-card-stat">{appointments.length} Appointments</span>
              </div>

              <div className="dashboard-card card" onClick={() => setActiveTab('profile')}>
                <div className="dashboard-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <h3>My Profile</h3>
                <p>Keep your medical information and contact details updated</p>
                <span className="dashboard-card-stat">{profile ? 'Completed' : 'Incomplete'}</span>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Profile Summary</h2>
              <div className="card profile-summary">
                {profile ? (
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <span className="profile-label">Blood Group</span>
                      <span className="profile-value">{profile.bloodGroup}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-label">Gender</span>
                      <span className="profile-value" style={{ textTransform: 'capitalize' }}>{profile.gender}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-label">Phone</span>
                      <span className="profile-value">{profile.phone || 'Not provided'}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-label">Allergies</span>
                      <span className="profile-value">{profile.allergies?.join(', ') || 'None reported'}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>You haven't completed your medical profile yet.</p>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('profile')}>Complete Profile</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tab Content: PROFILE */}
        {activeTab === 'profile' && (
          <div className="dashboard-section scale-in">
            <h2>Medical Profile</h2>
            <div className="card">
              <form onSubmit={handleProfileSubmit}>
                <div className="profile-info-grid" style={{ marginBottom: '24px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" value={user?.name} disabled />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="text" className="form-control" value={user?.email} disabled />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. +94 77 123 4567"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      className="form-control"
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Blood Group</label>
                    <select
                      className="form-control"
                      value={profileForm.bloodGroup}
                      onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="form-group">
                  <label>Allergies (comma separated)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Penicillin, Peanuts, Pollen"
                    value={profileForm.allergies}
                    onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Chronic Conditions (comma separated)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Diabetes, Hypertension, Asthma"
                    value={profileForm.chronicConditions}
                    onChange={(e) => setProfileForm({ ...profileForm, chronicConditions: e.target.value })}
                  ></textarea>
                </div>

                <div className="divider"></div>

                <h3>Emergency Contact</h3>
                <div className="profile-info-grid" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label>Contact Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.emergencyContact.name}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        emergencyContact: { ...profileForm.emergencyContact, name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Relationship</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.emergencyContact.relationship}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        emergencyContact: { ...profileForm.emergencyContact, relationship: e.target.value }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Emergency Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.emergencyContact.phone}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        emergencyContact: { ...profileForm.emergencyContact, phone: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{ marginTop: '24px' }}
                >
                  {actionLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab Content: REPORTS */}
        {activeTab === 'reports' && (
          <div className="dashboard-section scale-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Medical Reports</h2>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px' }}>
              {/* Report List */}
              <div className="card">
                {reports.length > 0 ? (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map(report => (
                          <tr key={report._id}>
                            <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div style={{ fontWeight: '500' }}>{report.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.description}</div>
                            </td>
                            <td><span className="badge badge-secondary">{report.fileType.split('/')[1].toUpperCase()}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => viewReport(report)}
                                  className="btn-icon"
                                  title="View File"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                </button>
                                <button
                                  onClick={() => deleteReport(report._id)}
                                  className="btn-icon btn-danger-icon"
                                  title="Delete"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No reports uploaded yet.</p>
                  </div>
                )}
              </div>

              {/* Upload Form */}
              <div className="card">
                <h3>Upload New Report</h3>
                <form onSubmit={handleReportUpload} style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label>Report Title</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Lab Results"
                      value={reportForm.title}
                      onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      placeholder="Optional details..."
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Select File (PDF/Image)</label>
                    <input
                      type="file"
                      className="form-control"
                      ref={fileInputRef}
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Uploading...' : 'Upload Report'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="dashboard-section scale-in">
            <h2>Track Appointments</h2>
            
            {isRescheduling && (
              <div className="card scale-in" style={{ marginBottom: '20px', border: '1px solid #3b82f6', background: '#eff6ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e40af' }}>🔄 Reschedule Appointment</h3>
                  <button className="btn-icon" onClick={() => setIsRescheduling(null)}>✕</button>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '15px' }}>
                  Modifying appointment with <strong>Dr. {isRescheduling.doctorName}</strong>
                </p>
                <form onSubmit={handleReschedule} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', color: '#1e40af' }}>New Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      required 
                      value={rescheduleForm.date}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', color: '#1e40af' }}>New Start Time</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      required 
                      value={rescheduleForm.startTime}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem', color: '#1e40af' }}>New End Time</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      required 
                      value={rescheduleForm.endTime}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, endTime: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>
                      {actionLoading ? 'Updating...' : 'Confirm Change'}
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsRescheduling(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="card">

              {appointments.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Doctor</th>
                        <th>Specialty</th>
                        <th>Status</th>
                        <th>Management Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {appointments.map(apt => (
                        <tr key={apt._id}>
                          <td>{new Date(apt.date).toLocaleDateString()}</td>
                          <td>{apt.timeSlot?.startTime} - {apt.timeSlot?.endTime}</td>
                          <td style={{ fontWeight: 600 }}>Dr. {apt.doctorName || apt.doctorId}</td>
                          <td>{apt.specialty || 'Checkup'}</td>
                          <td>
                            <span className="status-badge" style={{ 
                              background: apt.status === 'accepted' ? 'rgba(16,185,129,0.15)' : 
                                         apt.status === 'pending' ? 'rgba(245,158,11,0.15)' : 
                                         'rgba(239,68,68,0.15)',
                              color: apt.status === 'accepted' ? '#10b981' : 
                                     apt.status === 'pending' ? '#f59e0b' : 
                                     '#ef4444',
                              display: 'inline-block',
                              minWidth: '85px',
                              textAlign: 'center'
                            }}>
                              {apt.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap' }}>
                              {/* Payment Action */}
                              {apt.paymentStatus === 'paid' ? (
                                <span className="status-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid currentColor', fontSize: '0.65rem', padding: '2px 6px' }}>Paid</span>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline"
                                  style={{ padding: '4px 10px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                                  onClick={() => window.location.href = `/payments?appointmentId=${apt._id}&amount=20`}
                                >💳 Pay Now</button>
                              )}

                              {/* Telemedicine Action */}
                              {apt.status === 'accepted' && apt.type === 'video' && (
                                <button 
                                  className="btn btn-sm btn-primary" 
                                  style={{ padding: '4px 10px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                                  onClick={() => startVideoCall(apt)}
                                >
                                  📹 Join Call
                                </button>
                              )}

                              {/* Modification Action */}
                              {(apt.status === 'pending' || apt.status === 'accepted') && (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    style={{ padding: '4px 10px', fontSize: '0.7rem', color: '#1e40af', borderColor: '#1e40af', whiteSpace: 'nowrap' }}
                                    onClick={() => {
                                      setIsRescheduling(apt);
                                      setRescheduleForm({
                                        date: apt.date.split('T')[0],
                                        startTime: apt.timeSlot?.startTime || '',
                                        endTime: apt.timeSlot?.endTime || ''
                                      });
                                    }}
                                  >
                                    🕒 Modify
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline btn-danger-icon"
                                    style={{ padding: '4px 10px', fontSize: '0.7rem', color: '#ef4444', borderColor: '#ef4444', whiteSpace: 'nowrap' }}
                                    onClick={() => cancelAppointment(apt._id)}
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>No appointments found. Book one from the "Find Doctors" page!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="dashboard-section scale-in">
            <h2>My Prescriptions</h2>
            <div className="card">
              {prescriptions.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Diagnosis</th>
                        <th>Doctor</th>
                        <th>Medications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map(pres => (
                        <tr key={pres._id}>
                          <td>{new Date(pres.date || pres.createdAt).toLocaleDateString()}</td>
                          <td><span style={{ fontWeight: '600' }}>{pres.diagnosis}</span></td>
                          <td>Dr. {pres.doctorName || 'Available soon'}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {pres.medications?.map((m, i) => (
                                <div key={i} style={{ fontSize: '0.8rem' }}>
                                  • {m.name} ({m.dosage})
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>You don't have any prescriptions yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .loader-container { text-align: center; }
        .loader {
          width: 48px;
          height: 48px;
          border: 4px solid var(--primary-subtle);
          border-bottom-color: var(--primary);
          border-radius: 50%;
          display: inline-block;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @media (max-width: 992px) {
          .grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
};

export default PatientDashboard;
