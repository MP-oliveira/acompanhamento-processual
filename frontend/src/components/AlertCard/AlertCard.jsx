import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  FileText, 
  X, 
  Check,
  Bell,
  BellOff
} from 'lucide-react';
import './AlertCard.css';

const AlertCard = ({ 
  alert, 
  onMarkAsRead, 
  onDelete, 
  onViewProcess,
  showActions = true 
}) => {
  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'audiencia':
        return <Calendar size={20} />;
      case 'prazo_recurso':
        return <Clock size={20} />;
      case 'prazo_embargos':
        return <AlertTriangle size={20} />;
      case 'despacho':
        return <FileText size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const getAlertColor = (tipo, prioridade) => {
    if (prioridade === 'urgente') return 'urgent';
    if (prioridade === 'alta') return 'high';
    if (prioridade === 'media') return 'medium';
    if (prioridade === 'baixa') return 'low';
    
    // Fallback por tipo
    switch (tipo) {
      case 'audiencia':
        return 'info';
      case 'prazo_recurso':
      case 'prazo_embargos':
        return 'warning';
      case 'despacho':
        return 'primary';
      default:
        return 'medium';
    }
  };

  const getPriorityText = (prioridade) => {
    switch (prioridade) {
      case 'urgente': return 'Urgente';
      case 'alta': return 'Alta';
      case 'media': return 'Média';
      case 'baixa': return 'Baixa';
      default: return 'Média';
    }
  };

  const getTypeText = (tipo) => {
    switch (tipo) {
      case 'audiencia': return 'Audiência';
      case 'prazo_recurso': return 'Prazo para Recurso';
      case 'prazo_embargos': return 'Prazo para Embargos';
      case 'despacho': return 'Despacho';
      default: return 'Alerta';
    }
  };

  const formatDate = (dateString) => {
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
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline(alert.dataVencimento);
  const alertColor = getAlertColor(alert.tipo, alert.prioridade);
  const isOverdue = daysLeft < 0;

  return (
    <div className={`alert-card alert-card-${alertColor} ${alert.lido ? 'alert-card-read' : ''} ${isOverdue ? 'alert-card-overdue' : ''}`}>
      {/* Header do Card */}
      <div className="alert-card-header">
        <div className="alert-card-icon">
          {getAlertIcon(alert.tipo)}
        </div>
        <div className="alert-card-meta">
          <div className="alert-card-type">
            {getTypeText(alert.tipo)}
          </div>
          <div className="alert-card-priority">
            {getPriorityText(alert.prioridade)}
          </div>
        </div>
        {showActions && (
          <div className="alert-card-actions">
            {alert.lido ? (
              <div className="alert-card-check-read">
                <Check size={16} />
              </div>
            ) : (
              <button
                className="alert-card-action-btn alert-card-action-read"
                onClick={() => onMarkAsRead(alert.id)}
                title="Marcar como lido"
              >
                <Check size={16} />
              </button>
            )}
            <button
              className="alert-card-action-btn alert-card-action-delete"
              onClick={() => onDelete(alert.id)}
              title="Excluir alerta"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="alert-card-content">
        <h4 className="alert-card-title">
          {alert.titulo}
        </h4>
        <p className="alert-card-message">
          {alert.mensagem}
        </p>
        
        {alert.processo && (
          <div className="alert-card-process">
            <FileText size={14} />
            <span 
              className="alert-card-process-number"
              onClick={() => onViewProcess && onViewProcess(alert.processo.id)}
            >
              {alert.processo.numero}
            </span>
          </div>
        )}
      </div>

      {/* Footer do Card */}
      <div className="alert-card-footer">
        <div className="alert-card-dates">
          <div className="alert-card-date">
            <Clock size={14} />
            <span>Vence: {formatDate(alert.dataVencimento)}</span>
          </div>
          <div className="alert-card-notification">
            <Bell size={14} />
            <span>Notificado: {formatDate(alert.dataNotificacao)}</span>
          </div>
        </div>
        
        <div className="alert-card-deadline">
          {daysLeft > 0 ? (
            <span className="alert-card-days-left">
              {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} restantes
            </span>
          ) : daysLeft === 0 ? (
            <span className="alert-card-days-left alert-card-days-today">
              Vence hoje!
            </span>
          ) : (
            <span className="alert-card-days-left alert-card-days-overdue">
              Vencido há {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'dia' : 'dias'}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default AlertCard;
