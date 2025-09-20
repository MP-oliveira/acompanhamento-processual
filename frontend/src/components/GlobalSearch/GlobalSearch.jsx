import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, AlertTriangle, Calendar, Users, BarChart3, Clock, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import './GlobalSearch.css';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  
  const { 
    results, 
    searchWithSuggestions, 
    clearResults,
    isLoading 
  } = useGlobalSearch();

  // Foco automático no input quando o modal abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Busca em tempo real com debounce
  useEffect(() => {
    if (query.trim().length >= 2) {
      searchWithSuggestions(query.trim());
    } else {
      clearResults();
    }
  }, [query, searchWithSuggestions, clearResults]);

  // Navegação por teclado
  const handleKeyDown = useCallback((e) => {
    if (!results.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        handleClose();
        break;
    }
  }, [results, selectedIndex]);

  const handleResultClick = (result) => {
    if (result.link) {
      navigate(result.link);
    } else if (result.route) {
      navigate(result.route, { 
        state: result.state || {} 
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    clearResults();
    onClose();
  };

  const getResultIcon = (type) => {
    const icons = {
      processo: FileText,
      alerta: AlertTriangle,
      calendario: Calendar,
      usuario: Users,
      relatorio: BarChart3,
      consulta: Search,
      recente: Clock
    };
    return icons[type] || Search;
  };

  const formatResultText = (result) => {
    const { type, title, description, highlight } = result;
    
    return (
      <div className="search-result-content">
        <div className="search-result-title">
          {highlight?.title ? (
            <span dangerouslySetInnerHTML={{ __html: highlight.title }} />
          ) : (
            title
          )}
        </div>
        {description && (
          <div className="search-result-subtitle">
            {highlight?.description ? (
              <span dangerouslySetInnerHTML={{ __html: highlight.description }} />
            ) : (
              description
            )}
          </div>
        )}
        <div className="search-result-type">{type}</div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay" onClick={handleClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="global-search-header">
          <div className="global-search-input-container">
            <Search size={20} className="global-search-input-icon" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar processos, alertas, usuários..."
              className="global-search-input"
              autoComplete="off"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="global-search-clear"
                aria-label="Limpar busca"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="global-search-close"
            aria-label="Fechar busca"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="global-search-results">
          {isLoading ? (
            <div className="global-search-loading">
              <div className="loading-spinner" />
              <span>Buscando...</span>
            </div>
          ) : query.trim().length < 2 ? (
            <div className="global-search-placeholder">
              <Search size={48} />
              <p>Digite pelo menos 2 caracteres para buscar</p>
              <div className="global-search-shortcuts">
                <div className="shortcut-item">
                  <kbd>↑</kbd><kbd>↓</kbd> Navegar
                </div>
                <div className="shortcut-item">
                  <kbd>Enter</kbd> Selecionar
                </div>
                <div className="shortcut-item">
                  <kbd>Esc</kbd> Fechar
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="global-search-empty">
              <Search size={48} />
              <p>Nenhum resultado encontrado para "{query}"</p>
              <span>Tente termos diferentes ou verifique a ortografia</span>
            </div>
          ) : (
            <div className="global-search-results-list">
              {results.map((result, index) => {
                const IconComponent = getResultIcon(result.type);
                const isSelected = index === selectedIndex;
                
                return (
                  <div
                    key={`${result.type}-${result.id || index}`}
                    className={`global-search-result ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="global-search-result-icon">
                      <IconComponent size={20} />
                    </div>
                    {formatResultText(result)}
                    <div className="global-search-result-arrow">
                      →
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="global-search-footer">
            <div className="global-search-footer-info">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </div>
            <div className="global-search-footer-shortcuts">
              <span>Use as setas para navegar • Enter para selecionar</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
