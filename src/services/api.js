import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081'; // Connecting directly to Spring Boot Bootstrapped root

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized errors globally (e.g., redirect to login)
            console.error('Unauthorized access - possibly invalid token');
            localStorage.removeItem('token');
            // Depending on routing setup, window.location.href = '/login' can be done here 
            // but typical react apps might handle this in a Context.
        }
        return Promise.reject(error);
    }
);

export default api;
