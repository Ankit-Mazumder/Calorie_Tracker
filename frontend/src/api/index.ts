import axios from 'axios';
import config from '../../../config.json';

const api = axios.create({
    baseURL: config.frontend_api_base_url,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API calls
export const login = async (data: any) => {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    const response = await api.post('/users/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
};

export const register = async (data: any) => {
    const response = await api.post('/users/register', data);
    return response.data;
};

export const getUserProfile = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateUserProfile = async (data: any) => {
    const response = await api.put('/users/me', data);
    return response.data;
};

// Meals API calls
export const getMeals = async (params: any = {}) => {
    const response = await api.get('/meals', { params });
    return response.data;
};

export const createMeal = async (data: any) => {
    const response = await api.post('/meals', data);
    return response.data;
};

export const deleteMeal = async (id: any) => {
    const response = await api.delete(`/meals/${id}`);
    return response.data;
};

export const uploadMealsPDF = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/meals/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// Goals API calls
export const getGoals = async () => {
    const response = await api.get('/goals/');
    return response.data;
};

export const setGoal = async (data: any) => {
    const response = await api.post('/goals/', data);
    return response.data;
};

export const updateGoal = async (id: number | string, data: any) => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
};

// Report API calls
export const getSummary = async (startDate: any, endDate: any) => {
    const response = await api.get('/reports/summary', { params: { start_date: startDate, end_date: endDate } });
    return response.data;
};

// AI Features API calls
export const extractNutritionFromImage = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/ai/extract-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const chatWithAI = async (message: any) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
};

export default api;
