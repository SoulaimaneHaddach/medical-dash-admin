/* eslint-disable @typescript-eslint/no-explicit-any */

// lib/api.ts
import axios from 'axios';
import { message } from 'antd';
import { tSync, LocaleKey } from './i18n'

// Create axios instance
const base = (process.env.NEXT_PUBLIC_API_URL ?? 'https://vsrwljl6-8080.uks1.devtunnels.ms/api').replace(/\/$/, '')
const api = axios.create({
  baseURL: base,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Prevent repeated handling of the same 403 (multiple concurrent requests)

// Flag to prevent showing multiple forbidden messages/redirects at once.
// We reset it after a short delay so future real 403s can still be handled.
let _handlingForbidden = false



// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // ensure headers object exists and set Authorization
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers = config.headers || {}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
    // Log the full error to the console for debugging
    if (typeof console !== 'undefined') console.error('API error', error.response || error)

    // Show error message
    let locale: LocaleKey = 'en'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale') as LocaleKey | null
      if (stored) locale = stored
    }
    // prefer server message, then axios error.message (network errors), then generic translation
    message.error(
      error.response?.data?.message || error.message || tSync('common.connectionError', locale)
    );
    
    if (error.response?.status === 401) {
      // Redirect to login (only once)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        if (!window.location.href.includes('/login')) window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    if (error.response?.status === 403) {
      // Do not treat auth/login/bootstrap requests as global forbidden events
      const reqUrl = error?.config?.url || ''
      const skipPaths = ['/auth/login', '/admin/login', '/admin/auth/login', '/admin/admins/bootstrap', '/admin/admins/bootstrap']
      const isAuthReq = skipPaths.some(p => reqUrl.includes(p))
      if (isAuthReq) {
        return Promise.reject(error)
      }

      // Handle forbidden once to avoid multiple toasts and redirects
      if (typeof window !== 'undefined' && !_handlingForbidden) {
        _handlingForbidden = true
        // Reset the flag after a short delay so future 403s can be handled again.
        setTimeout(() => { try { _handlingForbidden = false } catch {} }, 5000)
        const token = localStorage.getItem('adminToken')
        // show a single message then redirect
        try { message.error(error.response?.data?.message || 'Forbidden') } catch {}
        if (typeof window !== 'undefined') {
          const cur = window.location.pathname || ''
          if (token) {
            if (!cur.includes('/not-authorized')) window.location.href = '/not-authorized'
          } else {
            // if already on login, do nothing
            localStorage.removeItem('adminToken')
            if (!cur.includes('/login')) window.location.href = '/login'
          }
        }
      }
      return Promise.reject(error)
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  // prefer explicit /admin/auth/login, fall back to /admin/login if missing
  login: (email: string, password: string) =>
    api.post('/admin/auth/login', { email, password }).catch(() =>
      api.post('/admin/login', { email, password })
    ),
  me: () => api.get('/admin/me'),
};

export const doctorsAPI = {
  getAll: (params?: any) => api.get('/admin/doctors', { params }),
  getById: (id: string) => api.get(`/admin/doctors/${id}`),
  create: (data: any) => api.post('/admin/doctors', data),
  batch: (data: any) => api.post('/admin/doctors/batch', data),
  update: (id: string, data: any) => api.patch(`/admin/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/admin/doctors/${id}`),
  approve: (id: string) => api.post(`/admin/doctors/${id}/approve`),
  reject: (id: string) => api.post(`/admin/doctors/${id}/reject`),
};

export const bookingsAPI = {
  getAll: (params?: any) => api.get('/admin/bookings', { params }),
  getById: (id: string) => api.get(`/admin/bookings/${id}`),
  update: (id: string, data: any) => api.patch(`/admin/bookings/${id}`, data),
  cancel: (id: string, data?: any) => api.post(`/admin/bookings/${id}/cancel`, data),
  confirm: (id: string) => api.post(`/admin/bookings/${id}/confirm`),
};
  

export const logsAPI = {
  list: async (params?: any) => {
    try {
      return await api.get('/admin/logs', { params })
    } catch (err: any) {
      // Avoid doubling `/api` if the base already contains it.
      // Only try the `/api`-prefixed path when the base does NOT already end with `/api`.
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.get('/api/admin/logs', { params })
      }
      throw err
    }
  }
}

