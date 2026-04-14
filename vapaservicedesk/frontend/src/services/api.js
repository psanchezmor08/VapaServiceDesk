import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('sd_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authAPI = {
  register: async (data) => {
    const res = await axios.post(`${API}/auth/register`, data);
    return res.data;
  },
  login: async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await axios.get(`${API}/auth/me`, { headers: getAuthHeader() });
    return res.data;
  },
  changePassword: async (data) => {
    const res = await axios.put(`${API}/auth/change-password`, data, { headers: getAuthHeader() });
    return res.data;
  },
  getGoogleUrl: async () => {
    const res = await axios.get(`${API}/auth/google`);
    return res.data;
  }
};

export const dashboardAPI = {
  get: async () => {
    const res = await axios.get(`${API}/dashboard`, { headers: getAuthHeader() });
    return res.data;
  }
};

export const ticketsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await axios.get(`${API}/tickets${params ? '?' + params : ''}`, { headers: getAuthHeader() });
    return res.data;
  },
  get: async (id) => {
    const res = await axios.get(`${API}/tickets/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post(`${API}/tickets`, data, { headers: getAuthHeader() });
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.put(`${API}/tickets/${id}`, data, { headers: getAuthHeader() });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API}/tickets/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  addComment: async (id, data) => {
    const res = await axios.post(`${API}/tickets/${id}/comments`, data, { headers: getAuthHeader() });
    return res.data;
  }
};

export const clientsAPI = {
  getAll: async () => {
    const res = await axios.get(`${API}/clients`, { headers: getAuthHeader() });
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post(`${API}/clients`, data, { headers: getAuthHeader() });
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.put(`${API}/clients/${id}`, data, { headers: getAuthHeader() });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API}/clients/${id}`, { headers: getAuthHeader() });
    return res.data;
  }
};

export const projectsAPI = {
  getAll: async (clientId) => {
    const url = clientId ? `${API}/projects?client_id=${clientId}` : `${API}/projects`;
    const res = await axios.get(url, { headers: getAuthHeader() });
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post(`${API}/projects`, data, { headers: getAuthHeader() });
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.put(`${API}/projects/${id}`, data, { headers: getAuthHeader() });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API}/projects/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  getTasks: async (projectId) => {
    const res = await axios.get(`${API}/projects/${projectId}/tasks`, { headers: getAuthHeader() });
    return res.data;
  },
  createTask: async (projectId, data) => {
    const res = await axios.post(`${API}/projects/${projectId}/tasks`, data, { headers: getAuthHeader() });
    return res.data;
  },
  updateTask: async (projectId, taskId, data) => {
    const res = await axios.put(`${API}/projects/${projectId}/tasks/${taskId}`, data, { headers: getAuthHeader() });
    return res.data;
  },
  deleteTask: async (projectId, taskId) => {
    const res = await axios.delete(`${API}/projects/${projectId}/tasks/${taskId}`, { headers: getAuthHeader() });
    return res.data;
  }
};

export const workersAPI = {
  getAll: async () => {
    const res = await axios.get(`${API}/workers`, { headers: getAuthHeader() });
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post(`${API}/workers`, data, { headers: getAuthHeader() });
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.put(`${API}/workers/${id}`, data, { headers: getAuthHeader() });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API}/workers/${id}`, { headers: getAuthHeader() });
    return res.data;
  }
};

export const usersAPI = {
  getAll: async () => {
    const res = await axios.get(`${API}/users`, { headers: getAuthHeader() });
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post(`${API}/users`, data, { headers: getAuthHeader() });
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.put(`${API}/users/${id}`, data, { headers: getAuthHeader() });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API}/users/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  resetPassword: async (id, new_password) => {
    const res = await axios.put(`${API}/users/${id}/reset-password`, { new_password }, { headers: getAuthHeader() });
    return res.data;
  }
};

export const invoicesAPI = {
  getAll: async (status) => {
    const url = status ? `${API}/invoices?status=${status}` : `${API}/invoices`;
    const res = await axios.get(url, { headers: getAuthHeader() });
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post(`${API}/invoices`, data, { headers: getAuthHeader() });
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.put(`${API}/invoices/${id}`, data, { headers: getAuthHeader() });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API}/invoices/${id}`, { headers: getAuthHeader() });
    return res.data;
  }
};

export const paymentsAPI = {
  getScheduled: async () => {
    const res = await axios.get(`${API}/payments/scheduled`, { headers: getAuthHeader() });
    return res.data;
  },
  createScheduled: async (data) => {
    const res = await axios.post(`${API}/payments/scheduled`, data, { headers: getAuthHeader() });
    return res.data;
  },
  updateScheduled: async (id, data) => {
    const res = await axios.put(`${API}/payments/scheduled/${id}`, data, { headers: getAuthHeader() });
    return res.data;
  },
  deleteScheduled: async (id) => {
    const res = await axios.delete(`${API}/payments/scheduled/${id}`, { headers: getAuthHeader() });
    return res.data;
  }
};

export const financeAPI = {
  getTransactions: async () => {
    const res = await axios.get(`${API}/transactions`, { headers: getAuthHeader() });
    return res.data;
  },
  createTransaction: async (data) => {
    const res = await axios.post(`${API}/transactions`, data, { headers: getAuthHeader() });
    return res.data;
  },
  deleteTransaction: async (id) => {
    const res = await axios.delete(`${API}/transactions/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  getBalance: async () => {
    const res = await axios.get(`${API}/balance`, { headers: getAuthHeader() });
    return res.data;
  }
};
