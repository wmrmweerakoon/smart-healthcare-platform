import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import Loader from '../components/Loader';
import './Home.css';

const SPECIALTIES = [
  'All Specialties', 'General Practice', 'Cardiology', 'Dermatology', 'Endocrinology',
  'Gastroenterology', 'Neurology', 'Oncology', 'Ophthalmology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology',
  'Radiology', 'Surgery', 'Urology',
];

const DoctorList = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [searchName, setSearchName] = useState('');

  // Booking modal
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: '', startTime: '', endTime: '', type: 'in-person', reason: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, searchName]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSpecialty !== 'All Specialties') params.specialty = selectedSpecialty;
      if (searchName.trim()) params.name = searchName.trim();

      const res = await axios.get('/doctor/search', { params });
      setDoctors(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      // Fallback to /all if search fails
      try {
        const res = await axios.get('/doctor/all');
        setDoctors(res.data.data || []);
        setError(null);
      } catch {
        setError('Unable to load doctors. The doctor service might be undergoing maintenance.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openBooking = (doctor) => {
    if (!isAuthenticated) {
      return navigate('/login');
    }
    setSelectedDoctor(doctor);
    setBookingForm({ date: '', startTime: '', endTime: '', type: 'in-person', reason: '' });
    setBookingMessage({ type: '', text: '' });
    setShowBooking(true);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingMessage({ type: '', text: '' });

    try {
      await axios.post('/appointment/book', {
        doctorId: selectedDoctor.userId,
        doctorName: selectedDoctor.name,
        patientName: user?.name || '',
        date: bookingForm.date,
        timeSlot: {
          startTime: bookingForm.startTime,
          endTime: bookingForm.endTime,
        },
        type: bookingForm.type,
        reason: bookingForm.reason,
      });
      setBookingMessage({ type: 'success', text: 'Appointment booked successfully! The doctor will review your request.' });
      setTimeout(() => setShowBooking(false), 2500);
    } catch (err) {
      setBookingMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to book appointment. Please try again.',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="home-page" style={{ paddingTop: '100px' }}>
      <div className="container">
        <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto 40px', textAlign: 'center' }}>
          <h1 className="hero-title">Meet Our <span>Specialists</span></h1>
          <p className="hero-subtitle">
            Find the right healthcare professional for your needs and book a consultation instantly.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ maxWidth: '250px', padding: '10px 16px' }}
          />
          <select
            className="form-control"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            style={{ maxWidth: '220px', padding: '10px 16px' }}
          >
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <Loader size="lg" text="Finding doctors..." />
          </div>
        ) : error ? (
          <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>{error}</p>
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
            <h3>No doctors found{selectedSpecialty !== 'All Specialties' ? ` for "${selectedSpecialty}"` : ''}.</h3>
            <p>Please check back later as we onboard more medical professionals.</p>
          </div>
        ) : (
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {doctors.map((doctor) => (
              <div key={doctor._id} className="feature-card" style={{ padding: '32px' }}>
                <div className="feature-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-light)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                </div>
                <h3>Dr. {doctor.name}</h3>
                <p style={{ color: 'var(--primary-light)', fontWeight: '600', marginBottom: '4px' }}>
                  {doctor.specialty || 'General Practitioner'}
                </p>
                {doctor.experience && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {doctor.experience} years experience
                  </p>
                )}
                {doctor.consultationFee && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--emerald-light)', fontWeight: 600, marginBottom: '8px' }}>
                    LKR {doctor.consultationFee}
                  </p>
                )}
                <p className="feature-desc" style={{ marginBottom: '16px' }}>
                  {doctor.bio || 'Experienced healthcare professional dedicated to providing the best medical care.'}
                </p>
                {doctor.availability?.length > 0 && (
                  <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {[...new Set(doctor.availability.map(a => a.day))].map(day => (
                      <span key={day} style={{
                        padding: '2px 8px', borderRadius: '999px', fontSize: '0.68rem',
                        background: 'rgba(99,102,241,0.08)', color: 'var(--primary-light)', fontWeight: 600,
                      }}>{day.substring(0, 3)}</span>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary btn-block" onClick={() => openBooking(doctor)}>
                  Book Consultation
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && selectedDoctor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px',
          animation: 'fadeIn 0.3s ease',
        }} onClick={() => setShowBooking(false)}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', animation: 'scaleIn 0.3s ease', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.3rem' }}>Book Consultation</h2>
              <button onClick={() => setShowBooking(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                {selectedDoctor.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Dr. {selectedDoctor.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--primary-light)' }}>{selectedDoctor.specialty || 'General Practitioner'}</div>
              </div>
            </div>

            {bookingMessage.text && (
              <div className={`alert alert-${bookingMessage.type}`} style={{ marginBottom: '16px' }}>
                {bookingMessage.type === 'error' ? '❌' : '✅'} {bookingMessage.text}
              </div>
            )}

            <form onSubmit={handleBook}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date" className="form-control" required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time" className="form-control" required
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time" className="form-control" required
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Consultation Type</label>
                <select
                  className="form-control"
                  value={bookingForm.type}
                  onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                >
                  <option value="in-person">🏥 In-Person</option>
                  <option value="video">📹 Video Call</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reason for Visit</label>
                <textarea
                  className="form-control" rows="2"
                  placeholder="Briefly describe your symptoms or reason..."
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                ></textarea>
              </div>

              {selectedDoctor.availability?.length > 0 && (
                <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(99,102,241,0.06)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: '6px' }}>Doctor's Available Hours:</p>
                  {selectedDoctor.availability.map((slot, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {slot.day}: {slot.startTime} – {slot.endTime}
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={bookingLoading}>
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;
