import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Dashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            switch (user.role) {
                case 'patient':
                    navigate('/patient', { replace: true });
                    break;
                case 'doctor':
                    navigate('/doctor', { replace: true });
                    break;
                case 'admin':
                    navigate('/admin', { replace: true });
                    break;
                default:
                    navigate('/patient', { replace: true });
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader size="lg" text="Redirecting to your dashboard..." />
        </div>
    );
};

export default Dashboard;
