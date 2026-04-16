import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './dashboards/DashboardStyles.css';

const PaymentPage = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Check for pre-filled data
    const prefillAppointmentId = searchParams.get('appointmentId');
    const prefillAmount = searchParams.get('amount');

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState(prefillAppointmentId ? 'new' : 'history');

    // Payment form state
    const [payForm, setPayForm] = useState({
        amount: prefillAmount || '',
        description: prefillAppointmentId ? 'Appointment Booking Fee' : '',
        appointmentId: prefillAppointmentId || '',
    });
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        fetchPayments();
        if (prefillAppointmentId) {
            setMessage({ type: 'success', text: 'Please complete the payment for your appointment.' });
        }
    }, [prefillAppointmentId]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await API.get('/payment/my-payments');
            if (res.data.success) {
                setPayments(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        if (!payForm.amount || parseFloat(payForm.amount) <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid amount' });
            return;
        }

        setPaying(true);
        try {
            const res = await API.post('/payment/create-payment', {
                amount: parseFloat(payForm.amount),
                description: payForm.description || 'Consultation payment',
                appointmentId: payForm.appointmentId || undefined,
            });

            if (res.data.success) {
                const intentId = res.data.data.stripePaymentIntentId;
                
                // Locally verify the payment immediately to simulate a completed card checkout
                await handleVerifyPayment(intentId);

                setMessage({ type: 'success', text: `Payment completed successfully!` });
                setPayForm({ amount: '', description: '', appointmentId: '' });
                fetchPayments();
                if (prefillAppointmentId) {
                    setTimeout(() => navigate('/dashboard'), 2000);
                } else {
                    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
                }
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Payment failed' });
        } finally {
            setPaying(false);
        }
    };

    const handleVerifyPayment = async (paymentIntentId) => {
        try {
            const res = await API.post('/payment/verify-payment', { paymentIntentId });
            if (res.data.success) {
                setMessage({ type: 'success', text: `Payment status: ${res.data.data.status}` });
                fetchPayments();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Verification failed' });
        }
    };

    const statusStyle = (status) => {
        const map = {
            completed: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
            pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
            failed: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
            refunded: { bg: 'rgba(99,102,241,0.15)', color: '#6366f1' },
            cancelled: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
        };
        return map[status] || map.pending;
    };

    if (loading) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loader" style={{
                        width: '48px', height: '48px', border: '4px solid var(--primary-subtle)',
                        borderBottomColor: 'var(--primary)', borderRadius: '50%',
                        display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: '16px',
                    }}></div>
                    <p>Loading payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page page" id="payment-page">
            <div className="container">
                {/* Header */}
                <div className="dashboard-banner">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1>💳 Payments</h1>
                            <p className="dashboard-subtitle">Manage your healthcare payments and billing</p>
                        </div>
                        <span className="badge badge-patient" style={{ textTransform: 'capitalize' }}>
                            {user?.role}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                    <button
                        className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('history')}
                    >Payment History</button>
                    <button
                        className={`btn btn-sm ${activeTab === 'new' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('new')}
                    >New Payment</button>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`} style={{ marginBottom: '24px' }}>
                        {message.type === 'error' ? '❌' : '✅'} {message.text}
                    </div>
                )}

                {/* Payment History */}
                {activeTab === 'history' && (
                    <div className="card">
                        <h2 style={{ marginBottom: '16px' }}>Payment History</h2>
                        {payments.length > 0 ? (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(p => {
                                            const st = statusStyle(p.status);
                                            return (
                                                <tr key={p._id}>
                                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                                    <td style={{ fontWeight: '500' }}>{p.description}</td>
                                                    <td style={{ fontWeight: '600' }}>
                                                        ${p.amount.toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.currency.toUpperCase()}</span>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem',
                                                            fontWeight: '600', background: st.bg, color: st.color, textTransform: 'capitalize',
                                                        }}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {p.status === 'pending' && p.stripePaymentIntentId && (
                                                            <button
                                                                className="btn btn-sm btn-outline"
                                                                style={{ padding: '3px 10px', fontSize: '0.7rem' }}
                                                                onClick={() => handleVerifyPayment(p.stripePaymentIntentId)}
                                                            >
                                                                🔄 Verify
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>No payments found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* New Payment */}
                {activeTab === 'new' && (
                    <div className="card scale-in" style={{ maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '20px' }}>Create Payment</h2>
                        <form onSubmit={handleCreatePayment}>
                            <div className="form-group">
                                <label>Amount (USD)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g. 50.00"
                                    value={payForm.amount}
                                    onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                                    min="1"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Consultation with Dr. Smith"
                                    value={payForm.description}
                                    onChange={(e) => setPayForm({ ...payForm, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Appointment ID (optional)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Link to an appointment"
                                    value={payForm.appointmentId}
                                    onChange={(e) => setPayForm({ ...payForm, appointmentId: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={paying}
                                style={{ marginTop: '16px' }}
                            >
                                {paying ? 'Processing...' : 'Pay Now'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="dashboard-grid" style={{ marginTop: '24px' }}>
                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <h3>Total Paid</h3>
                        <span className="dashboard-card-stat">
                            ${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                        </span>
                    </div>
                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        </div>
                        <h3>Pending</h3>
                        <span className="dashboard-card-stat">
                            {payments.filter(p => p.status === 'pending').length} payment(s)
                        </span>
                    </div>
                    <div className="dashboard-card card">
                        <div className="dashboard-card-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                        </div>
                        <h3>Total Transactions</h3>
                        <span className="dashboard-card-stat">
                            {payments.length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
