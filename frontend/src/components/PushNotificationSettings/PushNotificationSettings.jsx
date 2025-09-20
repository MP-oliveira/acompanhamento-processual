import React, { useState } from 'react';
import { Bell, BellOff, Send, Check, X, AlertCircle, Settings } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import './PushNotificationSettings.css';

const PushNotificationSettings = ({ className = '' }) => {
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  } = usePushNotifications();

  const [testMessage, setTestMessage] = useState('');
  const [showTestInput, setShowTestInput] = useState(false);

  const handleSubscribe = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    await subscribeToPush();
  };

  const handleUnsubscribe = async () => {
    await unsubscribeFromPush();
  };

  const handleSendTest = async () => {
    const message = testMessage || 'Esta é uma notificação de teste do JurisAcompanha!';
    const success = await sendTestNotification(message);
    if (success) {
      setTestMessage('');
      setShowTestInput(false);
    }
  };

  const getStatusIcon = () => {
    if (!isSupported) return <X className="status-icon error" size={20} />;
    if (permission === 'granted' && subscription) return <Check className="status-icon success" size={20} />;
    if (permission === 'denied') return <X className="status-icon error" size={20} />;
    return <AlertCircle className="status-icon warning" size={20} />;
  };

  const getStatusText = () => {
    if (!isSupported) return 'Não suportado';
    if (permission === 'granted' && subscription) return 'Ativado';
    if (permission === 'denied') return 'Negado';
    if (permission === 'granted') return 'Permitido';
    return 'Não configurado';
  };

  const getStatusColor = () => {
    if (!isSupported) return 'error';
    if (permission === 'granted' && subscription) return 'success';
    if (permission === 'denied') return 'error';
    if (permission === 'granted') return 'warning';
    return 'neutral';
  };

  if (!isSupported) {
    return (
      <div className={`push-notification-settings ${className}`}>
        <div className="push-notification-header">
          <BellOff size={24} className="push-notification-icon" />
          <h3>Notificações Push</h3>
        </div>
        <div className="push-notification-content">
          <div className="push-notification-status">
            <span className="status-text error">
              Push notifications não são suportadas neste navegador
            </span>
          </div>
          <p className="push-notification-description">
            Seu navegador não suporta notificações push. 
            Para receber notificações, use um navegador moderno como Chrome, Firefox ou Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`push-notification-settings ${className}`}>
      <div className="push-notification-header">
        <Settings size={24} className="push-notification-icon" />
        <h3>Notificações Push</h3>
      </div>
      
      <div className="push-notification-content">
        {/* Status */}
        <div className="push-notification-status">
          <div className="status-row">
            {getStatusIcon()}
            <span className={`status-text ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="push-notification-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Descrição */}
        <p className="push-notification-description">
          Receba notificações em tempo real sobre prazos de processos, 
          alertas importantes e atualizações do sistema.
        </p>

        {/* Controles */}
        <div className="push-notification-controls">
          {!subscription ? (
            <button
              className="btn btn-primary"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner" />
                  Configurando...
                </>
              ) : (
                <>
                  <Bell size={16} />
                  Ativar Notificações
                </>
              )}
            </button>
          ) : (
            <div className="push-notification-actions">
              <button
                className="btn btn-secondary"
                onClick={handleUnsubscribe}
                disabled={isLoading}
              >
                <BellOff size={16} />
                Desativar
              </button>
              
              <button
                className="btn btn-outline"
                onClick={() => setShowTestInput(!showTestInput)}
                disabled={isLoading}
              >
                <Send size={16} />
                Testar
              </button>
            </div>
          )}
        </div>

        {/* Input de teste */}
        {showTestInput && (
          <div className="push-notification-test">
            <div className="test-input-group">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Digite uma mensagem de teste (opcional)"
                className="test-input"
                disabled={isLoading}
              />
              <button
                className="btn btn-primary btn-small"
                onClick={handleSendTest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-spinner" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
            <small className="test-hint">
              Uma notificação será enviada para este dispositivo
            </small>
          </div>
        )}

        {/* Informações adicionais */}
        {subscription && (
          <div className="push-notification-info">
            <div className="info-item">
              <strong>Endpoint:</strong>
              <span className="endpoint-text">
                {subscription.endpoint.substring(0, 50)}...
              </span>
            </div>
            <div className="info-item">
              <strong>Status:</strong>
              <span className="status-active">Ativo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotificationSettings;
