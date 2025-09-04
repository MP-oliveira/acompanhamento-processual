import axios from 'axios';

// Configuração base da API
const API_BASE_URL = 'http://localhost:3001/api';

// Instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Serviços de processos
export const processoService = {
  async getAll() {
    const response = await api.get('/processos');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/processos/${id}`);
    return response.data;
  },

  async create(processoData) {
    const response = await api.post('/processos', processoData);
    return response.data;
  },

  async update(id, processoData) {
    const response = await api.put(`/processos/${id}`, processoData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/processos/${id}`);
    return response.data;
  }
};

// Serviços de alertas
export const alertService = {
  async getAll() {
    const response = await api.get('/alerts');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.patch(`/alerts/${id}/read`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  }
};

export default api;
