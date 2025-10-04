import React, { useState, useEffect } from 'react';
import { X, Edit2, Calendar, MapPin, Scale, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { processoService } from '../../services/api';
import Timeline from '../Timeline/Timeline';
import CommentSection from '../Comments/CommentSection';
import TagList from '../Tag/TagList';
import UserAvatar from '../UserAvatar/UserAvatar';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { generateProcessoTags } from '../../utils/processoTags';
import './ProcessoDetailModal.css';

const ProcessoDetailModal = ({ processoId, isOpen, onClose }) => {
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && processoId) {
      loadProcesso();
    }
  }, [isOpen, processoId]);

  const loadProcesso = async () => {
    try {
      setLoading(true);
      const response = await processoService.getById(processoId);
      setProcesso(response.processo || response);
    } catch (error) {
      console.error('Erro ao carregar processo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/processos/editar/${processoId}`);
    onClose();
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'ativo': { label: 'Ativo', color: 'success' },
      'suspenso': { label: 'Suspenso', color: 'warning' },
      'arquivado': { label: 'Arquivado', color: 'default' }
    };
    return config[status] || { label: status, color: 'default' };
  };

  if (!isOpen) return null;

  return (
    <div className="processo-modal-overlay" onClick={onClose}>
      <div className="processo-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="processo-modal-header">
          <div className="processo-modal-header-content">
            <h2 className="processo-modal-title">Detalhes do Processo</h2>
            {processo && (
              <div className="processo-modal-tags">
                <TagList tags={generateProcessoTags(processo)} maxVisible={4} />
              </div>
            )}
          </div>
          <div className="processo-modal-header-actions">
            <button className="btn btn-primary btn-sm" onClick={handleEdit}>
              <Edit2 size={16} />
              Editar
            </button>
            <button className="processo-modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="processo-modal-content">
          {loading ? (
            <div className="processo-modal-loading">
              <LoadingSpinner size="large" text="Carregando detalhes..." />
            </div>
          ) : processo ? (
            <div className="processo-modal-grid">
              {/* Informações Principais */}
              <div className="processo-modal-main">
                <div className="processo-detail-section">
                  <h3 className="processo-detail-title">Informações Gerais</h3>
                  
                  <div className="processo-detail-grid">
                    <div className="processo-detail-item">
                      <label className="processo-detail-label">
                        <FileText size={16} />
                        Número do Processo
                      </label>
                      <p className="processo-detail-value processo-detail-value-highlight">
                        {processo.numero}
                      </p>
                    </div>

                    <div className="processo-detail-item">
                      <label className="processo-detail-label">
                        <Scale size={16} />
                        Classe
                      </label>
                      <p className="processo-detail-value">{processo.classe}</p>
                    </div>

                    <div className="processo-detail-item">
                      <label className="processo-detail-label">Status</label>
                      <div>
                        <span className={`status-badge status-badge-${getStatusBadge(processo.status).color}`}>
                          {getStatusBadge(processo.status).label}
                        </span>
                      </div>
                    </div>

                    {processo.tribunal && (
                      <div className="processo-detail-item">
                        <label className="processo-detail-label">
                          <MapPin size={16} />
                          Tribunal
                        </label>
                        <p className="processo-detail-value">{processo.tribunal}</p>
                      </div>
                    )}

                    {processo.comarca && (
                      <div className="processo-detail-item">
                        <label className="processo-detail-label">Comarca</label>
                        <p className="processo-detail-value">{processo.comarca}</p>
                      </div>
                    )}

                    {processo.assunto && (
                      <div className="processo-detail-item full-width">
                        <label className="processo-detail-label">Assunto</label>
                        <p className="processo-detail-value">{processo.assunto}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Datas e Prazos */}
                <div className="processo-detail-section">
                  <h3 className="processo-detail-title">Datas e Prazos</h3>
                  
                  <div className="processo-detail-grid">
                    {processo.dataDistribuicao && (
                      <div className="processo-detail-item">
                        <label className="processo-detail-label">
                          <Calendar size={16} />
                          Data de Distribuição
                        </label>
                        <p className="processo-detail-value">{formatDate(processo.dataDistribuicao)}</p>
                      </div>
                    )}

                    {processo.proximaAudiencia && (
                      <div className="processo-detail-item">
                        <label className="processo-detail-label">
                          <Calendar size={16} />
                          Próxima Audiência
                        </label>
                        <p className="processo-detail-value processo-detail-value-warning">
                          {formatDate(processo.proximaAudiencia)}
                        </p>
                      </div>
                    )}

                    {processo.prazoRecurso && (
                      <div className="processo-detail-item">
                        <label className="processo-detail-label">
                          <Clock size={16} />
                          Prazo Recurso
                        </label>
                        <p className="processo-detail-value">{formatDate(processo.prazoRecurso)}</p>
                      </div>
                    )}

                    {processo.prazoEmbargos && (
                      <div className="processo-detail-item">
                        <label className="processo-detail-label">
                          <Clock size={16} />
                          Prazo Embargos
                        </label>
                        <p className="processo-detail-value">{formatDate(processo.prazoEmbargos)}</p>
                      </div>
                    )}

                    {processo.dataSentenca && (
                      <div className="processo-detail-item">
                        <label className="processo-detail-label">Data da Sentença</label>
                        <p className="processo-detail-value">{formatDate(processo.dataSentenca)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Observações */}
                {processo.observacoes && (
                  <div className="processo-detail-section">
                    <h3 className="processo-detail-title">Observações</h3>
                    <p className="processo-detail-observacoes">{processo.observacoes}</p>
                  </div>
                )}

                {/* Responsável */}
                {processo.user && (
                  <div className="processo-detail-section">
                    <h3 className="processo-detail-title">Responsável</h3>
                    <UserAvatar user={processo.user} size="md" showName={true} />
                  </div>
                )}
              </div>

              {/* Sidebar: Timeline e Comentários */}
              <div className="processo-modal-sidebar">
                <Timeline processo={processo} />
                <CommentSection processoId={processo.id} />
              </div>
            </div>
          ) : (
            <div className="processo-modal-error">
              <p>Processo não encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessoDetailModal;

