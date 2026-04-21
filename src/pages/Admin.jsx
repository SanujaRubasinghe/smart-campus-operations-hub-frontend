import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle, XCircle, UserCheck, RefreshCw, Shield, ShieldCheck,
    Calendar, AlertTriangle, Send, Plus, Pencil, Trash2, Package, X, MessageCircle,
    Monitor, Cpu, DoorOpen, Projector, Users, MapPin
} from 'lucide-react';


import {
    getAllTicketsAdmin, updateTicketStatus, assignTechnician,
    getAllResourcesAdmin, createResource, updateResource, deleteResource,
    getPendingAdmins, approveAdmin, rejectAdmin
} from '../services/adminService';
import { addComment } from '../services/ticketService';

import ResourceFormModal from '../components/ResourceFormModal';
import './Admin.css';

const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

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

// ─── Booking Row ─────────────────────────────────────────────────
const BookingRow = ({ booking, onApprove, onReject, loading }) => {
    const [note, setNote] = useState('');
    const [showNote, setShowNote] = useState(false);

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const fmtTime = (t) => t ? t.slice(0, 5) : '—';

    return (
        <div className="admin-booking-row card" id={`admin-booking-${booking.id}`}>
            <div className="abr-main">
                <div className="abr-info">
                    <strong className="abr-resource">{booking.resourceName || `Booking #${booking.id}`}</strong>
                    <span className="abr-meta">
                        {booking.bookedByFullName || booking.bookedByUsername || 'User'} &bull;{' '}
                        {fmtDate(booking.bookingDate)} &bull; {fmtTime(booking.startTime)}–{fmtTime(booking.endTime)}
                    </span>
                    {booking.purpose && <span className="abr-purpose">"{booking.purpose}"</span>}
                </div>
                <div className="abr-right">
                    <span className={`status-badge ${(booking.status || '').toLowerCase()}`}>{booking.status}</span>
                    {booking.status === 'PENDING' && (
                        <div className="abr-actions">
                            <button
                                id={`approve-booking-${booking.id}`}
                                className="btn-approve"
                                disabled={loading === booking.id}
                                onClick={() => onApprove(booking.id, note)}
                                title="Approve"
                            >
                                <CheckCircle size={15} /> Approve
                            </button>
                            <button
                                id={`reject-booking-${booking.id}`}
                                className="btn-reject"
                                disabled={loading === booking.id}
                                onClick={() => setShowNote(s => !s)}
                                title="Reject"
                            >
                                <XCircle size={15} /> Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject note expansion */}
            {showNote && booking.status === 'PENDING' && (
                <div className="abr-note-row">
                    <input
                        id={`reject-note-${booking.id}`}
                        className="form-control"
                        type="text"
                        placeholder="Reason for rejection (optional)…"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                    />
                    <button
                        id={`confirm-reject-${booking.id}`}
                        className="btn-reject"
                        disabled={loading === booking.id}
                        onClick={() => { onReject(booking.id, note); setShowNote(false); }}
                    >
                        Confirm Reject
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Ticket Row ──────────────────────────────────────────────────
const TicketRow = ({ ticket, onStatusChange, onAssign, onLightbox, onRefresh, loading }) => {
    const [tech, setTech]             = useState(ticket.assignedTechnicianName || '');
    const [showAssign, setShowAssign] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [replyText, setReplyText]   = useState('');
    const [sending, setSending]       = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [statusNotes, setStatusNotes]     = useState('');

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setSending(true);
        try {
            await addComment(ticket.id, replyText.trim(), 'Admin');
            setReplyText('');
            if (onRefresh) onRefresh();
        } catch (_) { /* silently ignore */ }
        finally { setSending(false); }
    };

    const handleStatusSelect = (newStatus) => {
        if (newStatus === 'RESOLVED' || newStatus === 'REJECTED') {
            setPendingStatus(newStatus);
            setStatusNotes('');
        } else {
            onStatusChange(ticket.id, newStatus, null, null);
        }
    };

    const confirmStatusChange = () => {
        if (!statusNotes.trim()) return;
        if (pendingStatus === 'RESOLVED') {
            onStatusChange(ticket.id, pendingStatus, statusNotes.trim(), null);
        } else {
            onStatusChange(ticket.id, pendingStatus, null, statusNotes.trim());
        }
        setPendingStatus(null);
        setStatusNotes('');
    };

    return (
        <div className="admin-ticket-row card" id={`admin-ticket-${ticket.id}`}>
            <div className="atr-main">
                <div className="atr-info">
                    <div className="atr-header">
                        <span className="ticket-id">#{ticket.id}</span>
                        <span className={`priority-badge ${(ticket.priority || '').toLowerCase()}`}>{ticket.priority}</span>
                    </div>
                    <strong>{(ticket.category || '').replace(/_/g, ' ')}</strong>
                    <span className="atr-meta">{ticket.location}</span>
                    {ticket.description && (
                        <span className="atr-meta" style={{ fontStyle: 'italic', marginTop: 2 }}>{ticket.description}</span>
                    )}
                    {ticket.assignedTechnicianName && (
                        <span className="chip" style={{ marginTop: 4 }}>🔧 {ticket.assignedTechnicianName}</span>
                    )}

                    {/* Attachment thumbnails */}
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="ticket-attachments">
                            {ticket.attachments.map(att => (
                                <button
                                    key={att.id}
                                    className="ticket-att-thumb"
                                    onClick={() => onLightbox(att.filePath)}
                                    title={att.fileName}
                                >
                                    <img src={att.filePath} alt={att.fileName} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="atr-right">
                    <span className={`status-badge ${(ticket.status || '').toLowerCase()}`}>
                        {(ticket.status || '').replace(/_/g, ' ')}
                    </span>
                    <div className="atr-actions">
                        {/* Status dropdown */}
                        <select
                            id={`ticket-status-select-${ticket.id}`}
                            className="form-control admin-select"
                            value={pendingStatus || ticket.status}
                            disabled={loading === ticket.id}
                            onChange={e => handleStatusSelect(e.target.value)}
                        >
                            {TICKET_STATUSES.map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        {/* Assign technician button */}
                        <button
                            id={`assign-tech-btn-${ticket.id}`}
                            className="btn-assign"
                            onClick={() => setShowAssign(s => !s)}
                            title="Assign Technician"
                        >
                            <UserCheck size={14} /> Assign
                        </button>
                        {/* Comments toggle */}
                        <button
                            id={`admin-comments-btn-${ticket.id}`}
                            className="btn-assign"
                            onClick={() => setShowComments(s => !s)}
                            title="Comments"
                            style={{ position: 'relative' }}
                        >
                            <MessageCircle size={14} />
                            {ticket.comments?.length > 0 && (
                                <span style={{
                                    position: 'absolute', top: -5, right: -5,
                                    background: 'var(--accent-blue)', color: 'white',
                                    borderRadius: '50%', width: 16, height: 16,
                                    fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>{ticket.comments.length}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Resolution / Rejection notes prompt */}
            {pendingStatus && (
                <div className="abr-note-row">
                    <textarea
                        className="form-control"
                        rows={2}
                        placeholder={pendingStatus === 'RESOLVED'
                            ? 'Resolution notes (required)…'
                            : 'Rejection reason (required)…'}
                        value={statusNotes}
                        onChange={e => setStatusNotes(e.target.value)}
                        style={{ resize: 'vertical', fontSize: 13 }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <button
                            className="btn-approve"
                            onClick={confirmStatusChange}
                            disabled={!statusNotes.trim()}
                        >
                            Confirm {pendingStatus === 'RESOLVED' ? 'Resolution' : 'Rejection'}
                        </button>
                        <button className="btn-assign" onClick={() => { setPendingStatus(null); setStatusNotes(''); }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showAssign && (
                <div className="atr-assign-row">
                    <input
                        id={`tech-name-input-${ticket.id}`}
                        className="form-control"
                        type="text"
                        placeholder="Technician name…"
                        value={tech}
                        onChange={e => setTech(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { onAssign(ticket.id, tech); setShowAssign(false); } }}
                    />
                    <button
                        id={`confirm-assign-${ticket.id}`}
                        className="btn-assign"
                        disabled={!tech.trim() || loading === ticket.id}
                        onClick={() => { onAssign(ticket.id, tech); setShowAssign(false); }}
                    >
                        <Send size={13} /> Confirm
                    </button>
                </div>
            )}

            {/* Comments Panel */}
            {showComments && (
                <div className="atr-comments">
                    <div className="atr-comments-list">
                        {(!ticket.comments || ticket.comments.length === 0) ? (
                            <p className="no-comments">No comments yet.</p>
                        ) : (
                            ticket.comments.map(c => (
                                <div className="comment-item" key={c.id}>
                                    <div className="comment-author">{c.commenterName || 'User'}</div>
                                    <div className="comment-text">{c.commentText}</div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="atr-reply-row">
                        <input
                            id={`admin-reply-input-${ticket.id}`}
                            type="text"
                            className="form-control"
                            placeholder="Reply as Admin…"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
                        />
                        <button
                            id={`admin-reply-send-${ticket.id}`}
                            className="btn-assign"
                            disabled={sending || !replyText.trim()}
                            onClick={handleReply}
                        >
                            <Send size={13} /> {sending ? '…' : 'Reply'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Admin Request Row ───────────────────────────────────────────
const AdminRequestRow = ({ request, onApprove, onReject, loading }) => {
    return (
        <div className="admin-booking-row card" id={`admin-request-${request.id}`}>
            <div className="abr-main">
                <div className="abr-info">
                    <strong className="abr-resource">{request.name}</strong>
                    <span className="abr-meta">
                        {request.email} &bull; Joined: {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="abr-right">
                    <div className="abr-actions">
                        <button
                            id={`approve-admin-${request.id}`}
                            className="btn-approve"
                            disabled={loading === request.id}
                            onClick={() => onApprove(request.id)}
                            title="Approve"
                        >
                            <UserCheck size={15} /> Approve
                        </button>
                        <button
                            id={`reject-admin-${request.id}`}
                            className="btn-reject"
                            disabled={loading === request.id}
                            onClick={() => onReject(request.id)}
                            title="Reject"
                        >
                            <XCircle size={15} /> Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// ─── Resource Icon Helper ─────────────────────────────────────────
const ResourceIcon = ({ type, size = 32 }) => {
    switch (type) {
        case 'LAB':          return <Cpu size={size} />;
        case 'MEETING_ROOM': return <DoorOpen size={size} />;
        case 'LECTURE_HALL': return <Monitor size={size} />;
        case 'EQUIPMENT':    return <Projector size={size} />;
        default:             return <Package size={size} />;
    }
};


// ─── Admin Page ──────────────────────────────────────────────────
const Admin = () => {
    const [tab, setTab]               = useState('bookings');
    const [bookings, setBookings]     = useState([]);
    const [tickets, setTickets]       = useState([]);
    const [resources, setResources]   = useState([]);
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [loadingB, setLoadingB]     = useState(true);
    const [loadingT, setLoadingT]     = useState(true);
    const [loadingR, setLoadingR]     = useState(false);
    const [loadingPA, setLoadingPA]   = useState(true);
    const [actionId, setActionId]     = useState(null);
    const [toast, setToast]           = useState(null);
    const [bookingFilter, setBookingFilter] = useState('PENDING');
    const [lightboxUrl, setLightboxUrl]     = useState(null);

    // Resource modal state
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [editingResource, setEditingResource]     = useState(null);
    const [deleteConfirm, setDeleteConfirm]         = useState(null); // resource id

    const loadBookings = useCallback(async () => {
        setLoadingB(true);
        try {
            const filters = bookingFilter !== 'ALL' ? { status: bookingFilter } : {};
            const data = await getAllBookingsAdmin(filters);
            setBookings(data);
        } catch (_) { setBookings([]); }
        finally { setLoadingB(false); }
    }, [bookingFilter]);

    const loadTickets = useCallback(async () => {
        setLoadingT(true);
        try { setTickets(await getAllTicketsAdmin()); }
        catch (_) { setTickets([]); }
        finally { setLoadingT(false); }
    }, []);

    const loadResources = useCallback(async () => {
        setLoadingR(true);
        try { setResources(await getAllResourcesAdmin()); }
        catch (_) { setResources([]); }
        finally { setLoadingR(false); }
    }, []);

    const loadPendingAdmins = useCallback(async () => {
        setLoadingPA(true);
        try { setPendingAdmins(await getPendingAdmins()); }
        catch (_) { setPendingAdmins([]); }
        finally { setLoadingPA(false); }
    }, []);

    useEffect(() => { loadBookings(); }, [loadBookings]);
    useEffect(() => { loadTickets();  }, [loadTickets]);
    useEffect(() => { loadResources(); }, [loadResources]);
    useEffect(() => { loadPendingAdmins(); }, [loadPendingAdmins]);

    // Booking actions
    const handleApprove = async (id, note) => {
        setActionId(id);
        try {
            await approveBooking(id, note);
            setToast({ msg: 'Booking approved!', type: 'success' });
            await loadBookings();
        } catch (_) { setToast({ msg: 'Failed to approve.', type: 'error' }); }
        finally { setActionId(null); }
    };

    const handleReject = async (id, reason) => {
        setActionId(id);
        try {
            await rejectBooking(id, reason);
            setToast({ msg: 'Booking rejected.', type: 'info' });
            await loadBookings();
        } catch (_) { setToast({ msg: 'Failed to reject.', type: 'error' }); }
        finally { setActionId(null); }
    };

    // Ticket actions
    const handleStatusChange = async (id, status, resolutionNotes = null, rejectionReason = null) => {
        setActionId(id);
        try {
            await updateTicketStatus(id, status, resolutionNotes, rejectionReason);
            setToast({ msg: `Ticket status → ${status.replace(/_/g,' ')}`, type: 'success' });
            await loadTickets();
        } catch (_) { setToast({ msg: 'Status update failed.', type: 'error' }); }
        finally { setActionId(null); }
    };

    const handleAssign = async (id, name) => {
        setActionId(id);
        try {
            await assignTechnician(id, name);
            setToast({ msg: `Assigned to ${name}`, type: 'success' });
            await loadTickets();
        } catch (_) { setToast({ msg: 'Assignment failed.', type: 'error' }); }
        finally { setActionId(null); }
    };

    // Resource actions
    const handleSaveResource = async (payload) => {
        if (editingResource) {
            await updateResource(editingResource.id, payload);
            setToast({ msg: 'Resource updated!', type: 'success' });
        } else {
            await createResource(payload);
            setToast({ msg: 'Resource created!', type: 'success' });
        }
        setShowResourceModal(false);
        setEditingResource(null);
        await loadResources();
    };

    const handleDeleteResource = async (id) => {
        try {
            await deleteResource(id);
            setToast({ msg: 'Resource deleted.', type: 'info' });
            setDeleteConfirm(null);
            await loadResources();
        } catch (_) { setToast({ msg: 'Delete failed.', type: 'error' }); }
    };

    const openCreate = () => { setEditingResource(null); setShowResourceModal(true); };
    const openEdit   = (r) => { setEditingResource(r);   setShowResourceModal(true); };

    // Admin request actions
    const handleApproveAdmin = async (id) => {
        setActionId(id);
        try {
            await approveAdmin(id);
            setToast({ msg: 'Admin registration approved!', type: 'success' });
            await loadPendingAdmins();
        } catch (_) { setToast({ msg: 'Failed to approve admin.', type: 'error' }); }
        finally { setActionId(null); }
    };

    const handleRejectAdmin = async (id) => {
        setActionId(id);
        try {
            await rejectAdmin(id);
            setToast({ msg: 'Admin registration rejected.', type: 'info' });
            await loadPendingAdmins();
        } catch (_) { setToast({ msg: 'Failed to reject admin.', type: 'error' }); }
        finally { setActionId(null); }
    };

    const BOOKING_FILTER_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
    const TYPE_LABELS = { LECTURE_HALL: 'Lecture Hall', LAB: 'Lab', MEETING_ROOM: 'Meeting Room', EQUIPMENT: 'Equipment' };

    return (
        <div className="admin-page" id="admin-dashboard">
            <div className="admin-bg-decoration" aria-hidden="true">
                <div className="admin-blob admin-blob-1" />
                <div className="admin-blob admin-blob-2" />
            </div>

            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            <div className="page-header">
                <div>
                    <h1><span>Administrator</span> Panel</h1>
                    <p className="subtitle">Campus Operations & Resource Management</p>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="tab-bar" style={{ marginBottom: 'var(--space-lg)' }}>
                <button id="admin-tab-bookings" className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
                    <Calendar size={14} /> Bookings
                </button>
                <button id="admin-tab-tickets" className={`tab-btn ${tab === 'tickets' ? 'active' : ''}`} onClick={() => setTab('tickets')}>
                    <AlertTriangle size={14} /> Tickets
                </button>
                <button id="admin-tab-resources" className={`tab-btn ${tab === 'resources' ? 'active' : ''}`} onClick={() => setTab('resources')}>
                    <Package size={14} /> Resources
                </button>
                <button id="admin-tab-requests" className={`tab-btn ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
                    <UserCheck size={14} /> Admin Requests
                    {pendingAdmins.length > 0 && <span className="badge-count">{pendingAdmins.length}</span>}
                </button>
            </div>

            {/* ── BOOKINGS TAB ── */}
            {tab === 'bookings' && (
                <div>
                    <div className="admin-toolbar">
                        <div className="tab-bar">
                            {BOOKING_FILTER_TABS.map(f => (
                                <button
                                    key={f}
                                    id={`booking-filter-${f.toLowerCase()}`}
                                    className={`tab-btn ${bookingFilter === f ? 'active' : ''}`}
                                    onClick={() => setBookingFilter(f)}
                                >
                                    {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                        <button className="icon-btn" onClick={loadBookings} title="Refresh"><RefreshCw size={14} /></button>
                    </div>

                    {loadingB ? (
                        <div className="spinner-container"><div className="spinner" /></div>
                    ) : bookings.length === 0 ? (
                        <div className="empty-state card">
                            <Calendar size={36} />
                            <h3>No bookings found</h3>
                            <p>No {bookingFilter !== 'ALL' ? bookingFilter.toLowerCase() : ''} bookings at the moment.</p>
                        </div>
                    ) : (
                        <div className="admin-list">
                            {bookings.map(b => (
                                <BookingRow
                                    key={b.id}
                                    booking={b}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    loading={actionId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── TICKETS TAB ── */}
            {tab === 'tickets' && (
                <div>
                    <div className="admin-toolbar">
                        <span className="admin-count">{tickets.length} tickets total</span>
                        <button className="icon-btn" onClick={loadTickets} title="Refresh"><RefreshCw size={14} /></button>
                    </div>

                    {loadingT ? (
                        <div className="spinner-container"><div className="spinner" /></div>
                    ) : tickets.length === 0 ? (
                        <div className="empty-state card">
                            <AlertTriangle size={36} />
                            <h3>No tickets</h3>
                        </div>
                    ) : (
                        <div className="admin-list">
                            {tickets.map(t => (
                                <TicketRow
                                    key={t.id}
                                    ticket={t}
                                    onStatusChange={handleStatusChange}
                                    onAssign={handleAssign}
                                    onLightbox={setLightboxUrl}
                                    onRefresh={loadTickets}
                                    loading={actionId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* ── RESOURCES TAB ── */}
            {tab === 'resources' && (
                <div>
                    <div className="admin-toolbar">
                        <span className="admin-count">{resources.length} resources</span>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button className="icon-btn" onClick={loadResources} title="Refresh"><RefreshCw size={14} /></button>
                            <button id="add-resource-btn" className="btn-primary" onClick={openCreate}>
                                <Plus size={15} /> Add Resource
                            </button>
                        </div>
                    </div>

                    {loadingR ? (
                        <div className="spinner-container"><div className="spinner" /></div>
                    ) : resources.length === 0 ? (
                        <div className="empty-state card">
                            <Package size={36} />
                            <h3>No resources yet</h3>
                            <p>Click "Add Resource" to create the first one.</p>
                        </div>
                    ) : (
                        <div className="resource-admin-grid">
                            {resources.map(r => (
                                <div key={r.id} id={`admin-resource-${r.id}`} className="resource-admin-card card">
                                    <div className="rac-header-badges">
                                        <span className={`status-badge ${(r.status || '').toLowerCase()}`}>
                                            {r.status === 'ACTIVE' ? <ShieldCheck size={10} /> : <XCircle size={10} />}
                                            {r.status?.replace(/_/g,' ')}
                                        </span>
                                    </div>

                                    <div className="rac-visual">
                                        {r.imageUrl ? (
                                            <img src={r.imageUrl} alt={r.name} className="rac-image" />
                                        ) : (
                                            <div className="rac-placeholder">
                                                <ResourceIcon type={r.type} size={42} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="rac-body">
                                        <div className="rac-title-row">
                                            <strong className="rac-name">{r.name}</strong>
                                            <span className="type-badge">{TYPE_LABELS[r.type] || r.type}</span>
                                        </div>
                                        <div className="rac-location"><MapPin size={12} /> {r.location || 'Unknown'}</div>

                                        <div className="rac-tags">
                                            {/* Show descriptive tags if available, otherwise defaults */}
                                            {(r.features || 'Standard').split(',').slice(0, 3).map((f, i) => (
                                                <span key={i} className="rac-tag">{f.trim()}</span>
                                            ))}
                                        </div>

                                        <div className="rac-footer">
                                            <div className="rac-meta-item">
                                                <Users size={14} /> <span>{r.capacity || 0}</span>
                                            </div>
                                            <div className="rac-actions">
                                                <button id={`edit-resource-${r.id}`} className="icon-btn" onClick={() => openEdit(r)} title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button id={`delete-resource-${r.id}`} className="icon-btn danger" onClick={() => setDeleteConfirm(r.id)} title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {deleteConfirm === r.id && (
                                        <div className="rac-confirm-overlay">
                                            <p>Delete <strong>{r.name}</strong>?</p>
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                <button className="btn-reject" onClick={() => handleDeleteResource(r.id)}>Delete</button>
                                                <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── ADMIN REQUESTS TAB ── */}
            {tab === 'requests' && (
                <div>
                    <div className="admin-toolbar">
                        <span className="admin-count">{pendingAdmins.length} pending requests</span>
                        <button className="icon-btn" onClick={loadPendingAdmins} title="Refresh"><RefreshCw size={14} /></button>
                    </div>

                    {loadingPA ? (
                        <div className="spinner-container"><div className="spinner" /></div>
                    ) : pendingAdmins.length === 0 ? (
                        <div className="empty-state card">
                            <UserCheck size={36} />
                            <h3>No pending requests</h3>
                            <p>All admin registration requests have been processed.</p>
                        </div>
                    ) : (
                        <div className="admin-list">
                            {pendingAdmins.map(req => (
                                <AdminRequestRow
                                    key={req.id}
                                    request={req}
                                    onApprove={handleApproveAdmin}
                                    onReject={handleRejectAdmin}
                                    loading={actionId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Resource Form Modal */}
            {showResourceModal && (
                <ResourceFormModal
                    resource={editingResource}
                    onSave={handleSaveResource}
                    onClose={() => { setShowResourceModal(false); setEditingResource(null); }}
                />
            )}

            {/* Lightbox */}
            {lightboxUrl && (
                <div className="lightbox-overlay" onClick={() => setLightboxUrl(null)}>
                    <button className="lightbox-close" onClick={() => setLightboxUrl(null)}>
                        <X size={22} />
                    </button>
                    <img
                        src={lightboxUrl}
                        alt="Attachment"
                        className="lightbox-img"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </div>

    );
};

export default Admin;
