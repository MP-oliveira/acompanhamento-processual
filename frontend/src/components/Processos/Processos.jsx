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
  Clock
} from 'lucide-react';
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

  // Dados mockados para demonstração
  const mockProcessos = [
    {
      id: 1,
      numero: '0001234-12.2024.8.05.0001',
      classe: 'Ação de Indenização por Dano Moral',
      assunto: 'Indenização por danos morais decorrentes de acidente de trânsito',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'ativo',
      dataDistribuicao: '2024-01-15T10:30:00Z',
      dataSentenca: '2024-02-20T14:15:00Z',
      prazoRecurso: '2024-03-05T23:59:59Z',
      prazoEmbargos: '2024-03-10T23:59:59Z',
      proximaAudiencia: '2024-03-15T09:00:00Z',
      observacoes: 'Processo em fase de produção de provas. Aguardando perícia médica.',
      user: { nome: 'Dr. João Silva' },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      numero: '0001235-12.2024.8.05.0001',
      classe: 'Execução de Título Extrajudicial',
      assunto: 'Execução de título extrajudicial - cheque sem fundos',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'ativo',
      dataDistribuicao: '2024-01-20T08:45:00Z',
      dataSentenca: null,
      prazoRecurso: null,
      prazoEmbargos: null,
      proximaAudiencia: '2024-03-20T14:00:00Z',
      observacoes: 'Aguardando manifestação do executado.',
      user: { nome: 'Dra. Maria Santos' },
      createdAt: '2024-01-20T08:45:00Z'
    },
    {
      id: 3,
      numero: '0001236-12.2024.8.05.0001',
      classe: 'Mandado de Segurança',
      assunto: 'Mandado de segurança contra ato de autoridade pública',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'arquivado',
      dataDistribuicao: '2024-01-10T16:20:00Z',
      dataSentenca: '2024-02-15T11:30:00Z',
      prazoRecurso: '2024-02-28T23:59:59Z',
      prazoEmbargos: '2024-03-05T23:59:59Z',
      proximaAudiencia: null,
      observacoes: 'Processo arquivado por acordo entre as partes.',
      user: { nome: 'Dr. Pedro Costa' },
      createdAt: '2024-01-10T16:20:00Z'
    }
  ];

  useEffect(() => {
    // Simula carregamento de dados
    const loadProcessos = async () => {
      setLoading(true);
      try {
        // Simula delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessos(mockProcessos);
      } catch (error) {
        console.error('Erro ao carregar processos:', error);
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
        // Simula delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simula exclusão
        setProcessos(prev => prev.filter(p => p.id !== id));
        console.log('Processo excluído:', id);
        
        // Mostra mensagem de sucesso
        alert('Processo excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir processo:', error);
        alert('Erro ao excluir processo. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/processos/${id}`);
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
    </div>
  );
};

export default Processos;
