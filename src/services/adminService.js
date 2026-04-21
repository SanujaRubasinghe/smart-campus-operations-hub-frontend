import api from './api';

// ── Bookings ─────────────────────────────────────────
export const getAllBookingsAdmin = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/api/bookings?${params.toString()}`);
    const embedded = response.data._embedded;
    if (embedded) {
        return embedded.bookingModelList || embedded.bookingList || embedded.bookings || [];
    }
    return Array.isArray(response.data) ? response.data : [];
};

export const approveBooking = async (id, adminNote = '') => {
    const response = await api.put(`/api/bookings/${id}/approve`, { adminNote });
    return response.data;
};

export const rejectBooking = async (id, rejectionReason = '') => {
    const response = await api.put(`/api/bookings/${id}/reject`, { rejectionReason });
    return response.data;
};

// ── Tickets ───────────────────────────────────────────
export const getAllTicketsAdmin = async () => {
    const response = await api.get('/api/tickets');
    return Array.isArray(response.data) ? response.data : [];
};

export const updateTicketStatus = async (id, status, resolutionNotes = null, rejectionReason = null) => {
    const payload = { status };
    if (resolutionNotes) payload.resolutionNotes = resolutionNotes;
    if (rejectionReason) payload.rejectionReason = rejectionReason;
    const response = await api.patch(`/api/tickets/${id}/status`, payload);
    return response.data;
};

export const assignTechnician = async (id, technicianName) => {
    const response = await api.patch(`/api/tickets/${id}/assign`, { assignedTechnicianName: technicianName });
    return response.data;
};

// ── Resources (Admin CRUD) ────────────────────────
export const getAllResourcesAdmin = async () => {
    const response = await api.get('/api/v1/resources?size=100');
    return response.data.content || response.data._embedded?.resourceList || [];
};

export const createResource = async (resource) => {
    const response = await api.post('/api/v1/resources', resource);
    return response.data;
};

export const updateResource = async (id, resource) => {
    const response = await api.put(`/api/v1/resources/${id}`, resource);
    return response.data;
};

export const deleteResource = async (id) => {
    await api.delete(`/api/v1/resources/${id}`);
};

// ── Admin Management ─────────────────────────────
export const getPendingAdmins = async () => {
    const response = await api.get('/api/admin/users/pending');
    return Array.isArray(response.data) ? response.data : [];
};

export const approveAdmin = async (id) => {
    const response = await api.put(`/api/admin/users/${id}/approve`);
    return response.data;
};

export const rejectAdmin = async (id) => {
    const response = await api.delete(`/api/admin/users/${id}/reject`);
    return response.data;
};
