import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus, X, Paperclip, MessageCircle, Send,
    RefreshCw, CheckCircle, Loader, FileText, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    getAllTickets,
    createTicket,
    addComment,
    downloadTicketPdf,
    previewTicketPdf
} from '../services/ticketService';
import { uploadTicketAttachments } from '../services/supabaseStorage';
import './Tickets.css';

const CATEGORIES = ['ELECTRICAL', 'NETWORK', 'PROJECTOR', 'LAB_EQUIPMENT', 'FURNITURE', 'OTHER'];
const PRIORITIES  = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES    = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

const Toast = ({ msg, type, onDone }) => {
    useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
    return (
        <div className="toast-container">
            <div className={`toast ${type}`}>
                <CheckCircle size={16}/> {msg}
            </div>
        </div>
    );
};

const Tickets = () => {
    const { user } = useAuth();
    const fileInputRef = useRef(null);

    const [tickets, setTickets]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [view, setView]         = useState('list');   // 'list' | 'create'
    const [tab, setTab]           = useState('ALL');
    const [expandedId, setExpId]  = useState(null);
    const [toast, setToast]       = useState(null);
    const [lightboxUrl, setLightboxUrl] = useState(null);

    // PDF states
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [pdfLoadingId, setPdfLoadingId] = useState(null);

    const [form, setForm] = useState({
        category: 'ELECTRICAL',
        location: '',
        description: '',
        priority: 'MEDIUM',
        preferredContact: '',
    });
    const [files, setFiles]       = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const [commentText, setCommentText]   = useState({});
    const [sendingComment, setSendingComment] = useState(null);

    const isAdmin =
        user?.role === 'ADMIN' ||
        user?.roles?.includes?.('ADMIN') ||
        user?.authorities?.includes?.('ROLE_ADMIN');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllTickets();
            setTickets(data);
        } catch (_) { setTickets([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = tickets.filter(t =>
        tab === 'ALL' || t.status === tab
    );

    const handleFormChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError('');
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const chosen = Array.from(e.dataTransfer?.files || e.target.files || []);
        const images = chosen.filter(f => f.type.startsWith('image/'));
        if (images.length === 0) return;
        setFiles(prev => {
            const combined = [...prev, ...images];
            return combined.slice(0, 3);
        });
    };

    const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.location || !form.description || !form.preferredContact) {
            setFormError('Please fill in all required fields.');
            return;
        }
        setSubmitting(true);
        try {
            let attachmentUrls = [];
            if (files.length > 0) {
                attachmentUrls = await uploadTicketAttachments(files);
            }
            await createTicket({ ...form, attachmentUrls });
            setToast({ msg: 'Ticket submitted successfully!', type: 'success' });
            setForm({ category: 'ELECTRICAL', location: '', description: '', priority: 'MEDIUM', preferredContact: '' });
            setFiles([]);
            setView('list');
            await load();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Submission failed.';
            setFormError(typeof msg === 'string' ? msg : 'Submission failed.');
        } finally { setSubmitting(false); }
    };

    const handleAddComment = async (ticketId) => {
        const text = commentText[ticketId]?.trim();
        if (!text) return;
        setSendingComment(ticketId);
        try {
            await addComment(ticketId, text, user?.name || user?.fullName || user?.email || 'User');
            setCommentText(prev => ({ ...prev, [ticketId]: '' }));
            setToast({ msg: 'Comment added.', type: 'success' });
            await load();
        } catch (_) {
            setToast({ msg: 'Failed to add comment.', type: 'error' });
        } finally { setSendingComment(null); }
    };

    const handlePreviewPdf = async (ticketId) => {
        try {
            setPdfLoadingId(ticketId);
            const pdfUrl = await previewTicketPdf(ticketId);
            setPdfPreviewUrl(pdfUrl);
        } catch (err) {
            setToast({ msg: 'Failed to open PDF preview.', type: 'error' });
        } finally {
            setPdfLoadingId(null);
        }
    };

    const handleDownloadPdf = async (ticketId) => {
        try {
            setPdfLoadingId(ticketId);
            await downloadTicketPdf(ticketId);
            setToast({ msg: 'PDF download started.', type: 'success' });
        } catch (err) {
            setToast({ msg: 'Failed to download PDF.', type: 'error' });
        } finally {
            setPdfLoadingId(null);
        }
    };

    const closePdfModal = () => {
        if (pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
        }
        setPdfPreviewUrl(null);
    };

    const statusKey = (s) => (s || '').toLowerCase().replace(/_/g, '_');

    return (
        <div className="tickets-page">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            <div className="page-header">
                <div>
                    <h1>Incident Tickets</h1>
                    <p className="subtitle">Report and track maintenance issues across campus</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {view === 'create' ? (
                        <button id="view-tickets-btn" className="btn-secondary" onClick={() => setView('list')}>
                            <X size={15} /> Cancel
                        </button>
                    ) : (
                        <button id="report-issue-btn" className="btn-primary" onClick={() => setView('create')}>
                            <Plus size={15} /> Report Issue
                        </button>
                    )}
                    <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={14}/></button>
                </div>
            </div>

            {view === 'create' && (
                <div className="card new-ticket-form" id="new-ticket-form">
                    <h2>New Incident Report</h2>
                    <form onSubmit={handleSubmit} className="ticket-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Category *</label>
                                <select id="ticket-category" name="category" className="form-control" value={form.category} onChange={handleFormChange}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Priority *</label>
                                <select id="ticket-priority" name="priority" className="form-control" value={form.priority} onChange={handleFormChange}>
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Location / Resource *</label>
                            <input
                                id="ticket-location"
                                name="location"
                                type="text"
                                className="form-control"
                                placeholder="e.g. Lab 02 Projector, Block B Floor 3"
                                value={form.location}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                id="ticket-description"
                                name="description"
                                className="form-control"
                                rows={4}
                                placeholder="Describe the problem in detail…"
                                value={form.description}
                                onChange={handleFormChange}
                                maxLength={1000}
                                required
                            />
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                                {form.description.length}/1000
                            </span>
                        </div>

                        <div className="form-group">
                            <label>Preferred Contact *</label>
                            <input
                                id="ticket-contact"
                                name="preferredContact"
                                type="text"
                                className="form-control"
                                placeholder="Phone number or email"
                                value={form.preferredContact}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Attachments (Max 3 images)</label>
                            <div
                                id="ticket-file-drop"
                                className="file-drop-zone"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={handleFileDrop}
                            >
                                {files.length === 0 ? (
                                    <>
                                        <Paperclip size={22} color="var(--text-secondary)" />
                                        <p>Click or drag & drop images here</p>
                                        <span>PNG, JPG up to 5MB each</span>
                                    </>
                                ) : (
                                    <div className="attachment-previews">
                                        {files.map((f, i) => (
                                            <div key={i} className="attachment-thumb">
                                                <img src={URL.createObjectURL(f)} alt={f.name} />
                                                <button
                                                    type="button"
                                                    className="attachment-remove"
                                                    onClick={ev => { ev.stopPropagation(); removeFile(i); }}
                                                >
                                                    <X size={12} />
                                                </button>
                                                <span className="attachment-name">{f.name.length > 12 ? f.name.slice(0,10)+'…' : f.name}</span>
                                            </div>
                                        ))}
                                        {files.length < 3 && (
                                            <div className="attachment-add-more">
                                                <Paperclip size={18} />
                                                <span>Add more</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleFileDrop}
                            />
                        </div>

                        {formError && (
                            <div className="form-error">{formError}</div>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn-ghost" onClick={() => setView('list')}>Cancel</button>
                            <button
                                id="submit-ticket-btn"
                                type="submit"
                                className="btn-primary"
                                disabled={submitting}
                            >
                                {submitting
                                    ? <><Loader size={14} className="spin" /> {files.length > 0 ? 'Uploading & Submitting…' : 'Submitting…'}</>
                                    : 'Submit Ticket'
                                }
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {view === 'list' && (
                <>
                    <div className="tab-bar">
                        {STATUSES.map(s => (
                            <button
                                key={s}
                                id={`ticket-tab-${s.toLowerCase()}`}
                                className={`tab-btn ${tab === s ? 'active' : ''}`}
                                onClick={() => setTab(s)}
                            >
                                {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="spinner-container"><div className="spinner" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state card">
                            <CheckCircle size={40} />
                            <h3>No tickets found</h3>
                            <p>No {tab !== 'ALL' ? tab.toLowerCase().replace(/_/g,' ') : ''} tickets at the moment.</p>
                        </div>
                    ) : (
                        <div className="tickets-grid">
                            {filtered.map(ticket => (
                                <div className="card ticket-card" key={ticket.id} id={`ticket-card-${ticket.id}`}>
                                    <div className="ticket-header">
                                        <span className="ticket-id">#{ticket.id}</span>
                                        <span className={`status-badge ${statusKey(ticket.status)}`}>
                                            {(ticket.status || '').replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    <h3 className="ticket-title">{(ticket.category || '').replace(/_/g, ' ')}</h3>
                                    <p className="ticket-location">{ticket.location}</p>
                                    {ticket.description && (
                                        <p className="ticket-desc">{ticket.description}</p>
                                    )}

                                    {ticket.attachments && ticket.attachments.length > 0 && (
                                        <div className="ticket-attachments">
                                            {ticket.attachments.map(att => (
                                                <button
                                                    key={att.id}
                                                    className="ticket-att-thumb"
                                                    onClick={() => setLightboxUrl(att.filePath)}
                                                    title={att.fileName}
                                                >
                                                    <img src={att.filePath} alt={att.fileName} />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {isAdmin && (
                                        <div className="ticket-pdf-actions">
                                            <button
                                                className="btn-secondary pdf-action-btn"
                                                onClick={() => handlePreviewPdf(ticket.id)}
                                                disabled={pdfLoadingId === ticket.id}
                                            >
                                                <FileText size={14} />
                                                {pdfLoadingId === ticket.id ? 'Opening...' : 'View PDF'}
                                            </button>

                                            <button
                                                className="btn-primary pdf-action-btn"
                                                onClick={() => handleDownloadPdf(ticket.id)}
                                                disabled={pdfLoadingId === ticket.id}
                                            >
                                                <Download size={14} />
                                                {pdfLoadingId === ticket.id ? 'Preparing...' : 'Download PDF'}
                                            </button>
                                        </div>
                                    )}

                                    <div className="ticket-footer">
                                        <span className={`priority-badge ${(ticket.priority || '').toLowerCase()}`}>
                                            {ticket.priority}
                                        </span>
                                        {ticket.assignedTechnicianName && (
                                            <span className="chip">🔧 {ticket.assignedTechnicianName}</span>
                                        )}
                                        <button
                                            id={`ticket-comments-btn-${ticket.id}`}
                                            className="icon-btn"
                                            onClick={() => setExpId(id => id === ticket.id ? null : ticket.id)}
                                            title="Comments"
                                        >
                                            <MessageCircle size={16} />
                                            {ticket.comments?.length > 0 && (
                                                <span style={{ fontSize: 10, marginLeft: 2 }}>{ticket.comments.length}</span>
                                            )}
                                        </button>
                                    </div>

                                    {expandedId === ticket.id && (
                                        <div className="comments-section">
                                            <div className="comments-list">
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
                                            <div className="comment-input-row">
                                                <input
                                                    id={`comment-input-${ticket.id}`}
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Add a comment…"
                                                    value={commentText[ticket.id] || ''}
                                                    onChange={e => setCommentText(p => ({ ...p, [ticket.id]: e.target.value }))}
                                                    onKeyDown={e => { if (e.key === 'Enter') handleAddComment(ticket.id); }}
                                                />
                                                <button
                                                    id={`send-comment-btn-${ticket.id}`}
                                                    className="btn-primary"
                                                    disabled={sendingComment === ticket.id}
                                                    onClick={() => handleAddComment(ticket.id)}
                                                    style={{ padding: '9px 14px' }}
                                                >
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

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

            {pdfPreviewUrl && (
                <div className="pdf-modal-overlay" onClick={closePdfModal}>
                    <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pdf-modal-header">
                            <h3>Ticket PDF Preview</h3>
                            <button className="pdf-close-btn" onClick={closePdfModal}>
                                <X size={18} />
                            </button>
                        </div>
                        <iframe
                            src={pdfPreviewUrl}
                            title="Ticket PDF Preview"
                            className="pdf-modal-frame"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tickets;