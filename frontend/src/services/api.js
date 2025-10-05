import axios from 'axios';

// Configuração base da API - Environment Variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';


// Debug: Log da URL da API

// API configurada para usar Supabase diretamente

// API URL CORRECTED - BACKEND P6XHHMWID - FORCE REBUILD


// Instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Não usar cookies, apenas JWT token
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    
    if (token) {
      // Verifica se o token está expirado
      try {
        // Verificar se o token tem o formato correto (JWT tem 3 partes separadas por ponto)
        const tokenParts = token.split('.');
        
        if (tokenParts.length !== 3) {
          localStorage.removeItem('token');
          return config;
        }
        
        // Verificar se a segunda parte (payload) é base64 válido
        const payload = JSON.parse(atob(tokenParts[1]));
        
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < now;
        
        if (isExpired) {
          localStorage.removeItem('token');
          // Opcional: redirecionar para login
          // window.location.href = '/login';
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
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
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  async login(email, password) {
    try {
      const loginData = { email, password };
      
      const response = await api.post('/auth/login', loginData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
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

// Serviços de consultas
export const consultaService = {
  async getAll(params = {}) {
    const response = await api.get('/consultas', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/consultas/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/consultas', data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/consultas/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/consultas/stats');
    return response.data;
  }
};

// Serviços de relatórios
export const relatorioService = {
  async getAll(params = {}) {
    const response = await api.get('/relatorios', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/relatorios/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/relatorios', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/relatorios/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/relatorios/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/relatorios/stats');
    return response.data;
  }
};

// Serviços de usuários
export const userService = {
  async getAll(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async update(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  async updatePassword(id, passwordData) {
    const response = await api.patch(`/users/${id}/password`, passwordData);
    return response.data;
  },

  async deactivate(id) {
    const response = await api.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  async activate(id) {
    const response = await api.patch(`/users/${id}/activate`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// Serviços de comentários
export const commentService = {
  async getAll(processoId) {
    const response = await api.get(`/comments/processos/${processoId}`);
    return response.data;
  },

  async create(processoId, texto) {
    const response = await api.post(`/comments/processos/${processoId}`, { texto });
    return response.data;
  },

  async update(id, texto) {
    const response = await api.put(`/comments/${id}`, { texto });
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  }
};

// Serviços de custas processuais
export const custaService = {
  async getAll(processoId) {
    const response = await api.get(`/custas/processos/${processoId}`);
    return response.data;
  },

  async create(processoId, dados) {
    const response = await api.post(`/custas/processos/${processoId}`, dados);
    return response.data;
  },

  async update(id, dados) {
    const response = await api.put(`/custas/${id}`, dados);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/custas/${id}`);
    return response.data;
  },

  async getEstatisticas() {
    const response = await api.get('/custas/estatisticas');
    return response.data;
  }
};

// Serviços de documentos
export const documentoService = {
  async getAll(processoId) {
    const response = await api.get(`/documentos/processos/${processoId}`);
    return response.data;
  },

  async create(processoId, dados) {
    const response = await api.post(`/documentos/processos/${processoId}`, dados);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/documentos/${id}`);
    return response.data;
  }
};

export default api;
// Force rebuild Sun Sep 21 16:38:03 -03 2025
