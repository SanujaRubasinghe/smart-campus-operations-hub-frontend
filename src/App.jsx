import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Bookings from './pages/Bookings';


function App() {
    return (
        <Routes>
            <Route path="/bookings" element={<Bookings />} />
        </Routes>
    );
}

export default App;
