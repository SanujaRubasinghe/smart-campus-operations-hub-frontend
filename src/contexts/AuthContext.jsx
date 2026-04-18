import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            getCurrentUser()
                .then(userData => {
                    setUser(userData);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load user', err);
                    localStorage.removeItem('token');
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