export const usersAPI = {
  getAll: async (params?: any) => {
    try {
      return await api.get('/admin/users', { params })
    } catch (err: any) {
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.get('/api/admin/users', { params })
      }
      throw err
    }
  },
  getById: async (id: string) => {
    try {
      return await api.get(`/admin/users/${id}`)
    } catch (err: any) {
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.get(`/api/admin/users/${id}`)
      }
      throw err
    }
  },
  create: async (data: any) => {
    try {
      return await api.post('/admin/users', data)
    } catch (err: any) {
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.post('/api/admin/users', data)
      }
      throw err
    }
  },
  update: async (id: string, data: any) => {
    try {
      return await api.put(`/admin/users/${id}`, data)
    } catch (err: any) {
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.put(`/api/admin/users/${id}`, data)
      }
      throw err
    }
  },
  delete: async (id: string) => {
    // Build absolute backend origin from configured `base` to avoid hitting the frontend dev server.
    // `base` may include a trailing `/api` segment; strip it to get the origin.
    try {
      const apiOrigin = String(base).replace(/\/api$/, '')
      const fullDelete = `${apiOrigin}/api/admin/users/${id}`
      try {
        return await api.delete(fullDelete)
      } catch (err: any) {
        // If DELETE is not allowed (405), try POST fallback endpoint on the same origin
        if (err?.response?.status === 405) {
          const postFallback = `${apiOrigin}/api/admin/users/${id}/delete`
          return await api.post(postFallback)
        }
        // If 404 or other error, rethrow for global handler
        throw err
      }
    } catch (err: any) {
      // If server responds 404, retry with /api prefix (some bases omit it)
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.delete(`/api/admin/users/${id}`)
      }
      // If DELETE is not allowed (405), try POST fallback endpoint
      if (err?.response?.status === 405) {
        try {
          return await api.post(`/admin/users/${id}/delete`)
        } catch (err2: any) {
          if (err2?.response?.status === 404 && !(base && base.endsWith('/api'))) {
            return api.post(`/api/admin/users/${id}/delete`)
          }
          throw err2
        }
      }
      throw err
    }
  },
  bulkDelete: async (ids: string[]) => {
    try {
      return await api.post('/admin/users/bulk-delete', { ids })
    } catch (err: any) {
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.post('/api/admin/users/bulk-delete', { ids })
      }
      throw err
    }
  },
  ban: async (id: string) => {
    try {
      return await api.post(`/admin/users/${id}/ban`)
    } catch (err: any) {
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.post(`/api/admin/users/${id}/ban`)
      }
      throw err
    }
  },
  unban: async (id: string) => {
    try {
      return await api.post(`/admin/users/${id}/unban`)
    } catch (err: any) {
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.post(`/api/admin/users/${id}/unban`)
      }
      throw err
    }
  },
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

export const statsAPI = {
  get: async () => {
    try {
      return await api.get('/admin/stats')
    } catch (err: any) {
      // If base already ends with '/api', don't retry with '/api' prefixed path (would cause /api/api/...)
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.get('/api/admin/stats')
      }
      throw err
    }
  },
}

export const settingsAPI = {
  get: async () => {
    try {
      return await api.get('/admin/settings')
    } catch (err: any) {
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.get('/api/admin/settings')
      }
      throw err
    }
  },
  update: async (payload: any) => {
    try {
      return await api.post('/admin/settings', payload)
    } catch (err: any) {
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.post('/api/admin/settings', payload)
      }
      throw err
    }
  },
  setMaintenance: async (payload: any) => {
    try {
      return await api.post('/admin/settings/maintenance', payload)
    } catch (err: any) {
      if (err?.response?.status === 404 && !(base && base.endsWith('/api'))) {
        return api.post('/api/admin/settings/maintenance', payload)
      }
      throw err
    }
  },
}

export const securityAPI = {
  get: () => api.get('/admin/security'),
  update: (payload: any) => api.post('/admin/security', payload),
}

export const messagesAPI = {
  send: (payload: any) => api.post('/admin/messages', payload),
  list: (params?: any) => api.get('/admin/messages', { params }),
}

export const backupAPI = {
  create: () => api.post('/admin/backup'),
  restore: (payload?: any) => api.post('/admin/backup/restore', payload),
}

export default api;