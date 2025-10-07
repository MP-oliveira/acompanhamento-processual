import api from './api';

export const calendarService = {
  // Listar eventos
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio);
    if (params.dataFim) queryParams.append('dataFim', params.dataFim);
    if (params.tipo) queryParams.append('tipo', params.tipo);
    if (params.status) queryParams.append('status', params.status);
    if (params.processoId) queryParams.append('processoId', params.processoId);

    const response = await api.get(`/calendar?${queryParams.toString()}`);
    return response.data;
  },

  // Buscar evento por ID
  async getById(id) {
    const response = await api.get(`/calendar/${id}`);
    return response.data;
  },

  // Criar evento
  async create(eventData) {
    const response = await api.post('/calendar', eventData);
    return response.data;
  },

  // Atualizar evento
  async update(id, eventData) {
    const response = await api.put(`/calendar/${id}`, eventData);
    return response.data;
  },

  // Remover evento
  async delete(id) {
    const response = await api.delete(`/calendar/${id}`);
    return response.data;
  },

  // Sincronizar eventos dos processos
  async sincronizar() {
    const response = await api.post('/calendar/sincronizar');
    return response.data;
  },

  // Obter estatísticas
  async getEstatisticas() {
    const response = await api.get('/calendar/estatisticas');
    return response.data;
  }
};

