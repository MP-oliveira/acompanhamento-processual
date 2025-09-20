import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { processoService } from '../../services/api';
import ProcessoCard from '../ProcessoCard/ProcessoCard';
import './Processos.css';

const Processos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('dataDistribuicao');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid ou list
  const [processoSelecionado, setProcessoSelecionado] = useState(null);

  useEffect(() => {
    // Carrega processos da API real
    const loadProcessos = async () => {
      setLoading(true);
      try {
        const response = await processoService.getAll();
        setProcessos(response.processos || []);
      } catch (error) {
        console.error('Erro ao carregar processos:', error);
        // Em caso de erro, mantém array vazio
        setProcessos([]);
      } finally {
        setLoading(false);
      }
    };

    loadProcessos();
  }, []);

  // Mostra mensagem de sucesso se veio de outra página
  useEffect(() => {
    if (location.state?.message) {
      // Aqui você pode mostrar um toast ou notificação
      console.log(location.state.message, location.state.type);
    }
  }, [location.state]);

  // Abre modal de visualização se veio de um alerta
  useEffect(() => {
    if (location.state?.viewProcessId && processos.length > 0) {
      const processoId = location.state.viewProcessId;
      const processo = processos.find(p => p.id === processoId);
      
      if (processo) {
        setProcessoSelecionado(processo);
        // Limpa o estado da navegação para evitar reabrir o modal
        navigate('/processos', { replace: true });
      }
    }
  }, [location.state, processos, navigate]);

  const filteredProcessos = processos.filter(processo => {
    const matchesSearch = 
      processo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.classe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.assunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.tribunal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.comarca.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || processo.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedProcessos = [...filteredProcessos].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'dataDistribuicao' || sortBy === 'dataSentenca') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleEdit = (id) => {
    navigate(`/processos/editar/${id}`);
  };

  const handleDelete = async (id) => {
    const processo = processos.find(p => p.id === id);
    const processoNome = processo ? `${processo.numero} - ${processo.classe}` : 'este processo';
    
    if (window.confirm(`Tem certeza que deseja excluir ${processoNome}?\n\nEsta ação não pode ser desfeita.`)) {
      try {
        setLoading(true);
        
        // Chama a API para deletar o processo
        await processoService.delete(id);
        
        // Remove o processo da lista local
        setProcessos(prev => prev.filter(p => p.id !== id));
        console.log('Processo excluído:', id);
        
        // Mostra mensagem de sucesso
        alert('Processo excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir processo:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao excluir processo. Tente novamente.';
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = async (id) => {
    try {
      const response = await processoService.getById(id);
      // A API retorna {processo: {...}}, então precisamos extrair o processo
      setProcessoSelecionado(response.processo || response);
    } catch (error) {
      console.error('Erro ao carregar processo:', error);
    }
  };

  const handleCloseView = () => {
    setProcessoSelecionado(null);
  };

  const getStats = () => {
    const total = processos.length;
    const ativos = processos.filter(p => p.status === 'ativo').length;
    const arquivados = processos.filter(p => p.status === 'arquivado').length;
    const suspensos = processos.filter(p => p.status === 'suspenso').length;
    
    return { total, ativos, arquivados, suspensos };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="processos">
        <div className="processos-loading">
          <div className="processos-loading-spinner" />
          <p>Carregando processos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="processos">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Processos</h1>
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/processos/novo')}
          >
            <Plus size={20} />
            Novo Processo
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="processos-stats">
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-total">
            <FileText size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.total}</div>
            <div className="processos-stat-label">Total</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-active">
            <CheckCircle size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.ativos}</div>
            <div className="processos-stat-label">Ativos</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-archived">
            <Clock size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.arquivados}</div>
            <div className="processos-stat-label">Arquivados</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-suspended">
            <AlertTriangle size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.suspensos}</div>
            <div className="processos-stat-label">Suspensos</div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="processos-filters">
        <div className="processos-search">
          <div className="processos-search-wrapper">
            <Search className="processos-search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, classe, assunto, tribunal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="processos-search-input"
            />
          </div>
        </div>

        <div className="processos-filters-row">
          <div className="processos-filter">
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="processos-filter-select"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="arquivado">Arquivados</option>
              <option value="suspenso">Suspensos</option>
            </select>
          </div>

          <div className="processos-filter">
            <label htmlFor="sortBy">Ordenar por:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="processos-filter-select"
            >
              <option value="dataDistribuicao">Data de Distribuição</option>
              <option value="dataSentenca">Data da Sentença</option>
              <option value="numero">Número</option>
              <option value="classe">Classe</option>
            </select>
          </div>

          <div className="processos-filter">
            <label htmlFor="sortOrder">Ordem:</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="processos-filter-select"
            >
              <option value="desc">Mais Recente</option>
              <option value="asc">Mais Antigo</option>
            </select>
          </div>

          <div className="processos-view-toggle">
            <button
              className={`processos-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Visualização em grade"
            >
              <div className="processos-view-grid-icon" />
            </button>
            <button
              className={`processos-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Visualização em lista"
            >
              <div className="processos-view-list-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Processos */}
      <div className="processos-content">
        {sortedProcessos.length === 0 ? (
          <div className="processos-empty">
            <FileText size={48} />
            <h3>Nenhum processo encontrado</h3>
            <p>
              {searchTerm || statusFilter !== 'todos' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando seu primeiro processo.'
              }
            </p>
            {!searchTerm && statusFilter === 'todos' && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/processos/novo')}
              >
                <Plus size={20} />
                Criar Primeiro Processo
              </button>
            )}
          </div>
        ) : (
          <div className={`processos-grid ${viewMode === 'list' ? 'processos-list' : ''}`}>
            {sortedProcessos.map(processo => (
              <ProcessoCard
                key={processo.id}
                processo={processo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Visualização do Processo */}
      {processoSelecionado && (
        <div className="processo-view-overlay">
          <div className="processo-view-container">
            <div className="processo-view-header">
              <h2>Processo {processoSelecionado.numero}</h2>
              <button 
                className="modal-close-btn"
                onClick={handleCloseView}
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="processo-view-content">
              <ProcessoCard 
                processo={processoSelecionado}
                showActions={false}
                compact={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Processos;
