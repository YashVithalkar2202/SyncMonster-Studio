import axios from 'axios';

const API_BASE = "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE
});

export const getVideos = (params) => api.get('/videos/', { params });
export const getVideo = (id) => api.get(`/videos/${id}`);
export const createVideo = (data) => api.post('/videos/', data);
export const splitVideo = (id, segments) => api.post(`/videos/${id}/split`, { segments });

export default api;