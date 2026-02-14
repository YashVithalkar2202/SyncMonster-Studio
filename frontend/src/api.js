import axios from 'axios';

const API_BASE = "http://localhost:8000";

// Create an axios instance with the base URL
const api = axios.create({
    baseURL: API_BASE
});

/**
 * AUTHENTICATION HELPER
 * Sends credentials to the /token endpoint and stores the JWT in localStorage.
 */
export const loginUser = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    // We use the base axios here because we don't need the interceptor for the login call itself
    const res = await axios.post(`${API_BASE}/token`, formData);
    
    // Store the access token for future requests
    localStorage.setItem('token', res.data.access_token);
    return res.data;
};

/**
 * LOGOUT HELPER
 * Clears the session from the browser.
 */
export const logoutUser = () => {
    localStorage.removeItem('token');
};

/**
 * AXIOS INTERCEPTOR
 * This "middleware" runs before every request. It checks for a token in 
 * localStorage and injects it into the Authorization header.
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

// Fetches all videos (supports pagination, search, and status filtering)
export const getVideos = (params) => api.get('/videos/', { params });

// Fetches a single video by ID
export const getVideo = (id) => api.get(`/videos/${id}`);

// Creates a new video (Requires Authentication)
export const createVideo = (data) => api.post('/videos/', data);

// Triggers the video split process (Requires Authentication)
export const splitVideo = (id, segments) => api.post(`/videos/${id}/split`, { segments });


export default api;