import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  FileText, 
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  RefreshCw,
  Eye,
  Plus
} from 'lucide-react';
import { relatorioService } from '../../services/api';
import RelatorioExport from '../RelatorioExport/RelatorioExport';
import './Relatorios.css';

const Relatorios = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('todos');
  const [selectedType, setSelectedType] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [newReport, setNewReport] = useState({
    tipo: 'processos',
    titulo: '',
    descricao: '',
    periodo: new Date().toISOString().slice(0, 7) // YYYY-MM
  });

  // Buscar relatórios do backend
  useEffect(() => {
    const fetchRelatorios = async () => {
      try {
        setLoading(true);
        const response = await relatorioService.getAll({
          tipo: selectedType !== 'todos' ? selectedType : undefined,
          status: 'todos'
        });
        setRelatorios(response.relatorios || []);
      } catch (error) {
        console.error('Erro ao buscar relatórios:', error);
        setRelatorios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorios();
  }, [selectedType, selectedPeriod]);

  const filteredRelatorios = relatorios.filter(relatorio => {
    const matchesType = selectedType === 'todos' || relatorio.tipo === selectedType;
    const matchesPeriod = selectedPeriod === 'todos' || relatorio.periodo.includes(selectedPeriod);
    
    return matchesType && matchesPeriod;
  });

  const handleGerarRelatorio = () => {
    setShowNewReportModal(true);
  };

  const handleCreateReport = async () => {
    try {
      setLoading(true);
      await relatorioService.create(newReport);
      setShowNewReportModal(false);
      setNewReport({
        tipo: 'processos',
        titulo: '',
        descricao: '',
        periodo: new Date().toISOString().slice(0, 7)
      });
      // Recarregar relatórios
      const response = await relatorioService.getAll();
      setRelatorios(response.relatorios || []);
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
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

  const handleVisualizar = (relatorioId) => {
    // Implementar visualização quando necessário
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
      try {
        const response = await relatorioService.getStats();
        setStats(response);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchStats();
  }, []);

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
              <div key={relatorio.id} className="relatorio-card">
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
                    className="btn btn-sm btn-outline"
                    onClick={() => handleVisualizar(relatorio.id)}
                    disabled={relatorio.status !== 'concluido'}
                  >
                    <Eye size={16} />
                    Visualizar
                  </button>
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

      {/* Modal para Novo Relatório */}
      {showNewReportModal && (
        <div className="modal-overlay" onClick={() => setShowNewReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Gerar Novo Relatório</h2>
              <button 
                className="modal-close"
                onClick={() => setShowNewReportModal(false)}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label required">Tipo de Relatório</label>
                <select
                  className="form-input"
                  value={newReport.tipo}
                  onChange={(e) => setNewReport({...newReport, tipo: e.target.value})}
                >
                  <option value="processos">Processos</option>
                  <option value="prazos">Prazos</option>
                  <option value="alertas">Alertas</option>
                  <option value="consultas">Consultas</option>
                  <option value="usuarios">Usuários</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Título</label>
                <input
                  type="text"
                  className="form-input"
                  value={newReport.titulo}
                  onChange={(e) => setNewReport({...newReport, titulo: e.target.value})}
                  placeholder="Ex: Relatório de Processos por Status"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={newReport.descricao}
                  onChange={(e) => setNewReport({...newReport, descricao: e.target.value})}
                  placeholder="Descrição do relatório..."
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Período</label>
                <input
                  type="month"
                  className="form-input"
                  value={newReport.periodo}
                  onChange={(e) => setNewReport({...newReport, periodo: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowNewReportModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreateReport}
                disabled={!newReport.titulo || !newReport.periodo}
              >
                <Plus size={16} />
                Gerar Relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
