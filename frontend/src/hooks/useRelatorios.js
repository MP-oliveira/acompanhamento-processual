import { useQuery } from '@tanstack/react-query';
import { relatorioService } from '../services/api';

// Hook para buscar estatísticas de relatórios (usado no sidebar)
export const useRelatoriosStats = () => {
  return useQuery({
    queryKey: ['relatorios-stats'],
    queryFn: () => relatorioService.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutos (stats mudam pouco)
    cacheTime: 30 * 60 * 1000, // 30 minutos
  });
};

// Hook para buscar todos os relatórios
export const useRelatorios = (filters = {}) => {
  return useQuery({
    queryKey: ['relatorios', filters],
    queryFn: () => relatorioService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};
