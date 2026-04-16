import { useState, useEffect } from 'react';
import API from '../api/axios';
import './dashboards/DashboardStyles.css';

const SymptomChecker = () => {
    const [supportedSymptoms, setSupportedSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchSupportedSymptoms();
    }, []);

    const fetchSupportedSymptoms = async () => {
        try {
            const res = await API.get('/ai/symptoms');
            if (res.data.success) {
                setSupportedSymptoms(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load symptoms list');
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await API.get('/ai/history');
            if (res.data.success) {
                setHistory(res.data.data);
                setShowHistory(true);
            }
        } catch (err) {
            console.error('Failed to load history');
        }
    };

    const toggleSymptom = (symptom) => {
        setSelectedSymptoms(prev =>
            prev.includes(symptom)
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (selectedSymptoms.length === 0) {
            setError('Please select at least one symptom');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await API.post('/ai/analyze-symptoms', {
                symptoms: selectedSymptoms,
                age: age ? parseInt(age) : null,
                gender: gender || null,
            });
            if (res.data.success) {
                setResult(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedSymptoms([]);
        setAge('');
        setGender('');
        setResult(null);
        setError('');
        setSearchTerm('');
    };

    const filteredSymptoms = supportedSymptoms.filter(s =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const severityColor = (severity) => {
        switch (severity) {
            case 'high': return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
            case 'medium': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
            case 'low': return { bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
            default: return { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' };
        }
    };

    return (
        <div className="dashboard-page page" id="symptom-checker">
            <div className="container">
                {/* Header */}
                <div className="dashboard-banner">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1>🤖 AI Symptom Checker</h1>
                            <p className="dashboard-subtitle">
                                Select your symptoms below and let our AI suggest possible conditions and the right specialist for you.
                            </p>
                        </div>
                        <button className="btn btn-sm btn-outline" onClick={fetchHistory}>
                            📋 History
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                        ❌ {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '24px' }}>
                    {/* Symptom Selection */}
                    <div className="card">
                        <h2 style={{ marginBottom: '16px' }}>Select Your Symptoms</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Age (optional)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g. 30"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    min="1"
                                    max="120"
                                />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Gender (optional)</label>
                                <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Search Symptoms</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Type to filter symptoms..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Selected symptoms */}
                        {selectedSymptoms.length > 0 && (
                            <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {selectedSymptoms.map(s => (
                                    <span
                                        key={s}
                                        onClick={() => toggleSymptom(s)}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {s} ✕
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Symptom pills */}
                        <div style={{
                            maxHeight: '240px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            padding: '4px',
                        }}>
                            {filteredSymptoms.map(symptom => (
                                <button
                                    key={symptom}
                                    type="button"
                                    onClick={() => toggleSymptom(symptom)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        border: selectedSymptoms.includes(symptom) ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: selectedSymptoms.includes(symptom) ? 'var(--primary-subtle)' : 'var(--bg-secondary)',
                                        color: selectedSymptoms.includes(symptom) ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        fontWeight: selectedSymptoms.includes(symptom) ? '600' : '400',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {symptom}
                                </button>
                            ))}
                            
                            {/* Custom Symptom Button */}
                            {searchTerm && !supportedSymptoms.some(s => s.toLowerCase() === searchTerm.toLowerCase()) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!selectedSymptoms.includes(searchTerm.toLowerCase())) {
                                            setSelectedSymptoms([...selectedSymptoms, searchTerm.toLowerCase()]);
                                            setSearchTerm('');
                                        }
                                    }}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        border: '1px dashed var(--primary)',
                                        background: 'rgba(102,126,234,0.1)',
                                        color: 'var(--primary)',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✨ Add custom: "{searchTerm}"
                                </button>
                            )}
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleAnalyze}
                                disabled={loading || selectedSymptoms.length === 0}
                            >
                                {loading ? 'Analyzing...' : `Analyze ${selectedSymptoms.length} Symptom(s)`}
                            </button>
                            <button className="btn btn-outline" onClick={resetForm}>
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* RESULT */}
                    {result && (
                        <div className="card scale-in">
                            <h2 style={{ marginBottom: '8px' }}>🩺 Analysis Results</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                                Based on: {result.symptoms.join(', ')}
                            </p>

                            {/* Suggested Specialty */}
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
                                marginBottom: '20px',
                                textAlign: 'center',
                            }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                    Recommended Specialist
                                </p>
                                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                                    {result.suggestedSpecialty}
                                </p>
                            </div>

                            {/* Recommendation */}
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                background: 'var(--bg-secondary)',
                                marginBottom: '20px',
                                borderLeft: '4px solid var(--primary)',
                            }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{result.recommendation}</p>
                            </div>

                            {/* Conditions List */}
                            <h3 style={{ marginBottom: '12px' }}>Possible Conditions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {result.possibleConditions.map((cond, i) => {
                                    const colors = severityColor(cond.severity);
                                    return (
                                        <div key={i} style={{
                                            padding: '14px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-secondary)',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{cond.condition}</span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600',
                                                        background: colors.bg, color: colors.color,
                                                    }}>
                                                        {cond.severity.toUpperCase()}
                                                    </span>
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem',
                                                        background: 'rgba(107,114,128,0.15)', color: '#6b7280',
                                                    }}>
                                                        {cond.probability}
                                                    </span>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{cond.description}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Disclaimer */}
                            <div style={{
                                marginTop: '20px', padding: '12px', borderRadius: '8px',
                                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                            }}>
                                <p style={{ fontSize: '0.75rem', color: '#b45309', margin: 0 }}>
                                    ⚠️ {result.disclaimer}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* History Modal */}
                {showHistory && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    }} onClick={() => setShowHistory(false)}>
                        <div className="card scale-in" style={{
                            maxWidth: '700px', width: '90%', maxHeight: '80vh', overflow: 'auto',
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2>Analysis History</h2>
                                <button className="btn btn-sm btn-outline" onClick={() => setShowHistory(false)}>Close</button>
                            </div>
                            {history.length > 0 ? history.map((h) => (
                                <div key={h._id} style={{
                                    padding: '14px', borderRadius: '8px', border: '1px solid var(--border)',
                                    marginBottom: '12px', background: 'var(--bg-secondary)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: '600' }}>
                                            {h.symptoms.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(h.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                        → {h.result?.suggestedSpecialty || 'N/A'}
                                    </p>
                                </div>
                            )) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                                    No analysis history found.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SymptomChecker;
