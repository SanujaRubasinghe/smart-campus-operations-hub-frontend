import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markAsRead } from '../services/notificationService';
import './NotificationPanel.css';


const NotificationPanel = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);
    const navigate = useNavigate();


    const fetchUnread = async () => {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch (_) {}
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { notifications: data } = await getNotifications();
            setNotifications(data);
        } catch (_) {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (open) fetchNotifications();
    }, [open]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (_) {}
    };

    const handleNotifClick = async (n) => {
        // Mark as read
        if (!n.read) {
            try {
                await markAsRead(n.id);
                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (_) {}
        }
        // Navigate to source
        if (n.link) {
            setOpen(false);
            navigate(n.link);
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const diff = (Date.now() - d.getTime()) / 1000;
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="notif-wrapper" ref={panelRef}>
            <button
                id="notification-bell-btn"
                className="icon-btn notif-trigger"
                onClick={() => setOpen(o => !o)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {open && (
                <div className="notif-panel">
                    <div className="notif-panel-header">
                        <h3>Notifications</h3>
                        <button className="icon-btn" onClick={() => setOpen(false)}><X size={18} /></button>
                    </div>

                    <div className="notif-list">
                        {loading && (
                            <div className="spinner-container"><div className="spinner" /></div>
                        )}
                        {!loading && notifications.length === 0 && (
                            <div className="empty-state" style={{ padding: '32px' }}>
                                <Inbox size={36} />
                                <h3>All caught up!</h3>
                                <p>No notifications yet.</p>
                            </div>
                        )}
                        {!loading && notifications.map(n => (
                            <div
                                key={n.id}
                                className={`notif-item ${!n.read ? 'unread' : ''} ${n.link ? 'clickable' : ''}`}
                                onClick={() => handleNotifClick(n)}
                            >
                                <div className="notif-item-content">
                                    {n.title && <p className="notif-title">{n.title}</p>}
                                    <p className="notif-message">{n.message || n.content || 'New notification'}</p>
                                    <span className="notif-time">{formatTime(n.createdAt)}</span>
                                </div>
                                {!n.read && (
                                    <button
                                        className="icon-btn notif-read-btn"
                                        onClick={e => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                                        title="Mark as read"
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
