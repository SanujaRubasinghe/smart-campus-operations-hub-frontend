import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Landing page for OAuth2 redirects.
 * The backend redirects here with ?token=<jwt>.
 * We save it and navigate to the dashboard.
 */
const OAuthRedirect = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            // Clean the token from the URL immediately
            window.history.replaceState({}, document.title, '/oauth2/redirect');
            // Navigate to dashboard — AuthContext will validate the token
            navigate('/dashboard', { replace: true });
        } else {
            // No token — something went wrong
            navigate('/login?error=oauth_failed', { replace: true });
        }
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: 16,
            background: 'var(--bg-secondary)',
        }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Signing you in…</p>
        </div>
    );
};

export default OAuthRedirect;
