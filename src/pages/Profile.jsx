import React from 'react';
import { User, Mail, Shield, Cpu, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="profile-info-row">
        <div className="profile-info-icon"><Icon size={16} /></div>
        <div>
            <span className="profile-info-label">{label}</span>
            <span className="profile-info-value">{value || '—'}</span>
        </div>
    </div>
);

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    return (
        <div className="profile-page">
            <div className="page-header">
                <div>
                    <h1>My Profile</h1>
                    <p className="subtitle">Your account information and preferences</p>
                </div>
            </div>

            <div className="profile-layout">
                {/* Avatar Card */}
                <div className="card profile-avatar-card">
                    <div className="profile-avatar-large" id="profile-avatar">
                        {user?.picture
                            ? <img src={user.picture} alt={user?.name} className="profile-avatar-img" />
                            : <span>{getInitials(user?.name)}</span>
                        }
                    </div>
                    <h2 className="profile-name">{user?.name || 'User'}</h2>
                    <p className="profile-email">{user?.email}</p>
                    <span className={`status-badge ${user?.role === 'ADMIN' ? 'approved' : 'open'}`} style={{ marginTop: '8px' }}>
                        {user?.role || 'USER'}
                    </span>

                    <div className="profile-actions">
                        <button id="profile-logout-btn" className="btn-danger" onClick={logout} style={{ width: '100%', justifyContent: 'center' }}>
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="card profile-info-card">
                    <h3 className="profile-section-title">Account Details</h3>

                    <div className="profile-info-list">
                        <InfoRow icon={User}     label="Full Name"     value={user?.name} />
                        <InfoRow icon={Mail}     label="Email"         value={user?.email} />
                        <InfoRow icon={Shield}   label="Role"          value={user?.role} />
                        {/*<InfoRow icon={Cpu}      label="Auth Provider" value={user?.provider} />*/}
                        <InfoRow icon={Calendar} label="Member Since"  value={joinedDate} />
                    </div>

                    <div className="profile-divider" />

                    <h3 className="profile-section-title">Quick Actions</h3>
                    <div className="profile-quick-actions">
                        <button id="goto-bookings-btn" className="btn-secondary" onClick={() => navigate('/bookings')}>
                            View My Bookings
                        </button>
                        <button id="goto-tickets-btn" className="btn-secondary" onClick={() => navigate('/tickets')}>
                            View My Tickets
                        </button>
                        <button id="goto-resources-btn" className="btn-primary" onClick={() => navigate('/resources')}>
                            Browse Resources
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
