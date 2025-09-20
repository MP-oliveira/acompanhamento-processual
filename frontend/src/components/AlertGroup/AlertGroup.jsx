import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import AlertCard from '../AlertCard/AlertCard';
import './AlertGroup.css';

const AlertGroup = ({ 
  processoNumero, 
  processo, 
  alertas, 
  total, 
  naoLidos, 
  prioridadeMaxima,
  onMarkAsRead,
  onDelete,
  onViewProcess
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const getPriorityColor = (prioridade) => {
    switch (prioridade) {
      case 'urgente': return 'urgent';
      case 'alta': return 'high';
      case 'media': return 'medium';
      case 'baixa': return 'low';
      default: return 'medium';
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

  // Ordena alertas por prioridade e data
  const sortedAlertas = [...alertas].sort((a, b) => {
    const prioridades = { 'urgente': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
    const prioridadeDiff = prioridades[b.prioridade] - prioridades[a.prioridade];
    if (prioridadeDiff !== 0) return prioridadeDiff;
    
    return new Date(b.dataVencimento) - new Date(a.dataVencimento);
  });

  const alertasVisiveis = showAll ? sortedAlertas : sortedAlertas.slice(0, 3);

  return (
    <div className={`alert-group alert-group-${getPriorityColor(prioridadeMaxima)}`}>
      {/* Header do Grupo */}
      <div className="alert-group-header" onClick={() => setExpanded(!expanded)}>
        <div className="alert-group-icon">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        
        <div className="alert-group-info">
          <div className="alert-group-process">
            <FileText size={16} />
            <span className="alert-group-process-number" onClick={(e) => {
              e.stopPropagation();
              onViewProcess(processo.id);
            }}>
              {processoNumero}
            </span>
          </div>
          
          <div className="alert-group-meta">
            <span className="alert-group-count">
              {total} {total === 1 ? 'alerta' : 'alertas'}
              {naoLidos > 0 && (
                <span className="alert-group-unread"> • {naoLidos} não lidos</span>
              )}
            </span>
            <span className={`alert-group-priority alert-priority-${getPriorityColor(prioridadeMaxima)}`}>
              {getPriorityText(prioridadeMaxima)}
            </span>
          </div>
        </div>

        <div className="alert-group-actions">
          <button
            className="alert-group-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onViewProcess(processo.id);
            }}
            title="Visualizar processo"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Lista de Alertas */}
      {expanded && (
        <div className="alert-group-content">
          <div className="alert-group-alerts">
            {alertasVisiveis.map(alerta => (
              <AlertCard
                key={alerta.id}
                alert={alerta}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onViewProcess={onViewProcess}
                compact={true}
              />
            ))}
            
            {sortedAlertas.length > 3 && (
              <div className="alert-group-show-more">
                <button
                  className="alert-group-show-more-btn"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll 
                    ? `Mostrar menos (${sortedAlertas.length - 3} ocultos)`
                    : `Mostrar mais (${sortedAlertas.length - 3} alertas)`
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertGroup;
