import api from './api';

export const getCurrentUser = async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
};

// To trigger login, normally you'd just redirect:
export const triggerGoogleLogin = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
};

export const triggerGithubLogin = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/github';
};

// If email/password was implemented:
export const login = async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
};
