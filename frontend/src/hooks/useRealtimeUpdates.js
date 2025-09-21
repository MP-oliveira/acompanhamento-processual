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

    console.log('🔄 Configurando listeners de tempo real...');

    // Escutar mudanças na tabela de processos
    const unsubscribeProcessos = subscribeToUserData('processos', (payload) => {
      console.log('📄 Mudança em processos:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          console.log('📄 Novo processo criado:', payload.new);
          queryClient.invalidateQueries(['processos']);
          break;
        case 'UPDATE':
          console.log('📄 Processo atualizado:', payload.new);
          queryClient.invalidateQueries(['processos']);
          queryClient.setQueryData(['processo', payload.new.id], payload.new);
          break;
        case 'DELETE':
          console.log('📄 Processo removido:', payload.old);
          queryClient.invalidateQueries(['processos']);
          queryClient.removeQueries(['processo', payload.old.id]);
          break;
      }
    });

    // Escutar mudanças na tabela de alertas
    const unsubscribeAlertas = subscribeToUserData('alertas', (payload) => {
      console.log('🚨 Mudança em alertas:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          console.log('🚨 Novo alerta criado:', payload.new);
          queryClient.invalidateQueries(['alertas']);
          break;
        case 'UPDATE':
          console.log('🚨 Alerta atualizado:', payload.new);
          queryClient.invalidateQueries(['alertas']);
          queryClient.setQueryData(['alerta', payload.new.id], payload.new);
          break;
        case 'DELETE':
          console.log('🚨 Alerta removido:', payload.old);
          queryClient.invalidateQueries(['alertas']);
          queryClient.removeQueries(['alerta', payload.old.id]);
          break;
      }
    });

    // Escutar mudanças na tabela de relatórios
    const unsubscribeRelatorios = subscribeToUserData('relatorios', (payload) => {
      console.log('📊 Mudança em relatórios:', payload);
      
      switch (payload.eventType) {
        case 'INSERT':
          console.log('📊 Novo relatório criado:', payload.new);
          queryClient.invalidateQueries(['relatorios']);
          queryClient.invalidateQueries(['relatoriosStats']);
          break;
        case 'UPDATE':
          console.log('📊 Relatório atualizado:', payload.new);
          queryClient.invalidateQueries(['relatorios']);
          queryClient.invalidateQueries(['relatoriosStats']);
          queryClient.setQueryData(['relatorio', payload.new.id], payload.new);
          break;
        case 'DELETE':
          console.log('📊 Relatório removido:', payload.old);
          queryClient.invalidateQueries(['relatorios']);
          queryClient.invalidateQueries(['relatoriosStats']);
          queryClient.removeQueries(['relatorio', payload.old.id]);
          break;
      }
    });

    // Cleanup
    return () => {
      console.log('🧹 Limpando listeners de tempo real...');
      if (unsubscribeProcessos) unsubscribeProcessos.unsubscribe();
      if (unsubscribeAlertas) unsubscribeAlertas.unsubscribe();
      if (unsubscribeRelatorios) unsubscribeRelatorios.unsubscribe();
    };
  }, [isConnected, subscribeToUserData, queryClient]);

  // Função para emitir eventos customizados
  const emitRealtimeEvent = (event, data) => {
    console.log('📡 Emitindo evento:', event, data);
    emitEvent(event, data);
  };

  return {
    isConnected,
    emitRealtimeEvent
  };
};