import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processoService } from '../services/api';

// Hook para buscar todos os processos
export const useProcessos = () => {
  return useQuery({
    queryKey: ['processos'],
    queryFn: async () => {
      console.log('🔍 useProcessos: Iniciando busca de processos...');
      const response = await processoService.getAll();
      console.log('🔍 useProcessos: Resposta da API:', response);
      console.log('🔍 useProcessos: Processos extraídos:', response.processos || []);
      return response.processos || []; // Extrai a lista de processos da resposta
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para buscar um processo específico
export const useProcesso = (id) => {
  return useQuery({
    queryKey: ['processos', id],
    queryFn: () => processoService.getById(id),
    enabled: !!id, // Só executa se id existe
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para criar processo
export const useCreateProcesso = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (processoData) => processoService.create(processoData),
    onSuccess: () => {
      // Invalidar e refetch processos
      queryClient.invalidateQueries(['processos']);
      queryClient.invalidateQueries(['dashboard-stats']);
    },
  });
};

// Hook para atualizar processo
export const useUpdateProcesso = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => processoService.update(id, data),
    onSuccess: (data, variables) => {
      // Atualizar cache do processo específico
      queryClient.setQueryData(['processos', variables.id], data);
      // Invalidar lista de processos
      queryClient.invalidateQueries(['processos']);
      queryClient.invalidateQueries(['dashboard-stats']);
    },
  });
};

// Hook para deletar processo
export const useDeleteProcesso = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => processoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['processos']);
      queryClient.invalidateQueries(['dashboard-stats']);
    },
  });
};
