import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Bell, 
  Search, 
  CheckCircle,
  Clock,
  FileText,
  X
} from 'lucide-react';
import { alertService } from '../../services/api';
import AlertCard from '../AlertCard/AlertCard';
import AlertGroup from '../AlertGroup/AlertGroup';
import './Alertas.css';

const Alertas = () => {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('dataVencimento');
  const [sortOrder, setSortOrder] = useState('asc');
  const [groupByProcess, setGroupByProcess] = useState(true);


  useEffect(() => {
    // Carrega alertas da API real
    const loadAlertas = async () => {
      setLoading(true);
      try {
        const response = await alertService.getAll();
        setAlertas(response.alertas || []);
      } catch (error) {
        console.error('Erro ao carregar alertas:', error);
        // Em caso de erro, mantém array vazio
        setAlertas([]);
      } finally {
        setLoading(false);
      }
    };

    loadAlertas();
  }, []);

  const filteredAlertas = alertas.filter(alerta => {
    const matchesSearch = 
      alerta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerta.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerta.processo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alerta.processo.classe.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = tipoFilter === 'todos' || alerta.tipo === tipoFilter;
    const matchesPrioridade = prioridadeFilter === 'todos' || alerta.prioridade === prioridadeFilter;
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'lidos' && alerta.lido) ||
      (statusFilter === 'nao_lidos' && !alerta.lido);

    return matchesSearch && matchesTipo && matchesPrioridade && matchesStatus;
  });

  const sortedAlertas = [...filteredAlertas].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'dataVencimento' || sortBy === 'dataNotificacao') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Agrupa alertas por processo
  const groupedAlertas = sortedAlertas.reduce((groups, alerta) => {
    const processoNumero = alerta.processo.numero;
    if (!groups[processoNumero]) {
      groups[processoNumero] = {
        processo: alerta.processo,
        alertas: [],
        total: 0,
        naoLidos: 0,
        prioridadeMaxima: 'baixa'
      };
    }
    groups[processoNumero].alertas.push(alerta);
    groups[processoNumero].total++;
    if (!alerta.lido) groups[processoNumero].naoLidos++;
    
    // Determina prioridade máxima do grupo
    const prioridades = { 'urgente': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
    if (prioridades[alerta.prioridade] > prioridades[groups[processoNumero].prioridadeMaxima]) {
      groups[processoNumero].prioridadeMaxima = alerta.prioridade;
    }
    
    return groups;
  }, {});

  const handleMarkAsRead = async (id) => {
    try {
      // Chama a API para marcar como lido
      await alertService.markAsRead(id);
      
      // Atualiza o estado local
      setAlertas(prev => prev.map(alerta => 
        alerta.id === id ? { ...alerta, lido: true } : alerta
      ));
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao marcar alerta como lido. Tente novamente.';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este alerta?')) {
      try {
        // Chama a API para deletar o alerta
        await alertService.delete(id);
        
        // Remove o alerta da lista local
        setAlertas(prev => prev.filter(alerta => alerta.id !== id));
        
        // Mostra mensagem de sucesso
        alert('Alerta excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir alerta:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao excluir alerta. Tente novamente.';
        alert(errorMessage);
      }
    }
  };

  const handleViewProcess = (processoId) => {
    // Navega para a página de processos e passa o ID para visualizar
    navigate('/processos', { 
      state: { 
        viewProcessId: processoId 
      } 
    });
  };

  const getStats = () => {
    const total = alertas.length;
    const naoLidos = alertas.filter(a => !a.lido).length;
    const urgentes = alertas.filter(a => a.prioridade === 'urgente').length;
    const vencidos = alertas.filter(a => {
      const vencimento = new Date(a.dataVencimento);
      const agora = new Date();
      return vencimento < agora;
    }).length;
    
    return { total, naoLidos, urgentes, vencidos };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="alertas">
        <div className="alertas-loading">
          <div className="alertas-loading-spinner" />
          <p>Carregando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alertas">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Bell size={24} />
            Alertas
          </h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary">
            <CheckCircle size={20} />
            Marcar Todos como Lidos
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="alertas-stats">
        <div className="alertas-stat-card">
          <div className="alertas-stat-icon alertas-stat-total">
            <Bell size={20} />
          </div>
          <div className="alertas-stat-content">
            <div className="alertas-stat-value">{stats.total}</div>
            <div className="alertas-stat-label">Total</div>
          </div>
        </div>
        
        <div className="alertas-stat-card">
          <div className="alertas-stat-icon alertas-stat-unread">
            <AlertTriangle size={20} />
          </div>
          <div className="alertas-stat-content">
            <div className="alertas-stat-value">{stats.naoLidos}</div>
            <div className="alertas-stat-label">Não Lidos</div>
          </div>
        </div>
        
        <div className="alertas-stat-card">
          <div className="alertas-stat-icon alertas-stat-urgent">
            <Clock size={20} />
          </div>
          <div className="alertas-stat-content">
            <div className="alertas-stat-value">{stats.urgentes}</div>
            <div className="alertas-stat-label">Urgentes</div>
          </div>
        </div>
        
        <div className="alertas-stat-card">
          <div className="alertas-stat-icon alertas-stat-overdue">
            <X size={20} />
          </div>
          <div className="alertas-stat-content">
            <div className="alertas-stat-value">{stats.vencidos}</div>
            <div className="alertas-stat-label">Vencidos</div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="alertas-filters">
        <div className="alertas-search">
          <div className="alertas-search-wrapper">
            <Search className="alertas-search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar por título, mensagem, número do processo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="alertas-search-input"
            />
          </div>
        </div>

        <div className="alertas-filters-row">
          <div className="alertas-filter">
            <label htmlFor="tipoFilter">Tipo:</label>
            <select
              id="tipoFilter"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="alertas-filter-select"
            >
              <option value="todos">Todos</option>
              <option value="audiencia">Audiência</option>
              <option value="prazo_recurso">Prazo para Recurso</option>
              <option value="prazo_embargos">Prazo para Embargos</option>
              <option value="despacho">Despacho</option>
            </select>
          </div>

          <div className="alertas-filter">
            <label htmlFor="prioridadeFilter">Prioridade:</label>
            <select
              id="prioridadeFilter"
              value={prioridadeFilter}
              onChange={(e) => setPrioridadeFilter(e.target.value)}
              className="alertas-filter-select"
            >
              <option value="todos">Todas</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          <div className="alertas-filter">
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="alertas-filter-select"
            >
              <option value="todos">Todos</option>
              <option value="nao_lidos">Não Lidos</option>
              <option value="lidos">Lidos</option>
            </select>
          </div>

          <div className="alertas-filter">
            <label htmlFor="sortBy">Ordenar por:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="alertas-filter-select"
            >
              <option value="dataVencimento">Data de Vencimento</option>
              <option value="dataNotificacao">Data de Notificação</option>
              <option value="prioridade">Prioridade</option>
              <option value="titulo">Título</option>
            </select>
          </div>

          <div className="alertas-filter">
            <label htmlFor="sortOrder">Ordem:</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="alertas-filter-select"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controles de Visualização */}
      <div className="alertas-view-controls">
        <div className="alertas-view-toggle">
          <button
            className={`alertas-view-btn ${groupByProcess ? 'active' : ''}`}
            onClick={() => setGroupByProcess(true)}
            title="Agrupar por processo"
          >
            <FileText size={16} />
            Agrupados
          </button>
          <button
            className={`alertas-view-btn ${!groupByProcess ? 'active' : ''}`}
            onClick={() => setGroupByProcess(false)}
            title="Visualização individual"
          >
            <Bell size={16} />
            Individuais
          </button>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="alertas-content">
        {sortedAlertas.length === 0 ? (
          <div className="alertas-empty">
            <Bell size={48} />
            <h3>Nenhum alerta encontrado</h3>
            <p>
              {searchTerm || tipoFilter !== 'todos' || prioridadeFilter !== 'todos' || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de busca.'
                : 'Você não possui alertas no momento.'
              }
            </p>
          </div>
        ) : groupByProcess ? (
          <div className="alertas-groups">
            {Object.entries(groupedAlertas)
              .sort(([, a], [, b]) => {
                const prioridades = { 'urgente': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
                return prioridades[b.prioridadeMaxima] - prioridades[a.prioridadeMaxima];
              })
              .map(([processoNumero, grupo]) => (
                <AlertGroup
                  key={processoNumero}
                  processoNumero={processoNumero}
                  processo={grupo.processo}
                  alertas={grupo.alertas}
                  total={grupo.total}
                  naoLidos={grupo.naoLidos}
                  prioridadeMaxima={grupo.prioridadeMaxima}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onViewProcess={handleViewProcess}
                />
              ))}
          </div>
        ) : (
          <div className="alertas-grid">
            {sortedAlertas.map(alerta => (
              <AlertCard
                key={alerta.id}
                alert={alerta}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onViewProcess={handleViewProcess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alertas;
