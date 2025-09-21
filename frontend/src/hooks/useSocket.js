import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para gerenciar conexão WebSocket
 */
export const useSocket = () => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    // Configurar URL do WebSocket baseada no ambiente
    const socketUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3001'
      : 'https://backend-42rxugdfm-mauricio-silva-oliveiras-projects.vercel.app';

    console.log('🔌 Conectando WebSocket em:', socketUrl);

    // Conectar ao WebSocket
    const socket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socketRef.current = socket;

    // Eventos de conexão
    socket.on('connect', () => {
      console.log('✅ WebSocket conectado com sucesso!');
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Evento de pong para manter conexão ativa
    socket.on('pong', () => {
      console.log('🏓 Pong recebido do servidor');
    });

    // Cleanup ao desmontar
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]);

  // Função para emitir eventos
  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Socket não conectado, evento não enviado:', event);
    }
  };

  // Função para escutar eventos
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Função para remover listener
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  // Função para fazer ping
  const ping = () => {
    emit('ping');
  };

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    ping
  };
};
