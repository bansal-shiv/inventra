import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL, timeout: 12000 })

export function readError(err) {
  if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
    return "Couldn't reach the server. Is the backend running?"
  }
  if (err?.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.'
  }
  const detail = err?.response?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
  }
  if (typeof detail === 'string') return detail
  return err?.message || 'Something went wrong'
}

export const Products = {
  list: () => api.get('/products').then((r) => r.data),
  create: (body) => api.post('/products', body).then((r) => r.data),
  update: (id, body) => api.put(`/products/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`),
}

export const Customers = {
  list: () => api.get('/customers').then((r) => r.data),
  create: (body) => api.post('/customers', body).then((r) => r.data),
  update: (id, body) => api.put(`/customers/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/customers/${id}`),
}

export const Orders = {
  list: () => api.get('/orders').then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (body) => api.post('/orders', body).then((r) => r.data),
  remove: (id) => api.delete(`/orders/${id}`),
}

export const Stats = {
  dashboard: () => api.get('/stats').then((r) => r.data),
}

export default api
