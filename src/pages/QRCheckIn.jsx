import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, CheckCircle, XCircle, AlertCircle, RotateCcw, Camera } from 'lucide-react';
import { checkInByQr } from '../services/bookingService';
import './QRCheckIn.css';

const RESULT_MESSAGES = {
    SUCCESS: { icon: CheckCircle, color: 'success', label: 'Check-in Successful' },
    ALREADY_CHECKED_IN: { icon: CheckCircle, color: 'info', label: 'Already Checked In' },
    TOO_EARLY: { icon: AlertCircle, color: 'warning', label: 'Too Early' },
    GRACE_EXPIRED: { icon: XCircle, color: 'error', label: 'Check-in Window Expired' },
    BOOKING_CANCELLED: { icon: XCircle, color: 'error', label: 'Booking Cancelled' },
    BOOKING_NO_SHOW: { icon: XCircle, color: 'error', label: 'Booking No-Show' },
    INVALID_TOKEN: { icon: XCircle, color: 'error', label: 'Invalid QR Code' },
    LOCATION_MISMATCH: { icon: XCircle, color: 'error', label: 'Location Mismatch' },
};

function parseQrUrl(raw) {
    try {
        const url = new URL(raw);
        const parts = url.pathname.split('/').filter(Boolean);
        // Expected path: /checkin/{resourceId}
        const checkinIdx = parts.indexOf('checkin');
        if (checkinIdx === -1 || !parts[checkinIdx + 1]) return null;
        const resourceId = parts[checkinIdx + 1];
        const qrSecret = url.searchParams.get('k');
        if (!qrSecret) return null;
        return { resourceId, qrSecret };
    } catch {
        return null;
    }
}

const QRCheckIn = () => {
    const [scanState, setScanState] = useState('idle'); // idle | scanning | loading | result | error
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const scannerRef = useRef(null);
    const isScanningRef = useRef(false);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try { await scannerRef.current.stop(); } catch (_) {}
            try { scannerRef.current.clear(); } catch (_) {}
            scannerRef.current = null;
        }
        isScanningRef.current = false;
    }, []);

    const startScanner = useCallback(async () => {
        setScanState('scanning');
        setResult(null);
        setErrorMsg('');

        await stopScanner();

        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        try {
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 240, height: 240 } },
                async (decodedText) => {
                    if (isScanningRef.current) return;
                    isScanningRef.current = true;

                    await stopScanner();
                    setScanState('loading');

                    const parsed = parseQrUrl(decodedText);
                    if (!parsed) {
                        setErrorMsg('QR code is not a valid check-in code.');
                        setScanState('error');
                        isScanningRef.current = false;
                        return;
                    }

                    try {
                        const data = await checkInByQr(parsed.resourceId, parsed.qrSecret);
                        setResult(data);
                        setScanState('result');
                    } catch (err) {
                        const msg = err.response?.data?.message || 'Check-in request failed. Please try again.';
                        setErrorMsg(msg);
                        setScanState('error');
                    }
                    isScanningRef.current = false;
                },
                () => {}
            );
        } catch (err) {
            setErrorMsg('Could not access camera. Please allow camera permissions and try again.');
            setScanState('error');
            scannerRef.current = null;
        }
    }, [stopScanner]);

    useEffect(() => {
        return () => { stopScanner(); };
    }, [stopScanner]);

    const reset = useCallback(async () => {
        await stopScanner();
        setScanState('idle');
        setResult(null);
        setErrorMsg('');
    }, [stopScanner]);

    const fmtTime = (t) => {
        if (!t) return '';
        try { return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
        catch { return t; }
    };

    const resultMeta = result?.result ? RESULT_MESSAGES[result.result] : null;
    const Icon = resultMeta?.icon || CheckCircle;

    return (
        <div className="qr-checkin-page">
            <div className="page-header">
                <div>
                    <h1>QR Check-in</h1>
                    <p className="subtitle">Scan the room QR code to confirm your arrival</p>
                </div>
            </div>

            <div className="qr-checkin-card card">
                {/* Idle state */}
                {scanState === 'idle' && (
                    <div className="qr-idle-state">
                        <div className="qr-icon-wrap">
                            <QrCode size={56} />
                        </div>
                        <h2>Ready to Check In?</h2>
                        <p>Point your camera at the QR code displayed at the room entrance.</p>
                        <button id="start-scan-btn" className="btn-primary qr-start-btn" onClick={startScanner}>
                            <Camera size={18} /> Start Camera
                        </button>
                    </div>
                )}

                {/* Scanner viewfinder */}
                {(scanState === 'scanning' || scanState === 'loading') && (
                    <div className="qr-scanner-wrap">
                        <div id="qr-reader" className="qr-reader-el" />
                        {scanState === 'loading' && (
                            <div className="qr-loading-overlay">
                                <div className="spinner" />
                                <p>Verifying check-in…</p>
                            </div>
                        )}
                        <button className="btn-secondary qr-cancel-btn" onClick={reset}>
                            Cancel
                        </button>
                    </div>
                )}

                {/* Result state */}
                {scanState === 'result' && result && (
                    <div className={`qr-result qr-result--${resultMeta?.color || 'success'}`}>
                        <div className="qr-result-icon">
                            <Icon size={52} />
                        </div>
                        <h2>{resultMeta?.label || 'Done'}</h2>
                        <p className="qr-result-message">{result.message}</p>

                        {result.resourceName && (
                            <div className="qr-result-details">
                                <div className="qr-detail-row">
                                    <span className="qr-detail-label">Room</span>
                                    <span className="qr-detail-value">{result.resourceName}</span>
                                </div>
                                {result.checkedInAt && (
                                    <div className="qr-detail-row">
                                        <span className="qr-detail-label">Checked in at</span>
                                        <span className="qr-detail-value">{fmtTime(result.checkedInAt)}</span>
                                    </div>
                                )}
                                {result.bookingEndTime && (
                                    <div className="qr-detail-row">
                                        <span className="qr-detail-label">Booking ends</span>
                                        <span className="qr-detail-value">{result.bookingEndTime}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button id="scan-again-btn" className="btn-primary qr-start-btn" onClick={reset}>
                            <RotateCcw size={16} /> Scan Another
                        </button>
                    </div>
                )}

                {/* Error state */}
                {scanState === 'error' && (
                    <div className="qr-result qr-result--error">
                        <div className="qr-result-icon">
                            <XCircle size={52} />
                        </div>
                        <h2>Check-in Failed</h2>
                        <p className="qr-result-message">{errorMsg}</p>
                        <button id="retry-scan-btn" className="btn-primary qr-start-btn" onClick={startScanner}>
                            <RotateCcw size={16} /> Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCheckIn;
