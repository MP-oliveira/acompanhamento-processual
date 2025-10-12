import React from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import './ProcessoCard.css';

const ProcessoCard = ({ 
  processo, 
  onEdit, 
  onDelete, 
  onView,
  showActions = true,
  compact = false
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo':
        return 'active';
      case 'arquivado':
        return 'archived';
      case 'suspenso':
        return 'suspended';
      default:
        return 'active';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'arquivado':
        return 'Arquivado';
      case 'suspenso':
        return 'Suspenso';
      default:
        return 'Ativo';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateWithTime = (dateString, timeString) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('pt-BR');
    if (timeString) {
      return `${formattedDate} às ${timeString}`;
    }
    return formattedDate;
  };

  const getDaysUntilDeadline = (dateString) => {
    if (!dateString) return null;
    
    // Normalizar datas para comparação (apenas dia, sem hora)
    const deadline = new Date(dateString);
    const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = deadlineDate - todayDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getNextDeadline = () => {
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

  const nextDeadline = getNextDeadline();
  const statusColor = getStatusColor(processo.status);

  return (
    <div className={`processo-card ${compact ? 'processo-card-compact' : ''} processo-card-${statusColor}`}>
      {/* Header Minimalista */}
      <div className="processo-card-header">
        <div className="processo-card-meta">
          <div className="processo-card-number">
            {processo.numero}
          </div>
          <div className={`processo-card-status`}>
            {getStatusText(processo.status)}
          </div>
        </div>
        {showActions && (
          <div className="processo-card-actions">
            <button
              className="processo-card-action-btn"
              onClick={() => onView && onView(processo.id)}
              title="Visualizar processo"
            >
              <Eye size={18} />
            </button>
            <button
              className="processo-card-action-btn"
              onClick={() => onEdit && onEdit(processo.id)}
              title="Editar processo"
            >
              <Edit size={18} />
            </button>
            <button
              className="processo-card-action-btn processo-card-action-delete"
              onClick={() => onDelete && onDelete(processo.id)}
              title="Excluir processo"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      <div className="processo-card-content">
        <h4 className="processo-card-title">
          {processo.classe}
        </h4>
        
        {processo.assunto && (
          <p className="processo-card-subject">
            {processo.assunto}
          </p>
        )}

        {/* Informações Essenciais */}
        <div className="processo-card-info">
          <div className="processo-card-info-item">
            <MapPin size={16} />
            <span>{processo.tribunal} - {processo.comarca}</span>
          </div>
          
          <div className="processo-card-info-item">
            <Calendar size={16} />
            <span>{formatDate(processo.dataDistribuicao)}</span>
          </div>
        </div>

        {/* Próximo Prazo */}
        {nextDeadline && (
          <div className="processo-card-deadline">
            <div className="processo-card-deadline-header">
              <Clock size={16} />
              <span>{nextDeadline.label}</span>
            </div>
            <div className="processo-card-deadline-content">
              <span className="processo-card-deadline-date">
                {nextDeadline.label === 'Audiência' && processo.horaAudiencia
                  ? formatDateWithTime(nextDeadline.date, processo.horaAudiencia)
                  : formatDate(nextDeadline.date)}
              </span>
              {nextDeadline.daysLeft !== null && nextDeadline.daysLeft !== undefined && (
                <span className={`processo-card-deadline-days ${
                  nextDeadline.daysLeft < 0 ? 'overdue' :
                  nextDeadline.daysLeft === 0 ? 'urgent' :
                  nextDeadline.daysLeft <= 7 ? 'urgent' : 'normal'
                }`}>
                  {nextDeadline.daysLeft < 0 ? 
                    'Vencido' :
                    nextDeadline.daysLeft === 0 ? 
                    'Hoje' :
                    `${nextDeadline.daysLeft}d`
                  }
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Simples */}
      <div className="processo-card-footer">
        <div className="processo-card-user">
          <User size={16} />
          <span>{processo.user?.nome || 'Não atribuído'}</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessoCard;
