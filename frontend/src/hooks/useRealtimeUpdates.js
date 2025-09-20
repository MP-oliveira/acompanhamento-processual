import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook para gerenciar atualizações em tempo real
 */
export const useRealtimeUpdates = () => {
  const { socket, isConnected, emit, on, off } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isConnected || !socket) {
      return;
    }

    console.log('🔄 Configurando atualizações em tempo real...');

    // Inscrever-se em atualizações do dashboard
    emit('subscribe_dashboard_updates');

    // Inscrever-se em atualizações de alertas
    emit('subscribe_alert_updates');

    // Eventos de atualização de dados
    const handleProcessUpdate = (data) => {
      console.log('📄 Processo atualizado:', data);
      
      // Invalidar queries relacionadas a processos
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Se for um processo específico, invalidar também
      if (data.processId) {
        queryClient.invalidateQueries({ queryKey: ['processo', data.processId] });
      }
    };

    const handleAlertUpdate = (data) => {
      console.log('🚨 Alerta atualizado:', data);
      
      // Invalidar queries relacionadas a alertas
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const handleUserUpdate = (data) => {
      console.log('👤 Usuário atualizado:', data);
      
      // Invalidar queries relacionadas a usuários
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['perfil'] });
    };

    const handleRelatorioUpdate = (data) => {
      console.log('📊 Relatório atualizado:', data);
      
      // Invalidar queries relacionadas a relatórios
      queryClient.invalidateQueries({ queryKey: ['relatorios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const handleConsultaUpdate = (data) => {
      console.log('🔍 Consulta atualizada:', data);
      
      // Invalidar queries relacionadas a consultas
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const handleSystemNotification = (data) => {
      console.log('🔔 Notificação do sistema:', data);
      
      // Invalidar queries relacionadas ao dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Aqui você pode adicionar uma notificação toast
      // toast.info(data.message);
    };

    // Registrar listeners
    on('process_updated', handleProcessUpdate);
    on('alert_updated', handleAlertUpdate);
    on('user_updated', handleUserUpdate);
    on('relatorio_updated', handleRelatorioUpdate);
    on('consulta_updated', handleConsultaUpdate);
    on('system_notification', handleSystemNotification);

    // Cleanup
    return () => {
      off('process_updated', handleProcessUpdate);
      off('alert_updated', handleAlertUpdate);
      off('user_updated', handleUserUpdate);
      off('relatorio_updated', handleRelatorioUpdate);
      off('consulta_updated', handleConsultaUpdate);
      off('system_notification', handleSystemNotification);
    };
  }, [isConnected, socket, emit, on, off, queryClient]);

  // Função para inscrever-se em atualizações de um processo específico
  const subscribeToProcess = (processId) => {
    if (isConnected) {
      emit('subscribe_process_updates', { processId });
      console.log('📄 Inscrito em atualizações do processo:', processId);
    }
  };

  // Função para cancelar inscrição em atualizações de um processo
  const unsubscribeFromProcess = (processId) => {
    if (isConnected && socket) {
      socket.leave(`process_${processId}`);
      console.log('📄 Cancelada inscrição em atualizações do processo:', processId);
    }
  };

  return {
    subscribeToProcess,
    unsubscribeFromProcess
  };
};
