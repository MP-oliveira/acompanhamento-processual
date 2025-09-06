import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  AlertTriangle,
  FileDown,
  FileText as FileTextIcon,
  Clock
} from 'lucide-react';
import { processoService } from '../../services/api';
import Modal from '../Modal/Modal';
import './ModalVisualizarProcesso.css';

const ModalVisualizarProcesso = ({ isOpen, onClose, processoId }) => {
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && processoId) {
      loadProcesso();
    }
  }, [isOpen, processoId]);

  const loadProcesso = async () => {
    setLoading(true);
    try {
      const response = await processoService.getById(processoId);
      setProcesso(response);
    } catch (error) {
      console.error('Erro ao carregar processo:', error);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo':
        return 'var(--success-color)';
      case 'arquivado':
        return 'var(--warning-color)';
      case 'suspenso':
        return 'var(--error-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'arquivado':
        return 'Arquivado';
      case 'suspenso':
        return 'Suspenso';
      default:
        return status;
    }
  };

  const handleDownloadPDF = () => {
    console.log('Download PDF do processo:', processoId);
  };

  const handleDownloadWord = () => {
    console.log('Download Word do processo:', processoId);
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Carregando...">
        <div className="modal-loading">
          <div className="loading-spinner"></div>
          <p>Carregando informações do processo...</p>
        </div>
      </Modal>
    );
  }

  if (!processo) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Erro">
        <div className="modal-error">
          <p>Processo não encontrado.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={processo.numero ? `Processo ${processo.numero}` : 'Visualizar Processo'}
      size="extra-large"
    >
      <div className="modal-visualizar-processo">
        {/* Header do Processo */}
        <div className="processo-header">
          <div className="processo-header-main">
            <div className="processo-title">
              <h3>{processo.numero}</h3>
              <div 
                className="processo-status-badge"
                style={{ backgroundColor: getStatusColor(processo.status) }}
              >
                {getStatusText(processo.status)}
              </div>
            </div>
            <p className="processo-classe">{processo.classe}</p>
            {processo.assunto && (
              <p className="processo-assunto">{processo.assunto}</p>
            )}
          </div>
          
          {/* Ações do Processo */}
          <div className="processo-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleDownloadPDF}
              title="Download PDF"
            >
              <FileDown size={16} />
              PDF
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleDownloadWord}
              title="Download Word"
            >
              <FileTextIcon size={16} />
              Word
            </button>
          </div>
        </div>

        {/* Grid de Informações */}
        <div className="processo-info-grid">
          {/* Informações Básicas */}
          <div className="info-card">
            <div className="info-card-header">
              <FileText size={20} />
              <h4>Informações Básicas</h4>
            </div>
            <div className="info-card-content">
              <div className="info-item">
                <label>Número do Processo</label>
                <span className="info-value">{processo.numero}</span>
              </div>
              <div className="info-item">
                <label>Classe</label>
                <span className="info-value">{processo.classe}</span>
              </div>
              <div className="info-item">
                <label>Assunto</label>
                <span className="info-value">{processo.assunto || 'Não informado'}</span>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(processo.status) }}
                >
                  {getStatusText(processo.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="info-card">
            <div className="info-card-header">
              <MapPin size={20} />
              <h4>Localização</h4>
            </div>
            <div className="info-card-content">
              <div className="info-item">
                <label>Tribunal</label>
                <span className="info-value">{processo.tribunal || 'Não informado'}</span>
              </div>
              <div className="info-item">
                <label>Comarca</label>
                <span className="info-value">{processo.comarca || 'Não informado'}</span>
              </div>
            </div>
          </div>

          {/* Datas Importantes */}
          <div className="info-card">
            <div className="info-card-header">
              <Calendar size={20} />
              <h4>Datas Importantes</h4>
            </div>
            <div className="info-card-content">
              <div className="info-item">
                <label>Data de Distribuição</label>
                <span className="info-value">{formatDate(processo.dataDistribuicao)}</span>
              </div>
              <div className="info-item">
                <label>Data da Sentença</label>
                <span className="info-value">{formatDate(processo.dataSentenca)}</span>
              </div>
              <div className="info-item">
                <label>Prazo para Recurso</label>
                <span className="info-value">{formatDate(processo.prazoRecurso)}</span>
              </div>
              <div className="info-item">
                <label>Prazo para Embargos</label>
                <span className="info-value">{formatDate(processo.prazoEmbargos)}</span>
              </div>
              <div className="info-item">
                <label>Próxima Audiência</label>
                <span className="info-value">{formatDateTime(processo.proximaAudiencia)}</span>
              </div>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="info-card">
            <div className="info-card-header">
              <User size={20} />
              <h4>Informações do Sistema</h4>
            </div>
            <div className="info-card-content">
              <div className="info-item">
                <label>Data de Criação</label>
                <span className="info-value">{formatDateTime(processo.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>Última Atualização</label>
                <span className="info-value">{formatDateTime(processo.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {processo.observacoes && (
            <div className="info-card info-card-full">
              <div className="info-card-header">
                <AlertTriangle size={20} />
                <h4>Observações</h4>
              </div>
              <div className="info-card-content">
                <div className="observacoes-content">
                  <p>{processo.observacoes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalVisualizarProcesso;
