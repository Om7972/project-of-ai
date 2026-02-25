import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30_000,
})

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('cardioai_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Handle 401 globally — clear auth and redirect to login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('cardioai_token')
            localStorage.removeItem('cardioai_user')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (email, password) => {
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', password)
        return api.post('/auth/login', form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
    },
    me: () => api.get('/auth/me'),
}

// ── Predictions ───────────────────────────────────────────────
export const predictApi = {
    // Authenticated — saves to DB
    predict: (data) => api.post('/predictions/predict', data),
    // Guest — not saved
    predictGuest: (data) => api.post('/predictions/predict/guest', data),
    // History
    list: (skip = 0, limit = 20) => api.get(`/predictions/?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/predictions/${id}`),
    delete: (id) => api.delete(`/predictions/${id}`),
    // Stats
    stats: () => api.get('/predictions/stats'),
}

// ── Health ────────────────────────────────────────────────────
export const healthApi = {
    check: () => api.get('/health', { baseURL: BASE_URL ? `${BASE_URL}/api` : '/api' }),
}
