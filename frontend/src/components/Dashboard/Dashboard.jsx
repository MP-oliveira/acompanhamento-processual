import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  // Dados mockados para demonstração
  const stats = [
    {
      title: 'Total de Processos',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      color: 'primary'
    },
    {
      title: 'Alertas Ativos',
      value: '8',
      change: '+3',
      changeType: 'warning',
      icon: AlertTriangle,
      color: 'warning'
    },
    {
      title: 'Próximas Audiências',
      value: '3',
      change: 'Esta semana',
      changeType: 'info',
      icon: Calendar,
      color: 'info'
    },
    {
      title: 'Taxa de Sucesso',
      value: '87%',
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'success'
    }
  ];

  const recentProcesses = [
    {
      id: 1,
      numero: '0001234-12.2024.8.05.0001',
      classe: 'Ação de Indenização',
      status: 'Em Andamento',
      prazo: '15 dias',
      priority: 'high'
    },
    {
      id: 2,
      numero: '0001235-12.2024.8.05.0001',
      classe: 'Execução de Título Extrajudicial',
      status: 'Aguardando Despacho',
      prazo: '8 dias',
      priority: 'medium'
    },
    {
      id: 3,
      numero: '0001236-12.2024.8.05.0001',
      classe: 'Mandado de Segurança',
      status: 'Concluído',
      prazo: 'Concluído',
      priority: 'low'
    }
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'Prazo para Recurso',
      process: '0001234-12.2024.8.05.0001',
      deadline: '2024-01-15',
      type: 'recurso',
      daysLeft: 2
    },
    {
      id: 2,
      title: 'Audiência de Conciliação',
      process: '0001235-12.2024.8.05.0001',
      deadline: '2024-01-18',
      type: 'audiencia',
      daysLeft: 5
    },
    {
      id: 3,
      title: 'Prazo para Embargos',
      process: '0001236-12.2024.8.05.0001',
      deadline: '2024-01-20',
      type: 'embargos',
      daysLeft: 7
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--error-500)';
      case 'medium': return 'var(--warning-500)';
      case 'low': return 'var(--success-500)';
      default: return 'var(--neutral-500)';
    }
  };

  const getDeadlineTypeIcon = (type) => {
    switch (type) {
      case 'recurso': return <Clock size={16} />;
      case 'audiencia': return <Calendar size={16} />;
      case 'embargos': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getDeadlineTypeColor = (type) => {
    switch (type) {
      case 'recurso': return 'var(--warning-500)';
      case 'audiencia': return 'var(--info-500)';
      case 'embargos': return 'var(--error-500)';
      default: return 'var(--neutral-500)';
    }
  };

  return (
    <div className="dashboard">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Visão geral dos seus processos e prazos
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary">
            <Plus size={20} />
            Novo Processo
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="dashboard-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-card-header">
              <div className={`stat-card-icon stat-card-icon-${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="stat-card-change">
                <span className={`stat-card-change-value stat-card-change-${stat.changeType}`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div className="stat-card-content">
              <h3 className="stat-card-title">{stat.title}</h3>
              <div className="stat-card-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Conteúdo Principal */}
      <div className="dashboard-content">
        <div className="dashboard-grid">
          {/* Processos Recentes */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">Processos Recentes</h3>
              <Link to="/processos" className="dashboard-section-link">
                Ver todos
              </Link>
            </div>
            <div className="dashboard-section-content">
              <div className="process-list">
                {recentProcesses.map((process) => (
                  <div key={process.id} className="process-item">
                    <div className="process-item-main">
                      <div className="process-item-header">
                        <h4 className="process-item-title">
                          {process.numero}
                        </h4>
                        <div 
                          className="process-item-priority"
                          style={{ backgroundColor: getPriorityColor(process.priority) }}
                        />
                      </div>
                      <p className="process-item-class">{process.classe}</p>
                      <div className="process-item-status">
                        <span className={`process-item-status-badge process-item-status-${process.status.toLowerCase().replace(' ', '-')}`}>
                          {process.status}
                        </span>
                      </div>
                    </div>
                    <div className="process-item-side">
                      <div className="process-item-prazo">
                        <Clock size={16} />
                        <span>{process.prazo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prazos Próximos */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">Prazos Próximos</h3>
              <Link to="/alertas" className="dashboard-section-link">
                Ver todos
              </Link>
            </div>
            <div className="dashboard-section-content">
              <div className="deadline-list">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="deadline-item">
                    <div className="deadline-item-icon" style={{ color: getDeadlineTypeColor(deadline.type) }}>
                      {getDeadlineTypeIcon(deadline.type)}
                    </div>
                    <div className="deadline-item-content">
                      <h4 className="deadline-item-title">{deadline.title}</h4>
                      <p className="deadline-item-process">{deadline.process}</p>
                      <div className="deadline-item-meta">
                        <span className="deadline-item-date">
                          {new Date(deadline.deadline).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`deadline-item-days deadline-item-days-${deadline.daysLeft <= 3 ? 'urgent' : 'normal'}`}>
                          {deadline.daysLeft} {deadline.daysLeft === 1 ? 'dia' : 'dias'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
