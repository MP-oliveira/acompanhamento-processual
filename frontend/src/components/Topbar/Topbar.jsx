import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react';
import './Topbar.css';

const Topbar = ({ onMenuToggle, user, onLogout }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const location = useLocation();

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    onLogout();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActiveRoute = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="topbar">
      <div className="topbar-container">
        {/* Logo e Menu Mobile */}
        <div className="topbar-left">
          <button 
            className="mobile-menu-toggle"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          
          <div className="topbar-logo">
            <div className="topbar-logo-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span>JurisAcompanha</span>
          </div>
        </div>

        {/* Navegação Central */}
        <nav className="topbar-nav">
          <Link 
            to="/dashboard" 
            className={`topbar-nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/processos" 
            className={`topbar-nav-link ${isActiveRoute('/processos') ? 'active' : ''}`}
          >
            Processos
          </Link>
          <Link 
            to="/alertas" 
            className={`topbar-nav-link ${isActiveRoute('/alertas') ? 'active' : ''}`}
          >
            Alertas
          </Link>
        </nav>

        {/* Usuário e Notificações */}
        <div className="topbar-right">
          {/* Notificações */}
          <button className="topbar-notification-btn" aria-label="Notificações">
            <Bell size={20} />
            <span className="topbar-notification-badge">3</span>
          </button>

          {/* Menu do Usuário */}
          <div className="topbar-user-menu">
            <button 
              className="topbar-user-trigger"
              onClick={toggleUserDropdown}
              aria-label="Menu do usuário"
            >
              <div className="topbar-user-avatar">
                {user ? getInitials(user.nome) : 'U'}
              </div>
              <span className="topbar-user-name">
                {user ? user.nome : 'Usuário'}
              </span>
            </button>

            {/* Dropdown do Usuário */}
            <div className={`topbar-user-dropdown ${showUserDropdown ? 'show' : ''}`}>
              <div className="topbar-user-info">
                <div className="topbar-user-avatar-large">
                  {user ? getInitials(user.nome) : 'U'}
                </div>
                <div className="topbar-user-details">
                  <div className="topbar-user-fullname">
                    {user ? user.nome : 'Usuário'}
                  </div>
                  <div className="topbar-user-email">
                    {user ? user.email : 'usuario@exemplo.com'}
                  </div>
                </div>
              </div>
              
              <div className="topbar-user-dropdown-divider"></div>
              
              <button className="topbar-user-dropdown-item">
                <User size={16} />
                <span>Meu Perfil</span>
              </button>
              
              <button className="topbar-user-dropdown-item">
                <Settings size={16} />
                <span>Configurações</span>
              </button>
              
              <div className="topbar-user-dropdown-divider"></div>
              
              <button 
                className="topbar-user-dropdown-item topbar-user-dropdown-item-danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
