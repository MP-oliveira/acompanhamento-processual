import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { useProcessos, useDeleteProcesso } from '../../hooks/useProcessos';
import ProcessoCard from '../ProcessoCard/ProcessoCard';
import './Processos.css';

const Processos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hooks do React Query
  const { data: processosData, isLoading, error } = useProcessos();
  const deleteProcessoMutation = useDeleteProcesso();
  
  // Estados locais para filtros e UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('dataDistribuicao');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [processoSelecionado, setProcessoSelecionado] = useState(null);
  
  // Extrair dados dos processos e garantir que seja um array
  const processos = Array.isArray(processosData) ? processosData : [];
  
  // Verificar se usuário está logado
  const token = localStorage.getItem('token');
  
  // Se não há token, redirecionar para login
  React.useEffect(() => {
    if (!token && !isLoading) {
      window.location.href = '/login';
    }
  }, [token, isLoading]);

  // Mostra mensagem de sucesso se veio de outra página
  useEffect(() => {
    if (location.state?.message) {
      // Aqui você pode mostrar um toast ou notificação
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

  const filteredProcessos = processos && Array.isArray(processos) ? processos.filter(processo => {
    const matchesSearch = 
      processo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.classe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.assunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.tribunal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.comarca.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || processo.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) : [];

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
        await deleteProcessoMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao excluir processo:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao excluir processo. Tente novamente.';
        alert(errorMessage);
      }
    }
  };

  const handleView = (id) => {
    // Busca o processo na lista atual (mais rápido)
    const processo = processos.find(p => p.id === id);
    if (processo) {
      setProcessoSelecionado(processo);
    } else {
      // Se não encontrar, busca na API
      // Aqui poderia usar o hook useProcesso, mas é mais simples buscar na lista atual
      console.warn('Processo não encontrado na lista atual');
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

  // Tratamento de erro
  if (error) {
    console.error('Erro no useProcessos:', error);
    
    // Verificar se é erro de autenticação
    const isAuthError = error?.response?.status === 401 || error?.message?.includes('Token');
    
    return (
      <div className="processos">
        <div className="processos-error">
          <div className="processos-error-content">
            <X size={48} className="processos-error-icon" />
            <h3>{isAuthError ? 'Erro de Autenticação' : 'Erro ao carregar processos'}</h3>
            <p>
              {isAuthError 
                ? 'Sua sessão expirou. Por favor, faça login novamente.' 
                : 'Não foi possível carregar a lista de processos. Tente novamente.'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (isAuthError) {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                } else {
                  window.location.reload();
                }
              }}
            >
              {isAuthError ? 'Fazer Login' : 'Recarregar Página'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
