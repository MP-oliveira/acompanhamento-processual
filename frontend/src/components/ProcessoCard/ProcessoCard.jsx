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

  const getDaysUntilDeadline = (dateString) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline - now;
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
      {/* Header do Card */}
      <div className="processo-card-header">
        <div className="processo-card-icon">
          <FileText size={20} />
        </div>
        <div className="processo-card-meta">
          <div className="processo-card-number">
            {processo.numero}
          </div>
          <div className={`processo-card-status process-status-${statusColor}`}>
            {getStatusText(processo.status)}
          </div>
        </div>
        {showActions && (
          <div className="processo-card-actions">
            <button
              className="processo-card-action-btn processo-card-action-view"
              onClick={() => onView && onView(processo.id)}
              title="Visualizar processo"
            >
              <Eye size={16} />
            </button>
            <button
              className="processo-card-action-btn processo-card-action-edit btn-icon"
              onClick={() => onEdit && onEdit(processo.id)}
              title="Editar processo"
            >
              <Edit size={16} />
            </button>
            <button
              className="processo-card-action-btn processo-card-action-delete"
              onClick={() => onDelete && onDelete(processo.id)}
              title="Excluir processo"
            >
              <Trash2 size={16} />
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

        {/* Informações do Processo */}
        <div className="processo-card-info">
          <div className="processo-card-info-item">
            <MapPin size={14} />
            <span>{processo.tribunal} - {processo.comarca}</span>
          </div>
          
          <div className="processo-card-info-item">
            <Calendar size={14} />
            <span>Distribuído em {formatDate(processo.dataDistribuicao)}</span>
          </div>

          {processo.dataSentenca && (
            <div className="processo-card-info-item">
              <FileText size={14} />
              <span>Sentença em {formatDate(processo.dataSentenca)}</span>
            </div>
          )}
        </div>

        {/* Próximo Prazo */}
        {nextDeadline && (
          <div className="processo-card-deadline">
            <div className="processo-card-deadline-header">
              <Clock size={14} />
              <span>Próximo: {nextDeadline.label}</span>
            </div>
            <div className="processo-card-deadline-content">
              <span className="processo-card-deadline-date">
                {formatDateTime(nextDeadline.date)}
              </span>
              {nextDeadline.daysLeft !== null && (
                <span className={`processo-card-deadline-days ${
                  nextDeadline.daysLeft <= 0 ? 'overdue' :
                  nextDeadline.daysLeft <= 3 ? 'urgent' : 'normal'
                }`}>
                  {nextDeadline.daysLeft <= 0 ? 
                    `Vencido há ${Math.abs(nextDeadline.daysLeft)} ${Math.abs(nextDeadline.daysLeft) === 1 ? 'dia' : 'dias'}` :
                    nextDeadline.daysLeft === 0 ? 'Vence hoje!' :
                    `${nextDeadline.daysLeft} ${nextDeadline.daysLeft === 1 ? 'dia' : 'dias'} restantes`
                  }
                </span>
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        {processo.observacoes && !compact && (
          <div className="processo-card-observations">
            <p className="processo-card-observations-text">
              {processo.observacoes}
            </p>
          </div>
        )}
      </div>

      {/* Footer do Card */}
      <div className="processo-card-footer">
        <div className="processo-card-user">
          <User size={14} />
          <span>Responsável: {processo.user?.nome || 'Não informado'}</span>
        </div>
        
        <div className="processo-card-dates">
          <span className="processo-card-created">
            Criado em {formatDate(processo.createdAt)}
          </span>
        </div>
      </div>

      {/* Indicador de Status removido - usando apenas borda esquerda */}
    </div>
  );
};

export default ProcessoCard;
