import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './dashboards/DashboardStyles.css';

const VideoCall = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinSession = async () => {
      try {
        const res = await API.get(`/video/join-session/${roomId}`);
        setSession(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to join video session');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      joinSession();
    }
  }, [roomId]);

  const handleEndCall = async () => {
    try {
      await API.put(`/video/end-session/${roomId}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to end session:', err);
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Connecting to video session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '12px' }}>Unable to Join</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: session?.status === 'active' ? '#10b981' : '#f59e0b',
            animation: 'pulse 2s infinite',
          }}></div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {session?.status === 'active' ? '🔴 Live Session' : '⏳ Waiting...'}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Room: {roomId?.substring(0, 20)}...
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="badge badge-doctor" style={{ fontSize: '0.7rem' }}>
            {user?.role === 'doctor' ? 'Doctor' : 'Patient'}
          </span>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleEndCall}
            style={{ padding: '8px 20px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
              <line x1="23" y1="1" x2="1" y2="23"/>
            </svg>
            End Call
          </button>
        </div>
      </div>

      {/* Jitsi iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        {session?.jitsiUrl && (
          <iframe
            src={`${session.jitsiUrl}#userInfo.displayName="${encodeURIComponent(user?.name || 'User')}"`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            title="Video Consultation"
          ></iframe>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .loader {
          width: 48px; height: 48px;
          border: 4px solid var(--primary-subtle);
          border-bottom-color: var(--primary);
          border-radius: 50%;
          display: inline-block;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
      `}} />
    </div>
  );
};

export default VideoCall;
