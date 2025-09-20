// frontend/src/components/NotificationPreferences/NotificationPreferences.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Mail, Clock, Settings, Save, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import api from '../../services/api';
import './NotificationPreferences.css';

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notification-preferences');
      setPreferences(response.data.preferences);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar preferências:', err);
      setError('Erro ao carregar preferências de notificação.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/notification-preferences', preferences);
      setMessage('Preferências salvas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao salvar preferências:', err);
      setError('Erro ao salvar preferências.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences({
      emailEnabled: true,
      emailCriticalAlerts: true,
      pushEnabled: true,
      pushCriticalAlerts: true,
      alertFrequency: 'immediate',
      preferredTime: '09:00:00',
      timezone: 'America/Sao_Paulo'
    });
  };

  const handleChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const sendTestEmail = async () => {
    try {
      setSaving(true);
      await api.post('/email-notifications/test');
      setMessage('Email de teste enviado com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao enviar email de teste:', err);
      setError('Erro ao enviar email de teste. Verifique se o SMTP está configurado.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="notification-preferences">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando preferências...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="notification-preferences">
        <div className="error-container">
          <p>Erro ao carregar preferências de notificação.</p>
          <button onClick={loadPreferences} className="btn btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-preferences">
      <div className="preferences-header">
        <h3 className="configuracoes-subsection-title">
          <AlertTriangle size={20} />
          Notificações Críticas
        </h3>
        <p className="preferences-description">
          Configure apenas as notificações essenciais para prazos processuais críticos.
        </p>
      </div>

      <div className="notification-warning">
        <Info size={16} />
        <div className="warning-content">
          <h5>Como Funcionam as Notificações</h5>
          <ul>
            <li><strong>Alertas no Cabeçalho:</strong> Todas as notificações aparecem em tempo real no ícone de sino</li>
            <li><strong>Email:</strong> Apenas para prazos críticos que podem resultar em perda do processo</li>
            <li><strong>Push:</strong> Notificações do navegador para alertas importantes</li>
            <li><strong>WebSocket:</strong> Atualizações automáticas em tempo real na aplicação</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="success-message">
          <p>{message}</p>
        </div>
      )}

      <div className="preferences-sections">
        {/* Email Notifications - Apenas para Prazos Críticos */}
        <div className="preference-section critical-section">
          <div className="section-header">
            <Mail size={20} />
            <h4>Email para Prazos Críticos</h4>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.emailEnabled}
                onChange={(e) => handleChange('emailEnabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {preferences.emailEnabled && (
            <div className="preference-options">
              <div className="preference-option critical-option">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.emailCriticalAlerts}
                    onChange={(e) => handleChange('emailCriticalAlerts', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <strong>Prazos Processuais Críticos</strong>
                </label>
                <p className="preference-description">
                  Receba emails apenas para prazos que podem resultar em perda do processo
                </p>
              </div>

              <div className="test-section">
                <button
                  onClick={sendTestEmail}
                  disabled={saving || !preferences.emailEnabled || !preferences.emailCriticalAlerts}
                  className="btn btn-info btn-small"
                >
                  <Mail size={16} />
                  Enviar Email de Teste
                </button>
                <p className="test-description">
                  Teste se suas configurações de email estão funcionando
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Push Notifications - Simplificado */}
        <div className="preference-section">
          <div className="section-header">
            <Bell size={20} />
            <h4>Notificações Push</h4>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.pushEnabled}
                onChange={(e) => handleChange('pushEnabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {preferences.pushEnabled && (
            <div className="preference-options">
              <div className="preference-option">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.pushCriticalAlerts}
                    onChange={(e) => handleChange('pushCriticalAlerts', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Alertas Críticos
                </label>
                <p className="preference-description">
                  Notificações push para prazos processuais importantes
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Configurações de Horário */}
        <div className="preference-section">
          <div className="section-header">
            <Clock size={20} />
            <h4>Horário de Envio</h4>
          </div>

          <div className="preference-options">
            <div className="preference-option">
              <label>Horário Preferido</label>
              <input
                type="time"
                value={preferences.preferredTime}
                onChange={(e) => handleChange('preferredTime', e.target.value)}
                className="form-input"
              />
              <p className="preference-description">
                Horário preferido para envio de emails (apenas para prazos críticos)
              </p>
            </div>

            <div className="preference-option">
              <label>Fuso Horário</label>
              <select
                value={preferences.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="form-select"
              >
                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                <option value="America/Manaus">Manaus (GMT-4)</option>
                <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="preferences-actions">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? (
            <>
              <div className="loading-spinner small"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save size={20} />
              Salvar Preferências
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          disabled={saving}
          className="btn btn-secondary"
        >
          <RotateCcw size={20} />
          Restaurar Padrões
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences;