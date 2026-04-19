import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Filter, Monitor, Users, Cpu, DoorOpen, X, Sparkles, CheckCircle, RefreshCw, Layers
} from 'lucide-react';
import { getResources, getRecommendations } from '../services/resourceService';
import BookingModal from '../components/BookingModal';
import './Resources.css';

const TYPE_ICONS = {
    LECTURE_HALL: Users,
    LAB: Cpu,
    MEETING_ROOM: DoorOpen,
    EQUIPMENT: Monitor,
};

const RESOURCE_TYPES = ['ALL', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

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

const Resources = () => {
    const [resources, setResources]         = useState([]);
    const [loading, setLoading]             = useState(true);
    const [search, setSearch]               = useState('');
    const [isAiSearch, setIsAiSearch]       = useState(false);
    const [aiLoading, setAiLoading]         = useState(false);
    const [typeFilter, setTypeFilter]       = useState('ALL');
    const [capacityFilter, setCapacity]     = useState('');
    const [showFilters, setShowFilters]     = useState(false);
    const [bookingResource, setBookingResource] = useState(null);
    const [toast, setToast]                 = useState(null);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (typeFilter !== 'ALL') filters.type = typeFilter;
            if (capacityFilter) filters.minCapacity = capacityFilter;
            const data = await getResources(filters);
            setResources(data.content || data || []);
        } catch (_) {
            setResources([]);
        } finally {
            setLoading(false);
        }
    }, [typeFilter, capacityFilter]);

    useEffect(() => { fetchResources(); }, [fetchResources]);

    // Standard filter (runs as you type — no API call)
    const handleSearchChange = (value) => {
        setSearch(value);
        if (isAiSearch && value.trim().length === 0) {
            setIsAiSearch(false);
            fetchResources();
        }
    };

    // Explicitly trigger AI search (Enter key or Sparkles button)
    const triggerAiSearch = async () => {
        const query = search.trim();
        if (!query) return;
        setIsAiSearch(true);
        setAiLoading(true);
        try {
            const results = await getRecommendations(query);
            setResources(Array.isArray(results) ? results : []);
        } catch (_) {
            await fetchResources();
            setIsAiSearch(false);
        } finally {
            setAiLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') triggerAiSearch();
    };

    const resetSearch = () => {
        setSearch('');
        setIsAiSearch(false);
        fetchResources();
    };

    const filteredResources = isAiSearch
        ? resources
        : resources.filter(r =>
            r.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.type?.toLowerCase().includes(search.toLowerCase()) ||
            r.location?.toLowerCase().includes(search.toLowerCase())
        );

    const getStatusKey = (status) => (status || '').toLowerCase().replace(/_/g, '_');

    const IconComp = (type) => {
        const Ic = TYPE_ICONS[type] || Monitor;
        return <Ic size={40} opacity={0.4} />;
    };

    const handleBookingSuccess = () => {
        setBookingResource(null);
        setToast({ msg: 'Booking submitted successfully! Awaiting approval.', type: 'success' });
    };

    return (
        <div className="resources-page">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            <div className="page-header">
                <div>
                    <h1>Facilities &amp; Assets</h1>
                    <p className="subtitle">Browse and book campus resources</p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="resources-toolbar glass-panel">
                <div className="search-row">
                    {aiLoading
                        ? <RefreshCw size={18} className="search-icon ai spinning" />
                        : isAiSearch
                            ? <Sparkles size={18} className="search-icon ai" />
                            : <Search size={18} className="search-icon" />
                    }
                    <input
                        id="resource-search-input"
                        type="text"
                        placeholder="Search by name, or describe what you need and press Enter / ✦ for AI…"
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="search-input"
                    />
                    {search && (
                        <button className="icon-btn" onClick={resetSearch} title="Clear search">
                            <X size={16} />
                        </button>
                    )}
                    {/* Explicit AI search button */}
                    <button
                        id="ai-search-btn"
                        className={`icon-btn ${isAiSearch ? 'active-filter' : ''}`}
                        onClick={triggerAiSearch}
                        disabled={!search.trim() || aiLoading}
                        title="Search with AI (or press Enter)"
                        style={{ color: 'var(--accent-purple)' }}
                    >
                        <Sparkles size={18} />
                    </button>
                    <button
                        id="filter-toggle-btn"
                        className={`icon-btn ${showFilters ? 'active-filter' : ''}`}
                        onClick={() => setShowFilters(s => !s)}
                        title="Filters"
                    >
                        <Filter size={18} />
                    </button>
                    <button className="icon-btn" onClick={fetchResources} title="Refresh">
                        <RefreshCw size={16} />
                    </button>
                </div>

                {isAiSearch && (
                    <div className="ai-banner">
                        <Sparkles size={13} /> AI Recommendation mode — showing best matches for your query
                        <button className="ai-banner-reset" onClick={resetSearch}>Show all</button>
                    </div>
                )}

                {showFilters && (
                    <div className="filter-row">
                        <div className="tab-bar">
                            {RESOURCE_TYPES.map(t => (
                                <button
                                    key={t}
                                    id={`filter-type-${t.toLowerCase()}`}
                                    className={`tab-btn ${typeFilter === t ? 'active' : ''}`}
                                    onClick={() => setTypeFilter(t)}
                                >
                                    {t === 'ALL' ? 'All Types' : t.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                        <div className="capacity-filter">
                            <label>Min Capacity</label>
                            <input
                                id="capacity-filter-input"
                                type="number"
                                className="form-control"
                                placeholder="e.g. 20"
                                value={capacityFilter}
                                onChange={e => setCapacity(e.target.value)}
                                min={1}
                                style={{ width: 100 }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {(loading || aiLoading) ? (
                <div className="spinner-container"><div className="spinner" /></div>
            ) : filteredResources.length === 0 ? (
                <div className="empty-state card">
                    <Layers size={42} />
                    <h3>No resources found</h3>
                    <p>{isAiSearch ? 'Try rephrasing your search.' : 'Try adjusting your filters.'}</p>
                </div>
            ) : (
                <div className="resources-grid">
                    {filteredResources.map(resource => (
                        <div className="card resource-card" key={resource.id} id={`resource-card-${resource.id}`}>
                            <div className="resource-image-placeholder">
                                {resource.imageUrl
                                    ? <img src={resource.imageUrl} alt={resource.name} className="resource-img" />
                                    : IconComp(resource.type)
                                }
                                <span className={`status-badge ${getStatusKey(resource.status)} resource-status-badge`}>
                                    {(resource.status || '').replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div className="resource-info">
                                <div className="resource-header">
                                    <h3>{resource.name}</h3>
                                    <span className="chip">{(resource.type || '').replace(/_/g, ' ')}</span>
                                </div>
                                <p className="resource-meta">{resource.location || 'Location not set'}</p>

                                {resource.amenities?.length > 0 && (
                                    <div className="amenities-row">
                                        {resource.amenities.map((a, i) => (
                                            <span key={i} className="chip">{a}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="resource-footer">
                                    <span className="capacity-badge">
                                        <Users size={13} /> {resource.capacity ?? '—'}
                                    </span>
                                    <button
                                        id={`book-btn-${resource.id}`}
                                        className="btn-primary"
                                        disabled={resource.status !== 'ACTIVE'}
                                        onClick={() => setBookingResource(resource)}
                                    >
                                        {resource.status === 'ACTIVE' ? 'Book Now' : 'Unavailable'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Booking Modal */}
            {bookingResource && (
                <BookingModal
                    resource={bookingResource}
                    onClose={() => setBookingResource(null)}
                    onSuccess={handleBookingSuccess}
                />
            )}
        </div>
    );
};

export default Resources;
