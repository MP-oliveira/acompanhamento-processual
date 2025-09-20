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
  Search
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
  
  const menuItems = [
    {
      section: 'Principal',
      items: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: FileText, label: 'Processos', href: '/processos' },
        { icon: AlertTriangle, label: 'Alertas', href: '/alertas' },
        { icon: Calendar, label: 'Calendário', href: '/calendario' },
      ]
    },
    {
      section: 'Gestão',
      items: [
        { icon: Search, label: 'Consultas', href: '/consultas' },
        { icon: BarChart3, label: `Relatórios (${totalRelatorios})`, href: '/relatorios' },
      ]
    },
    {
      section: 'Sistema',
      items: [
        { icon: Users, label: 'Usuários', href: '/usuarios' },
        { icon: Settings, label: 'Configurações', href: '/configuracoes' },
      ]
    }
  ];

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
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="sidebar-nav-section">
              <h4 className="sidebar-nav-section-title">
                {section.section}
              </h4>
              
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.href}
                  className={`sidebar-nav-item ${isActiveRoute(item.href) ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon className="sidebar-nav-item-icon" size={20} />
                  <span className="sidebar-nav-item-text">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          ))}
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
