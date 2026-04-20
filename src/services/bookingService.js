import api from './api';

export const createBooking = async (bookingData, userId) => {
    const response = await api.post(`/api/bookings?userId=${userId}`, bookingData);
    return response.data;
};

export const getMyBookings = async (userId, status = '') => {
    let url = `/api/bookings/my?userId=${userId}`;
    if (status) url += `&status=${status}`;
    const response = await api.get(url);
    const embedded = response.data._embedded;
    if (embedded) {
        // Try common HATEOAS key variants
        return embedded.bookingModelList || embedded.bookingList || embedded.bookings || [];
    }
    return Array.isArray(response.data) ? response.data : [];
};

export const getAllBookings = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/api/bookings?${params.toString()}`);
    const embedded = response.data._embedded;
    if (embedded) {
        return embedded.bookingModelList || embedded.bookingList || embedded.bookings || [];
    }
    return Array.isArray(response.data) ? response.data : [];
};

export const cancelBooking = async (id) => {
    const response = await api.put(`/api/bookings/${id}/cancel`);
    return response.data;
};

export const deleteBooking = async (id) => {
    await api.delete(`/api/bookings/${id}`);
};

export const checkInByQr = async (resourceId, qrSecret) => {
    const response = await api.post(`/api/checkin/room/${resourceId}`, { qrSecret });
    return response.data;
};
