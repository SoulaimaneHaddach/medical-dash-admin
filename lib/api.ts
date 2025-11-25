// lib/api.ts
import axios from 'axios';
import { message } from 'antd';
import { tSync, LocaleKey } from './i18n'

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => {
    // Show success message for POST, PUT, DELETE
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method || '')) {
      let locale: LocaleKey = 'en'
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('locale') as LocaleKey | null
        if (stored) locale = stored
      }
      message.success(tSync('common.success', locale))
    }
    return response;
  },
  (error) => {
    // Show error message
    let locale: LocaleKey = 'en'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale') as LocaleKey | null
      if (stored) locale = stored
    }
    message.error(error.response?.data?.message || tSync('common.connectionError', locale));
    
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/admin/login', { email, password }),
  me: () => api.get('/admin/me'),
};

export const doctorsAPI = {
  getAll: (params?: any) => api.get('/admin/doctors', { params }),
  getById: (id: string) => api.get(`/admin/doctors/${id}`),
  create: (data: any) => api.post('/admin/doctors', data),
  update: (id: string, data: any) => api.patch(`/admin/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/admin/doctors/${id}`),
  approve: (id: string) => api.post(`/admin/doctors/${id}/approve`),
  reject: (id: string) => api.post(`/admin/doctors/${id}/reject`),
};

export const bookingsAPI = {
  getAll: (params?: any) => api.get('/admin/bookings', { params }),
  getById: (id: string) => api.get(`/admin/bookings/${id}`),
  update: (id: string, data: any) => api.patch(`/admin/bookings/${id}`, data),
  cancel: (id: string) => api.post(`/admin/bookings/${id}/cancel`),
  confirm: (id: string) => api.post(`/admin/bookings/${id}/confirm`),
};

export const usersAPI = {
  getAll: (params?: any) => api.get('/admin/users', { params }),
  getById: (id: string) => api.get(`/admin/users/${id}`),
  ban: (id: string) => api.post(`/admin/users/${id}/ban`),
  unban: (id: string) => api.post(`/admin/users/${id}/unban`),
};

export const specialtiesAPI = {
  getAll: () => api.get('/admin/specialties'),
  create: (data: any) => api.post('/admin/specialties', data),
  update: (id: string, data: any) => api.patch(`/admin/specialties/${id}`, data),
  delete: (id: string) => api.delete(`/admin/specialties/${id}`),
};

export const reportsAPI = {
  getBookingStats: (from: string, to: string) => 
    api.get('/admin/reports/bookings', { params: { from, to } }),
  getDoctorStats: () => api.get('/admin/reports/doctors'),
};

export default api;