import api from './api';

export const timesheetService = {
  // Listar timesheets
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.processoId) queryParams.append('processoId', params.processoId);
    if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio);
    if (params.dataFim) queryParams.append('dataFim', params.dataFim);
    if (params.tipo) queryParams.append('tipo', params.tipo);
    if (params.faturavel !== undefined) queryParams.append('faturavel', params.faturavel);
    if (params.faturado !== undefined) queryParams.append('faturado', params.faturado);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await api.get(`/timesheets?${queryParams.toString()}`);
    return response.data;
  },

  // Criar timesheet
  async create(timesheetData) {
    const response = await api.post('/timesheets', timesheetData);
    return response.data;
  },

  // Atualizar timesheet
  async update(id, timesheetData) {
    const response = await api.put(`/timesheets/${id}`, timesheetData);
    return response.data;
  },

  // Remover timesheet
  async delete(id) {
    const response = await api.delete(`/timesheets/${id}`);
    return response.data;
  },

  // Obter estatísticas
  async getEstatisticas(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio);
    if (params.dataFim) queryParams.append('dataFim', params.dataFim);
    if (params.processoId) queryParams.append('processoId', params.processoId);

    const response = await api.get(`/timesheets/estatisticas?${queryParams.toString()}`);
    return response.data;
  }
};

