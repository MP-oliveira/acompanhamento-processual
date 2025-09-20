// frontend/src/components/NotificationPreferences/NotificationPreferences.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Clock, Settings, Save, RotateCcw } from 'lucide-react';
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

  const handleReset = async () => {
    try {
      setSaving(true);
      const response = await api.post('/notification-preferences/reset');
      setPreferences(response.data.preferences);
      setMessage('Preferências redefinidas para valores padrão!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao redefinir preferências:', err);
      setError('Erro ao redefinir preferências.');
    } finally {
      setSaving(false);
    }
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

  const testNotificationSystem = async (tipo) => {
    try {
      setSaving(true);
      const response = await api.post('/email-notifications/test-system', { tipo });
      setMessage(`Sistema de notificação testado: ${response.data.tipo} - ${response.data.mensagem}`);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Erro ao testar sistema:', err);
      setError('Erro ao testar sistema de notificação.');
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
          <Settings size={20} />
          Preferências de Notificação
        </h3>
        <p className="preferences-description">
          Configure como você deseja receber notificações sobre seus processos e alertas.
        </p>
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
        {/* Email Notifications */}
        <div className="preference-section">
          <div className="section-header">
            <Mail size={20} />
            <h4>Notificações por Email</h4>
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
              <div className="preference-option">
                <label>Alertas e Prazos</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.emailAlerts}
                    onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-option">
                <label>Atualizações de Processos</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.emailProcessUpdates}
                    onChange={(e) => handleChange('emailProcessUpdates', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-option">
                <label>Relatórios Concluídos</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.emailReportCompleted}
                    onChange={(e) => handleChange('emailReportCompleted', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-option">
                <label>Resumo Semanal</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.emailWeeklyDigest}
                    onChange={(e) => handleChange('emailWeeklyDigest', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-option">
                <button
                  onClick={sendTestEmail}
                  disabled={saving}
                  className="btn btn-secondary btn-small"
                >
                  <Mail size={16} />
                  Enviar Email de Teste
                </button>
              </div>

              <div className="preference-option">
                <div className="test-buttons">
                  <button
                    onClick={() => testNotificationSystem('alerta')}
                    disabled={saving}
                    className="btn btn-info btn-small"
                  >
                    🚨 Testar Alerta
                  </button>
                  <button
                    onClick={() => testNotificationSystem('processo')}
                    disabled={saving}
                    className="btn btn-info btn-small"
                  >
                    📄 Testar Processo
                  </button>
                  <button
                    onClick={() => testNotificationSystem('relatorio')}
                    disabled={saving}
                    className="btn btn-info btn-small"
                  >
                    📊 Testar Relatório
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Push Notifications */}
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
                <label>Alertas e Prazos</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.pushAlerts}
                    onChange={(e) => handleChange('pushAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-option">
                <label>Atualizações de Processos</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.pushProcessUpdates}
                    onChange={(e) => handleChange('pushProcessUpdates', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-option">
                <label>Relatórios Concluídos</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.pushReportCompleted}
                    onChange={(e) => handleChange('pushReportCompleted', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* SMS Notifications (Future) */}
        <div className="preference-section">
          <div className="section-header">
            <Smartphone size={20} />
            <h4>Notificações por SMS</h4>
            <label className="toggle-switch disabled">
              <input
                type="checkbox"
                checked={false}
                disabled
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <p className="coming-soon">🚧 Em breve - Funcionalidade em desenvolvimento</p>
        </div>

        {/* Frequency Settings */}
        <div className="preference-section">
          <div className="section-header">
            <Clock size={20} />
            <h4>Configurações de Frequência</h4>
          </div>

          <div className="preference-options">
            <div className="preference-option">
              <label>Frequência de Alertas</label>
              <select
                value={preferences.alertFrequency}
                onChange={(e) => handleChange('alertFrequency', e.target.value)}
                className="form-select"
              >
                <option value="immediate">Imediato</option>
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>

            <div className="preference-option">
              <label>Frequência do Resumo</label>
              <select
                value={preferences.digestFrequency}
                onChange={(e) => handleChange('digestFrequency', e.target.value)}
                className="form-select"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="never">Nunca</option>
              </select>
            </div>

            <div className="preference-option">
              <label>Horário Preferido</label>
              <input
                type="time"
                value={preferences.preferredTime}
                onChange={(e) => handleChange('preferredTime', e.target.value)}
                className="form-input"
              />
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
          Redefinir Padrões
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
