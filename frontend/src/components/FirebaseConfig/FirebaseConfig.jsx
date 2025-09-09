import React, { useState, useEffect } from 'react';
import { Database, Server, Settings, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import hybridService from '../../services/hybridService.js';
import './FirebaseConfig.css';

const FirebaseConfig = () => {
  const [useFirebase, setUseFirebase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Verificar configuração atual
    const currentMode = hybridService.isUsingFirebase();
    setUseFirebase(currentMode);
  }, []);

  const handleToggleMode = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const newMode = !useFirebase;
      
      if (newMode) {
        // Tentar inicializar Firebase
        await hybridService.init();
        setMessage('Firebase inicializado com sucesso!');
      } else {
        // Verificar se backend está disponível
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`);
        if (!response.ok) {
          throw new Error('Backend não está disponível');
        }
        setMessage('Backend conectado com sucesso!');
      }

      hybridService.setUseFirebase(newMode);
      setUseFirebase(newMode);
      setStatus('success');
      
      // Salvar preferência no localStorage
      localStorage.setItem('useFirebase', newMode.toString());
      
    } catch (error) {
      console.error('Erro ao alternar modo:', error);
      setStatus('error');
      setMessage(error.message || 'Erro ao conectar com o serviço');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <Loader size={20} className="spinning" />;
    if (status === 'success') return <CheckCircle size={20} className="success" />;
    if (status === 'error') return <AlertCircle size={20} className="error" />;
    return null;
  };

  const getStatusClass = () => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    return '';
  };

  return (
    <div className="firebase-config">
      <div className="firebase-config-header">
        <Settings size={24} />
        <h2>Configuração de Backend</h2>
      </div>

      <div className="firebase-config-content">
        <div className="firebase-config-description">
          <p>
            Escolha qual backend usar para armazenar seus dados:
          </p>
        </div>

        <div className="firebase-config-options">
          {/* Backend Atual */}
          <div className={`firebase-config-option ${!useFirebase ? 'active' : ''}`}>
            <div className="firebase-config-option-header">
              <Server size={24} />
              <h3>Backend Atual</h3>
              <span className="firebase-config-option-badge">Atual</span>
            </div>
            <div className="firebase-config-option-content">
              <p>Usa o backend Node.js com PostgreSQL</p>
              <ul>
                <li>✅ Dados locais no seu servidor</li>
                <li>✅ Controle total dos dados</li>
                <li>✅ Autenticação JWT</li>
                <li>✅ API REST completa</li>
              </ul>
            </div>
          </div>

          {/* Firebase */}
          <div className={`firebase-config-option ${useFirebase ? 'active' : ''}`}>
            <div className="firebase-config-option-header">
              <Database size={24} />
              <h3>Firebase</h3>
              <span className="firebase-config-option-badge">Cloud</span>
            </div>
            <div className="firebase-config-option-content">
              <p>Usa Firebase para autenticação e Firestore</p>
              <ul>
                <li>✅ Sincronização em tempo real</li>
                <li>✅ Escalabilidade automática</li>
                <li>✅ Autenticação integrada</li>
                <li>✅ Backup automático</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="firebase-config-actions">
          <button
            className={`firebase-config-toggle ${useFirebase ? 'firebase' : 'backend'}`}
            onClick={handleToggleMode}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={16} className="spinning" />
                Alternando...
              </>
            ) : (
              <>
                {useFirebase ? <Server size={16} /> : <Database size={16} />}
                Usar {useFirebase ? 'Backend' : 'Firebase'}
              </>
            )}
          </button>
        </div>

        {message && (
          <div className={`firebase-config-message ${getStatusClass()}`}>
            {getStatusIcon()}
            <span>{message}</span>
          </div>
        )}

        <div className="firebase-config-info">
          <h4>Como configurar Firebase:</h4>
          <ol>
            <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
            <li>Crie um novo projeto</li>
            <li>Configure Authentication (Email/Password)</li>
            <li>Configure Firestore Database</li>
            <li>Copie as configurações para o arquivo <code>.env.local</code></li>
            <li>Reinicie a aplicação</li>
          </ol>
          
          <p>
            <strong>Nota:</strong> Consulte o arquivo <code>firebase-config-example.md</code> para instruções detalhadas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseConfig;
