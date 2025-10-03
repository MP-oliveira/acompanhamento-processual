import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Scale,
  Search, 
  FileText,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import { useProcessos } from '../../hooks/useProcessos';
import ProcessoCard from '../ProcessoCard/ProcessoCard';
import '../Processos/Processos.css';

const Recursos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hooks do React Query
  const { data: processosData, isLoading, error } = useProcessos();
  
  // Estados locais para filtros e UI
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoRecurso, setTipoRecurso] = useState('todos');
  const [sortOrder, setSortOrder] = useState('asc');
  const [processoSelecionado, setProcessoSelecionado] = useState(null);
  
  // Extrair dados dos processos e filtrar apenas com recursos/embargos
  const processosTodos = Array.isArray(processosData) ? processosData : [];
  const processos = processosTodos.filter(p => p.prazoRecurso || p.prazoEmbargos);
  
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

    const matchesTipo = 
      tipoRecurso === 'todos' ||
      (tipoRecurso === 'recurso' && processo.prazoRecurso) ||
      (tipoRecurso === 'embargos' && processo.prazoEmbargos);

    return matchesSearch && matchesTipo;
  });

  const sortedProcessos = [...filteredProcessos].sort((a, b) => {
    // Usar o prazo mais próximo (recurso ou embargos)
    const getPrazoMaisProximo = (p) => {
      const prazos = [p.prazoRecurso, p.prazoEmbargos].filter(Boolean).map(d => new Date(d));
      return prazos.length > 0 ? Math.min(...prazos) : Infinity;
    };

    const aValue = getPrazoMaisProximo(a);
    const bValue = getPrazoMaisProximo(b);

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
    const comRecurso = processos.filter(p => p.prazoRecurso).length;
    const comEmbargos = processos.filter(p => p.prazoEmbargos).length;
    const vencendo = processos.filter(p => {
      const prazos = [p.prazoRecurso, p.prazoEmbargos].filter(Boolean);
      return prazos.some(prazo => {
        const dataPrazo = new Date(prazo);
        return dataPrazo >= hoje && dataPrazo <= proximaSemana;
      });
    }).length;
    
    return { total, comRecurso, comEmbargos, vencendo };
  };

  const stats = getStats();

  if (error) {
    const isAuthError = error?.response?.status === 401 || error?.message?.includes('Token');
    
    return (
      <div className="processos">
        <div className="processos-error">
          <div className="processos-error-content">
            <X size={48} className="processos-error-icon" />
            <h3>{isAuthError ? 'Erro de Autenticação' : 'Erro ao carregar recursos'}</h3>
            <p>
              {isAuthError 
                ? 'Sua sessão expirou. Por favor, faça login novamente.' 
                : 'Não foi possível carregar a lista de recursos. Tente novamente.'}
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
          <p>Carregando prazos recursais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="processos">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Recursos e Embargos</h1>
          <p className="page-subtitle">Processos com prazos recursais pendentes</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="processos-stats">
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-total">
            <Scale size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.total}</div>
            <div className="processos-stat-label">Total de Prazos</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-active">
            <FileText size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.comRecurso}</div>
            <div className="processos-stat-label">Com Recurso</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-archived">
            <FileText size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.comEmbargos}</div>
            <div className="processos-stat-label">Com Embargos</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-suspended">
            <AlertCircle size={20} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.vencendo}</div>
            <div className="processos-stat-label">Vencendo em 7 dias</div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="processos-filters" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="processos-search" style={{ maxWidth: '400px', flex: '0 0 400px' }}>
          <Search className="processos-search-icon" size={20} />
          <input
            type="text"
            className="processos-search-input"
            placeholder="Buscar por número, classe, tribunal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="processos-filter-group" style={{ margin: 0 }}>
          <label className="processos-filter-label">Tipo:</label>
          <select
            className="processos-filter-select"
            value={tipoRecurso}
            onChange={(e) => setTipoRecurso(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="recurso">Apenas Recursos</option>
            <option value="embargos">Apenas Embargos</option>
          </select>
        </div>

        <div className="processos-filter-group" style={{ margin: 0 }}>
          <label className="processos-filter-label">Ordenar:</label>
          <select
            className="processos-filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Prazo mais próximo</option>
            <option value="desc">Prazo mais distante</option>
          </select>
        </div>
      </div>

      {/* Lista de Processos */}
      <div className="processos-content">
        {sortedProcessos.length === 0 ? (
          <div className="processos-empty">
            <Scale size={48} className="processos-empty-icon" />
            <h3>Nenhum prazo recursal encontrado</h3>
            <p>
              {searchTerm 
                ? 'Nenhum prazo corresponde aos critérios de busca.'
                : 'Você ainda não tem processos com prazos recursais pendentes.'}
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
                highlightField={processo.prazoRecurso ? "prazoRecurso" : "prazoEmbargos"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recursos;

