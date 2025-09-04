import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Calendar,
  MapPin,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import './Consultas.css';

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dataFilter, setDataFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('dataConsulta');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Dados mockados para demonstração
  const mockConsultas = [
    {
      id: 1,
      tipo: 'processo',
      numero: '0001234-12.2024.8.05.0001',
      classe: 'Ação de Indenização por Dano Moral',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'encontrado',
      dataConsulta: '2024-03-14T10:30:00Z',
      resultado: {
        status: 'Ativo',
        ultimaMovimentacao: '2024-03-10T14:20:00Z',
        valorCausa: 'R$ 50.000,00',
        partes: ['João Silva (Autor)', 'Empresa XYZ Ltda (Réu)']
      }
    },
    {
      id: 2,
      tipo: 'processo',
      numero: '0001235-12.2024.8.05.0001',
      classe: 'Execução de Título Extrajudicial',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'encontrado',
      dataConsulta: '2024-03-14T09:15:00Z',
      resultado: {
        status: 'Ativo',
        ultimaMovimentacao: '2024-03-12T16:45:00Z',
        valorCausa: 'R$ 25.000,00',
        partes: ['Maria Santos (Exequente)', 'João Costa (Executado)']
      }
    },
    {
      id: 3,
      tipo: 'processo',
      numero: '0009999-12.2024.8.05.0001',
      classe: 'Processo Inexistente',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'nao_encontrado',
      dataConsulta: '2024-03-13T15:20:00Z',
      resultado: null
    },
    {
      id: 4,
      tipo: 'pessoa',
      numero: '123.456.789-00',
      classe: 'Consulta de CPF',
      tribunal: 'Receita Federal',
      comarca: 'Brasil',
      status: 'encontrado',
      dataConsulta: '2024-03-12T11:45:00Z',
      resultado: {
        nome: 'João Silva Santos',
        situacao: 'Regular',
        ultimaAtualizacao: '2024-03-01T00:00:00Z'
      }
    },
    {
      id: 5,
      tipo: 'empresa',
      numero: '12.345.678/0001-90',
      classe: 'Consulta de CNPJ',
      tribunal: 'Receita Federal',
      comarca: 'Brasil',
      status: 'encontrado',
      dataConsulta: '2024-03-11T14:30:00Z',
      resultado: {
        razaoSocial: 'Empresa XYZ Ltda',
        situacao: 'Ativa',
        ultimaAtualizacao: '2024-02-15T00:00:00Z'
      }
    }
  ];

  useEffect(() => {
    // Simula carregamento de dados
    const loadConsultas = async () => {
      setLoading(true);
      try {
        // Simula delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConsultas(mockConsultas);
      } catch (error) {
        console.error('Erro ao carregar consultas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConsultas();
  }, []);

  const filteredConsultas = consultas.filter(consulta => {
    const matchesSearch = 
      consulta.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.classe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.tribunal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.comarca.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = tipoFilter === 'todos' || consulta.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'todos' || consulta.status === statusFilter;
    
    let matchesData = true;
    if (dataFilter !== 'todos') {
      const consultaDate = new Date(consulta.dataConsulta);
      const now = new Date();
      const daysDiff = Math.floor((now - consultaDate) / (1000 * 60 * 60 * 24));
      
      switch (dataFilter) {
        case 'hoje':
          matchesData = daysDiff === 0;
          break;
        case 'semana':
          matchesData = daysDiff <= 7;
          break;
        case 'mes':
          matchesData = daysDiff <= 30;
          break;
        default:
          matchesData = true;
      }
    }

    return matchesSearch && matchesTipo && matchesStatus && matchesData;
  });

  const sortedConsultas = [...filteredConsultas].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'dataConsulta') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleNovaConsulta = () => {
    console.log('Nova consulta');
    // Aqui você pode abrir um modal ou navegar para uma página de nova consulta
  };

  const handleExportar = () => {
    console.log('Exportar consultas');
    // Aqui você pode implementar a exportação
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Simula refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Consultas atualizadas');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = consultas.length;
    const encontrados = consultas.filter(c => c.status === 'encontrado').length;
    const naoEncontrados = consultas.filter(c => c.status === 'nao_encontrado').length;
    const hoje = consultas.filter(c => {
      const consultaDate = new Date(c.dataConsulta);
      const now = new Date();
      return Math.floor((now - consultaDate) / (1000 * 60 * 60 * 24)) === 0;
    }).length;
    
    return { total, encontrados, naoEncontrados, hoje };
  };

  const stats = getStats();

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
      case 'encontrado':
        return <CheckCircle size={16} className="status-icon status-success" />;
      case 'nao_encontrado':
        return <XCircle size={16} className="status-icon status-error" />;
      default:
        return <AlertTriangle size={16} className="status-icon status-warning" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'encontrado':
        return 'Encontrado';
      case 'nao_encontrado':
        return 'Não Encontrado';
      default:
        return 'Pendente';
    }
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'processo':
        return 'Processo';
      case 'pessoa':
        return 'Pessoa Física';
      case 'empresa':
        return 'Pessoa Jurídica';
      default:
        return 'Consulta';
    }
  };

  if (loading) {
    return (
      <div className="consultas">
        <div className="consultas-loading">
          <div className="consultas-loading-spinner" />
          <p>Carregando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consultas">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Search size={24} />
            Consultas
          </h1>
          <p className="page-subtitle">
            Consulte processos, pessoas e empresas em sistemas externos
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={20} />
            Atualizar
          </button>
          <button className="btn btn-secondary" onClick={handleExportar}>
            <Download size={20} />
            Exportar
          </button>
          <button className="btn btn-primary" onClick={handleNovaConsulta}>
            <Plus size={20} />
            Nova Consulta
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="consultas-stats">
        <div className="consultas-stat-card">
          <div className="consultas-stat-icon consultas-stat-total">
            <Search size={20} />
          </div>
          <div className="consultas-stat-content">
            <div className="consultas-stat-value">{stats.total}</div>
            <div className="consultas-stat-label">Total</div>
          </div>
        </div>
        
        <div className="consultas-stat-card">
          <div className="consultas-stat-icon consultas-stat-found">
            <CheckCircle size={20} />
          </div>
          <div className="consultas-stat-content">
            <div className="consultas-stat-value">{stats.encontrados}</div>
            <div className="consultas-stat-label">Encontrados</div>
          </div>
        </div>
        
        <div className="consultas-stat-card">
          <div className="consultas-stat-icon consultas-stat-not-found">
            <XCircle size={20} />
          </div>
          <div className="consultas-stat-content">
            <div className="consultas-stat-value">{stats.naoEncontrados}</div>
            <div className="consultas-stat-label">Não Encontrados</div>
          </div>
        </div>
        
        <div className="consultas-stat-card">
          <div className="consultas-stat-icon consultas-stat-today">
            <Calendar size={20} />
          </div>
          <div className="consultas-stat-content">
            <div className="consultas-stat-value">{stats.hoje}</div>
            <div className="consultas-stat-label">Hoje</div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="consultas-filters">
        <div className="consultas-search">
          <div className="consultas-search-wrapper">
            <Search className="consultas-search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, classe, tribunal, comarca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="consultas-search-input"
            />
          </div>
          <button 
            className="consultas-filters-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="consultas-filters-row">
            <div className="consultas-filter">
              <label htmlFor="tipoFilter">Tipo:</label>
              <select
                id="tipoFilter"
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="consultas-filter-select"
              >
                <option value="todos">Todos</option>
                <option value="processo">Processo</option>
                <option value="pessoa">Pessoa Física</option>
                <option value="empresa">Pessoa Jurídica</option>
              </select>
            </div>

            <div className="consultas-filter">
              <label htmlFor="statusFilter">Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="consultas-filter-select"
              >
                <option value="todos">Todos</option>
                <option value="encontrado">Encontrado</option>
                <option value="nao_encontrado">Não Encontrado</option>
              </select>
            </div>

            <div className="consultas-filter">
              <label htmlFor="dataFilter">Período:</label>
              <select
                id="dataFilter"
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                className="consultas-filter-select"
              >
                <option value="todos">Todos</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mês</option>
              </select>
            </div>

            <div className="consultas-filter">
              <label htmlFor="sortBy">Ordenar por:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="consultas-filter-select"
              >
                <option value="dataConsulta">Data da Consulta</option>
                <option value="numero">Número</option>
                <option value="classe">Classe</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="consultas-filter">
              <label htmlFor="sortOrder">Ordem:</label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="consultas-filter-select"
              >
                <option value="desc">Mais Recente</option>
                <option value="asc">Mais Antigo</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Consultas */}
      <div className="consultas-content">
        {sortedConsultas.length === 0 ? (
          <div className="consultas-empty">
            <Search size={48} />
            <h3>Nenhuma consulta encontrada</h3>
            <p>
              {searchTerm || tipoFilter !== 'todos' || statusFilter !== 'todos' || dataFilter !== 'todos'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece fazendo sua primeira consulta.'
              }
            </p>
            {!searchTerm && tipoFilter === 'todos' && statusFilter === 'todos' && dataFilter === 'todos' && (
              <button 
                className="btn btn-primary"
                onClick={handleNovaConsulta}
              >
                <Plus size={20} />
                Nova Consulta
              </button>
            )}
          </div>
        ) : (
          <div className="consultas-list">
            {sortedConsultas.map(consulta => (
              <div key={consulta.id} className="consulta-card">
                <div className="consulta-card-header">
                  <div className="consulta-card-type">
                    <FileText size={16} />
                    <span>{getTipoText(consulta.tipo)}</span>
                  </div>
                  <div className="consulta-card-status">
                    {getStatusIcon(consulta.status)}
                    <span>{getStatusText(consulta.status)}</span>
                  </div>
                </div>

                <div className="consulta-card-content">
                  <div className="consulta-card-main">
                    <h4 className="consulta-card-title">
                      {consulta.numero}
                    </h4>
                    <p className="consulta-card-class">
                      {consulta.classe}
                    </p>
                    <div className="consulta-card-location">
                      <MapPin size={14} />
                      <span>{consulta.tribunal} - {consulta.comarca}</span>
                    </div>
                  </div>

                  <div className="consulta-card-meta">
                    <div className="consulta-card-date">
                      <Clock size={14} />
                      <span>{formatDate(consulta.dataConsulta)}</span>
                    </div>
                  </div>
                </div>

                {consulta.resultado && (
                  <div className="consulta-card-result">
                    <h5>Resultado da Consulta:</h5>
                    {consulta.tipo === 'processo' && (
                      <div className="consulta-result-details">
                        <div className="consulta-result-item">
                          <strong>Status:</strong> {consulta.resultado.status}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Última Movimentação:</strong> {formatDate(consulta.resultado.ultimaMovimentacao)}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Valor da Causa:</strong> {consulta.resultado.valorCausa}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Partes:</strong>
                          <ul>
                            {consulta.resultado.partes.map((parte, index) => (
                              <li key={index}>{parte}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {consulta.tipo === 'pessoa' && (
                      <div className="consulta-result-details">
                        <div className="consulta-result-item">
                          <strong>Nome:</strong> {consulta.resultado.nome}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Situação:</strong> {consulta.resultado.situacao}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Última Atualização:</strong> {formatDate(consulta.resultado.ultimaAtualizacao)}
                        </div>
                      </div>
                    )}
                    {consulta.tipo === 'empresa' && (
                      <div className="consulta-result-details">
                        <div className="consulta-result-item">
                          <strong>Razão Social:</strong> {consulta.resultado.razaoSocial}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Situação:</strong> {consulta.resultado.situacao}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Última Atualização:</strong> {formatDate(consulta.resultado.ultimaAtualizacao)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="consulta-card-actions">
                  <button className="btn btn-sm btn-outline">
                    <ExternalLink size={16} />
                    Ver Detalhes
                  </button>
                  <button className="btn btn-sm btn-outline">
                    <Download size={16} />
                    Exportar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultas;
