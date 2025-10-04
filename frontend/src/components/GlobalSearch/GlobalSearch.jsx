import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  Users, 
  Settings,
  TrendingUp,
  Command,
  ArrowRight,
  Clock,
  Star,
  X,
  Filter,
  ChevronDown
} from 'lucide-react';
import { processoService } from '../../services/api';
import { 
  addToHistory, 
  getHistory, 
  removeFromHistory,
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  isFavorite
} from '../../utils/searchHistory';
import './GlobalSearch.css';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    tribunal: '',
    dataInicio: '',
    dataFim: ''
  });
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'history', 'favorites'
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus no input quando abrir e carregar histórico/favoritos
  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      setHistory(getHistory());
      setFavorites(getFavorites());
      setQuery('');
      setFilters({ status: '', tribunal: '', dataInicio: '', dataFim: '' });
      setShowFilters(false);
      setActiveTab('all');
    }
  }, [isOpen]);

  // Buscar processos quando o usuário digitar
  useEffect(() => {
    const searchProcessos = async () => {
      if (query.trim().length < 2) {
        setResults(getDefaultActions());
        return;
      }

      setLoading(true);
      try {
        const response = await processoService.getAll();
        const processos = response.processos || response;
        
        // Filtrar processos que correspondem à busca
        const searchTerm = query.toLowerCase().trim();
        let filtered = processos.filter(p => 
          p.numero?.toLowerCase().includes(searchTerm) ||
          p.classe?.toLowerCase().includes(searchTerm) ||
          p.assunto?.toLowerCase().includes(searchTerm) ||
          p.tribunal?.toLowerCase().includes(searchTerm) ||
          p.comarca?.toLowerCase().includes(searchTerm)
        );

        // Aplicar filtros avançados
        if (filters.status) {
          filtered = filtered.filter(p => p.status === filters.status);
        }
        if (filters.tribunal) {
          filtered = filtered.filter(p => p.tribunal?.toLowerCase().includes(filters.tribunal.toLowerCase()));
        }
        if (filters.dataInicio) {
          filtered = filtered.filter(p => {
            const pData = new Date(p.dataDistribuicao);
            const fData = new Date(filters.dataInicio);
            return pData >= fData;
          });
        }
        if (filters.dataFim) {
          filtered = filtered.filter(p => {
            const pData = new Date(p.dataDistribuicao);
            const fData = new Date(filters.dataFim);
            return pData <= fData;
          });
        }

        const processResults = filtered.slice(0, 8).map(p => ({
          id: p.id,
          type: 'processo',
          title: p.numero,
          subtitle: p.classe,
          meta: `${p.status} • ${p.tribunal || 'Tribunal não informado'}`,
          icon: FileText,
          processo: p,
          action: () => navigate(`/processos/editar/${p.id}`)
        }));

        // Quando tem busca, mostra apenas os processos (sem ações padrão)
        setResults(processResults);
        
        // Adiciona ao histórico após busca completada
        addToHistory(query);
        setHistory(getHistory());
      } catch (error) {
        console.error('Erro ao buscar:', error);
        setResults(getDefaultActions());
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProcessos, 300);
    return () => clearTimeout(debounce);
  }, [query, filters]);

  const getDefaultActions = () => [
    {
      id: 'novo-processo',
      type: 'action',
      title: 'Novo Processo',
      subtitle: 'Criar um novo processo',
      icon: FileText,
      action: () => navigate('/processos/novo')
    },
    {
      id: 'processos',
      type: 'nav',
      title: 'Processos',
      subtitle: 'Ver todos os processos',
      icon: FileText,
      action: () => navigate('/processos')
    },
    {
      id: 'kanban',
      type: 'nav',
      title: 'Kanban Board',
      subtitle: 'Visualização em quadro',
      icon: TrendingUp,
      action: () => navigate('/processos/kanban')
    },
    {
      id: 'calendario',
      type: 'nav',
      title: 'Calendário',
      subtitle: 'Ver audiências e prazos',
      icon: Calendar,
      action: () => navigate('/calendario')
    },
    {
      id: 'alertas',
      type: 'nav',
      title: 'Alertas',
      subtitle: 'Ver alertas ativos',
      icon: AlertTriangle,
      action: () => navigate('/alertas')
    },
    {
      id: 'usuarios',
      type: 'nav',
      title: 'Usuários',
      subtitle: 'Gerenciar usuários',
      icon: Users,
      action: () => navigate('/usuarios')
    },
    {
      id: 'configuracoes',
      type: 'nav',
      title: 'Configurações',
      subtitle: 'Ajustar preferências',
      icon: Settings,
      action: () => navigate('/configuracoes')
    }
  ];

  // Listener global para navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, results, selectedIndex]);

  const handleSelectResult = (result) => {
    result.action();
    onClose();
    setQuery('');
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (query.trim().length < 2) return;
    
    if (isFavorite(query)) {
      const updated = removeFromFavorites(favorites.find(f => f.query.toLowerCase() === query.toLowerCase())?.id);
      setFavorites(updated);
    } else {
      const updated = addToFavorites(query, filters);
      setFavorites(updated);
    }
  };

  const handleSelectHistoryOrFavorite = (item) => {
    setQuery(item.query);
    if (item.filters) {
      setFilters(item.filters);
    }
    setActiveTab('all');
  };

  const handleRemoveHistory = (e, id) => {
    e.stopPropagation();
    const updated = removeFromHistory(id);
    setHistory(updated);
  };

  const handleRemoveFavorite = (e, id) => {
    e.stopPropagation();
    const updated = removeFromFavorites(id);
    setFavorites(updated);
  };

  const hasActiveFilters = filters.status || filters.tribunal || filters.dataInicio || filters.dataFim;

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-header">
          <Search className="global-search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="global-search-input"
            placeholder="Buscar processos, ações..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="global-search-header-actions">
            {query.trim().length >= 2 && (
              <button 
                className={`global-search-favorite-btn ${isFavorite(query) ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                title={isFavorite(query) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Star size={18} fill={isFavorite(query) ? 'currentColor' : 'none'} />
              </button>
            )}
            <button 
              className={`global-search-filter-btn ${hasActiveFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              title="Filtros avançados"
            >
              <Filter size={18} />
            </button>
          </div>
          <kbd className="global-search-kbd">ESC</kbd>
        </div>

        {showFilters && (
          <div className="global-search-filters">
            <div className="global-search-filter-row">
              <div className="global-search-filter-field">
                <label>Status</label>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="suspenso">Suspenso</option>
                  <option value="arquivado">Arquivado</option>
                </select>
              </div>
              <div className="global-search-filter-field">
                <label>Tribunal</label>
                <input 
                  type="text"
                  placeholder="Ex: TJBA"
                  value={filters.tribunal}
                  onChange={(e) => setFilters({...filters, tribunal: e.target.value})}
                />
              </div>
            </div>
            <div className="global-search-filter-row">
              <div className="global-search-filter-field">
                <label>Data Início</label>
                <input 
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) => setFilters({...filters, dataInicio: e.target.value})}
                />
              </div>
              <div className="global-search-filter-field">
                <label>Data Fim</label>
                <input 
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) => setFilters({...filters, dataFim: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {query.trim().length < 2 && (history.length > 0 || favorites.length > 0) && (
          <div className="global-search-tabs">
            <button 
              className={`global-search-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Ações
            </button>
            {history.length > 0 && (
              <button 
                className={`global-search-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <Clock size={16} />
                Histórico ({history.length})
              </button>
            )}
            {favorites.length > 0 && (
              <button 
                className={`global-search-tab ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <Star size={16} />
                Favoritos ({favorites.length})
              </button>
            )}
          </div>
        )}

        <div className="global-search-results">
          {loading && (
            <div className="global-search-loading">
              <div className="loading-spinner-small" />
              <span>Buscando...</span>
            </div>
          )}

          {/* AÇÕES RÁPIDAS - quando campo vazio e tab all */}
          {!loading && query.trim().length < 2 && activeTab === 'all' && (
            <>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`global-search-result ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelectResult(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="global-search-result-icon">
                    <result.icon size={18} />
                  </div>
                  <div className="global-search-result-content">
                    <div className="global-search-result-title">{result.title}</div>
                    <div className="global-search-result-subtitle">{result.subtitle}</div>
                  </div>
                  <ArrowRight size={16} className="global-search-result-arrow" />
                </div>
              ))}
            </>
          )}

          {/* HISTÓRICO */}
          {!loading && query.trim().length < 2 && activeTab === 'history' && (
            <>
              {history.length === 0 ? (
                <div className="global-search-empty">
                  <Clock size={32} />
                  <p>Nenhuma busca recente</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="global-search-result history-item"
                    onClick={() => handleSelectHistoryOrFavorite(item)}
                  >
                    <div className="global-search-result-icon">
                      <Clock size={18} />
                    </div>
                    <div className="global-search-result-content">
                      <div className="global-search-result-title">{item.query}</div>
                      <div className="global-search-result-subtitle">
                        {new Date(item.timestamp).toLocaleString('pt-BR', { 
                          day: '2-digit', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <button 
                      className="global-search-remove-btn"
                      onClick={(e) => handleRemoveHistory(e, item.id)}
                      title="Remover do histórico"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {!loading && query.trim().length < 2 && activeTab === 'favorites' && (
            <>
              {favorites.length === 0 ? (
                <div className="global-search-empty">
                  <Star size={32} />
                  <p>Nenhuma busca favorita</p>
                </div>
              ) : (
                favorites.map((item) => (
                  <div
                    key={item.id}
                    className="global-search-result favorite-item"
                    onClick={() => handleSelectHistoryOrFavorite(item)}
                  >
                    <div className="global-search-result-icon">
                      <Star size={18} fill="currentColor" />
                    </div>
                    <div className="global-search-result-content">
                      <div className="global-search-result-title">{item.query}</div>
                      <div className="global-search-result-subtitle">
                        {Object.values(item.filters || {}).filter(Boolean).length > 0 
                          ? `${Object.values(item.filters).filter(Boolean).length} filtros ativos`
                          : 'Sem filtros'
                        }
                      </div>
                    </div>
                    <button 
                      className="global-search-remove-btn"
                      onClick={(e) => handleRemoveFavorite(e, item.id)}
                      title="Remover dos favoritos"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {/* RESULTADOS DE BUSCA - quando tem query */}
          {!loading && query.trim().length >= 2 && (
            <>
              {results.length === 0 && (
                <div className="global-search-empty">
                  <Search size={32} />
                  <p>Nenhum resultado encontrado</p>
                </div>
              )}
              
              {results.length > 0 && results.map((result, index) => (
                <div
                  key={result.id}
                  className={`global-search-result ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelectResult(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="global-search-result-icon">
                    <result.icon size={18} />
                  </div>
                  <div className="global-search-result-content">
                    <div className="global-search-result-title">{result.title}</div>
                    <div className="global-search-result-subtitle">{result.subtitle}</div>
                    {result.meta && (
                      <div className="global-search-result-meta">{result.meta}</div>
                    )}
                  </div>
                  <ArrowRight size={16} className="global-search-result-arrow" />
                </div>
              ))}
            </>
          )}
        </div>

        <div className="global-search-footer">
          <div className="global-search-footer-hint">
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <span>navegar</span>
          </div>
          <div className="global-search-footer-hint">
            <kbd>Enter</kbd>
            <span>selecionar</span>
          </div>
          <div className="global-search-footer-hint">
            <kbd>ESC</kbd>
            <span>fechar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
