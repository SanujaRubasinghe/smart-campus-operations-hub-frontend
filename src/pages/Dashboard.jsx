import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Layers, Calendar, AlertTriangle, Bell,
    ArrowRight, TrendingUp, CheckCircle, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getResources } from '../services/resourceService';
import { getMyBookings } from '../services/bookingService';
import { getAllTickets } from '../services/ticketService';
import { getUnreadCount } from '../services/notificationService';
import './Dashboard.css';

const StatCard = ({ icon: Icon, label, value, color, trend, to }) => (
    <Link to={to} className="stat-card card" id={`stat-card-${label.toLowerCase().replace(/\s+/g,'-')}`}>
        <div className="stat-icon" style={{ background: color + '18', color }}>
            <Icon size={22} />
        </div>
        <div className="stat-info">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value ?? '—'}</span>
            {trend && <span className="stat-trend">{trend}</span>}
        </div>
        <ArrowRight size={16} className="stat-arrow" />
    </Link>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        resources: null,
        bookings: null,
        tickets: null,
        notifications: null,
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [recentTickets, setRecentTickets]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [resourcesRes, bookingsRes, ticketsRes, notifCount] = await Promise.allSettled([
                    getResources({ size: 1 }),
                    getMyBookings(user?.id || 1),
                    getAllTickets(),
                    getUnreadCount(),
                ]);

                const resourceTotal = resourcesRes.status === 'fulfilled'
                    ? (resourcesRes.value?.totalElements ?? resourcesRes.value?.content?.length ?? 0)
                    : '?';

                const bookings = bookingsRes.status === 'fulfilled' ? (bookingsRes.value || []) : [];
                const tickets  = ticketsRes.status  === 'fulfilled' ? (ticketsRes.value  || []) : [];
                const notifs   = notifCount.status  === 'fulfilled' ? notifCount.value : 0;

                setStats({
                    resources:     resourceTotal,
                    bookings:      bookings.filter(b => b.status === 'PENDING' || b.status === 'APPROVED').length,
                    tickets:       tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
                    notifications: notifs,
                });
                setRecentBookings(bookings.slice(0, 3));
                setRecentTickets(tickets.slice(0, 3));
            } catch (_) {}
            finally { setLoading(false); }
        };
        load();
    }, [user]);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

    return (
        <div className="dashboard-page">
            {/* Hero Greeting */}
            <div className="dashboard-greeting">
                <div>
                    <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
                    <p className="subtitle">Here's what's happening on campus today.</p>
                </div>
                <div className="dashboard-quick-actions">
                    <Link to="/resources" id="quick-action-book" className="btn-primary">Book a Resource</Link>
                    <Link to="/tickets"   id="quick-action-ticket" className="btn-secondary">Report Issue</Link>
                </div>
            </div>

            {/* Stat Cards */}
            {loading ? (
                <div className="spinner-container"><div className="spinner" /></div>
            ) : (
                <div className="stats-grid">
                    <StatCard icon={Layers}        label="Total Resources"  value={stats.resources}    color="var(--accent-blue)"   to="/resources" />
                    <StatCard icon={Calendar}       label="Active Bookings"  value={stats.bookings}     color="var(--accent-green)"  to="/bookings"  />
                    <StatCard icon={AlertTriangle}  label="Open Tickets"     value={stats.tickets}      color="var(--accent-orange)" to="/tickets"   />
                    <StatCard icon={Bell}           label="Unread Notifs"    value={stats.notifications} color="var(--accent-purple)" to="/dashboard" />
                </div>
            )}

            {/* Recent Activity */}
            <div className="dashboard-panels">
                {/* Recent Bookings */}
                <div className="card dashboard-panel">
                    <div className="panel-header">
                        <h3><Calendar size={16} /> Recent Bookings</h3>
                        <Link to="/bookings" className="btn-ghost" id="view-all-bookings-link">View all</Link>
                    </div>
                    {recentBookings.length === 0 ? (
                        <div className="empty-state" style={{ padding: '20px' }}>
                            <Clock size={28} />
                            <p>No recent bookings</p>
                        </div>
                    ) : (
                        <div className="panel-list">
                            {recentBookings.map(b => (
                                <div className="panel-item" key={b.id}>
                                    <div className="panel-item-info">
                                        <strong>{b.resourceName || `Booking #${b.id}`}</strong>
                                        <span>{formatDate(b.bookingDate || b.createdAt)}</span>
                                    </div>
                                    <span className={`status-badge ${(b.status || '').toLowerCase()}`}>
                                        {b.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Tickets */}
                <div className="card dashboard-panel">
                    <div className="panel-header">
                        <h3><AlertTriangle size={16} /> Recent Tickets</h3>
                        <Link to="/tickets" className="btn-ghost" id="view-all-tickets-link">View all</Link>
                    </div>
                    {recentTickets.length === 0 ? (
                        <div className="empty-state" style={{ padding: '20px' }}>
                            <CheckCircle size={28} />
                            <p>No open tickets</p>
                        </div>
                    ) : (
                        <div className="panel-list">
                            {recentTickets.map(t => (
                                <div className="panel-item" key={t.id}>
                                    <div className="panel-item-info">
                                        <strong>{(t.category || '').replace(/_/g, ' ')}</strong>
                                        <span>{t.location}</span>
                                    </div>
                                    <span className={`priority-badge ${(t.priority || '').toLowerCase()}`}>
                                        {t.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
