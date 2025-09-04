import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  FileText, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  AlertTriangle,
  Edit,
  Download,
  Share2,
  Printer
} from 'lucide-react';
import { processoService } from '../../services/api';
import './VisualizarProcesso.css';

const VisualizarProcesso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProcesso = async () => {
      setLoading(true);
      try {
        // Carrega o processo da API
        const response = await processoService.getById(id);
        setProcesso(response);
      } catch (error) {
        console.error('Erro ao carregar processo:', error);
        // Processo não encontrado ou erro
        navigate('/processos');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProcesso();
    }
  }, [id, navigate]);

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

  const handleEdit = () => {
    navigate(`/processos/editar/${id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementar download do processo
    console.log('Download do processo:', id);
  };

  const handleShare = () => {
    // Implementar compartilhamento
    console.log('Compartilhar processo:', id);
  };

  if (loading) {
    return (
      <div className="visualizar-processo">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando processo...</p>
        </div>
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="visualizar-processo">
        <div className="error-container">
          <p>Processo não encontrado.</p>
          <Link to="/processos" className="btn btn-primary">
            Voltar para Processos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="visualizar-processo">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <Link to="/processos" className="btn btn-secondary">
            <ArrowLeft size={20} />
            Voltar
          </Link>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="visualizar-processo-content">
        {/* Cabeçalho do Processo */}
        <div className="processo-header">
          <div className="processo-header-main">
            <div className="processo-title">
              <h1>{processo.numero}</h1>
              <div 
                className="processo-status"
                style={{ backgroundColor: getStatusColor(processo.status) }}
              >
                {getStatusText(processo.status)}
              </div>
            </div>
            <p className="processo-classe">{processo.classe}</p>
          </div>
          
          <div className="processo-actions">
            <button 
              className="btn btn-primary"
              onClick={handleEdit}
            >
              <Edit size={16} />
              Editar
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleDownload}
            >
              <Download size={16} />
              Download
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handlePrint}
            >
              <Printer size={16} />
              Imprimir
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleShare}
            >
              <Share2 size={16} />
              Compartilhar
            </button>
          </div>
        </div>

        {/* Informações do Processo */}
        <div className="processo-info">
          <div className="info-section">
            <h3>
              <FileText size={20} />
              Informações Básicas
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Número do Processo</label>
                <span>{processo.numero}</span>
              </div>
              <div className="info-item">
                <label>Classe</label>
                <span>{processo.classe}</span>
              </div>
              <div className="info-item">
                <label>Assunto</label>
                <span>{processo.assunto || 'Não informado'}</span>
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

          <div className="info-section">
            <h3>
              <MapPin size={20} />
              Localização
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Tribunal</label>
                <span>{processo.tribunal || 'Não informado'}</span>
              </div>
              <div className="info-item">
                <label>Comarca</label>
                <span>{processo.comarca || 'Não informado'}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>
              <Calendar size={20} />
              Datas Importantes
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Data de Distribuição</label>
                <span>{formatDate(processo.dataDistribuicao)}</span>
              </div>
              <div className="info-item">
                <label>Data da Sentença</label>
                <span>{formatDate(processo.dataSentenca)}</span>
              </div>
              <div className="info-item">
                <label>Prazo para Recurso</label>
                <span>{formatDate(processo.prazoRecurso)}</span>
              </div>
              <div className="info-item">
                <label>Prazo para Embargos</label>
                <span>{formatDate(processo.prazoEmbargos)}</span>
              </div>
              <div className="info-item">
                <label>Próxima Audiência</label>
                <span>{formatDateTime(processo.proximaAudiencia)}</span>
              </div>
            </div>
          </div>

          {processo.observacoes && (
            <div className="info-section">
              <h3>
                <AlertTriangle size={20} />
                Observações
              </h3>
              <div className="observacoes-content">
                <p>{processo.observacoes}</p>
              </div>
            </div>
          )}

          <div className="info-section">
            <h3>
              <User size={20} />
              Informações do Sistema
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Data de Criação</label>
                <span>{formatDateTime(processo.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>Última Atualização</label>
                <span>{formatDateTime(processo.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarProcesso;