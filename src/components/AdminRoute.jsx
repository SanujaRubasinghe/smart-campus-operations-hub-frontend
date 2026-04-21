import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: 'var(--bg-secondary)', flexDirection: 'column', gap: 16
            }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!user) return <Navigate to="/admin/login" replace />;

    if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

    return children;
};

export default AdminRoute;
