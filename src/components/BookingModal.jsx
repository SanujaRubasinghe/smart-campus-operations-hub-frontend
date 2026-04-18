import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, FileText } from 'lucide-react';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';

const BookingModal = ({ resource, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        bookingDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.bookingDate || !form.startTime || !form.endTime || !form.purpose) {
            setError('Please fill in all required fields.');
            return;
        }

        if (form.startTime >= form.endTime) {
            setError('End time must be after start time.');
            return;
        }

        setLoading(true);
        try {
            await createBooking({
                ResourceId: resource.id,
                bookingDate: form.bookingDate,
                startTime: form.startTime,
                endTime: form.endTime,
                purpose: form.purpose,
                expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : undefined,
            }, user?.id || 1);
            onSuccess?.();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Booking failed. Please try again.';
            setError(typeof msg === 'string' ? msg : 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
                <div className="modal-header">
                    <div>
                        <h2 id="booking-modal-title">Book Resource</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {resource.name} &bull; Capacity: {resource.capacity}
                        </p>
                    </div>
                    <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit} id="booking-form">
                    <div className="form-group">
                        <label htmlFor="bookingDate">
                            <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                            Date *
                        </label>
                        <input
                            id="bookingDate"
                            name="bookingDate"
                            type="date"
                            className="form-control"
                            value={form.bookingDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label htmlFor="startTime">
                                <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                                Start Time *
                            </label>
                            <input
                                id="startTime"
                                name="startTime"
                                type="time"
                                className="form-control"
                                value={form.startTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endTime">
                                <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                                End Time *
                            </label>
                            <input
                                id="endTime"
                                name="endTime"
                                type="time"
                                className="form-control"
                                value={form.endTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="purpose">
                            <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />
                            Purpose *
                        </label>
                        <textarea
                            id="purpose"
                            name="purpose"
                            className="form-control"
                            rows={3}
                            placeholder="Describe the purpose of this booking..."
                            value={form.purpose}
                            onChange={handleChange}
                            maxLength={1000}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="expectedAttendees">
                            <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
                            Expected Attendees
                        </label>
                        <input
                            id="expectedAttendees"
                            name="expectedAttendees"
                            type="number"
                            className="form-control"
                            placeholder={`Max ${resource.capacity}`}
                            value={form.expectedAttendees}
                            onChange={handleChange}
                            min={1}
                            max={resource.capacity}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'var(--accent-red-light)',
                            color: 'var(--accent-red)',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '13px',
                            fontWeight: 500,
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button
                            id="submit-booking-btn"
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Booking…</> : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
