import api from './api';

export const clienteService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.tipo) queryParams.append('tipo', params.tipo);
    
    const response = await api.get(`/clientes?${queryParams.toString()}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  async create(clienteData) {
    const response = await api.post('/clientes', clienteData);
    return response.data;
  },

  async update(id, clienteData) {
    const response = await api.put(`/clientes/${id}`, clienteData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  }
};
