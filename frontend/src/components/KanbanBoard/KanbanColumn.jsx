import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const KanbanColumn = ({ id, title, icon: Icon, color, count, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`}
    >
      <div className="kanban-column-header" style={{ borderTopColor: color }}>
        <div className="kanban-column-title-wrapper">
          <Icon size={20} color={color} />
          <h3 className="kanban-column-title">{title}</h3>
        </div>
        <span className="kanban-column-count" style={{ backgroundColor: `${color}20`, color }}>
          {count}
        </span>
      </div>
      <div className="kanban-column-content">
        {children}
      </div>
    </div>
  );
};

export default KanbanColumn;

