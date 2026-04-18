import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home, Layers, Calendar, AlertTriangle, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationPanel from './NotificationPanel';
import './AppLayout.css';

const AppLayout = () => {
    const { user, logout } = useAuth();

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="layout-container">
            <nav className="glass-panel sidebar">
                <div className="sidebar-header">
                    <h2>Campus<span style={{ color: 'var(--accent-blue)' }}>Hub</span></h2>
                    <p className="sidebar-subtitle">Operations Platform</p>
                </div>

                <div className="sidebar-links">
                    <NavLink to="/dashboard"  id="nav-dashboard"  className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Home size={18} /> Dashboard
                    </NavLink>
                    <NavLink to="/resources"  id="nav-resources"  className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Layers size={18} /> Resources
                    </NavLink>
                    <NavLink to="/bookings"   id="nav-bookings"   className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Calendar size={18} /> Bookings
                    </NavLink>
                    <NavLink to="/tickets"    id="nav-tickets"    className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                        <AlertTriangle size={18} /> Tickets
                    </NavLink>
                    {user?.role === 'ADMIN' && (
                        <NavLink to="/admin" id="nav-admin" className={({isActive}) => isActive ? 'nav-link active nav-link-admin' : 'nav-link nav-link-admin'}>
                            <Shield size={18} /> Admin
                        </NavLink>
                    )}
                </div>

                <div className="sidebar-footer">
                    {user && (
                        <Link to="/profile" className="sidebar-user" id="sidebar-user-link">
                            {user.picture
                                ? <img src={user.picture} alt={user.name} className="sidebar-avatar-img" />
                                : <div className="sidebar-avatar">{getInitials(user.name)}</div>
                            }
                            <div className="sidebar-user-info">
                                <span className="sidebar-user-name">{user.name || 'User'}</span>
                                <span className="sidebar-user-role">{user.role || 'USER'}</span>
                            </div>
                        </Link>
                    )}
                    <button id="logout-btn" className="btn-logout" onClick={logout}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            <main className="main-content">
                <header className="topbar">
                    <div className="topbar-title">
                        {/* Breadcrumb area — future enhancement */}
                    </div>
                    <div className="topbar-actions">
                        <NotificationPanel />
                        <Link to="/profile" id="topbar-profile-link" className="user-avatar" title="Profile">
                            {user?.picture
                                ? <img src={user.picture} alt={user?.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                : <User size={18} />
                            }
                        </Link>
                    </div>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
