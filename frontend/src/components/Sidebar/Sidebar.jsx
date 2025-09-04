import React from 'react';
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
  Plus
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
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
        { icon: Plus, label: 'Novo Processo', href: '/processos/novo' },
        { icon: Search, label: 'Consultas', href: '/consultas' },
        { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
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
