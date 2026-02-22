import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create an axios instance with the base URL
const api = axios.create({
    baseURL: API_BASE
});

/**
 * AUTHENTICATION HELPER
 */
export const loginUser = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const res = await axios.post(`${API_BASE}/token`, formData);
    
    // Store the access token for future requests
    localStorage.setItem('token', res.data.access_token);
    return res.data;
};

/**
 * LOGOUT HELPER
 */
export const logoutUser = () => {
    localStorage.removeItem('token');
};

/**
 * AXIOS INTERCEPTOR
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * VIDEO MANAGEMENT API CALLS
 */
export const getVideos = (params) => api.get('/videos/', { params });
export const getVideo = (id) => api.get(`/videos/${id}`);
export const createVideo = (data) => api.post('/videos/', data);
export const splitVideo = (id, segments) => api.post(`/videos/${id}/split`, { segments });

export default api;