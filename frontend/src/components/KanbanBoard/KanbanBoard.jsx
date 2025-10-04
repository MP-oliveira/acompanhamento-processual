import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FileText, Archive, PauseCircle, Plus } from 'lucide-react';
import { processoService } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import KanbanColumn from './KanbanColumn';
import ProcessCard from './ProcessCard';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './KanbanBoard.css';

const COLUMNS = [
  {
    id: 'ativo',
    title: 'Ativos',
    icon: FileText,
    color: '#4A90E2'
  },
  {
    id: 'suspenso',
    title: 'Suspensos',
    icon: PauseCircle,
    color: '#FFC107'
  },
  {
    id: 'arquivado',
    title: 'Arquivados',
    icon: Archive,
    color: '#6B7280'
  }
];

const KanbanBoard = () => {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadProcessos();
  }, []);

  const loadProcessos = async () => {
    try {
      setLoading(true);
      const response = await processoService.getAll();
      setProcessos(response.processos || response);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
      toast.error('Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  };

  const getProcessosByStatus = (status) => {
    return processos.filter(p => p.status === status);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeProcesso = processos.find(p => p.id === active.id);
    const newStatus = over.id;

    if (activeProcesso && activeProcesso.status !== newStatus) {
      try {
        // Atualização otimista
        setProcessos(prev =>
          prev.map(p =>
            p.id === active.id ? { ...p, status: newStatus } : p
          )
        );

        // Atualizar no backend
        await processoService.update(active.id, { status: newStatus });
        toast.success(`Processo movido para ${COLUMNS.find(c => c.id === newStatus)?.title}`);
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status do processo');
        // Reverter mudança em caso de erro
        loadProcessos();
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeProcesso = activeId ? processos.find(p => p.id === activeId) : null;

  if (loading) {
    return (
      <div className="kanban-loading">
        <LoadingSpinner size="large" text="Carregando processos..." />
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h1 className="kanban-title">Board de Processos</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/processos/novo')}
        >
          <Plus size={20} />
          Novo Processo
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="kanban-board">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              icon={column.icon}
              color={column.color}
              count={getProcessosByStatus(column.id).length}
            >
              <SortableContext
                items={getProcessosByStatus(column.id).map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {getProcessosByStatus(column.id).map(processo => (
                  <ProcessCard
                    key={processo.id}
                    processo={processo}
                    isDragging={activeId === processo.id}
                  />
                ))}
              </SortableContext>

              {getProcessosByStatus(column.id).length === 0 && (
                <div className="kanban-empty">
                  <p>Nenhum processo {column.title.toLowerCase()}</p>
                </div>
              )}
            </KanbanColumn>
          ))}
        </div>

        <DragOverlay>
          {activeProcesso ? (
            <ProcessCard processo={activeProcesso} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;

