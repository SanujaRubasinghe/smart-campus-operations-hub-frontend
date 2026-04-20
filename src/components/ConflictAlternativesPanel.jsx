import React, { useState } from 'react';
import { ArrowLeft, MapPin, Users, Clock, Calendar, CheckCircle, Zap } from 'lucide-react';
import { createBooking } from '../services/bookingService';

const STRATEGY_CONFIG = {
    SAME_RESOURCE_SHIFTED_TIME: {
        label: 'Same room · shifted time',
        color: 'var(--accent-blue)',
        bg: 'var(--accent-blue-light)',
    },
    SAME_TIME_DIFFERENT_RESOURCE: {
        label: 'Same time · different room',
        color: 'var(--accent-green)',
        bg: 'var(--accent-green-light)',
    },
    RELAXED_MATCH: {
        label: 'Similar resource',
        color: 'var(--accent-purple)',
        bg: 'var(--accent-purple-light)',
    },
};

const MatchBar = ({ score }) => {
    const pct = Math.min(100, Math.round(score * 100));
    const color = pct >= 70 ? 'var(--accent-green)' : pct >= 40 ? 'var(--accent-blue)' : 'var(--accent-orange)';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
                flex: 1,
                height: 4,
                borderRadius: 99,
                background: 'var(--border-color)',
                overflow: 'hidden',
            }}>
                <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 99,
                    transition: 'width 0.4s ease',
                }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color, minWidth: 34, textAlign: 'right' }}>
                {pct}%
            </span>
        </div>
    );
};

const AlternativeCard = ({ alt, originalForm, userId, onSuccess }) => {
    const [booking, setBooking] = useState(false);
    const [err, setErr] = useState('');
    const [done, setDone] = useState(false);

    const strategy = STRATEGY_CONFIG[alt.strategy] || STRATEGY_CONFIG.RELAXED_MATCH;

    const handleBook = async () => {
        setBooking(true);
        setErr('');
        try {
            await createBooking({
                ResourceId: alt.resourceId,
                bookingDate: alt.bookingDate,
                startTime: alt.startTime,
                endTime: alt.endTime,
                purpose: originalForm.purpose,
                expectedAttendees: originalForm.expectedAttendees
                    ? parseInt(originalForm.expectedAttendees)
                    : undefined,
            }, userId);
            setDone(true);
            setTimeout(() => onSuccess?.(), 900);
        } catch (e) {
            const msg = e?.response?.data?.message || 'Booking failed. Please try again.';
            setErr(typeof msg === 'string' ? msg : 'Booking failed. Please try again.');
        } finally {
            setBooking(false);
        }
    };

    return (
        <div style={{
            border: `1px solid ${done ? 'rgba(15,174,111,0.3)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: done ? 'var(--accent-green-light)' : 'var(--bg-secondary)',
            transition: 'background 0.3s ease, border-color 0.3s ease',
        }}>
            {/* Top row: strategy badge + match bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: strategy.bg,
                    color: strategy.color,
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.2px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                }}>
                    {strategy.label}
                </span>
                <div style={{ flex: 1 }}>
                    <MatchBar score={alt.score} />
                </div>
            </div>

            {/* Resource name + type */}
            <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {alt.resourceName}
                </div>
                {alt.resourceType && (
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 1 }}>
                        {alt.resourceType.replace(/_/g, ' ')}
                    </div>
                )}
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px' }}>
                {alt.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <MapPin size={10} style={{ flexShrink: 0 }} />
                        {alt.location}
                    </div>
                )}
                {alt.capacity != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <Users size={10} style={{ flexShrink: 0 }} />
                        {alt.capacity} seats
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <Calendar size={10} style={{ flexShrink: 0 }} />
                    {alt.bookingDate}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <Clock size={10} style={{ flexShrink: 0 }} />
                    {alt.startTime} – {alt.endTime}
                </div>
            </div>

            {/* Amenities/reasons */}
            {alt.reasons?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {alt.reasons.map((r, i) => (
                        <span key={i} className="chip" style={{ fontSize: '10px' }}>{r}</span>
                    ))}
                </div>
            )}

            {err && (
                <div style={{ fontSize: '12px', color: 'var(--accent-red)', fontWeight: 500 }}>{err}</div>
            )}

            {done ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--accent-green)',
                    fontWeight: 700,
                    fontSize: '13px',
                }}>
                    <CheckCircle size={15} /> Booked successfully!
                </div>
            ) : (
                <button
                    className="btn-primary"
                    style={{ justifyContent: 'center', fontSize: '13px', padding: '8px 14px' }}
                    onClick={handleBook}
                    disabled={booking}
                >
                    {booking
                        ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Booking…</>
                        : 'Book This Instead'}
                </button>
            )}
        </div>
    );
};

const ConflictAlternativesPanel = ({ message, alternatives, originalForm, userId, onSuccess, onBack }) => {
    return (
        <div className="modal-form">
            {/* Conflict banner */}
            <div style={{
                background: 'var(--accent-red-light)',
                border: '1px solid rgba(220,53,69,0.22)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
            }}>
                <div style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '13px', marginBottom: 3 }}>
                    Time slot unavailable
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {message}
                </div>
            </div>

            {alternatives.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-lg) 0' }}>
                    <Zap size={30} style={{ opacity: 0.4 }} />
                    <h3 style={{ fontSize: '14px' }}>No alternatives found</h3>
                    <p>Try choosing a different date or time.</p>
                </div>
            ) : (
                <>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                    }}>
                        {alternatives.length} suggested alternative{alternatives.length !== 1 ? 's' : ''}
                    </div>
                    {alternatives.map((alt, i) => (
                        <AlternativeCard
                            key={`${alt.resourceId}-${alt.startTime}-${i}`}
                            alt={alt}
                            originalForm={originalForm}
                            userId={userId}
                            onSuccess={onSuccess}
                        />
                    ))}
                </>
            )}

            <div className="modal-actions">
                <button className="btn-ghost" onClick={onBack} style={{ gap: 6 }}>
                    <ArrowLeft size={13} /> Back to form
                </button>
            </div>
        </div>
    );
};

export default ConflictAlternativesPanel;
