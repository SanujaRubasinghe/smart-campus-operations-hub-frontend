import axios from 'axios';

// Configure the Axios instance to point to the Spring Boot backend
const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api/v1/resources',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Optional: Global error interceptor to keep logs clean
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

/**
 * Fetches the list of facilities with optional filters and pagination.
 */
export const fetchCatalogue = async (page = 0, size = 20, type = '', minCapacity = '', name = '') => {
  const params = { page, size };
  if (type) params.type = type;
  if (minCapacity) params.minCapacity = minCapacity;
  if (name) params.name = name;

  const response = await apiClient.get('', { params });
  return response.data;
};

/**
 * Triggers the AI recommendation engine on the backend.
 */
export const fetchRecommendations = async (intentText) => {
  const response = await apiClient.post('/recommendations', {
    intent: intentText,
  });
  return response.data;
};

/**
 * Creates a new resource.
 */
export const createResource = async (resourceData) => {
  const response = await apiClient.post('', resourceData);
  return response.data;
};

/**
 * Updates an existing resource.
 */
export const updateResource = async (id, resourceData) => {
  const response = await apiClient.put(`/${id}`, resourceData);
  return response.data;
};

/**
 * Deletes a resource by its ID.
 */
export const deleteResource = async (id) => {
  const response = await apiClient.delete(`/${id}`);
  return response.data;
};

