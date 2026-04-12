import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DoctorList from './pages/DoctorList';
import VideoCall from './pages/VideoCall';

const App = () => {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <Loader size="lg" text="Loading HealthCare+..." />
            </div>
        );
    }

    return (
        <div className="app">
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/doctors" element={<DoctorList />} />

                {/* Protected: Dashboard Redirector */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Protected: Patient Dashboard */}
                <Route
                    path="/patient"
                    element={
                        <ProtectedRoute roles={['patient']}>
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Protected: Doctor Dashboard */}
                <Route
                    path="/doctor"
                    element={
                        <ProtectedRoute roles={['doctor']}>
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Protected: Admin Dashboard */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute roles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Protected: Video Call */}
                <Route
                    path="/video/:roomId"
                    element={
                        <ProtectedRoute>
                            <VideoCall />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

export default App;
