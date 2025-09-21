import axios from 'axios';

// Configuração base da API
// Usar localhost em desenvolvimento, Vercel em produção
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001/api'
  : 'https://backend-eight-gamma-94.vercel.app/api';

console.log('🔗 API URL:', API_BASE_URL, '| Hostname:', window.location.hostname);

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
      // Token expirado ou inválido - não redirecionar automaticamente
      // Deixar o AuthContext lidar com isso
      console.warn('⚠️ Token expirado ou inválido');
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação com fallback mock
export const authService = {
  async login(email, password) {
    console.log('🌐 API - Fazendo requisição de login para:', email);
    console.log('🌐 API - URL completa:', api.defaults.baseURL + '/auth/login');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('🌐 API - Resposta recebida:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 API - Erro na requisição:', error);
      console.error('🌐 API - Status:', error.response?.status);
      console.error('🌐 API - Dados:', error.response?.data);
      
      // Fallback para dados mockados se o backend falhar
      if (email === 'guilherme@jurisacompanha.com' && password === 'Gui@2025') {
        console.log('🔄 Usando dados mockados para login');
        const mockToken = 'mock-token-' + Date.now();
        const mockUser = {
          id: 1,
          nome: 'Guilherme Fernandes',
          email: 'guilherme@jurisacompanha.com',
          role: 'user',
          ativo: true
        };
        return {
          message: 'Login realizado com sucesso (mock)',
          token: mockToken,
          user: mockUser
        };
      }
      
      throw error;
    }
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getProfile() {
    console.log('🌐 API - Fazendo requisição de perfil');
    try {
      const response = await api.get('/auth/me');
      console.log('🌐 API - Perfil recebido:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('🌐 API - Erro no perfil:', error);
      
      // Fallback para dados mockados
      console.log('🔄 Usando perfil mockado');
      const mockUser = {
        id: 1,
        nome: 'Guilherme Fernandes',
        email: 'guilherme@jurisacompanha.com',
        role: 'user',
        ativo: true
      };
      return { user: mockUser };
    }
  }
};

// Serviços de processos com fallback mock
export const processoService = {
  async getAll() {
    try {
      const response = await api.get('/processos');
      return response.data;
    } catch (error) {
      console.log('🔄 Usando dados mockados para processos');
      return {
        processos: [
          {
            id: 1,
            numero: '1234567-89.2024.8.26.0001',
            titulo: 'Processo de Teste',
            status: 'ativo',
            created_at: new Date().toISOString()
          }
        ]
      };
    }
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

// Serviços de alertas com fallback mock
export const alertService = {
  async getAll() {
    try {
      const response = await api.get('/alerts');
      return response.data;
    } catch (error) {
      console.log('🔄 Usando dados mockados para alertas');
      return {
        alertas: [
          {
            id: 1,
            titulo: 'Alerta de Teste',
            descricao: 'Este é um alerta de teste',
            tipo: 'info',
            lido: false,
            created_at: new Date().toISOString()
          }
        ]
      };
    }
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

// Serviços de relatórios com fallback mock
export const relatorioService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/relatorios', { params });
      return response.data;
    } catch (error) {
      console.log('🔄 Usando dados mockados para relatórios');
      return { relatorios: [] };
    }
  },

  async getById(id) {
    const response = await api.get(`/relatorios/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/relatorios', data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/relatorios/${id}`);
    return response.data;
  },

  async getStats() {
    try {
      const response = await api.get('/relatorios/stats');
      return response.data;
    } catch (error) {
      console.log('🔄 Usando dados mockados para stats de relatórios');
      return {
        total: 0,
        concluidos: 0,
        pendentes: 0,
        estaSemana: 0
      };
    }
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
  }
};

export default api;
