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
  ArrowRight
} from 'lucide-react';
import { processoService } from '../../services/api';
import './GlobalSearch.css';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus no input quando abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
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
        const filtered = processos.filter(p => 
          p.numero?.toLowerCase().includes(query.toLowerCase()) ||
          p.classe?.toLowerCase().includes(query.toLowerCase()) ||
          p.assunto?.toLowerCase().includes(query.toLowerCase()) ||
          p.tribunal?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);

        const processResults = filtered.map(p => ({
          id: p.id,
          type: 'processo',
          title: p.numero,
          subtitle: p.classe,
          icon: FileText,
          action: () => navigate(`/processos/editar/${p.id}`)
        }));

        setResults([...getDefaultActions(), ...processResults]);
      } catch (error) {
        console.error('Erro ao buscar:', error);
        setResults(getDefaultActions());
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProcessos, 300);
    return () => clearTimeout(debounce);
  }, [query]);

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
          <kbd className="global-search-kbd">ESC</kbd>
        </div>

        <div className="global-search-results">
          {loading && (
            <div className="global-search-loading">
              <div className="loading-spinner-small" />
              <span>Buscando...</span>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="global-search-empty">
              <p>Nenhum resultado encontrado</p>
            </div>
          )}

          {!loading && results.length > 0 && results.map((result, index) => (
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
