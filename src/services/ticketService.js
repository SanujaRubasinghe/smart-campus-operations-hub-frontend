import api from './api';

export const getAllTickets = async () => {
    const response = await api.get('/api/tickets');
    return Array.isArray(response.data) ? response.data : [];
};

export const getTicketById = async (id) => {
    const response = await api.get(`/api/tickets/${id}`);
    return response.data;
};

export const createTicket = async (ticketData) => {
    const response = await api.post('/api/tickets', ticketData);
    return response.data;
};

export const updateTicketStatus = async (id, status) => {
    const response = await api.patch(`/api/tickets/${id}/status`, { status });
    return response.data;
};

export const addComment = async (ticketId, content, authorName) => {
    const response = await api.post(`/api/tickets/${ticketId}/comments`, {
        commentText:   content,
        commenterName: authorName,
    });
    return response.data;
};

export const createTicketWithImages = async (formData) => {
    const response = await api.post('/api/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteTicket = async (id) => {
    await api.delete(`/api/tickets/${id}`);
};
