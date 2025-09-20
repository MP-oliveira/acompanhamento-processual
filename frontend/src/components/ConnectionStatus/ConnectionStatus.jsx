import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const { isConnected, connectionError } = useSocket();

  if (connectionError) {
    return (
      <div className="connection-status error">
        <WifiOff size={16} />
        <span>Conexão perdida</span>
      </div>
    );
  }

  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <Wifi size={16} />
      <span>{isConnected ? 'Online' : 'Conectando...'}</span>
    </div>
  );
};

export default ConnectionStatus;
