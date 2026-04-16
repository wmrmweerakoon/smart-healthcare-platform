import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import './DashboardStyles.css';

const SPECIALTIES = [
  'General Practice', 'Cardiology', 'Dermatology', 'Endocrinology',
  'Gastroenterology', 'Neurology', 'Oncology', 'Ophthalmology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology',
  'Radiology', 'Surgery', 'Urology',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    phone: '', specialty: '', experience: '', bio: '', consultationFee: '',
    qualifications: '',
  });

  // Availability form
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', startTime: '09:00', endTime: '17:00' });

  // Prescription form
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '', appointmentId: '', diagnosis: '', notes: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, appointmentsRes, prescriptionsRes, patientsRes] = await Promise.all([
        API.get('/doctor/profile').catch(() => ({ data: { success: false } })),
        API.get('/appointment/my-appointments').catch(() => ({ data: { data: [] } })),
        API.get('/doctor/prescriptions').catch(() => ({ data: { data: [] } })),
        API.get('/doctor/patients').catch(() => ({ data: { data: [] } })),
      ]);


      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
        const p = profileRes.data.data;
        setProfileForm({
          phone: p.phone || '',
          specialty: p.specialty || '',
          experience: p.experience || '',
          bio: p.bio || '',
          consultationFee: p.consultationFee || '',
          qualifications: p.qualifications?.join(', ') || '',
        });
        setAvailabilitySlots(p.availability || []);
      }

      setAppointments(appointmentsRes.data.data || []);
      setPrescriptions(prescriptionsRes.data.data || []);
      setPatients(patientsRes.data.data || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // ─── Profile ────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const data = {
        ...profileForm,
        name: user?.name, // Sync name from user context
        experience: profileForm.experience ? Number(profileForm.experience) : undefined,
        consultationFee: profileForm.consultationFee ? Number(profileForm.consultationFee) : undefined,
        qualifications: profileForm.qualifications.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await API.put('/doctor/profile', data);
      setProfile(res.data.data);
      showMessage('success', 'Profile updated successfully!');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Availability ───────────────────────────────────
  const addSlot = () => {
    if (newSlot.startTime >= newSlot.endTime) {
      return showMessage('error', 'End time must be after start time');
    }
    setAvailabilitySlots([...availabilitySlots, { ...newSlot }]);
  };

  const removeSlot = (index) => {
    setAvailabilitySlots(availabilitySlots.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    if (availabilitySlots.length === 0) {
      return showMessage('error', 'Please add at least one time slot');
    }
    setActionLoading(true);
    try {
      await API.post('/doctor/availability', { availability: availabilitySlots });
      showMessage('success', 'Availability saved!');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to save availability');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Appointments ───────────────────────────────────
  const handleAppointmentAction = async (id, action) => {
    setActionLoading(true);
    try {
      await API.put(`/appointment/${action}/${id}`);
      showMessage('success', `Appointment ${action}ed`);
      fetchDashboardData();
    } catch (err) {
      showMessage('error', err.response?.data?.message || `Failed to ${action} appointment`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteAppointment = async (id) => {
    setActionLoading(true);
    try {
      await API.put(`/appointment/status/${id}`, { status: 'completed' });
      showMessage('success', 'Appointment marked as completed');
      fetchDashboardData();
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to complete appointment');
    } finally {
      setActionLoading(false);
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
      showMessage('error', err.response?.data?.message || 'Failed to start video call');
    }
  };

  // ─── Prescriptions ─────────────────────────────────
  const addMedication = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [...prescriptionForm.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    });
  };

  const removeMedication = (index) => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: prescriptionForm.medications.filter((_, i) => i !== index),
    });
  };

  const updateMedication = (index, field, value) => {
    const meds = [...prescriptionForm.medications];
    meds[index][field] = value;
    setPrescriptionForm({ ...prescriptionForm, medications: meds });
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post('/doctor/prescription', prescriptionForm);
      showMessage('success', 'Prescription issued successfully!');
      setPrescriptionForm({
        patientId: '', appointmentId: '', diagnosis: '', notes: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      });
      fetchDashboardData();
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to issue prescription');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Stats ──────────────────────────────────────────
  const todayAppointments = appointments.filter(a => {
    const today = new Date().toDateString();
    return new Date(a.date).toDateString() === today && a.status !== 'cancelled' && a.status !== 'rejected';
  });
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const uniquePatients = [...new Set(appointments.filter(a => a.status === 'completed').map(a => a.patientId))];

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b', accepted: '#10b981', rejected: '#ef4444',
      cancelled: '#6b7280', completed: '#6366f1',
    };
    return colors[status] || '#94a3b8';
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page page" id="doctor-dashboard">
      <div className="container">
        {/* Welcome Banner */}
        <div className="dashboard-banner" style={{background: 'linear-gradient(135deg, #0e4b6d 0%, #164e63 50%, var(--bg-tertiary) 100%)'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Welcome, Dr. {user?.name} 🩺</h1>
              <p className="dashboard-subtitle">Manage your practice, patients, and consultations</p>
            </div>
            <span className="badge badge-doctor">Doctor</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          {['overview', 'profile', 'availability', 'appointments', 'patients', 'prescriptions'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ textTransform: 'capitalize' }}
            >{tab}</button>
          ))}
        </div>


        {message.text && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '24px' }}>
            {message.type === 'error' ? '❌' : '✅'} {message.text}
          </div>
        )}

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card card" onClick={() => setActiveTab('appointments')}>
                <div className="dashboard-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h3>Today's Appointments</h3>
                <p>View and manage today's scheduled consultations</p>
                <span className="dashboard-card-stat">{todayAppointments.length} today</span>
              </div>

              <div className="dashboard-card card" onClick={() => setActiveTab('appointments')}>
                <div className="dashboard-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h3>Pending Requests</h3>
                <p>Appointment requests awaiting your response</p>
                <span className="dashboard-card-stat">{pendingAppointments.length} pending</span>
              </div>

              <div className="dashboard-card card" onClick={() => setActiveTab('prescriptions')}>
                <div className="dashboard-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3>Patients Seen</h3>
                <p>Unique patients from completed appointments</p>
                <span className="dashboard-card-stat">{uniquePatients.length} patients</span>
              </div>

              <div className="dashboard-card card" onClick={() => setActiveTab('availability')}>
                <div className="dashboard-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </div>
                <h3>Availability</h3>
                <p>Configure your weekly schedule</p>
                <span className="dashboard-card-stat">{availabilitySlots.length} slots</span>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="dashboard-section">
              <h2>Profile Summary</h2>
              <div className="card profile-summary">
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <span className="profile-label">Name</span>
                    <span className="profile-value">Dr. {user?.name}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-label">Specialty</span>
                    <span className="profile-value">{profile?.specialty || 'Not set'}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-label">Experience</span>
                    <span className="profile-value">{profile?.experience ? `${profile.experience} years` : 'Not set'}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-label">Fee</span>
                    <span className="profile-value">{profile?.consultationFee ? `LKR ${profile.consultationFee}` : 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ PROFILE ═══ */}
        {activeTab === 'profile' && (
          <div className="dashboard-section scale-in">
            <h2>Doctor Profile</h2>
            <div className="card">
              <form onSubmit={handleProfileSubmit}>
                <div className="profile-info-grid" style={{ marginBottom: '24px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" value={user?.name} disabled />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="text" className="form-control" value={user?.email} disabled />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text" className="form-control" placeholder="e.g. +94 77 123 4567"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialty</label>
                    <select
                      className="form-control" value={profileForm.specialty}
                      onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                    >
                      <option value="">Select Specialty</option>
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Experience (years)</label>
                    <input
                      type="number" className="form-control" min="0" max="70"
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Consultation Fee (LKR)</label>
                    <input
                      type="number" className="form-control" min="0"
                      value={profileForm.consultationFee}
                      onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Qualifications (comma separated)</label>
                  <textarea
                    className="form-control" rows="2"
                    placeholder="e.g. MBBS, MD Cardiology, MRCP"
                    value={profileForm.qualifications}
                    onChange={(e) => setProfileForm({ ...profileForm, qualifications: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    className="form-control" rows="4"
                    placeholder="Write a brief professional bio..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={actionLoading} style={{ marginTop: '8px' }}>
                  {actionLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══ AVAILABILITY ═══ */}
        {activeTab === 'availability' && (
          <div className="dashboard-section scale-in">
            <h2>Weekly Availability</h2>
            <div className="card">
              <div className="availability-form" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: '1 1 140px' }}>
                  <label>Day</label>
                  <select className="form-control" value={newSlot.day} onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0, flex: '1 1 120px' }}>
                  <label>Start Time</label>
                  <input type="time" className="form-control" value={newSlot.startTime} onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0, flex: '1 1 120px' }}>
                  <label>End Time</label>
                  <input type="time" className="form-control" value={newSlot.endTime} onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })} />
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addSlot} style={{ height: '44px' }}>
                  + Add Slot
                </button>
              </div>

              {availabilitySlots.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availabilitySlots.map((slot, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{slot.day}</td>
                          <td>{slot.startTime}</td>
                          <td>{slot.endTime}</td>
                          <td>
                            <button className="btn-icon btn-danger-icon" title="Remove" onClick={() => removeSlot(i)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  <p>No availability slots configured. Add your weekly schedule above.</p>
                </div>
              )}

              <button className="btn btn-primary" onClick={saveAvailability} disabled={actionLoading} style={{ marginTop: '20px' }}>
                {actionLoading ? 'Saving...' : 'Save Availability'}
              </button>
            </div>
          </div>
        )}

        {/* ═══ APPOINTMENTS ═══ */}
        {activeTab === 'appointments' && (
          <div className="dashboard-section scale-in">
            <h2>Appointments</h2>
            <div className="card">
              {appointments.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(apt => (
                        <tr key={apt._id}>
                          <td>{new Date(apt.date).toLocaleDateString()}</td>
                          <td>{apt.timeSlot?.startTime} – {apt.timeSlot?.endTime}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{apt.patientName || 'Patient'}</div>
                            {apt.reason && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.reason}</div>}
                          </td>
                          <td>
                            <span className="badge" style={{ background: apt.type === 'video' ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)', color: apt.type === 'video' ? '#818cf8' : '#34d399', border: 'none' }}>
                              {apt.type === 'video' ? '📹 Video' : '🏥 In-Person'}
                            </span>
                          </td>
                          <td>
                            <span className="status-badge" style={{ background: `${getStatusColor(apt.status)}20`, color: getStatusColor(apt.status) }}>
                              {apt.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {apt.status === 'pending' && (
                                <>
                                  <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'none', padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => handleAppointmentAction(apt._id, 'accept')} disabled={actionLoading}>Accept</button>
                                  <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'none', padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => handleAppointmentAction(apt._id, 'reject')} disabled={actionLoading}>Reject</button>
                                </>
                              )}
                              {apt.status === 'accepted' && (
                                <>
                                  {apt.type === 'video' && (
                                    <button className="btn btn-sm btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => startVideoCall(apt)}>
                                      📹 Start Call
                                    </button>
                                  )}
                                  <button className="btn btn-sm" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'none', padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => handleCompleteAppointment(apt._id)} disabled={actionLoading}>Complete</button>
                                  <button className="btn btn-sm" style={{ background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: 'none', padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => handleAppointmentAction(apt._id, 'cancel')} disabled={actionLoading}>Cancel</button>
                                </>
                              )}
                              {apt.status === 'completed' && (
                                <button className="btn btn-sm" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'none', padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => { setPrescriptionForm({ ...prescriptionForm, patientId: apt.patientId, appointmentId: apt._id }); setActiveTab('prescriptions'); }}>
                                  Write Rx
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <p>No appointments yet. Patients will book consultations with you once your profile and availability are set up.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ PATIENTS ═══ */}
        {activeTab === 'patients' && (
          <div className="dashboard-section scale-in">
            <h2>My Patients</h2>
            <div className="card">
              {patients.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Patient ID</th>
                        <th>Last Appointment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map(p => (
                        <tr key={p.patientId}>
                          <td style={{ fontWeight: 600 }}>{p.patientName || 'Unknown Patient'}</td>
                          <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{p.patientId}</td>
                          <td>{p.lastAppointment ? new Date(p.lastAppointment).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-sm btn-outline" onClick={() => { setPrescriptionForm({ ...prescriptionForm, patientId: p.patientId }); setActiveTab('prescriptions'); }}>
                                Issue Rx
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <p>No patients have booked appointments with you yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ PRESCRIPTIONS ═══ */}

        {activeTab === 'prescriptions' && (
          <div className="dashboard-section scale-in">
            <h2>Prescriptions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
              {/* List */}
              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Issued Prescriptions</h3>
                {prescriptions.length > 0 ? (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Patient ID</th>
                          <th>Diagnosis</th>
                          <th>Medications</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptions.map(pres => (
                          <tr key={pres._id}>
                            <td>{new Date(pres.date || pres.createdAt).toLocaleDateString()}</td>
                            <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{pres.patientId?.substring(0, 8)}...</td>
                            <td><span style={{ fontWeight: 600 }}>{pres.diagnosis}</span></td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {pres.medications?.map((m, i) => (
                                  <span key={i} style={{ fontSize: '0.78rem' }}>• {m.name} ({m.dosage})</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    <p>No prescriptions issued yet.</p>
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Issue New Prescription</h3>
                <form onSubmit={handlePrescriptionSubmit}>
                  <div className="form-group">
                    <label>Patient ID</label>
                    <input
                      type="text" className="form-control" required
                      placeholder="Enter patient user ID"
                      value={prescriptionForm.patientId}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Appointment ID (optional)</label>
                    <input
                      type="text" className="form-control"
                      placeholder="Link to appointment"
                      value={prescriptionForm.appointmentId}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, appointmentId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Diagnosis</label>
                    <input
                      type="text" className="form-control" required
                      placeholder="e.g. Upper Respiratory Infection"
                      value={prescriptionForm.diagnosis}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Medications</label>
                      <button type="button" className="btn btn-sm btn-outline" onClick={addMedication} style={{ padding: '4px 10px', fontSize: '0.7rem' }}>+ Add</button>
                    </div>
                    {prescriptionForm.medications.map((med, i) => (
                      <div key={i} style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '8px', position: 'relative' }}>
                        {prescriptionForm.medications.length > 1 && (
                          <button type="button" onClick={() => removeMedication(i)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <input className="form-control" placeholder="Name" required value={med.name} onChange={(e) => updateMedication(i, 'name', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                          <input className="form-control" placeholder="Dosage" required value={med.dosage} onChange={(e) => updateMedication(i, 'dosage', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                          <input className="form-control" placeholder="Frequency" required value={med.frequency} onChange={(e) => updateMedication(i, 'frequency', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                          <input className="form-control" placeholder="Duration" value={med.duration} onChange={(e) => updateMedication(i, 'duration', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                        </div>
                        <input className="form-control" placeholder="Instructions (optional)" value={med.instructions} onChange={(e) => updateMedication(i, 'instructions', e.target.value)} style={{ marginTop: '8px', padding: '8px 12px', fontSize: '0.85rem' }} />
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      className="form-control" rows="2" placeholder="Optional notes..."
                      value={prescriptionForm.notes}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={actionLoading}>
                    {actionLoading ? 'Issuing...' : 'Issue Prescription'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .loader-container { text-align: center; }
        .loader {
          width: 48px; height: 48px;
          border: 4px solid var(--primary-subtle);
          border-bottom-color: var(--primary);
          border-radius: 50%;
          display: inline-block;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @media (max-width: 992px) {
          .dashboard-section > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
};

export default DoctorDashboard;
