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
 * Fetches the default list of facilities from the database.
 * Passes default pagination parameters.
 */
export const fetchCatalogue = async () => {
  const response = await apiClient.get('', {
    params: { page: 0, size: 20 },
  });
  return response.data;
};

/**
 * Triggers the AI recommendation engine on the backend.
 * Expects { intent: "string" } DTO matching the Java backend.
 */
export const fetchRecommendations = async (intentText) => {
  const response = await apiClient.post('/recommendations', {
    intent: intentText,
  });
  return response.data;
};
