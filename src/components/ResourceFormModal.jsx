import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import { uploadResourceImage } from '../services/supabaseStorage';
import './ResourceFormModal.css';

const TYPES     = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const STATUSES  = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'];

const EMPTY = {
    name: '', type: 'LECTURE_HALL', capacity: '', location: '',
    status: 'ACTIVE', amenities: [], imageUrl: '',
};

const ResourceFormModal = ({ resource, onSave, onClose }) => {
    const isEdit = !!resource;
    const [form, setForm]               = useState(isEdit ? { ...resource, amenities: resource.amenities || [] } : { ...EMPTY });
    const [amenityInput, setAmenityInput] = useState('');
    const [imageFile, setImageFile]     = useState(null);
    const [imagePreview, setImagePreview] = useState(resource?.imageUrl || '');
    const [uploading, setUploading]     = useState(false);
    const [saving, setSaving]           = useState(false);
    const [error, setError]             = useState('');
    const fileRef = useRef();

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleFile = (file) => {
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith('image/')) handleFile(file);
    };

    const addAmenity = () => {
        const val = amenityInput.trim();
        if (val && !form.amenities.includes(val)) {
            set('amenities', [...form.amenities, val]);
        }
        setAmenityInput('');
    };

    const removeAmenity = (a) => set('amenities', form.amenities.filter(x => x !== a));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            let imageUrl = form.imageUrl;

            // Upload image to Supabase if a new file was picked
            if (imageFile) {
                setUploading(true);
                imageUrl = await uploadResourceImage(imageFile);
                setUploading(false);
            }

            const payload = {
                ...form,
                capacity: Number(form.capacity) || null,
                imageUrl,
            };
            await onSave(payload);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Save failed.');
            setUploading(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel rfm-panel" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">{isEdit ? 'Edit Resource' : 'Add Resource'}</h2>
                    <button className="icon-btn" onClick={onClose}><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="rfm-form">
                    <div className="rfm-body">
                        {/* Left col — form fields */}
                        <div className="rfm-fields">
                            <div className="form-group">
                                <label>Name *</label>
                                <input id="rfm-name" className="form-control" required minLength={3}
                                    value={form.name} onChange={e => set('name', e.target.value)}
                                    placeholder="e.g. Lecture Hall A" />
                            </div>

                            <div className="rfm-row">
                                <div className="form-group">
                                    <label>Type *</label>
                                    <select id="rfm-type" className="form-control" value={form.type}
                                        onChange={e => set('type', e.target.value)}>
                                        {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Capacity</label>
                                    <input id="rfm-capacity" className="form-control" type="number" min={1}
                                        value={form.capacity} onChange={e => set('capacity', e.target.value)}
                                        placeholder="50" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input id="rfm-location" className="form-control"
                                    value={form.location} onChange={e => set('location', e.target.value)}
                                    placeholder="e.g. Block A, Floor 2" />
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select id="rfm-status" className="form-control" value={form.status}
                                    onChange={e => set('status', e.target.value)}>
                                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>

                            {/* Amenities tag input */}
                            <div className="form-group">
                                <label>Amenities</label>
                                <div className="rfm-tags">
                                    {form.amenities.map(a => (
                                        <span key={a} className="chip">
                                            {a}
                                            <button type="button" className="chip-remove" onClick={() => removeAmenity(a)}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="rfm-tag-input">
                                    <input id="rfm-amenity" className="form-control" value={amenityInput}
                                        onChange={e => setAmenityInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
                                        placeholder="Type and press Enter…" />
                                    <button type="button" className="btn-secondary" onClick={addAmenity}>Add</button>
                                </div>
                            </div>
                        </div>

                        {/* Right col — image upload */}
                        <div className="rfm-image-col">
                            <label>Image</label>
                            <div
                                className={`rfm-dropzone ${imagePreview ? 'rfm-dropzone-has-image' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                onClick={() => fileRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" className="rfm-preview" />
                                ) : (
                                    <div className="rfm-dropzone-placeholder">
                                        <ImageIcon size={32} />
                                        <p>Drop image here<br /><small>or click to browse</small></p>
                                    </div>
                                )}
                                {uploading && (
                                    <div className="rfm-upload-overlay">
                                        <Loader size={24} className="spin-anim" />
                                        <span>Uploading…</span>
                                    </div>
                                )}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={e => handleFile(e.target.files[0])} />
                            <p className="rfm-upload-hint">
                                JPG, PNG or WebP · Max 5 MB<br />
                                Drag &amp; drop or click to browse
                            </p>
                            {imagePreview && (
                                <button type="button" className="rfm-clear-img"
                                    onClick={() => { setImageFile(null); setImagePreview(''); set('imageUrl', ''); }}>
                                    Remove image
                                </button>
                            )}
                        </div>
                    </div>

                    {error && <div className="login-error" style={{ margin: '0 var(--space-lg) var(--space-md)' }}>{error}</div>}

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button id="rfm-save-btn" type="submit" className="btn-primary" disabled={saving || uploading}>
                            {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : isEdit ? 'Save Changes' : 'Create Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceFormModal;
