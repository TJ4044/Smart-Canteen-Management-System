import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

// ── Menu ──────────────────────────────────────────────────────
export const menuAPI = {
  getAll:         ()       => api.get('/menu'),
  getAllAdmin:     ()       => api.get('/menu/all'),
  getByCategory:  (cat)    => api.get(`/menu/category/${cat}`),
  create:         (data)   => api.post('/menu', data),
  update:         (id, d)  => api.put(`/menu/${id}`, d),
  delete:         (id)     => api.delete(`/menu/${id}`),
  toggle:         (id)     => api.patch(`/menu/${id}/toggle`),
}

// ── Orders ────────────────────────────────────────────────────
export const orderAPI = {
  place:         (data)   => api.post('/orders', data),
  getMyOrders:   ()       => api.get('/orders/my'),
  getAll:        ()       => api.get('/orders/all'),
  getActive:     ()       => api.get('/orders/active'),
  getById:       (id)     => api.get(`/orders/${id}`),
  updateStatus:  (id, s)  => api.patch(`/orders/${id}/status`, { status: s }),
  cancel:        (id)     => api.patch(`/orders/${id}/cancel`),
}

// ── Wallet ────────────────────────────────────────────────────
export const walletAPI = {
  getBalance:      ()    => api.get('/wallet'),
  recharge:        (amt) => api.post('/wallet/recharge', { amount: amt }),
  getTransactions: ()    => api.get('/wallet/transactions'),
}

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  getStats:    ()       => api.get('/admin/stats'),
  getUsers:    ()       => api.get('/admin/users'),
  createUser:  (data)   => api.post('/admin/users', data),
  toggleUser:  (id)     => api.patch(`/admin/users/${id}/toggle`),
  deleteUser:  (id)     => api.delete(`/admin/users/${id}`),
}
