import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { useNavigate } from 'react-router-dom';
import './Bookings.css';

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const Toast = ({ msg, type, onDone }) => {
    useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
    return (
        <div className="toast-container">
            <div className={`toast ${type}`}>
                <CheckCircle size={16} /> {msg}
            </div>
        </div>
    );
};

const Bookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [tab, setTab]             = useState('ALL');
    const [cancelling, setCancelling] = useState(null);
    const [toast, setToast]         = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const userId = user?.id || 1;
            const status = tab === 'ALL' ? '' : tab;
            const data = await getMyBookings(userId, status);
            setBookings(data);
        } catch (_) {
            setBookings([]);
        } finally { setLoading(false); }
    }, [user, tab]);

    useEffect(() => { load(); }, [load]);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this booking?')) return;
        setCancelling(id);
        try {
            await cancelBooking(id);
            setToast({ msg: 'Booking cancelled.', type: 'info' });
            await load();
        } catch (e) {
            setToast({ msg: 'Failed to cancel booking.', type: 'error' });
        } finally { setCancelling(null); }
    };

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';
    const fmtTime = (t) => t ? t.slice(0, 5) : '—';

    return (
        <div className="bookings-page">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            <div className="page-header">
                <div>
                    <h1>My Bookings</h1>
                    <p className="subtitle">Manage your venue and equipment reservations</p>
                </div>
                <button id="request-booking-btn" className="btn-primary" onClick={() => navigate('/resources')}>
                    + New Booking
                </button>
            </div>

            {/* Status Tabs */}
            <div className="tab-bar">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        id={`booking-tab-${s.toLowerCase()}`}
                        className={`tab-btn ${tab === s ? 'active' : ''}`}
                        onClick={() => setTab(s)}
                    >
                        {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                ))}
                <button className="icon-btn" onClick={load} title="Refresh" style={{ marginLeft: 'auto' }}>
                    <RefreshCw size={14} />
                </button>
            </div>

            {loading ? (
                <div className="spinner-container"><div className="spinner" /></div>
            ) : bookings.length === 0 ? (
                <div className="empty-state card">
                    <CalendarIcon size={40} />
                    <h3>No bookings found</h3>
                    <p>Head over to Resources to book a facility or equipment.</p>
                    <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/resources')}>
                        Browse Resources
                    </button>
                </div>
            ) : (
                <div className="card bookings-table-wrap">
                    <table className="bookings-table" id="bookings-table">
                        <thead>
                            <tr>
                                <th>Resource</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Purpose</th>
                                <th>Attendees</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id} id={`booking-row-${b.id}`}>
                                    <td><strong>{b.resourceName || `#${b.id}`}</strong></td>
                                    <td>
                                        <span className="date-cell">
                                            <CalendarIcon size={13} />
                                            {fmt(b.bookingDate)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="date-cell">
                                            <Clock size={13} />
                                            {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
                                        </span>
                                    </td>
                                    <td className="purpose-cell" title={b.purpose}>{b.purpose || '—'}</td>
                                    <td>{b.expectedAttendees ?? '—'}</td>
                                    <td>
                                        <span className={`status-badge ${(b.status || '').toLowerCase()}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td>
                                        {b.status === 'PENDING' && (
                                            <button
                                                id={`cancel-booking-btn-${b.id}`}
                                                className="btn-danger"
                                                disabled={cancelling === b.id}
                                                onClick={() => handleCancel(b.id)}
                                            >
                                                {cancelling === b.id ? '…' : 'Cancel'}
                                            </button>
                                        )}
                                        {b.adminNote && (
                                            <span className="admin-note" title={b.adminNote}>
                                                <AlertCircle size={14} /> Note
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Bookings;
