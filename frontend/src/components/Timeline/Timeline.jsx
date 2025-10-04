import React from 'react';
import { 
  Calendar, 
  FileText, 
  Scale, 
  Gavel, 
  Clock, 
  AlertCircle,
  CheckCircle,
  PauseCircle,
  Archive
} from 'lucide-react';
import './Timeline.css';

const Timeline = ({ processo }) => {
  if (!processo) {
    return null;
  }

  // Gerar eventos da timeline baseado nos dados do processo
  const events = [];

  // Evento: Distribuição
  if (processo.dataDistribuicao) {
    events.push({
      id: 'distribuicao',
      type: 'distribuicao',
      title: 'Processo Distribuído',
      description: `Distribuído em ${processo.tribunal || 'tribunal'}`,
      date: processo.dataDistribuicao,
      icon: FileText,
      color: '#4A90E2'
    });
  }

  // Evento: Próxima Audiência
  if (processo.proximaAudiencia) {
    const isUpcoming = new Date(processo.proximaAudiencia) > new Date();
    events.push({
      id: 'audiencia',
      type: 'audiencia',
      title: isUpcoming ? 'Audiência Agendada' : 'Audiência Realizada',
      description: processo.classe || 'Audiência',
      date: processo.proximaAudiencia,
      icon: Gavel,
      color: isUpcoming ? '#FFC107' : '#6B7280'
    });
  }

  // Evento: Prazo Recurso
  if (processo.prazoRecurso) {
    const isPending = new Date(processo.prazoRecurso) > new Date();
    events.push({
      id: 'prazo-recurso',
      type: 'prazo',
      title: 'Prazo para Recurso',
      description: isPending ? 'Prazo em aberto' : 'Prazo vencido',
      date: processo.prazoRecurso,
      icon: Clock,
      color: isPending ? '#FFC107' : '#DC3545'
    });
  }

  // Evento: Prazo Embargos
  if (processo.prazoEmbargos) {
    const isPending = new Date(processo.prazoEmbargos) > new Date();
    events.push({
      id: 'prazo-embargos',
      type: 'prazo',
      title: 'Prazo para Embargos',
      description: isPending ? 'Prazo em aberto' : 'Prazo vencido',
      date: processo.prazoEmbargos,
      icon: Clock,
      color: isPending ? '#FFC107' : '#DC3545'
    });
  }

  // Evento: Sentença
  if (processo.dataSentenca) {
    events.push({
      id: 'sentenca',
      type: 'sentenca',
      title: 'Sentença Proferida',
      description: 'Decisão judicial',
      date: processo.dataSentenca,
      icon: Scale,
      color: '#28A745'
    });
  }

  // Evento: Status Atual
  if (processo.status) {
    const statusConfig = {
      'ativo': { icon: CheckCircle, color: '#28A745', title: 'Processo Ativo' },
      'suspenso': { icon: PauseCircle, color: '#FFC107', title: 'Processo Suspenso' },
      'arquivado': { icon: Archive, color: '#6B7280', title: 'Processo Arquivado' }
    };

    const config = statusConfig[processo.status];
    if (config) {
      events.push({
        id: 'status',
        type: 'status',
        title: config.title,
        description: processo.observacoes || `Status: ${processo.status}`,
        date: processo.updatedAt || new Date(),
        icon: config.icon,
        color: config.color
      });
    }
  }

  // Ordenar eventos por data (mais recente primeiro)
  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const formatDateShort = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (events.length === 0) {
    return (
      <div className="timeline-empty">
        <AlertCircle size={48} />
        <p>Nenhum evento registrado para este processo</p>
        <span>Adicione datas de audiências, prazos ou sentenças</span>
      </div>
    );
  }

  return (
    <div className="timeline">
      <h3 className="timeline-title">Linha do Tempo</h3>
      <div className="timeline-container">
        {events.map((event, index) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-marker">
              <div 
                className="timeline-icon" 
                style={{ backgroundColor: `${event.color}20`, color: event.color }}
              >
                <event.icon size={20} />
              </div>
              {index < events.length - 1 && <div className="timeline-line" />}
            </div>
            
            <div className="timeline-content">
              <div className="timeline-header">
                <h4 className="timeline-event-title">{event.title}</h4>
                <span className="timeline-date">{formatDateShort(event.date)}</span>
              </div>
              <p className="timeline-event-description">{event.description}</p>
              <span className="timeline-timestamp">{formatDate(event.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;

