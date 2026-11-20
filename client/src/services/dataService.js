import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

export const customerService = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
};

export const testService = {
  create: (data) => api.post('/tests', data),
  getByCustomer: (id) => api.get(`/tests/customer/${id}`),
  getAll: (params) => api.get('/tests', { params }),
};

export const reportService = {
  getDaily: (date) => api.get('/reports/daily', { params: { date } }),
  getSummary: () => api.get('/reports/summary'),
  getWeekly: () => api.get('/reports/weekly'),
};

export const userService = {
  getAll: () => api.get('/users'),
  delete: (id) => api.delete(`/users/${id}`),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
};
