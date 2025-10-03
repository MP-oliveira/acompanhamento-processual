import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar,
  Search, 
  FileText,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import { useProcessos } from '../../hooks/useProcessos';
import ProcessoCard from '../ProcessoCard/ProcessoCard';
import '../Processos/Processos.css';

const Audiencias = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hooks do React Query
  const { data: processosData, isLoading, error } = useProcessos();
  
  // Estados locais para filtros e UI
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [processoSelecionado, setProcessoSelecionado] = useState(null);
  
  // Extrair dados dos processos e filtrar apenas com audiências
  const processosTodos = Array.isArray(processosData) ? processosData : [];
  const processos = processosTodos.filter(p => p.proximaAudiencia);
  
  // Verificar se usuário está logado
  const token = localStorage.getItem('token');
  
  React.useEffect(() => {
    if (!token && !isLoading) {
      window.location.href = '/login';
    }
  }, [token, isLoading]);

  const filteredProcessos = processos.filter(processo => {
    const matchesSearch = 
      processo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.classe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.tribunal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.comarca?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const sortedProcessos = [...filteredProcessos].sort((a, b) => {
    const aValue = new Date(a.proximaAudiencia);
    const bValue = new Date(b.proximaAudiencia);

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleEdit = (id) => {
    navigate(`/processos/editar/${id}`);
  };

  const handleView = (id) => {
    const processo = processos.find(p => p.id === id);
    if (processo) {
      setProcessoSelecionado(processo);
    }
  };

  const handleCloseView = () => {
    setProcessoSelecionado(null);
  };

  const getStats = () => {
    const hoje = new Date();
    const proximaSemana = new Date();
    proximaSemana.setDate(hoje.getDate() + 7);
    
    const total = processos.length;
    const proximas = processos.filter(p => {
      const dataAudiencia = new Date(p.proximaAudiencia);
      return dataAudiencia >= hoje && dataAudiencia <= proximaSemana;
    }).length;
    const passadas = processos.filter(p => new Date(p.proximaAudiencia) < hoje).length;
    
    return { total, proximas, passadas };
  };

  const stats = getStats();

  if (error) {
    const isAuthError = error?.response?.status === 401 || error?.message?.includes('Token');
    
    return (
      <div className="processos">
        <div className="processos-error">
          <div className="processos-error-content">
            <X size={48} className="processos-error-icon" />
            <h3>{isAuthError ? 'Erro de Autenticação' : 'Erro ao carregar audiências'}</h3>
            <p>
              {isAuthError 
                ? 'Sua sessão expirou. Por favor, faça login novamente.' 
                : 'Não foi possível carregar a lista de audiências. Tente novamente.'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Recarregar Página
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
          <p>Carregando audiências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="processos">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Audiências</h1>
          <p className="page-subtitle">Processos com audiências agendadas</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="processos-stats">
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-total">
            <Calendar size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.total}</div>
            <div className="processos-stat-label">Total de Audiências</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-active">
            <Clock size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.proximas}</div>
            <div className="processos-stat-label">Próximos 7 dias</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-archived">
            <AlertCircle size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.passadas}</div>
            <div className="processos-stat-label">Passadas</div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="processos-filters">
        <div className="processos-search">
          <Search className="processos-search-icon" size={20} />
          <input
            type="text"
            className="processos-search-input"
            placeholder="Buscar por número, classe, tribunal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="processos-filter-group">
          <label className="processos-filter-label">Ordenar por:</label>
          <select
            className="processos-filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Data mais próxima</option>
            <option value="desc">Data mais distante</option>
          </select>
        </div>
      </div>

      {/* Lista de Processos */}
      <div className="processos-content">
        {sortedProcessos.length === 0 ? (
          <div className="processos-empty">
            <Calendar size={48} className="processos-empty-icon" />
            <h3>Nenhuma audiência encontrada</h3>
            <p>
              {searchTerm 
                ? 'Nenhuma audiência corresponde aos critérios de busca.'
                : 'Você ainda não tem processos com audiências agendadas.'}
            </p>
          </div>
        ) : (
          <div className="processos-grid">
            {sortedProcessos.map((processo) => (
              <ProcessoCard
                key={processo.id}
                processo={processo}
                onEdit={handleEdit}
                onView={handleView}
                highlightField="proximaAudiencia"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Audiencias;

