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
import './VisualizarProcesso.css';

const VisualizarProcesso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dados mockados para demonstração
  const mockProcessos = [
    {
      id: 1,
      numero: '0001234-12.2024.8.05.0001',
      classe: 'Ação de Indenização por Dano Moral',
      assunto: 'Indenização por danos morais decorrentes de acidente de trânsito',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'ativo',
      dataDistribuicao: '2024-01-15T10:30:00Z',
      dataSentenca: '2024-02-20T14:15:00Z',
      prazoRecurso: '2024-03-05T23:59:59Z',
      prazoEmbargos: '2024-03-10T23:59:59Z',
      proximaAudiencia: '2024-03-15T09:00:00Z',
      observacoes: 'Processo em fase de produção de provas. Aguardando perícia médica.',
      user: { nome: 'Dr. João Silva' },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      numero: '0001235-12.2024.8.05.0001',
      classe: 'Execução de Título Extrajudicial',
      assunto: 'Execução de título extrajudicial - cheque sem fundos',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'ativo',
      dataDistribuicao: '2024-01-20T08:45:00Z',
      dataSentenca: null,
      prazoRecurso: null,
      prazoEmbargos: null,
      proximaAudiencia: '2024-03-20T14:00:00Z',
      observacoes: 'Aguardando manifestação do executado.',
      user: { nome: 'Dra. Maria Santos' },
      createdAt: '2024-01-20T08:45:00Z'
    },
    {
      id: 3,
      numero: '0001236-12.2024.8.05.0001',
      classe: 'Mandado de Segurança',
      assunto: 'Mandado de segurança contra ato de autoridade pública',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'arquivado',
      dataDistribuicao: '2024-01-10T16:20:00Z',
      dataSentenca: '2024-02-15T11:30:00Z',
      prazoRecurso: '2024-02-28T23:59:59Z',
      prazoEmbargos: '2024-03-05T23:59:59Z',
      proximaAudiencia: null,
      observacoes: 'Processo arquivado por acordo entre as partes.',
      user: { nome: 'Dr. Pedro Costa' },
      createdAt: '2024-01-10T16:20:00Z'
    }
  ];

  useEffect(() => {
    const loadProcesso = async () => {
      setLoading(true);
      try {
        // Simula delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const processoEncontrado = mockProcessos.find(p => p.id === parseInt(id));
        if (processoEncontrado) {
          setProcesso(processoEncontrado);
        } else {
          // Processo não encontrado
          navigate('/processos');
        }
      } catch (error) {
        console.error('Erro ao carregar processo:', error);
        navigate('/processos');
      } finally {
        setLoading(false);
      }
    };

    loadProcesso();
  }, [id, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo':
        return 'active';
      case 'arquivado':
        return 'archived';
      case 'suspenso':
        return 'suspended';
      default:
        return 'active';
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
        return 'Ativo';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDeadline = (dateString) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleEdit = () => {
    navigate(`/processos/editar/${id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Implementar exportação
    console.log('Exportar processo:', id);
  };

  if (loading) {
    return (
      <div className="visualizar-processo">
        <div className="visualizar-processo-loading">
          <div className="visualizar-processo-loading-spinner" />
          <p>Carregando processo...</p>
        </div>
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="visualizar-processo">
        <div className="visualizar-processo-error">
          <AlertTriangle size={48} />
          <h3>Processo não encontrado</h3>
          <p>O processo solicitado não foi encontrado.</p>
          <Link to="/processos" className="btn btn-primary">
            <ArrowLeft size={20} />
            Voltar para Processos
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(processo.status);
  const deadlines = [
    { date: processo.proximaAudiencia, label: 'Próxima Audiência', type: 'audiencia' },
    { date: processo.prazoRecurso, label: 'Prazo para Recurso', type: 'recurso' },
    { date: processo.prazoEmbargos, label: 'Prazo para Embargos', type: 'embargos' }
  ].filter(d => d.date).map(d => ({
    ...d,
    daysLeft: getDaysUntilDeadline(d.date)
  }));

  return (
    <div className="visualizar-processo">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-breadcrumb">
            <Link to="/processos" className="page-header-breadcrumb-link">
              <ArrowLeft size={16} />
              Processos
            </Link>
            <span className="page-header-breadcrumb-separator">/</span>
            <span className="page-header-breadcrumb-current">Visualizar</span>
          </div>
          <h1 className="page-title">Processo {processo.numero}</h1>
          <p className="page-subtitle">
            {processo.classe}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={20} />
            Imprimir
          </button>
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={20} />
            Exportar
          </button>
          <button className="btn btn-primary" onClick={handleEdit}>
            <Edit size={20} />
            Editar
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="visualizar-processo-content">
        <div className="visualizar-processo-grid">
          {/* Informações Básicas */}
          <div className="visualizar-processo-section">
            <div className="visualizar-processo-section-header">
              <h2 className="visualizar-processo-section-title">
                <FileText size={20} />
                Informações Básicas
              </h2>
              <div className={`visualizar-processo-status visualizar-processo-status-${statusColor}`}>
                {getStatusText(processo.status)}
              </div>
            </div>
            <div className="visualizar-processo-section-content">
              <div className="visualizar-processo-info-grid">
                <div className="visualizar-processo-info-item">
                  <label>Número do Processo</label>
                  <span>{processo.numero}</span>
                </div>
                <div className="visualizar-processo-info-item">
                  <label>Classe</label>
                  <span>{processo.classe}</span>
                </div>
                <div className="visualizar-processo-info-item">
                  <label>Assunto</label>
                  <span>{processo.assunto}</span>
                </div>
                <div className="visualizar-processo-info-item">
                  <label>Tribunal</label>
                  <span>{processo.tribunal}</span>
                </div>
                <div className="visualizar-processo-info-item">
                  <label>Comarca</label>
                  <span>{processo.comarca}</span>
                </div>
                <div className="visualizar-processo-info-item">
                  <label>Status</label>
                  <span className={`visualizar-processo-status-badge visualizar-processo-status-${statusColor}`}>
                    {getStatusText(processo.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Datas Importantes */}
          <div className="visualizar-processo-section">
            <div className="visualizar-processo-section-header">
              <h2 className="visualizar-processo-section-title">
                <Calendar size={20} />
                Datas Importantes
              </h2>
            </div>
            <div className="visualizar-processo-section-content">
              <div className="visualizar-processo-info-grid">
                <div className="visualizar-processo-info-item">
                  <label>Data de Distribuição</label>
                  <span>{formatDate(processo.dataDistribuicao)}</span>
                </div>
                {processo.dataSentenca && (
                  <div className="visualizar-processo-info-item">
                    <label>Data da Sentença</label>
                    <span>{formatDate(processo.dataSentenca)}</span>
                  </div>
                )}
                <div className="visualizar-processo-info-item">
                  <label>Data de Criação</label>
                  <span>{formatDate(processo.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prazos e Audiências */}
          {deadlines.length > 0 && (
            <div className="visualizar-processo-section">
              <div className="visualizar-processo-section-header">
                <h2 className="visualizar-processo-section-title">
                  <Clock size={20} />
                  Prazos e Audiências
                </h2>
              </div>
              <div className="visualizar-processo-section-content">
                <div className="visualizar-processo-deadlines">
                  {deadlines.map((deadline, index) => (
                    <div key={index} className="visualizar-processo-deadline">
                      <div className="visualizar-processo-deadline-header">
                        <span className="visualizar-processo-deadline-label">{deadline.label}</span>
                        <span className={`visualizar-processo-deadline-days ${
                          deadline.daysLeft <= 0 ? 'overdue' :
                          deadline.daysLeft <= 3 ? 'urgent' : 'normal'
                        }`}>
                          {deadline.daysLeft <= 0 ? 
                            `Vencido há ${Math.abs(deadline.daysLeft)} ${Math.abs(deadline.daysLeft) === 1 ? 'dia' : 'dias'}` :
                            deadline.daysLeft === 0 ? 'Vence hoje!' :
                            `${deadline.daysLeft} ${deadline.daysLeft === 1 ? 'dia' : 'dias'} restantes`
                          }
                        </span>
                      </div>
                      <div className="visualizar-processo-deadline-date">
                        {formatDateTime(deadline.date)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          {processo.observacoes && (
            <div className="visualizar-processo-section">
              <div className="visualizar-processo-section-header">
                <h2 className="visualizar-processo-section-title">
                  <FileText size={20} />
                  Observações
                </h2>
              </div>
              <div className="visualizar-processo-section-content">
                <div className="visualizar-processo-observations">
                  <p>{processo.observacoes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Responsável */}
          <div className="visualizar-processo-section">
            <div className="visualizar-processo-section-header">
              <h2 className="visualizar-processo-section-title">
                <User size={20} />
                Responsável
              </h2>
            </div>
            <div className="visualizar-processo-section-content">
              <div className="visualizar-processo-info-grid">
                <div className="visualizar-processo-info-item">
                  <label>Advogado Responsável</label>
                  <span>{processo.user?.nome || 'Não informado'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarProcesso;
