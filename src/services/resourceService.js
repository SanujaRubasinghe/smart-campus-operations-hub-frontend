import api from './api';

export const getResources = async (filters = {}) => {
    // Convert filter object to query params
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.type) params.append('type', filters.type);
    if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
    if (filters.location) params.append('location', filters.location);
    if (filters.page) params.append('page', filters.page);
    if (filters.size) params.append('size', filters.size);

    const response = await api.get(`/api/v1/resources?${params.toString()}`);
    return response.data;
};

export const getResourceById = async (id) => {
    const response = await api.get(`/api/v1/resources/${id}`);
    return response.data;
};

export const getRecommendations = async (intent) => {
    const response = await api.post('/api/v1/resources/recommendations', { intent });
    return response.data;
};
