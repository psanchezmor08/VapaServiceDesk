import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('vapaone_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const http = (method, url, data) => axios({ method, url: `${API}${url}`, data, headers: getAuthHeader() }).then(r => r.data);

export const authAPI = {
  login: (email, password) => {
    const form = new FormData();
    form.append('username', email);
    form.append('password', password);
    return axios.post(`${API}/auth/token`, form).then(r => r.data);
  },
  me: () => http('get', '/auth/me'),
  register: (data) => http('post', '/auth/register', data),
};

export const usersAPI = {
  list: () => http('get', '/users'),
  create: (data) => http('post', '/users', data),
  resetPassword: (id, new_password) => http('put', `/users/${id}/password`, { new_password }),
  changeMyPassword: (data) => http('put', '/users/me/password', data),
  delete: (id) => http('delete', `/users/${id}`),
};

export const customersAPI = {
  list: () => http('get', '/customers'),
  create: (data) => http('post', '/customers', data),
  update: (id, data) => http('put', `/customers/${id}`, data),
  delete: (id) => http('delete', `/customers/${id}`),
};

export const ticketsAPI = {
  list: (params) => axios.get(`${API}/tickets`, { headers: getAuthHeader(), params }).then(r => r.data),
  get: (id) => http('get', `/tickets/${id}`),
  create: (data) => http('post', '/tickets', data),
  update: (id, data) => http('put', `/tickets/${id}`, data),
  addComment: (id, data) => http('post', `/tickets/${id}/comments`, data),
  delete: (id) => http('delete', `/tickets/${id}`),
};

export const invoicesAPI = {
  list: () => http('get', '/invoices'),
  create: (data) => http('post', '/invoices', data),
  updateStatus: (id, status) => http('put', `/invoices/${id}/status?status=${status}`),
};

export const employeesAPI = {
  list: () => http('get', '/employees'),
  create: (data) => http('post', '/employees', data),
  update: (id, data) => http('put', `/employees/${id}`, data),
  delete: (id) => http('delete', `/employees/${id}`),
};

export const vacationsAPI = {
  list: () => http('get', '/vacations'),
  create: (data) => http('post', '/vacations', data),
  updateStatus: (id, status) => http('put', `/vacations/${id}/status?status=${status}`),
};