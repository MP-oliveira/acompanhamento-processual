import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gerenciar conexão em tempo real com Supabase
 */
export const useSupabaseRealtime = () => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const supabaseRef = useRef(null);
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    // Temporariamente desabilitar Realtime para debug
    console.log('🔌 Supabase Realtime temporariamente desabilitado para debug');
    setIsConnected(false);
    setConnectionError('Realtime desabilitado temporariamente');

    // // Configurar Supabase client
    // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zejrnsdshiaipptfopqu.supabase.co';
    // const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJuc2RzaGlhaXBwdGZvcHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTQ3OTEsImV4cCI6MjA3Mzk3MDc5MX0.bXl9yFF_uAS5nWoNB9E43ybls0JwMzi0jC_i9Z4cD70';

    // console.log('🔌 Conectando ao Supabase Realtime:', supabaseUrl);

    // const supabase = createClient(supabaseUrl, supabaseKey);
    // supabaseRef.current = supabase;

    // // Configurar autenticação
    // supabase.auth.setAuth(token);

    // // Verificar status da conexão
    // const checkConnection = () => {
    //   supabase.realtime.getChannel('heartbeat').subscribe((status) => {
    //     console.log('💓 Status do Realtime:', status);
    //     if (status === 'SUBSCRIBED') {
    //       setIsConnected(true);
    //       setConnectionError(null);
    //     } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
    //       setIsConnected(false);
    //       setConnectionError('Conexão perdida');
    //     }
    //   });
    // };

    // checkConnection();

    // // Cleanup ao desmontar
    // return () => {
    //   subscriptionsRef.current.forEach(subscription => {
    //     supabase.removeChannel(subscription);
    //   });
    //   subscriptionsRef.current = [];
    // };
  }, [user, token]);

  // Função para inscrever-se em mudanças de uma tabela
  const subscribeToTable = (table, callback, filter = null) => {
    if (!supabaseRef.current) return null;

    let subscription;
    
    if (filter) {
      subscription = supabaseRef.current
        .channel(`public:${table}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: table,
          filter: filter
        }, callback)
        .subscribe();
    } else {
      subscription = supabaseRef.current
        .channel(`public:${table}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: table
        }, callback)
        .subscribe();
    }

    subscriptionsRef.current.push(subscription);
    return subscription;
  };

  // Função para inscrever-se em mudanças específicas do usuário
  const subscribeToUserData = (table, callback) => {
    if (!user) return null;
    
    return subscribeToTable(table, callback, `user_id=eq.${user.id}`);
  };

  // Função para emitir eventos customizados
  const emitEvent = (event, data) => {
    if (!supabaseRef.current) return;
    
    supabaseRef.current
      .channel('custom-events')
      .send({
        type: 'broadcast',
        event: event,
        payload: data
      });
  };

  // Função para escutar eventos customizados
  const listenToEvent = (event, callback) => {
    if (!supabaseRef.current) return null;

    const subscription = supabaseRef.current
      .channel('custom-events')
      .on('broadcast', { event: event }, callback)
      .subscribe();

    subscriptionsRef.current.push(subscription);
    return subscription;
  };

  return {
    isConnected,
    connectionError,
    subscribeToTable,
    subscribeToUserData,
    emitEvent,
    listenToEvent,
    supabase: supabaseRef.current
  };
};
