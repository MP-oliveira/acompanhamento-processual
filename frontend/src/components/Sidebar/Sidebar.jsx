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
  Activity
} from 'lucide-react';
import { processoService } from '../../services/api';
import { useRelatoriosStats } from '../../hooks/useRelatorios';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
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
  const totalRelatorios = relatoriosStats?.total || 0;

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
                    </Link>
                    <Link
                      to="/processos"
                      className={`sidebar-nav-item ${isActiveRoute('/processos') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <FileText className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Processos</span>
                    </Link>
                    <Link
                      to="/alertas"
                      className={`sidebar-nav-item ${isActiveRoute('/alertas') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <AlertTriangle className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Alertas</span>
                    </Link>
                    <Link
                      to="/calendario"
                      className={`sidebar-nav-item ${isActiveRoute('/calendario') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Calendar className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Calendário</span>
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
                  </div>

                  {/* Seção Sistema */}
                  <div className="sidebar-nav-section">
                    <h4 className="sidebar-nav-section-title">Sistema</h4>
                    <Link
                      to="/usuarios"
                      className={`sidebar-nav-item ${isActiveRoute('/usuarios') ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Users className="sidebar-nav-item-icon" size={20} />
                      <span className="sidebar-nav-item-text">Usuários</span>
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
          <div className="sidebar-version">
            <span className="sidebar-version-text">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
