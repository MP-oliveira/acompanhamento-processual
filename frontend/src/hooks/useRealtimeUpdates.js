import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabaseRealtime } from './useSupabaseRealtime';

/**
 * Hook para gerenciar atualizações em tempo real com Supabase
 */
export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const { isConnected, subscribeToUserData, emitEvent } = useSupabaseRealtime();

  useEffect(() => {
    if (!isConnected) {
      return;
    }


    // Escutar mudanças na tabela de processos
    const unsubscribeProcessos = subscribeToUserData('processos', (payload) => {
      
      switch (payload.eventType) {
        case 'INSERT':
          queryClient.invalidateQueries(['processos']);
          break;
        case 'UPDATE':
          queryClient.invalidateQueries(['processos']);
          queryClient.setQueryData(['processo', payload.new.id], payload.new);
          break;
        case 'DELETE':
          queryClient.invalidateQueries(['processos']);
          queryClient.removeQueries(['processo', payload.old.id]);
          break;
      }
    });

    // Escutar mudanças na tabela de alertas
    const unsubscribeAlertas = subscribeToUserData('alertas', (payload) => {
      
      switch (payload.eventType) {
        case 'INSERT':
          queryClient.invalidateQueries(['alertas']);
          break;
        case 'UPDATE':
          queryClient.invalidateQueries(['alertas']);
          queryClient.setQueryData(['alerta', payload.new.id], payload.new);
          break;
        case 'DELETE':
          queryClient.invalidateQueries(['alertas']);
          queryClient.removeQueries(['alerta', payload.old.id]);
          break;
      }
    });

    // Escutar mudanças na tabela de relatórios
    const unsubscribeRelatorios = subscribeToUserData('relatorios', (payload) => {
      
      switch (payload.eventType) {
        case 'INSERT':
          queryClient.invalidateQueries(['relatorios']);
          queryClient.invalidateQueries(['relatoriosStats']);
          break;
        case 'UPDATE':
          queryClient.invalidateQueries(['relatorios']);
          queryClient.invalidateQueries(['relatoriosStats']);
          queryClient.setQueryData(['relatorio', payload.new.id], payload.new);
          break;
        case 'DELETE':
          queryClient.invalidateQueries(['relatorios']);
          queryClient.invalidateQueries(['relatoriosStats']);
          queryClient.removeQueries(['relatorio', payload.old.id]);
          break;
      }
    });

    // Cleanup
    return () => {
      if (unsubscribeProcessos) unsubscribeProcessos.unsubscribe();
      if (unsubscribeAlertas) unsubscribeAlertas.unsubscribe();
      if (unsubscribeRelatorios) unsubscribeRelatorios.unsubscribe();
    };
  }, [isConnected, subscribeToUserData, queryClient]);

  // Função para emitir eventos customizados
  const emitRealtimeEvent = (event, data) => {
    emitEvent(event, data);
  };

  return {
    isConnected,
    emitRealtimeEvent
  };
};