import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import OAuthRedirect from './pages/OAuthRedirect';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Bookings from './pages/Bookings';
import Tickets from './pages/Tickets';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import QRCheckIn from './pages/QRCheckIn';

function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/oauth2/redirect" element={<OAuthRedirect />} />

            {/* Authenticated */}
            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/checkin" element={<QRCheckIn />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <Admin />
                        </AdminRoute>
                    }
                />
            </Route>

            {/* Fallbacks */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default App;
