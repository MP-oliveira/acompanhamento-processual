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
import { useProcessos } from '../../hooks/useProcessos';
import { useAlertas } from '../../hooks/useAlertas';
import './Dashboard.css';

const Dashboard = () => {
  // Hooks do React Query para buscar dados
  const { data: processosData, isLoading: loadingProcessos, error: errorProcessos } = useProcessos();
  const { data: alertasData, isLoading: loadingAlertas, error: errorAlertas } = useAlertas();
  
  // Extrair dados das respostas
  const processos = processosData || [];
  const alertas = alertasData || [];
  
  // Loading geral (qualquer um dos dois ainda carregando)
  const loading = loadingProcessos || loadingAlertas;

  // Calcular estatísticas baseadas nos dados reais
  const getStats = () => {
    const totalProcessos = processos.length;
    const alertasAtivos = alertas.filter(a => !a.lido).length;
    const proximasAudiencias = processos.filter(p => 
      p.proximaAudiencia && 
      new Date(p.proximaAudiencia) >= new Date() &&
      new Date(p.proximaAudiencia) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;
    const processosAtivos = processos.filter(p => p.status === 'ativo').length;
    const taxaSucesso = totalProcessos > 0 ? Math.round((processosAtivos / totalProcessos) * 100) : 0;

    return [
      {
        title: 'Total de Processos',
        value: totalProcessos.toString(),
        change: '+12%',
        changeType: 'positive',
        icon: FileText,
        color: 'primary',
        link: '/processos'
      },
      {
        title: 'Alertas Ativos',
        value: alertasAtivos.toString(),
        change: '+3',
        changeType: 'warning',
        icon: AlertTriangle,
        color: 'warning',
        link: '/alertas'
      },
      {
        title: 'Próximas Audiências',
        value: proximasAudiencias.toString(),
        change: 'Esta semana',
        changeType: 'info',
        icon: Calendar,
        color: 'info',
        link: '/calendario'
      },
      {
        title: 'Taxa de Sucesso',
        value: `${taxaSucesso}%`,
        change: '+5%',
        changeType: 'positive',
        icon: TrendingUp,
        color: 'success',
        link: '/relatorios'
      }
    ];
  };

  // Processos recentes (últimos 5)
  const getRecentProcesses = () => {
    return processos
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(processo => {
        const nextDeadline = getNextDeadline(processo);
        return {
          id: processo.id,
          numero: processo.numero,
          classe: processo.classe,
          status: getStatusText(processo.status),
          prazo: nextDeadline ? `${nextDeadline.daysLeft} dias` : 'Sem prazo',
          priority: getPriorityFromDeadline(nextDeadline)
        };
      });
  };

  // Prazos próximos baseados nos processos
  const getUpcomingDeadlines = () => {
    const deadlines = [];
    
    processos.forEach(processo => {
      // Próxima audiência
      if (processo.proximaAudiencia) {
        const daysLeft = getDaysUntilDeadline(processo.proximaAudiencia);
        if (daysLeft >= 0 && daysLeft <= 30) {
          deadlines.push({
            id: `audiencia-${processo.id}`,
            title: 'Audiência de Conciliação',
            process: processo.numero,
            deadline: processo.proximaAudiencia,
            type: 'audiencia',
            daysLeft: daysLeft
          });
        }
      }

      // Prazo para recurso
      if (processo.prazoRecurso) {
        const daysLeft = getDaysUntilDeadline(processo.prazoRecurso);
        if (daysLeft >= 0 && daysLeft <= 30) {
          deadlines.push({
            id: `recurso-${processo.id}`,
            title: 'Prazo para Recurso',
            process: processo.numero,
            deadline: processo.prazoRecurso,
            type: 'recurso',
            daysLeft: daysLeft
          });
        }
      }

      // Prazo para embargos
      if (processo.prazoEmbargos) {
        const daysLeft = getDaysUntilDeadline(processo.prazoEmbargos);
        if (daysLeft >= 0 && daysLeft <= 30) {
          deadlines.push({
            id: `embargos-${processo.id}`,
            title: 'Prazo para Embargos',
            process: processo.numero,
            deadline: processo.prazoEmbargos,
            type: 'embargos',
            daysLeft: daysLeft
          });
        }
      }
    });

    return deadlines
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  };

  // Funções auxiliares
  const getDaysUntilDeadline = (dateString) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getNextDeadline = (processo) => {
    const deadlines = [
      { date: processo.proximaAudiencia, label: 'Audiência' },
      { date: processo.prazoRecurso, label: 'Recurso' },
      { date: processo.prazoEmbargos, label: 'Embargos' }
    ].filter(d => d.date);

    if (deadlines.length === 0) return null;

    const sortedDeadlines = deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
    const nextDeadline = sortedDeadlines[0];
    const daysLeft = getDaysUntilDeadline(nextDeadline.date);

    return {
      ...nextDeadline,
      daysLeft
    };
  };

  const getPriorityFromDeadline = (deadline) => {
    if (!deadline) return 'low';
    if (deadline.daysLeft <= 3) return 'high';
    if (deadline.daysLeft <= 7) return 'medium';
    return 'low';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ativo': return 'Em Andamento';
      case 'arquivado': return 'Arquivado';
      case 'suspenso': return 'Suspenso';
      default: return 'Em Andamento';
    }
  };

  const stats = getStats();
  const recentProcesses = getRecentProcesses();
  const upcomingDeadlines = getUpcomingDeadlines();

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

  // Tratamento de erros
  if (errorProcessos || errorAlertas) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <div className="dashboard-error-content">
            <XCircle size={48} className="dashboard-error-icon" />
            <h3>Erro ao carregar dados</h3>
            <p>Não foi possível carregar as informações do dashboard. Tente novamente.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="page-header-actions">
          <Link to="/processos/novo" className="btn btn-primary">
            <Plus size={20} />
            Novo Processo
          </Link>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="dashboard-stats">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link} className="stat-card-link">
            <div className={`stat-card stat-card-${stat.color}`}>
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
          </Link>
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
                  <div key={process.id} className={`process-item process-item-${process.status.toLowerCase().replace(' ', '-')}`}>
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
