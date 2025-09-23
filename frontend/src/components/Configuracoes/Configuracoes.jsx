import React, { useState, useEffect } from 'react';
import { 
  Settings,
  Save,
  RefreshCw,
  Bell,
  Shield,
  Database,
  Clock,
  CheckCircle,
  Info
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import PushNotificationSettings from '../PushNotificationSettings/PushNotificationSettings';
import NotificationPreferences from '../NotificationPreferences/NotificationPreferences';
import './Configuracoes.css';

const Configuracoes = () => {
  const [configuracoes, setConfiguracoes] = useState({
    // Configurações de Sistema
    sistema: {
      nomeEmpresa: 'Advocacia & Associados',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua das Flores, 123 - Centro, Salvador/BA',
      telefone: '(71) 3333-4444',
      email: 'contato@advocacia.com',
      site: 'www.advocacia.com.br'
    },
    // Configurações de Notificações
    notificacoes: {
      emailAlertas: true,
      emailPrazos: true,
      emailAudiencias: true,
      smsAlertas: false,
      smsPrazos: false,
      notificacaoPush: true,
      diasAntecedencia: 3
    },
    // Configurações de Segurança
    seguranca: {
      sessaoTimeout: 30,
      tentativasLogin: 3,
      senhaMinima: 8,
      doisFatores: false,
      logAtividades: true,
      backupAutomatico: true
    },
    // Configurações de Integração
    integracao: {
      datajudAtivo: true,
      datajudToken: '••••••••••••••••',
      datajudBase: 'https://api.datajud.com.br',
      sincronizacaoAutomatica: true,
      intervalo: 60
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('sistema');
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadConfiguracoes = async () => {
      setLoading(true);
      try {
        // TODO: Implementar carregamento de configurações via API
        // Por enquanto, mantém os dados mockados
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfiguracoes();
  }, []);

  const validateField = (section, field, value) => {
    const newErrors = { ...errors };
    const errorKey = `${section}.${field}`;
    
    // Remove erro anterior se existir
    if (newErrors[errorKey]) {
      delete newErrors[errorKey];
    }
    
    // Validações específicas
    if (section === 'sistema') {
      if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[errorKey] = 'Email inválido';
      }
      if (field === 'cnpj' && value && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value)) {
        newErrors[errorKey] = 'CNPJ inválido (formato: 00.000.000/0000-00)';
      }
      if (field === 'telefone' && value && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) {
        newErrors[errorKey] = 'Telefone inválido (formato: (00) 0000-0000)';
      }
    }
    
    if (section === 'integracao') {
      if (field === 'datajudBase' && value && !/^https?:\/\/.+/.test(value)) {
        newErrors[errorKey] = 'URL inválida (deve começar com http:// ou https://)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section, field, value) => {
    setConfiguracoes(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
    validateField(section, field, value);
  };

  const handleSave = async () => {
    // Verifica se há erros de validação
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      alert('Por favor, corrija os erros antes de salvar.');
      return;
    }
    
    setSaving(true);
    setShowSuccess(false);
    
    try {
      // TODO: Implementar salvamento de configurações via API
      
      // Simula delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      setShowSuccess(true);
      
      // Esconde a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja reverter todas as alterações?')) {
      // Recarrega as configurações originais
      setConfiguracoes({
        sistema: {
          nomeEmpresa: 'Advocacia & Associados',
          cnpj: '12.345.678/0001-90',
          endereco: 'Rua das Flores, 123 - Centro, Salvador/BA',
          telefone: '(71) 3333-4444',
          email: 'contato@advocacia.com',
          site: 'www.advocacia.com.br'
        },
        notificacoes: {
          emailAlertas: true,
          emailPrazos: true,
          emailAudiencias: true,
          smsAlertas: false,
          smsPrazos: false,
          notificacaoPush: true,
          diasAntecedencia: 3
        },
        seguranca: {
          sessaoTimeout: 30,
          tentativasLogin: 3,
          senhaMinima: 8,
          doisFatores: false,
          logAtividades: true,
          backupAutomatico: true
        },
        integracao: {
          datajudAtivo: true,
          datajudToken: '••••••••••••••••',
          datajudBase: 'https://api.datajud.com.br',
          sincronizacaoAutomatica: true,
          intervalo: 60
        }
      });
      setHasChanges(false);
      alert('Configurações revertidas para os valores originais!');
    }
  };

  const tabs = [
    { id: 'sistema', label: 'Sistema', icon: Settings },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'integracao', label: 'Integração', icon: Database }
  ];

  if (loading) {
    return (
      <div className="configuracoes">
        <div className="configuracoes-loading">
          <div className="configuracoes-loading-spinner" />
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="configuracoes">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Configurações</h1>
        </div>
        <div className="page-header-actions">
          {showSuccess && (
            <div className="configuracoes-success-message">
              <CheckCircle size={16} />
              Configurações salvas com sucesso!
            </div>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={handleReset}
            disabled={saving}
          >
            <RefreshCw size={20} />
            Reverter
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving || !hasChanges || Object.keys(errors).length > 0}
          >
            <Save size={20} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="configuracoes-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`configuracoes-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      <div className="configuracoes-content">
        {activeTab === 'sistema' && (
          <div className="configuracoes-section">
            <div className="configuracoes-section-header">
              <h2 className="configuracoes-section-title">
                <Settings size={20} />
                Informações da Empresa
              </h2>
              <p className="configuracoes-section-description">
                Configure as informações básicas da sua empresa
              </p>
            </div>
            <div className="configuracoes-section-content">
              <div className="configuracoes-form-grid">
                <div className="configuracoes-form-group">
                  <label htmlFor="nomeEmpresa">Nome da Empresa</label>
                  <input
                    type="text"
                    id="nomeEmpresa"
                    value={configuracoes.sistema.nomeEmpresa}
                    onChange={(e) => handleInputChange('sistema', 'nomeEmpresa', e.target.value)}
                    className="configuracoes-input"
                  />
                </div>
                <div className="configuracoes-form-group">
                  <label htmlFor="cnpj">CNPJ</label>
                  <input
                    type="text"
                    id="cnpj"
                    value={configuracoes.sistema.cnpj}
                    onChange={(e) => handleInputChange('sistema', 'cnpj', e.target.value)}
                    className={`configuracoes-input ${errors['sistema.cnpj'] ? 'error' : ''}`}
                    placeholder="00.000.000/0000-00"
                  />
                  {errors['sistema.cnpj'] && (
                    <span className="configuracoes-error">{errors['sistema.cnpj']}</span>
                  )}
                </div>
                <div className="configuracoes-form-group configuracoes-form-group-full">
                  <label htmlFor="endereco">Endereço</label>
                  <input
                    type="text"
                    id="endereco"
                    value={configuracoes.sistema.endereco}
                    onChange={(e) => handleInputChange('sistema', 'endereco', e.target.value)}
                    className="configuracoes-input"
                  />
                </div>
                <div className="configuracoes-form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <input
                    type="text"
                    id="telefone"
                    value={configuracoes.sistema.telefone}
                    onChange={(e) => handleInputChange('sistema', 'telefone', e.target.value)}
                    className={`configuracoes-input ${errors['sistema.telefone'] ? 'error' : ''}`}
                    placeholder="(00) 0000-0000"
                  />
                  {errors['sistema.telefone'] && (
                    <span className="configuracoes-error">{errors['sistema.telefone']}</span>
                  )}
                </div>
                <div className="configuracoes-form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={configuracoes.sistema.email}
                    onChange={(e) => handleInputChange('sistema', 'email', e.target.value)}
                    className={`configuracoes-input ${errors['sistema.email'] ? 'error' : ''}`}
                  />
                  {errors['sistema.email'] && (
                    <span className="configuracoes-error">{errors['sistema.email']}</span>
                  )}
                </div>
                <div className="configuracoes-form-group">
                  <label htmlFor="site">Site</label>
                  <input
                    type="url"
                    id="site"
                    value={configuracoes.sistema.site}
                    onChange={(e) => handleInputChange('sistema', 'site', e.target.value)}
                    className="configuracoes-input"
                  />
                </div>
                
                {/* Configuração de Tema */}
                <div className="configuracoes-form-group configuracoes-form-group-full">
                  <label>Tema da Interface</label>
                  <div className="configuracoes-theme-toggle">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notificacoes' && (
          <div className="configuracoes-section">
            <div className="configuracoes-section-header">
              <h2 className="configuracoes-section-title">
                <Bell size={20} />
                Notificações
              </h2>
              <p className="configuracoes-section-description">
                Configure como e quando receber notificações
              </p>
            </div>
            <div className="configuracoes-section-content">
              <div className="configuracoes-form-grid">
                <div className="configuracoes-form-group configuracoes-form-group-full">
                  <h3 className="configuracoes-subsection-title">Notificações por Email</h3>
                </div>
                <div className="configuracoes-form-group">
                  <label className="configuracoes-checkbox-label">
                    <input
                      type="checkbox"
                      checked={configuracoes.notificacoes.emailAlertas}
                      onChange={(e) => handleInputChange('notificacoes', 'emailAlertas', e.target.checked)}
                      className="configuracoes-checkbox"
                    />
                    <span className="configuracoes-checkbox-text">Alertas de Prazos</span>
                  </label>
                </div>
                <div className="configuracoes-form-group">
                  <label className="configuracoes-checkbox-label">
                    <input
                      type="checkbox"
                      checked={configuracoes.notificacoes.emailPrazos}
                      onChange={(e) => handleInputChange('notificacoes', 'emailPrazos', e.target.checked)}
                      className="configuracoes-checkbox"
                    />
                    <span className="configuracoes-checkbox-text">Lembretes de Prazos</span>
                  </label>
                </div>
                <div className="configuracoes-form-group">
                  <label className="configuracoes-checkbox-label">
                    <input
                      type="checkbox"
                      checked={configuracoes.notificacoes.emailAudiencias}
                      onChange={(e) => handleInputChange('notificacoes', 'emailAudiencias', e.target.checked)}
                      className="configuracoes-checkbox"
                    />
                    <span className="configuracoes-checkbox-text">Audiências</span>
                  </label>
                </div>
                <div className="configuracoes-form-group configuracoes-form-group-full">
                  <h3 className="configuracoes-subsection-title">Notificações por SMS</h3>
                </div>
                <div className="configuracoes-form-group">
                  <label className="configuracoes-checkbox-label">
                    <input
                      type="checkbox"
                      checked={configuracoes.notificacoes.smsAlertas}
                      onChange={(e) => handleInputChange('notificacoes', 'smsAlertas', e.target.checked)}
                      className="configuracoes-checkbox"
                    />
                    <span className="configuracoes-checkbox-text">Alertas Urgentes</span>
                  </label>
                </div>
                <div className="configuracoes-form-group">
                  <label className="configuracoes-checkbox-label">
                    <input
                      type="checkbox"
                      checked={configuracoes.notificacoes.smsPrazos}
                      onChange={(e) => handleInputChange('notificacoes', 'smsPrazos', e.target.checked)}
                      className="configuracoes-checkbox"
                    />
                    <span className="configuracoes-checkbox-text">Prazos Críticos</span>
                  </label>
                </div>
                <div className="configuracoes-form-group">
                  <label htmlFor="diasAntecedencia">Dias de Antecedência</label>
                  <select
                    id="diasAntecedencia"
                    value={configuracoes.notificacoes.diasAntecedencia}
                    onChange={(e) => handleInputChange('notificacoes', 'diasAntecedencia', parseInt(e.target.value))}
                    className="configuracoes-select"
                  >
                    <option value={1}>1 dia</option>
                    <option value={2}>2 dias</option>
                    <option value={3}>3 dias</option>
                    <option value={5}>5 dias</option>
                    <option value={7}>1 semana</option>
                  </select>
                </div>
              </div>
              
              {/* Push Notifications */}
              <PushNotificationSettings />
              
              {/* Notification Preferences */}
              <NotificationPreferences />
            </div>
          </div>
        )}

        {activeTab === 'seguranca' && (
          <div className="configuracoes-section">
            <div className="configuracoes-section-header">
              <h2 className="configuracoes-section-title">
                <Shield size={20} />
                Segurança
              </h2>
              <p className="configuracoes-section-description">
                Configure as políticas de segurança do sistema
              </p>
            </div>
            <div className="configuracoes-section-content">
              <div className="configuracoes-form-grid">
                <div className="configuracoes-form-group">
                  <label htmlFor="sessaoTimeout">Timeout da Sessão (minutos)</label>
                  <select
                    id="sessaoTimeout"
                    value={configuracoes.seguranca.sessaoTimeout}
                    onChange={(e) => handleInputChange('seguranca', 'sessaoTimeout', parseInt(e.target.value))}
                    className="configuracoes-select"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                    <option value={480}>8 horas</option>
                  </select>
                </div>
                <div className="configuracoes-form-group">
                  <label htmlFor="tentativasLogin">Tentativas de Login</label>
                  <select
                    id="tentativasLogin"
                    value={configuracoes.seguranca.tentativasLogin}
                    onChange={(e) => handleInputChange('seguranca', 'tentativasLogin', parseInt(e.target.value))}
                    className="configuracoes-select"
                  >
                    <option value={3}>3 tentativas</option>
                    <option value={5}>5 tentativas</option>
                    <option value={10}>10 tentativas</option>
                  </select>
                </div>
                <div className="configuracoes-form-group">
                  <label htmlFor="senhaMinima">Tamanho Mínimo da Senha</label>
                  <select
                    id="senhaMinima"
                    value={configuracoes.seguranca.senhaMinima}
                    onChange={(e) => handleInputChange('seguranca', 'senhaMinima', parseInt(e.target.value))}
                    className="configuracoes-select"
                  >
                    <option value={6}>6 caracteres</option>
                    <option value={8}>8 caracteres</option>
                    <option value={10}>10 caracteres</option>
                    <option value={12}>12 caracteres</option>
                  </select>
                </div>
                <div className="configuracoes-form-group">
                  <label className="configuracoes-checkbox-label">
                    <input
                      type="checkbox"
                      checked={configuracoes.seguranca.doisFatores}
                      onChange={(e) => handleInputChange('seguranca', 'doisFatores', e.target.checked)}
                      className="configuracoes-checkbox"
                    />
                    <span className="configuracoes-checkbox-text">Autenticação de Dois Fatores</span>
                  </label>
                </div>
                <div className="configuracoes-form-group">
                  <label className="configuracoes-checkbox-label">
                    <input
                      type="checkbox"
                      checked={configuracoes.seguranca.logAtividades}
                      onChange={(e) => handleInputChange('seguranca', 'logAtividades', e.target.checked)}
                      className="configuracoes-checkbox"
                    />
                    <span className="configuracoes-checkbox-text">Log de Atividades</span>
                  </label>
                </div>
                <div className="configuracoes-form-group">
                  <label className="configuracoes-checkbox-label">
                    <input
                      type="checkbox"
                      checked={configuracoes.seguranca.backupAutomatico}
                      onChange={(e) => handleInputChange('seguranca', 'backupAutomatico', e.target.checked)}
                      className="configuracoes-checkbox"
                    />
                    <span className="configuracoes-checkbox-text">Backup Automático</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integracao' && (
          <div className="configuracoes-section">
            <div className="configuracoes-section-header">
              <h2 className="configuracoes-section-title">
                <Database size={20} />
                Integração com DataJud
              </h2>
              <p className="configuracoes-section-description">
                Configure a integração com o sistema DataJud/TJ-BA
              </p>
            </div>
            <div className="configuracoes-section-content">
              <div className="configuracoes-form-grid">
                <div className="configuracoes-form-group">
                  <label className="configuracoes-checkbox-label">
                    <input
                      type="checkbox"
                      checked={configuracoes.integracao.datajudAtivo}
                      onChange={(e) => handleInputChange('integracao', 'datajudAtivo', e.target.checked)}
                      className="configuracoes-checkbox"
                    />
                    <span className="configuracoes-checkbox-text">Ativar Integração</span>
                  </label>
                </div>
                <div className="configuracoes-form-group">
                  <label htmlFor="datajudToken">Token de Acesso</label>
                  <input
                    type="password"
                    id="datajudToken"
                    value={configuracoes.integracao.datajudToken}
                    onChange={(e) => handleInputChange('integracao', 'datajudToken', e.target.value)}
                    className="configuracoes-input"
                    placeholder="Digite o token de acesso"
                  />
                </div>
                <div className="configuracoes-form-group">
                  <label htmlFor="datajudBase">URL Base da API</label>
                  <input
                    type="url"
                    id="datajudBase"
                    value={configuracoes.integracao.datajudBase}
                    onChange={(e) => handleInputChange('integracao', 'datajudBase', e.target.value)}
                    className={`configuracoes-input ${errors['integracao.datajudBase'] ? 'error' : ''}`}
                    placeholder="https://api.exemplo.com.br"
                  />
                  {errors['integracao.datajudBase'] && (
                    <span className="configuracoes-error">{errors['integracao.datajudBase']}</span>
                  )}
                </div>
                <div className="configuracoes-form-group">
                  <label className="configuracoes-checkbox-label">
                    <input
                      type="checkbox"
                      checked={configuracoes.integracao.sincronizacaoAutomatica}
                      onChange={(e) => handleInputChange('integracao', 'sincronizacaoAutomatica', e.target.checked)}
                      className="configuracoes-checkbox"
                    />
                    <span className="configuracoes-checkbox-text">Sincronização Automática</span>
                  </label>
                </div>
                <div className="configuracoes-form-group">
                  <label htmlFor="intervalo">Intervalo de Sincronização (minutos)</label>
                  <select
                    id="intervalo"
                    value={configuracoes.integracao.intervalo}
                    onChange={(e) => handleInputChange('integracao', 'intervalo', parseInt(e.target.value))}
                    className="configuracoes-select"
                    disabled={!configuracoes.integracao.sincronizacaoAutomatica}
                  >
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                    <option value={240}>4 horas</option>
                    <option value={480}>8 horas</option>
                    <option value={1440}>24 horas</option>
                  </select>
                </div>
              </div>
              
              {/* Status da Integração */}
              <div className="configuracoes-status">
                <div className="configuracoes-status-item">
                  <div className="configuracoes-status-icon">
                    <CheckCircle size={20} />
                  </div>
                  <div className="configuracoes-status-content">
                    <h4>Status da Conexão</h4>
                    <p>Conectado com sucesso ao DataJud</p>
                  </div>
                </div>
                <div className="configuracoes-status-item">
                  <div className="configuracoes-status-icon">
                    <Clock size={20} />
                  </div>
                  <div className="configuracoes-status-content">
                    <h4>Última Sincronização</h4>
                    <p>Há 15 minutos</p>
                  </div>
                </div>
                <div className="configuracoes-status-item">
                  <div className="configuracoes-status-icon">
                    <Info size={20} />
                  </div>
                  <div className="configuracoes-status-content">
                    <h4>Processos Sincronizados</h4>
                    <p>24 processos atualizados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Configuracoes;
