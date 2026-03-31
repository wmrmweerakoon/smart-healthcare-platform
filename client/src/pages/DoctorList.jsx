import { useState, useEffect } from 'react';
import axios from '../api/axios';
import Loader from '../components/Loader';
import './Home.css'; // Reuse home styles for layout consistency

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // This will proxy to doctor-service (Member 3)
        // For now, if doctor-service is down, we can fallback or handle error
        const res = await axios.get('/doctor');
        setDoctors(res.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Unable to load doctors. The doctor service might be undergoing maintenance.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="home-page" style={{ paddingTop: '100px' }}>
      <div className="container">
        <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto 60px', textAlign: 'center' }}>
          <h1 className="hero-title">Meet Our <span>Specialists</span></h1>
          <p className="hero-subtitle">
            Find the right healthcare professional for your needs and book a consultation instantly.
          </p>
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
            <h3>No doctors found at the moment.</h3>
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
                <p style={{ color: 'var(--primary-light)', fontWeight: '600', marginBottom: '8px' }}>
                  {doctor.specialty || 'General Practitioner'}
                </p>
                <p className="feature-desc" style={{ marginBottom: '24px' }}>
                  {doctor.bio || 'Experienced healthcare professional dedicated to providing the best medical care.'}
                </p>
                <button className="btn btn-primary btn-block">Book Consultation</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
