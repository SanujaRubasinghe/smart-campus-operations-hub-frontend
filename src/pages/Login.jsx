import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { triggerGoogleLogin, triggerGithubLogin } from '../services/authService';
import api from '../services/api';
import './Login.css';

const Login = () => {
    const { user, loading, setUser } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode]       = useState('login'); // 'login' | 'register'
    const [email, setEmail]     = useState('');
    const [password, setPassword] = useState('');
    const [name, setName]       = useState('');
    const [error, setError]     = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!loading && user) navigate('/dashboard', { replace: true });
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-secondary)' }}>
                <div className="spinner" />
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
                const res = await api.post('/api/auth/login', { email, password });
                const token = res.data.token;
                localStorage.setItem('token', token);
                // Reload to trigger AuthContext validation
                window.location.href = '/dashboard';
            } else {
                await api.post('/api/auth/register', { name, email, password });
                setSuccess('Account created! You can now sign in.');
                setMode('login');
                setPassword('');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || (mode === 'login' ? 'Invalid email or password.' : 'Registration failed.');
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card card">
                {/* Brand */}
                <div className="login-brand">
                    <div className="login-brand-icon">C</div>
                    <h1>Campus<span style={{ color: 'var(--accent-blue)' }}>Hub</span></h1>
                    <p>Smart Operations Platform</p>
                </div>

                <div className="login-divider" />

                <div className="login-body">
                    {/* Mode toggle */}
                    <div className="login-tab-bar">
                        <button
                            id="tab-login"
                            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
                            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                        >
                            Sign In
                        </button>
                        <button
                            id="tab-register"
                            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
                            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                        >
                            Register
                        </button>
                    </div>

                    {/* Email/password form */}
                    <form id="auth-form" onSubmit={handleSubmit} className="login-form">
                        {mode === 'register' && (
                            <div className="form-group">
                                <label htmlFor="login-name">Full Name</label>
                                <input
                                    id="login-name"
                                    type="text"
                                    className="form-control"
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                className="form-control"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {error   && <div className="login-error">{error}</div>}
                        {success && <div className="login-success">{success}</div>}

                        <button
                            id="auth-submit-btn"
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {submitting
                                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                                : mode === 'login' ? 'Sign In' : 'Create Account'
                            }
                        </button>
                    </form>

                    {/* OAuth divider */}
                    <div className="provider-divider"><span>or continue with</span></div>

                    <div className="login-providers">
                        <button id="google-login-btn" className="provider-btn" onClick={triggerGoogleLogin}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google
                        </button>
                        <button id="github-login-btn" className="provider-btn provider-btn-github" onClick={triggerGithubLogin}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                            </svg>
                            GitHub
                        </button>
                    </div>
                </div>

                <div className="login-footer">
                    <p>Smart Campus Operations Hub &copy; {new Date().getFullYear()}</p>
                    <a href="/admin/login" style={{ fontSize: 11, color: 'var(--text-tertiary)', textDecoration: 'none', marginTop: 4, display: 'inline-block', transition: 'color 0.18s' }}
                       onMouseEnter={e => e.target.style.color = 'var(--accent-blue)'}
                       onMouseLeave={e => e.target.style.color = 'var(--text-tertiary)'}
                    >
                        Administrator? Sign in here →
                    </a>
                </div>
            </div>

            <div className="login-bg-decoration" aria-hidden="true">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
            </div>
        </div>
    );
};

export default Login;
