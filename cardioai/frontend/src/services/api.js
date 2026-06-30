import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
    timeout: 60_000,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('cardioai_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('cardioai_token')
            localStorage.removeItem('cardioai_user')
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(err)
    }
)

export default api

export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (email, password) => {
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', password)
        return api.post('/auth/login', form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
    },
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
    getUsers: () => api.get('/auth/users'),
    getPreferences: () => api.get('/auth/preferences'),
    updatePreferences: (data) => api.put('/auth/preferences', data),
}

export const predictApi = {
    predict: (data) => api.post('/predictions/predict', data),
    predictGuest: (data) => api.post('/predictions/predict/guest', data),
    list: (skip = 0, limit = 20) => api.get(`/predictions/?skip=${skip}&limit=${limit}`),
    history: (skip = 0, limit = 50) => api.get(`/predictions/history?skip=${skip}&limit=${limit}`),
    search: (q) => api.get(`/predictions/search?q=${encodeURIComponent(q)}`),
    getById: (id) => api.get(`/predictions/${id}`),
    explain: (id) => api.get(`/predictions/${id}/explain`),
    report: (id) => api.get(`/predictions/${id}/report`, { responseType: 'blob' }),
    fhir: (id) => api.get(`/predictions/${id}/fhir`),
    timeline: (uid) => api.get(`/predictions/patients/${uid}/timeline`),
    delete: (id) => api.delete(`/predictions/${id}`),
    stats: () => api.get('/predictions/stats'),
}

export const triageApi = {
    list: (status = 'pending') => api.get(`/triage/?status_filter=${status}`),
    update: (id, data) => api.patch(`/triage/${id}`, data),
}

export const auditApi = {
    list: (skip = 0, limit = 50) => api.get(`/audit/?skip=${skip}&limit=${limit}`),
}

export const batchApi = {
    upload: (file) => {
        const form = new FormData()
        form.append('file', file)
        return api.post('/batch/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
    getJob: (id) => api.get(`/batch/${id}`),
    getResults: (id) => api.get(`/batch/${id}/results`),
}

export const healthApi = {
    check: () => api.get('/health', { baseURL: BASE_URL ? `${BASE_URL}/api` : '/api' }),
}

export const getWsUrl = () => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = BASE_URL ? new URL(BASE_URL).host : window.location.host
    return `${proto}//${host}/api/v1/ws/triage`
}
