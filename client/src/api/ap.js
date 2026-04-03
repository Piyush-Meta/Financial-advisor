import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const sendAiChat = (data) => apiClient.post('/api/ai/chat', data)
export const loginUser = (data) => apiClient.post('/api/auth/login', data)
export const registerUser = (data) => apiClient.post('/api/auth/register', data)
export const fetchBudget = (userId) => apiClient.get(`/api/budget/${userId}`)
export const saveBudget = (data) => apiClient.post('/api/budget', data)

export { API_BASE_URL }