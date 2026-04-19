import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';

import Login        from './pages/Login';
import OAuthRedirect from './pages/OAuthRedirect';
import Dashboard    from './pages/Dashboard';
import Resources from './pages/Resources';
import Bookings  from './pages/Bookings';
import Tickets   from './pages/Tickets';
import Profile   from './pages/Profile';
import Admin     from './pages/Admin';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login"          element={<Login />} />
                    <Route path="/oauth2/redirect" element={<OAuthRedirect />} />

                    {/* Protected — inside AppLayout shell */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index               element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard"    element={<Dashboard />} />
                        <Route path="resources"    element={<Resources />} />
                        <Route path="bookings"     element={<Bookings />} />
                        <Route path="tickets"      element={<Tickets />} />
                        <Route path="profile"      element={<Profile />} />
                        <Route path="admin"        element={<AdminRoute><Admin /></AdminRoute>} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
