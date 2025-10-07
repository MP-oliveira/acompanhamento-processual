import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  Settings, 
  Users,
  BarChart3,
  Search,
  Activity,
  Scale,
  Mic,
  LayoutGrid,
  Zap,
  DollarSign,
  Clock
} from 'lucide-react';
import { processoService } from '../../services/api';
import { useRelatoriosStats } from '../../hooks/useRelatorios';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, user }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [processosMes, setProcessosMes] = useState(0);
  
  // Hook do React Query para buscar estatísticas de relatórios
  const { data: relatoriosStats, isLoading: loadingRelatorios } = useRelatoriosStats();
  
  // Buscar número de processos cadastrados no mês atual
  useEffect(() => {
    const fetchProcessosMes = async () => {
      try {
        const response = await processoService.getAll();
        const processos = response.processos || [];
        
        // Filtrar processos do mês atual
        const agora = new Date();
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);
        
        const processosDoMes = processos.filter(processo => {
          const dataCriacao = new Date(processo.createdAt);
          return dataCriacao >= inicioMes && dataCriacao <= fimMes;
        });
        
        setProcessosMes(processosDoMes.length);
      } catch (error) {
        console.error('Erro ao buscar processos do mês:', error);
        setProcessosMes(0);
      }
    };

    fetchProcessosMes();
  }, []);

  // Total de relatórios vem do React Query hook
  const totalRelatorios = isAuthenticated 
    ? (relatoriosStats?.total || 0) // Se autenticado, usar dados reais da API
    : 0;

  const isActiveRoute = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay show" 
          onClick={onClose}
          aria-label="Fechar menu"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
        {/* Header da Sidebar */}
        <div className="sidebar-header">
          <h3 className="sidebar-title">Menu</h3>
        </div>

                {/* Navegação */}
                <nav className="sidebar-nav">
                  {/* Seção Principal */}
                  <div className="sidebar-nav-section">
                    <h4 className="sidebar-nav-section-title">Principal</h4>
                    <Link
                      to="/dashboard"
                      className={`sidebar-nav-item ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Home className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Dashboard</span>
                      <kbd className="sidebar-nav-shortcut">D</kbd>
                    </Link>
                    <Link
                      to="/processos"
                      className={`sidebar-nav-item ${isActiveRoute('/processos') && !location.pathname.includes('/kanban') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <FileText className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Processos</span>
                      <kbd className="sidebar-nav-shortcut">P</kbd>
                    </Link>
                    <Link
                      to="/processos/kanban"
                      className={`sidebar-nav-item ${location.pathname.includes('/kanban') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <LayoutGrid className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Kanban Board</span>
                      <kbd className="sidebar-nav-shortcut">K</kbd>
                    </Link>
                    <Link
                      to="/audiencias"
                      className={`sidebar-nav-item ${isActiveRoute('/audiencias') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Mic className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Audiências</span>
                    </Link>
                    <Link
                      to="/recursos"
                      className={`sidebar-nav-item ${isActiveRoute('/recursos') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Scale className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Recursos</span>
                    </Link>
                    <Link
                      to="/alertas"
                      className={`sidebar-nav-item ${isActiveRoute('/alertas') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <AlertTriangle className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Alertas</span>
                      <kbd className="sidebar-nav-shortcut">A</kbd>
                    </Link>
                    <Link
                      to="/calendario"
                      className={`sidebar-nav-item ${isActiveRoute('/calendario') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Calendar className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Calendário</span>
                      <kbd className="sidebar-nav-shortcut">C</kbd>
                    </Link>
                  </div>

                  {/* Seção Gestão */}
                  <div className="sidebar-nav-section">
                    <h4 className="sidebar-nav-section-title">Gestão</h4>
                    <Link
                      to="/consultas"
                      className={`sidebar-nav-item ${isActiveRoute('/consultas') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Search className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Consultas</span>
                    </Link>
                    <Link
                      to="/relatorios"
                      className={`sidebar-nav-item ${isActiveRoute('/relatorios') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <BarChart3 className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Relatórios ({totalRelatorios})</span>
                    </Link>
                    <Link
                      to="/financeiro"
                      className={`sidebar-nav-item ${isActiveRoute('/financeiro') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <DollarSign className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Financeiro</span>
                    </Link>
                  </div>

                    <Link
                      to="/clientes"
                      className={`sidebar-nav-item ${isActiveRoute('/clientes') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Users className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Clientes</span>
                    </Link>
                    <Link
                      to="/timesheet"
                      className={`sidebar-nav-item ${isActiveRoute('/timesheet') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Clock className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Timesheet</span>
                    </Link>

                  {/* Seção Sistema */}
                  <div className="sidebar-nav-section">
                    <h4 className="sidebar-nav-section-title">Sistema</h4>
                    {/* Usuários - Apenas para administradores */}
                    {user?.role === 'admin' && (
                      <Link
                        to="/usuarios"
                        className={`sidebar-nav-item ${isActiveRoute('/usuarios') ? 'active' : ''}`}
                        onClick={onClose}
                      >
                        <Users className="sidebar-nav-item-icon" size={20} />
                        <span className="sidebar-nav-item-text">Usuários</span>
                      </Link>
                    )}
                    <Link
                      to="/workflows"
                      className={`sidebar-nav-item ${isActiveRoute('/workflows') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Zap className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Workflows</span>
                    </Link>
                    <Link
                      to="/performance"
                      className={`sidebar-nav-item ${isActiveRoute('/performance') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Activity className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Performance</span>
                    </Link>
                    <Link
                      to="/configuracoes"
                      className={`sidebar-nav-item ${isActiveRoute('/configuracoes') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Settings className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Configurações</span>
                    </Link>
                  </div>
                </nav>

        {/* Footer da Sidebar */}
        <div className="sidebar-footer">
          <div className="sidebar-shortcuts-hint">
            <span>Pressione <kbd>Shift</kbd> + <kbd>/</kbd> para ver atalhos</span>
          </div>
          <div className="sidebar-version">
            <span className="sidebar-version-text">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
