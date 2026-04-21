import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
    const { user, loading, setUser } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode]             = useState('login'); // 'login' | 'register'
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [name, setName]             = useState('');
    const [error, setError]           = useState('');
    const [success, setSuccess]       = useState('');
    const [submitting, setSubmitting] = useState(false);

    // If already logged in as admin, go to admin panel
    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'ADMIN') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0f14' }}>
                <div className="admin-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            if (mode === 'login') {
                const res = await api.post('/api/admin/auth/login', { email, password });
                const token = res.data.token;
                localStorage.setItem('token', token);
                window.location.href = '/admin';
            } else {
                await api.post('/api/admin/auth/register', { name, email, password });
                setSuccess('Admin registration request submitted! Please wait for an existing administrator to approve your account.');
                setMode('login');
                setPassword('');
                setName('');
            }
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                (mode === 'login' ? 'Invalid email or password.' : 'Registration failed.');
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">

                {/* Brand */}
                <div className="admin-login-brand">
                    <div className="admin-login-brand-icon">
                        {/* Shield icon */}
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                                fill="#0d0f14"
                                stroke="#0d0f14"
                                strokeWidth="0.5"
                            />
                            <path
                                d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                                fill="url(#shieldGrad)"
                            />
                            <path
                                d="M9 12L11 14L15 10"
                                stroke="#0d0f14"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <defs>
                                <linearGradient id="shieldGrad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#c9a227" />
                                    <stop offset="1" stopColor="#f0d060" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1>Campus<span>Hub</span></h1>
                    <p>Smart Operations Platform</p>
                    <span className="admin-badge">
                        {/* Lock icon */}
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 1C9.24 1 7 3.24 7 6v2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z"/>
                        </svg>
                        Administrator Portal
                    </span>
                </div>

                <div className="admin-login-divider" />

                <div className="admin-login-body">
                    {/* Mode toggle */}
                    <div className="admin-tab-bar">
                        <button
                            id="admin-tab-login"
                            className={`admin-tab ${mode === 'login' ? 'active' : ''}`}
                            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                        >
                            Sign In
                        </button>
                        <button
                            id="admin-tab-register"
                            className={`admin-tab ${mode === 'register' ? 'active' : ''}`}
                            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                        >
                            Register Admin
                        </button>
                    </div>

                    {/* Form */}
                    <form id="admin-auth-form" onSubmit={handleSubmit} className="admin-login-form">
                        {mode === 'register' && (
                            <div className="admin-form-group">
                                <label htmlFor="admin-name">Full Name</label>
                                <input
                                    id="admin-name"
                                    type="text"
                                    className="admin-form-control"
                                    placeholder="Administrator name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="admin-form-group">
                            <label htmlFor="admin-email">Email Address</label>
                            <input
                                id="admin-email"
                                type="email"
                                className="admin-form-control"
                                placeholder="admin@campus.edu"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="admin-form-group">
                            <label htmlFor="admin-password">Password</label>
                            <input
                                id="admin-password"
                                type="password"
                                className="admin-form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {error   && <div className="admin-login-error">{error}</div>}
                        {success && <div className="admin-login-success">{success}</div>}

                        <button
                            id="admin-submit-btn"
                            type="submit"
                            className="admin-submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="admin-spinner" />
                                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                                </>
                            ) : (
                                mode === 'login' ? 'Sign In as Admin' : 'Create Admin Account'
                            )}
                        </button>
                    </form>

                    <Link to="/login" className="admin-client-link">
                        ← Back to Client Login
                    </Link>
                </div>

                <div className="admin-login-divider" />

                <div className="admin-login-footer">
                    <p>Smart Campus Operations Hub &copy; {new Date().getFullYear()} — Admin Portal</p>
                </div>
            </div>

            {/* Background decoration */}
            <div className="admin-login-bg" aria-hidden="true">
                <div className="admin-blob admin-blob-1" />
                <div className="admin-blob admin-blob-2" />
            </div>
        </div>
    );
};

export default AdminLogin;
