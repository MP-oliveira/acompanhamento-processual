import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import './Topbar.css';

const Topbar = ({ onMenuToggle, user, onLogout }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserDropdown(false);
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    onLogout();
  };

  const handleProfile = () => {
    setShowUserDropdown(false);
    navigate('/perfil');
  };

  const handleSettings = () => {
    setShowUserDropdown(false);
    navigate('/configuracoes');
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    if (notification.type === 'processo') {
      navigate(`/processos/${notification.processId}`);
    } else if (notification.type === 'alerta') {
      navigate('/alertas');
    }
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

  // Dados mockados para notificações
  const notifications = [
    {
      id: 1,
      type: 'alerta',
      title: 'Prazo vencendo',
      message: 'Processo 0001234-12.2024.8.05.0001 tem prazo vencendo em 2 dias',
      time: '5 min atrás',
      unread: true,
      icon: AlertTriangle
    },
    {
      id: 2,
      type: 'processo',
      title: 'Nova movimentação',
      message: 'Processo 0001235-12.2024.8.05.0001 teve nova movimentação',
      time: '1 hora atrás',
      unread: true,
      processId: 2,
      icon: CheckCircle
    },
    {
      id: 3,
      type: 'alerta',
      title: 'Audiência agendada',
      message: 'Audiência de conciliação agendada para amanhã às 14h',
      time: '3 horas atrás',
      unread: false,
      icon: Clock
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
          <div className="topbar-notification-menu">
            <button 
              className="topbar-notification-btn" 
              onClick={toggleNotifications}
              aria-label="Notificações"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="topbar-notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            <div className={`topbar-notification-dropdown ${showNotifications ? 'show' : ''}`}>
              <div className="topbar-notification-header">
                <h3>Notificações</h3>
                <span className="topbar-notification-count">{unreadCount} não lidas</span>
              </div>
              
              <div className="topbar-notification-list">
                {notifications.length === 0 ? (
                  <div className="topbar-notification-empty">
                    <Bell size={24} />
                    <p>Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <button
                      key={notification.id}
                      className={`topbar-notification-item ${notification.unread ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="topbar-notification-icon">
                        <notification.icon size={16} />
                      </div>
                      <div className="topbar-notification-content">
                        <div className="topbar-notification-title">{notification.title}</div>
                        <div className="topbar-notification-message">{notification.message}</div>
                        <div className="topbar-notification-time">{notification.time}</div>
                      </div>
                      {notification.unread && (
                        <div className="topbar-notification-dot"></div>
                      )}
                    </button>
                  ))
                )}
              </div>
              
              <div className="topbar-notification-footer">
                <Link to="/alertas" className="topbar-notification-link">
                  Ver todas as notificações
                </Link>
              </div>
            </div>
          </div>

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
              
              <button 
                className="topbar-user-dropdown-item"
                onClick={handleProfile}
              >
                <User size={16} />
                <span>Meu Perfil</span>
              </button>
              
              <button 
                className="topbar-user-dropdown-item"
                onClick={handleSettings}
              >
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
