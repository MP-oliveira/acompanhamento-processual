import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { alertService } from '../../services/api';
import './Topbar.css';

const Topbar = ({ onMenuToggle, user, onLogout }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Buscar notificações reais dos alertas
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await alertService.getAll();
        const alerts = response.alerts || [];
        
        // Converter alertas em notificações
        const notificationsData = alerts.slice(0, 5).map(alert => ({
          id: alert.id,
          type: 'alerta',
          title: alert.titulo,
          message: alert.mensagem,
          time: formatTimeAgo(alert.createdAt),
          unread: !alert.lido,
          alertId: alert.id,
          icon: AlertTriangle
        }));
        
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserDropdown(false);
  };

  // Fechar dropdowns ao sair do mouse
  const handleUserMenuMouseLeave = () => {
    setShowUserDropdown(false);
  };

  const handleNotificationMenuMouseLeave = () => {
    setShowNotifications(false);
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

  const handleNotificationClick = async (notification) => {
    setShowNotifications(false);
    
    // Marcar como lida se não estiver lida
    if (notification.unread && notification.alertId) {
      try {
        await alertService.markAsRead(notification.alertId);
        // Atualizar a notificação local
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, unread: false }
              : n
          )
        );
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
      }
    }
    
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
          <div 
            className="topbar-notification-menu"
            onMouseLeave={handleNotificationMenuMouseLeave}
          >
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
                {loading ? (
                  <div className="topbar-notification-empty">
                    <div className="topbar-notification-loading">
                      <div className="topbar-notification-spinner"></div>
                    </div>
                    <p>Carregando...</p>
                  </div>
                ) : notifications.length === 0 ? (
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
          <div 
            className="topbar-user-menu"
            onMouseLeave={handleUserMenuMouseLeave}
          >
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
