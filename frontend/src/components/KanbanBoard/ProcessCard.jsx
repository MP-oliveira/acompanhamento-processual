import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TagList from '../Tag/TagList';
import { generateProcessoTags } from '../../utils/processoTags';

const ProcessCard = ({ processo, isDragging }) => {
  const navigate = useNavigate();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: processo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const formatDate = (date) => {
    if (!date) return null;
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return null;
    }
  };

  const handleCardClick = (e) => {
    // Não navegar se estiver arrastando
    if (isDragging || isSortableDragging) return;
    navigate(`/processos/editar/${processo.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`process-card ${isDragging || isSortableDragging ? 'dragging' : ''}`}
    >
      <div className="process-card-header">
        <h4 className="process-card-number">{processo.numero}</h4>
        <button
          className="process-card-view-btn"
          onClick={handleCardClick}
          title="Ver detalhes"
        >
          <Eye size={16} />
        </button>
      </div>

      <div className="process-card-content">
        <p className="process-card-classe">{processo.classe}</p>
        {processo.assunto && (
          <p className="process-card-assunto">{processo.assunto}</p>
        )}
        
        {/* Tags Automáticas */}
        <div className="process-card-tags">
          <TagList 
            tags={generateProcessoTags(processo).filter(t => t.type !== 'status')} 
            maxVisible={3}
          />
        </div>
      </div>

      <div className="process-card-footer">
        {processo.proximaAudiencia && (
          <div className="process-card-info">
            <Calendar size={14} />
            <span>{formatDate(processo.proximaAudiencia)}</span>
          </div>
        )}
        {processo.prazoRecurso && (
          <div className="process-card-info">
            <Clock size={14} />
            <span>{formatDate(processo.prazoRecurso)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessCard;

