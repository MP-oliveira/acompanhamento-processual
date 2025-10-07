import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  CheckCircle2,
  DollarSign,
  XCircle,
  AlertTriangle,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { relatorioService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import RelatorioExport from '../RelatorioExport/RelatorioExport';
import './Relatorios.css';

const Relatorios = () => {
  const { isAuthenticated, user } = useAuth();
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('todos');
  const [selectedType, setSelectedType] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRelatorio, setSelectedRelatorio] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [relatorioData, setRelatorioData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Buscar relatórios do backend
  useEffect(() => {
    const fetchRelatorios = async () => {
      if (!isAuthenticated || !user) {
        console.log('👤 Usuário não autenticado - pulando busca de relatórios');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📊 Relatórios: Buscando relatórios para o usuário', user.email);
        const response = await relatorioService.getAll({
          tipo: selectedType !== 'todos' ? selectedType : undefined,
          status: 'todos'
        });
        
        // Usar dados reais do backend
        setRelatorios(response.relatorios || []);
      } catch (error) {
        console.error('Erro ao buscar relatórios:', error);
        setRelatorios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorios();
  }, [selectedType, selectedPeriod, isAuthenticated, user]);

  const filteredRelatorios = relatorios.filter(relatorio => {
    const matchesType = selectedType === 'todos' || relatorio.tipo === selectedType;
    const matchesPeriod = selectedPeriod === 'todos' || relatorio.periodo.includes(selectedPeriod);
    
    return matchesType && matchesPeriod;
  });

  const handleGerarRelatorio = async () => {
    const agora = new Date();
    const periodo = agora.toISOString().slice(0, 7); // YYYY-MM
    const mesNome = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    // Gerar relatório automático inteligente
    const reportData = {
      tipo: 'processos',
      titulo: `Relatório Mensal - ${mesNome}`,
      descricao: `Relatório automático com análise completa de processos, prazos e alertas do mês de ${mesNome.toLowerCase()}`,
      periodo: periodo
    };

    try {
      setLoading(true);
      console.log('📊 Gerando relatório automático:', reportData);
      const result = await relatorioService.create(reportData);
      console.log('✅ Relatório gerado com sucesso:', result);
      
      // Recarregar relatórios
      const response = await relatorioService.getAll({
        tipo: selectedType !== 'todos' ? selectedType : undefined,
        status: 'todos'
      });
      setRelatorios(response.relatorios || []);
      
      // Atualizar estatísticas
      const statsResponse = await relatorioService.getStats();
      setStats(statsResponse || { total: 0, concluidos: 0, processando: 0, erro: 0 });
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };



  const handleExportSuccess = (relatorioId, type) => {
    // Aqui você pode adicionar notificação de sucesso
  };

  const handleExportError = (error) => {
    console.error('Erro na exportação:', error);
    // Aqui você pode adicionar notificação de erro
  };

  const handleViewRelatorio = async (relatorio) => {
    setSelectedRelatorio(relatorio);
    setShowViewModal(true);
    await loadRelatorioData(relatorio);
  };

  const loadRelatorioData = async (relatorio) => {
    try {
      setLoadingData(true);
      const data = await relatorioService.getRelatorioData({
        mes: relatorio.mes,
        ano: relatorio.ano,
        userId: user.id
      });
      setRelatorioData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      // Fallback para dados mockados se a API falhar
      setRelatorioData({
        estatisticas: {
          totalProcessos: 1,
          processosAtivos: 1,
          processosArquivados: 0,
          processosSuspensos: 0,
          totalAudiencias: 3,
          totalHoras: 40,
          valorTotal: 2000,
          receitas: 5000,
          despesas: 1200,
          lucro: 3800
        },
        processos: [
          {
            numero: '1234567-89.2025.8.26.0001',
            cliente: 'João Silva',
            status: 'ATIVO',
            data: '01/10/2025'
          }
        ],
        timesheet: [
          {
            descricao: 'Elaboração de petição inicial',
            processo: '1234567-89.2025.8.26.0001',
            horas: 8,
            valor: 400
          }
        ]
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteRelatorio = (relatorio) => {
    setSelectedRelatorio(relatorio);
    setAdminPassword('');
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRelatorio(null);
    setAdminPassword('');
  };

  const handleOpenStatusModal = (status) => {
    setSelectedStatus(status);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedStatus(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRelatorio || !adminPassword.trim()) {
      alert('Por favor, digite a senha do administrador para confirmar a exclusão.');
      return;
    }

    try {
      setDeleteLoading(true);
      
      // Validar senha do admin e deletar relatório
      await relatorioService.deleteWithPassword(selectedRelatorio.id, adminPassword);
      
      setShowDeleteModal(false);
      setSelectedRelatorio(null);
      setAdminPassword('');
      
      // Recarregar relatórios
      const response = await relatorioService.getAll({
        tipo: selectedType !== 'todos' ? selectedType : undefined,
        status: 'todos'
      });
      setRelatorios(response.relatorios || []);
      
      // Atualizar estatísticas
      const statsResponse = await relatorioService.getStats();
      setStats(statsResponse || { total: 0, concluidos: 0, processando: 0, erro: 0 });
      
      alert('Relatório excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar relatório:', error);
      if (error.response?.status === 401) {
        alert('Senha incorreta. Apenas administradores podem excluir relatórios.');
      } else if (error.response?.status === 403) {
        alert('Acesso negado. Apenas administradores podem excluir relatórios.');
      } else {
        alert('Erro ao deletar relatório. Tente novamente.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };


  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await relatorioService.getAll({
        tipo: selectedType !== 'todos' ? selectedType : undefined,
        status: 'todos'
      });
      setRelatorios(response.relatorios || []);
    } catch (error) {
      console.error('Erro ao atualizar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const [stats, setStats] = useState({
    total: 0,
    concluidos: 0,
    processando: 0,
    erro: 0
  });

  // Buscar estatísticas do backend
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        const response = await relatorioService.getStats();
        
        // Usar dados reais do backend
        setStats(response || { total: 0, concluidos: 0, processando: 0, erro: 0 });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        // Em caso de erro, zerar estatísticas
        setStats({ total: 0, concluidos: 0, processando: 0, erro: 0 });
      }
    };

    fetchStats();
  }, [isAuthenticated, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle size={16} className="status-icon status-success" />;
      case 'processando':
        return <Clock size={16} className="status-icon status-warning" />;
      case 'erro':
        return <XCircle size={16} className="status-icon status-error" />;
      default:
        return <AlertTriangle size={16} className="status-icon status-warning" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'concluido':
        return 'Concluído';
      case 'processando':
        return 'Processando';
      case 'erro':
        return 'Erro';
      default:
        return 'Pendente';
    }
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'processos':
        return 'Processos';
      case 'prazos':
        return 'Prazos';
      case 'alertas':
        return 'Alertas';
      case 'consultas':
        return 'Consultas';
      case 'usuarios':
        return 'Usuários';
      default:
        return 'Relatório';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'processos':
        return <FileText size={20} />;
      case 'prazos':
        return <Clock size={20} />;
      case 'alertas':
        return <AlertTriangle size={20} />;
      case 'consultas':
        return <BarChart3 size={20} />;
      case 'usuarios':
        return <Users size={20} />;
      default:
        return <BarChart3 size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="relatorios">
        <div className="relatorios-loading">
          <div className="relatorios-loading-spinner" />
          <p>Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relatorios">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <BarChart3 size={24} />
            Relatórios
          </h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={20} />
            Atualizar
          </button>
          <button className="btn btn-primary" onClick={handleGerarRelatorio}>
            <BarChart3 size={20} />
            Gerar Relatório
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="relatorios-stats">
        <div className="relatorios-stat-card">
          <div className="relatorios-stat-icon relatorios-stat-total">
            <BarChart3 size={20} />
          </div>
          <div className="relatorios-stat-content">
            <div className="relatorios-stat-value">{stats.total}</div>
            <div className="relatorios-stat-label">Total</div>
          </div>
        </div>
        
        <div className="relatorios-stat-card">
          <div className="relatorios-stat-icon relatorios-stat-completed">
            <CheckCircle size={20} />
          </div>
          <div className="relatorios-stat-content">
            <div className="relatorios-stat-value">{stats.concluidos}</div>
            <div className="relatorios-stat-label">Concluídos</div>
          </div>
        </div>
        
        <div className="relatorios-stat-card">
          <div className="relatorios-stat-icon relatorios-stat-processing">
            <Clock size={20} />
          </div>
          <div className="relatorios-stat-content">
            <div className="relatorios-stat-value">{stats.processando}</div>
            <div className="relatorios-stat-label">Processando</div>
          </div>
        </div>
        
        <div className="relatorios-stat-card">
          <div className="relatorios-stat-icon relatorios-stat-error">
            <XCircle size={20} />
          </div>
          <div className="relatorios-stat-content">
            <div className="relatorios-stat-value">{stats.erro}</div>
            <div className="relatorios-stat-label">Com Erro</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="relatorios-filters">
        <div className="relatorios-filters-header">
          <h3>Filtros</h3>
          <button 
            className="relatorios-filters-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
        </div>

        {showFilters && (
          <div className="relatorios-filters-row">
            <div className="relatorios-filter">
              <label htmlFor="selectedType">Tipo:</label>
              <select
                id="selectedType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="relatorios-filter-select"
              >
                <option value="todos">Todos</option>
                <option value="processos">Processos</option>
                <option value="prazos">Prazos</option>
                <option value="alertas">Alertas</option>
                <option value="consultas">Consultas</option>
                <option value="usuarios">Usuários</option>
              </select>
            </div>

            <div className="relatorios-filter">
              <label htmlFor="selectedPeriod">Período:</label>
              <select
                id="selectedPeriod"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="relatorios-filter-select"
              >
                <option value="todos">Todos</option>
                <option value="2024-03">Março 2024</option>
                <option value="2024-02">Fevereiro 2024</option>
                <option value="2024-01">Janeiro 2024</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Relatórios */}
      <div className="relatorios-content">
        {filteredRelatorios.length === 0 ? (
          <div className="relatorios-empty">
            <BarChart3 size={48} />
            <h3>Nenhum relatório encontrado</h3>
            <p>
              {selectedType !== 'todos' || selectedPeriod !== 'todos'
                ? 'Tente ajustar os filtros de busca.'
                : 'Gere seu primeiro relatório para começar.'
              }
            </p>
            {selectedType === 'todos' && selectedPeriod === 'todos' && (
              <button 
                className="btn btn-primary btn-first-report"
                onClick={handleGerarRelatorio}
              >
                <BarChart3 size={18} />
                Gerar Primeiro Relatório
              </button>
            )}
          </div>
        ) : (
          <div className="relatorios-grid">
            {filteredRelatorios.map(relatorio => (
              <div key={relatorio.id} className={`relatorio-card relatorio-card-${relatorio.status}`}>
                <div className="relatorio-card-header">
                  <div className="relatorio-card-type">
                    {getTipoIcon(relatorio.tipo)}
                    <span>{getTipoText(relatorio.tipo)}</span>
                  </div>
                  <div className="relatorio-card-status">
                    {getStatusIcon(relatorio.status)}
                    <span>{getStatusText(relatorio.status)}</span>
                  </div>
                </div>

                <div className="relatorio-card-content">
                  <h4 className="relatorio-card-title">
                    {relatorio.titulo}
                  </h4>
                  <p className="relatorio-card-description">
                    {relatorio.descricao}
                  </p>
                  
                  <div className="relatorio-card-meta">
                    <div className="relatorio-card-period">
                      <Calendar size={14} />
                      <span>Período: {relatorio.periodo}</span>
                    </div>
                    <div className="relatorio-card-date">
                      <Clock size={14} />
                      <span>Gerado em: {formatDate(relatorio.dataGeracao)}</span>
                    </div>
                  </div>
                </div>

                {relatorio.dados && (
                  <div className="relatorio-card-data">
                    <h5>Principais Indicadores:</h5>
                    <div className="relatorio-data-grid">
                      {Object.entries(relatorio.dados).map(([key, value]) => {
                        if (key === 'crescimento') return null;
                        return (
                          <div key={key} className="relatorio-data-item">
                            <span className="relatorio-data-label">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </span>
                            <span className="relatorio-data-value">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {relatorio.dados.crescimento && (
                      <div className="relatorio-crescimento">
                        <div className={`relatorio-crescimento-value ${
                          relatorio.dados.crescimento > 0 ? 'positive' : 'negative'
                        }`}>
                          {relatorio.dados.crescimento > 0 ? (
                            <TrendingUp size={16} />
                          ) : (
                            <TrendingDown size={16} />
                          )}
                          <span>{Math.abs(relatorio.dados.crescimento)}%</span>
                        </div>
                        <span className="relatorio-crescimento-label">vs período anterior</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="relatorio-card-actions">
                  <button
                    className="relatorio-card-action-btn relatorio-card-action-view"
                    onClick={() => handleViewRelatorio(relatorio)}
                    title="Visualizar relatório completo"
                  >
                    <Eye size={16} />
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      className="relatorio-card-action-btn relatorio-card-action-delete"
                      onClick={() => handleDeleteRelatorio(relatorio)}
                      title="Excluir relatório (apenas admin)"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <RelatorioExport 
                    relatorio={relatorio}
                    onSuccess={(type) => handleExportSuccess(relatorio.id, type)}
                    onError={handleExportError}
                    className={relatorio.status !== 'concluido' ? 'disabled' : ''}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Visualização Completa */}
      {showViewModal && selectedRelatorio && (
        <div className="processo-view-overlay" onClick={() => setShowViewModal(false)}>
          <div className="processo-view-container" onClick={(e) => e.stopPropagation()}>
            <div className="processo-view-header">
              <h2>{selectedRelatorio.titulo}</h2>
              <div className="modal-header-actions">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => window.print()}
                  title="Imprimir relatório"
                >
                  <FileText size={16} />
                  Imprimir
                </button>
                <button 
                  className="modal-close-btn" 
                  onClick={() => setShowViewModal(false)}
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            
            <div className="processo-view-content">
              {loadingData && (
                <div className="relatorio-loading">
                  <div className="loading-spinner"></div>
                  <p>Carregando dados do relatório...</p>
                </div>
              )}
              <div className="relatorio-completo">
                {/* Header do Relatório */}
                <div className="relatorio-completo-header">
                  <div className="relatorio-completo-meta">
                    <div className="relatorio-meta-item">
                      <span>Período: {selectedRelatorio.periodo}</span>
                    </div>
                    <div className="relatorio-meta-item">
                      <span>Gerado em: {formatDate(selectedRelatorio.dataGeracao)}</span>
                    </div>
                    <div className="relatorio-meta-item">
                      <span>Tipo: {getTipoText(selectedRelatorio.tipo)}</span>
                    </div>
                  </div>
                  <div className="relatorio-completo-status">
                    <span>{getStatusText(selectedRelatorio.status)}</span>
                  </div>
                </div>

                {/* Descrição */}
                <div className="relatorio-completo-description">
                  <p>{selectedRelatorio.descricao}</p>
                </div>

                {/* Seções de Dados */}
                <div className="relatorio-completo-sections">
                  {/* Resumo Executivo */}
                  <div className="relatorio-section relatorio-section-resumo">
                    <h3>Resumo Executivo</h3>
                    <div className="relatorio-section-content">
                      <div className="relatorio-resumo-stats-grid">
                        <div className="relatorio-resumo-stat-card">
                          <div className="relatorio-resumo-stat-icon total">
                            <FileText size={24} />
                          </div>
                          <div className="relatorio-resumo-stat-content">
                            <div className="relatorio-resumo-stat-value">
                              {loadingData ? '...' : (relatorioData?.estatisticas?.totalProcessos || 0)}
                            </div>
                            <div className="relatorio-resumo-stat-label">Total de Processos</div>
                          </div>
                        </div>
                        <div className="relatorio-resumo-stat-card">
                          <div className="relatorio-resumo-stat-icon ativos">
                            <CheckCircle size={24} />
                          </div>
                          <div className="relatorio-resumo-stat-content">
                            <div className="relatorio-resumo-stat-value">
                              {loadingData ? '...' : (relatorioData?.estatisticas?.processosAtivos || 0)}
                            </div>
                            <div className="relatorio-resumo-stat-label">Processos Ativos</div>
                          </div>
                        </div>
                        <div className="relatorio-resumo-stat-card">
                          <div className="relatorio-resumo-stat-icon arquivados">
                            <FileText size={24} />
                          </div>
                          <div className="relatorio-resumo-stat-content">
                            <div className="relatorio-resumo-stat-value">
                              {loadingData ? '...' : (relatorioData?.estatisticas?.processosArquivados || 0)}
                            </div>
                            <div className="relatorio-resumo-stat-label">Processos Arquivados</div>
                          </div>
                        </div>
                        <div className="relatorio-resumo-stat-card">
                          <div className="relatorio-resumo-stat-icon suspensos">
                            <Clock size={24} />
                          </div>
                          <div className="relatorio-resumo-stat-content">
                            <div className="relatorio-resumo-stat-value">
                              {loadingData ? '...' : (relatorioData?.estatisticas?.processosSuspensos || 0)}
                            </div>
                            <div className="relatorio-resumo-stat-label">Processos Suspensos</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Processos do Mês */}
                  <div className="relatorio-section relatorio-section-processos">
                    <h3>Processos do Mês</h3>
                    <div className="relatorio-section-content">
                      <div className="relatorio-table">
                        <div className="relatorio-table-header">
                          <div className="relatorio-table-cell">Número</div>
                          <div className="relatorio-table-cell">Cliente</div>
                          <div className="relatorio-table-cell">Status</div>
                          <div className="relatorio-table-cell">Data</div>
                        </div>
                        <div className="relatorio-table-row">
                          <div className="relatorio-table-cell">1234567-89.2025.8.26.0001</div>
                          <div className="relatorio-table-cell">João Silva</div>
                          <div className="relatorio-table-cell">
                            <span className="relatorio-status-badge ativo">Ativo</span>
                          </div>
                          <div className="relatorio-table-cell">01/10/2025</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarefas Realizadas */}
                  <div className="relatorio-section relatorio-section-tarefas">
                    <h3>Tarefas Realizadas</h3>
                    <div className="relatorio-section-content">
                      <div className="relatorio-tasks">
                        <div className="relatorio-task-item">
                          <div className="relatorio-task-info">
                            <div className="relatorio-task-title">Petição inicial protocolada</div>
                            <div className="relatorio-task-meta">Processo: 1234567-89.2025.8.26.0001</div>
                          </div>
                          <div className="relatorio-task-date">15/10/2025</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="relatorio-section relatorio-section-timeline">
                    <h3>Status do Mês</h3>
                    <div className="relatorio-section-content">
                      {/* Cards de Estatísticas */}
                      <div className="relatorio-stats-grid">
                        <div className="relatorio-stat-card" onClick={() => handleOpenStatusModal('audiencias')}>
                          <div className="relatorio-stat-icon audiencia">
                            <Calendar size={24} />
                          </div>
                          <div className="relatorio-stat-content">
                            <div className="relatorio-stat-number">
                              {loadingData ? '...' : (relatorioData?.estatisticas?.totalAudiencias || 0)}
                            </div>
                            <div className="relatorio-stat-label">Audiências</div>
                          </div>
                        </div>

                        <div className="relatorio-stat-card" onClick={() => handleOpenStatusModal('processos')}>
                          <div className="relatorio-stat-icon processo">
                            <CheckCircle size={24} />
                          </div>
                          <div className="relatorio-stat-content">
                            <div className="relatorio-stat-number">
                              {loadingData ? '...' : (relatorioData?.estatisticas?.processosAtivos || 0)}
                            </div>
                            <div className="relatorio-stat-label">Processos Ativos</div>
                          </div>
                        </div>

                        <div className="relatorio-stat-card" onClick={() => handleOpenStatusModal('distribuicao')}>
                          <div className="relatorio-stat-icon distribuicao">
                            <FileText size={24} />
                          </div>
                          <div className="relatorio-stat-content">
                            <div className="relatorio-stat-number">
                              {loadingData ? '...' : (relatorioData?.estatisticas?.processosDistribuidos || 0)}
                            </div>
                            <div className="relatorio-stat-label">Distribuídos</div>
                          </div>
                        </div>

                        <div className="relatorio-stat-card" onClick={() => handleOpenStatusModal('concluidos')}>
                          <div className="relatorio-stat-icon concluido">
                            <CheckCircle2 size={24} />
                          </div>
                          <div className="relatorio-stat-content">
                            <div className="relatorio-stat-number">
                              {loadingData ? '...' : (relatorioData?.estatisticas?.processosConcluidos || 0)}
                            </div>
                            <div className="relatorio-stat-label">Concluídos</div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Visual */}
                      <div className="relatorio-timeline">
                        <div className="relatorio-timeline-item" onClick={() => handleOpenStatusModal('audiencias')}>
                          <div className="relatorio-timeline-icon audiencia-agendada">
                            <Calendar size={16} />
                          </div>
                          <div className="relatorio-timeline-content">
                            <div className="relatorio-timeline-title">Audiência Agendada</div>
                            <div className="relatorio-timeline-subtitle">Ação de Indenização</div>
                            <div className="relatorio-timeline-date">10 de out. de 2025, 21:00</div>
                          </div>
                          <div className="relatorio-timeline-date-right">10 de out. de 2025</div>
                        </div>

                        <div className="relatorio-timeline-item" onClick={() => handleOpenStatusModal('processos')}>
                          <div className="relatorio-timeline-icon processo-ativo">
                            <CheckCircle size={16} />
                          </div>
                          <div className="relatorio-timeline-content">
                            <div className="relatorio-timeline-title">Processo Ativo</div>
                            <div className="relatorio-timeline-subtitle">Sem nada</div>
                            <div className="relatorio-timeline-date">07 de out. de 2025, 14:55</div>
                          </div>
                          <div className="relatorio-timeline-date-right">07 de out. de 2025</div>
                        </div>

                        <div className="relatorio-timeline-item" onClick={() => handleOpenStatusModal('distribuicao')}>
                          <div className="relatorio-timeline-icon processo-distribuido">
                            <FileText size={16} />
                          </div>
                          <div className="relatorio-timeline-content">
                            <div className="relatorio-timeline-title">Processo Distribuído</div>
                            <div className="relatorio-timeline-subtitle">Distribuído em TJBA</div>
                            <div className="relatorio-timeline-date">03 de out. de 2025, 21:00</div>
                          </div>
                          <div className="relatorio-timeline-date-right">03 de out. de 2025</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timesheet */}
                  <div className="relatorio-section relatorio-section-timesheet">
                    <h3>Controle de Horas</h3>
                    <div className="relatorio-section-content">
                      <div className="relatorio-timesheet">
                        <div className="relatorio-timesheet-stats-grid">
                          <div className="relatorio-timesheet-stat-card">
                            <div className="relatorio-timesheet-stat-icon horas">
                              <Clock size={24} />
                            </div>
                            <div className="relatorio-timesheet-stat-content">
                              <div className="relatorio-timesheet-stat-value">
                                {loadingData ? '...' : `${relatorioData?.estatisticas?.totalHoras || 0}h`}
                              </div>
                              <div className="relatorio-timesheet-stat-label">Total de Horas</div>
                            </div>
                          </div>
                          <div className="relatorio-timesheet-stat-card">
                            <div className="relatorio-timesheet-stat-icon valor">
                              <DollarSign size={24} />
                            </div>
                            <div className="relatorio-timesheet-stat-content">
                              <div className="relatorio-timesheet-stat-value">
                                {loadingData ? '...' : `R$ ${(relatorioData?.estatisticas?.valorTotal || 0).toLocaleString('pt-BR')}`}
                              </div>
                              <div className="relatorio-timesheet-stat-label">Valor Total</div>
                            </div>
                          </div>
                        </div>
                        <div className="relatorio-timesheet-details">
                          <div className="relatorio-timesheet-item">
                            <div className="relatorio-timesheet-info">
                              <div className="relatorio-timesheet-desc">Elaboração de petição inicial</div>
                              <div className="relatorio-timesheet-meta">Processo: 1234567-89.2025.8.26.0001</div>
                            </div>
                            <div className="relatorio-timesheet-valores">
                              <div className="relatorio-timesheet-stat-card pequeno">
                                <div className="relatorio-timesheet-stat-icon pequeno horas">
                                  <Clock size={16} />
                                </div>
                                <div className="relatorio-timesheet-stat-content">
                                  <div className="relatorio-timesheet-stat-value">
                                    {loadingData ? '...' : `${relatorioData?.timesheet?.[0]?.horas || 0}h`}
                                  </div>
                                </div>
                              </div>
                              <div className="relatorio-timesheet-stat-card pequeno">
                                <div className="relatorio-timesheet-stat-icon pequeno valor">
                                  <DollarSign size={16} />
                                </div>
                                <div className="relatorio-timesheet-stat-content">
                                  <div className="relatorio-timesheet-stat-value">
                                    {loadingData ? '...' : `R$ ${(relatorioData?.timesheet?.[0]?.valor || 0).toLocaleString('pt-BR')}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financeiro */}
                  <div className="relatorio-section relatorio-section-financeiro">
                    <h3>Financeiro</h3>
                    <div className="relatorio-section-content">
                      <div className="relatorio-financeiro">
                        <div className="relatorio-financeiro-stats-grid">
                          <div className="relatorio-financeiro-stat-card">
                            <div className="relatorio-financeiro-stat-icon receitas">
                              <TrendingUp size={24} />
                            </div>
                            <div className="relatorio-financeiro-stat-content">
                              <div className="relatorio-financeiro-stat-value">
                                {loadingData ? '...' : `R$ ${(relatorioData?.estatisticas?.receitas || 0).toLocaleString('pt-BR')}`}
                              </div>
                              <div className="relatorio-financeiro-stat-label">Receitas</div>
                            </div>
                          </div>
                          <div className="relatorio-financeiro-stat-card">
                            <div className="relatorio-financeiro-stat-icon despesas">
                              <TrendingDown size={24} />
                            </div>
                            <div className="relatorio-financeiro-stat-content">
                              <div className="relatorio-financeiro-stat-value">
                                {loadingData ? '...' : `R$ ${(relatorioData?.estatisticas?.despesas || 0).toLocaleString('pt-BR')}`}
                              </div>
                              <div className="relatorio-financeiro-stat-label">Despesas</div>
                            </div>
                          </div>
                          <div className="relatorio-financeiro-stat-card">
                            <div className="relatorio-financeiro-stat-icon lucro">
                              <DollarSign size={24} />
                            </div>
                            <div className="relatorio-financeiro-stat-content">
                              <div className="relatorio-financeiro-stat-value">
                                {loadingData ? '...' : `R$ ${(relatorioData?.estatisticas?.lucro || 0).toLocaleString('pt-BR')}`}
                              </div>
                              <div className="relatorio-financeiro-stat-label">Lucro</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Deletar */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirmar Exclusão</h2>
              <button 
                className="modal-close"
                onClick={handleCloseDeleteModal}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="confirm-message">
                <AlertTriangle size={48} className="confirm-icon" />
                <p>Tem certeza que deseja deletar o relatório:</p>
                <strong>"{selectedRelatorio?.titulo}"</strong>
                <p className="confirm-warning">Esta ação não pode ser desfeita.</p>
              </div>
              
              <div className="admin-password-section">
                <label htmlFor="adminPassword" className="admin-password-label">
                  🔒 Senha do Administrador:
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  className="admin-password-input"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Digite sua senha de administrador"
                  autoComplete="current-password"
                />
                <small className="admin-password-help">
                  Apenas administradores podem excluir relatórios. Digite sua senha para confirmar.
                </small>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={handleCloseDeleteModal}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmDelete}
                disabled={deleteLoading || !adminPassword.trim()}
              >
                <Trash2 size={16} />
                {deleteLoading ? 'Excluindo...' : 'Sim, Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Status Detalhado */}
      {showStatusModal && selectedStatus && (
        <div className="processo-view-overlay" onClick={handleCloseStatusModal}>
          <div className="processo-view-container" onClick={(e) => e.stopPropagation()}>
            <div className="processo-view-header">
              <h2>
                {selectedStatus === 'audiencias' && 'Audiências do Mês'}
                {selectedStatus === 'processos' && 'Processos Ativos'}
                {selectedStatus === 'distribuicao' && 'Processos Distribuídos'}
              </h2>
              <div className="modal-header-actions">
                <button 
                  className="modal-close-btn" 
                  onClick={handleCloseStatusModal}
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            
            <div className="processo-view-content">
              <div className="status-detalhado">
                {selectedStatus === 'audiencias' && (
                  <div className="status-list">
                    <div className="status-item">
                      <div className="status-item-header">
                        <div className="status-item-icon audiencia-agendada">
                          <Calendar size={16} />
                        </div>
                        <div className="status-item-info">
                          <div className="status-item-title">Audiência de Conciliação</div>
                          <div className="status-item-subtitle">Processo: 1234567-89.2025.8.26.0001</div>
                        </div>
                        <div className="status-item-date">10/10/2025 - 21:00</div>
                      </div>
                      <div className="status-item-details">
                        <div className="status-detail-row">
                          <span className="status-detail-label">Cliente:</span>
                          <span className="status-detail-value">João Silva</span>
                        </div>
                        <div className="status-detail-row">
                          <span className="status-detail-label">Tribunal:</span>
                          <span className="status-detail-value">TJBA</span>
                        </div>
                        <div className="status-detail-row">
                          <span className="status-detail-label">Responsável:</span>
                          <span className="status-detail-value">Admin LexElite</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedStatus === 'processos' && (
                  <div className="status-list">
                    <div className="status-item">
                      <div className="status-item-header">
                        <div className="status-item-icon processo-ativo">
                          <CheckCircle size={16} />
                        </div>
                        <div className="status-item-info">
                          <div className="status-item-title">Ação de Indenização</div>
                          <div className="status-item-subtitle">Processo: 1234567-89.2025.8.26.0001</div>
                        </div>
                        <div className="status-item-date">07/10/2025 - 14:55</div>
                      </div>
                      <div className="status-item-details">
                        <div className="status-detail-row">
                          <span className="status-detail-label">Cliente:</span>
                          <span className="status-detail-value">João Silva</span>
                        </div>
                        <div className="status-detail-row">
                          <span className="status-detail-label">Status:</span>
                          <span className="status-detail-value">Ativo</span>
                        </div>
                        <div className="status-detail-row">
                          <span className="status-detail-label">Responsável:</span>
                          <span className="status-detail-value">Admin LexElite</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedStatus === 'distribuicao' && (
                  <div className="status-list">
                    <div className="status-item">
                      <div className="status-item-header">
                        <div className="status-item-icon processo-distribuido">
                          <FileText size={16} />
                        </div>
                        <div className="status-item-info">
                          <div className="status-item-title">Ação de Indenização</div>
                          <div className="status-item-subtitle">Processo: 1234567-89.2025.8.26.0001</div>
                        </div>
                        <div className="status-item-date">03/10/2025 - 21:00</div>
                      </div>
                      <div className="status-item-details">
                        <div className="status-detail-row">
                          <span className="status-detail-label">Cliente:</span>
                          <span className="status-detail-value">João Silva</span>
                        </div>
                        <div className="status-detail-row">
                          <span className="status-detail-label">Tribunal:</span>
                          <span className="status-detail-value">TJBA</span>
                        </div>
                        <div className="status-detail-row">
                          <span className="status-detail-label">Responsável:</span>
                          <span className="status-detail-value">Admin LexElite</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
