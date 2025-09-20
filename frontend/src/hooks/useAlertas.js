import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '../services/api';

// Hook para buscar todos os alertas
export const useAlertas = () => {
  return useQuery({
    queryKey: ['alertas'],
    queryFn: async () => {
      const response = await alertService.getAll();
      return response.alertas || []; // Extrai a lista de alertas da resposta
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (alertas mudam mais frequentemente)
    cacheTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para marcar alerta como lido
export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId) => alertService.markAsRead(alertId),
    onSuccess: (data, alertId) => {
      // Atualizar cache otimisticamente
      queryClient.setQueryData(['alertas'], (oldData) => {
        if (!oldData?.alertas) return oldData;
        return {
          ...oldData,
          alertas: oldData.alertas.map(alert => 
            alert.id === alertId ? { ...alert, lido: true } : alert
          )
        };
      });
      // Invalidar para garantir sincronização
      queryClient.invalidateQueries(['alertas']);
    },
  });
};

// Hook para deletar alerta
export const useDeleteAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId) => alertService.delete(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries(['alertas']);
    },
  });
};
