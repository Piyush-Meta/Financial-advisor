import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  timeout: 20000,
})

export const fetchBudget = (userId) => api.get(`/budget/${userId}`)
export const saveBudget = (payload) => api.post('/budget', payload)
export const sendAiChat = (payload) => api.post('/ai/chat', payload)
export const createUserProfile = (payload) => api.post('/users/profile', payload)
