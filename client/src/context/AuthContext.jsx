import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user on mount if token exists
    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    // Load current user from token
    const loadUser = async () => {
        try {
            const res = await API.get('/auth/me');
            setUser(res.data.data);
            setError(null);
        } catch (err) {
            console.error('Failed to load user:', err);
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    // Register
    const register = async (userData) => {
        try {
            setError(null);
            const res = await API.post('/auth/register', userData);
            const { token: newToken, data } = res.data;

            setToken(newToken);
            setUser(data);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(data));

            return { success: true };
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.msg ||
                'Registration failed';
            setError(message);
            return { success: false, message };
        }
    };

    // Login
    const login = async (credentials) => {
        try {
            setError(null);
            const res = await API.post('/auth/login', credentials);
            const { token: newToken, data } = res.data;

            setToken(newToken);
            setUser(data);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(data));

            return { success: true };
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.msg ||
                'Login failed';
            setError(message);
            return { success: false, message };
        }
    };

    // Logout
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    // Clear error
    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                isAuthenticated: !!user,
                register,
                login,
                logout,
                clearError,
                loadUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
