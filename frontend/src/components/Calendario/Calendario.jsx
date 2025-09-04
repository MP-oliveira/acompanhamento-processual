import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Search
} from 'lucide-react';
import './Calendario.css';

const Calendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);

  // Dados mockados para demonstração
  const mockEvents = [
    {
      id: 1,
      title: 'Audiência de Conciliação',
      type: 'audiencia',
      date: '2024-03-15',
      time: '09:00',
      duration: 120,
      description: 'Audiência de conciliação do processo 0001234-12.2024.8.05.0001',
      processo: {
        id: 1,
        numero: '0001234-12.2024.8.05.0001',
        classe: 'Ação de Indenização por Dano Moral'
      },
      status: 'agendado'
    },
    {
      id: 2,
      title: 'Prazo para Recurso',
      type: 'prazo',
      date: '2024-03-10',
      time: '23:59',
      duration: 0,
      description: 'Prazo para interposição de recurso',
      processo: {
        id: 2,
        numero: '0001235-12.2024.8.05.0001',
        classe: 'Execução de Título Extrajudicial'
      },
      status: 'pendente'
    },
    {
      id: 3,
      title: 'Audiência de Instrução',
      type: 'audiencia',
      date: '2024-03-20',
      time: '14:00',
      duration: 180,
      description: 'Audiência de instrução e julgamento',
      processo: {
        id: 3,
        numero: '0001236-12.2024.8.05.0001',
        classe: 'Mandado de Segurança'
      },
      status: 'agendado'
    },
    {
      id: 4,
      title: 'Prazo para Embargos',
      type: 'prazo',
      date: '2024-03-12',
      time: '23:59',
      duration: 0,
      description: 'Prazo para embargos de declaração',
      processo: {
        id: 1,
        numero: '0001234-12.2024.8.05.0001',
        classe: 'Ação de Indenização por Dano Moral'
      },
      status: 'vencido'
    }
  ];

  useEffect(() => {
    // Simula carregamento de dados
    const loadEvents = async () => {
      setLoading(true);
      try {
        // Simula delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(mockEvents);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const today = new Date();
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = currentDate.toDateString() === selectedDate.toDateString();
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday,
        isSelected
      });
    }
    
    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'audiencia':
        return 'var(--primary-500)';
      case 'prazo':
        return 'var(--warning-500)';
      case 'sentenca':
        return 'var(--success-500)';
      default:
        return 'var(--neutral-500)';
    }
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case 'agendado':
        return 'var(--info-500)';
      case 'pendente':
        return 'var(--warning-500)';
      case 'vencido':
        return 'var(--error-500)';
      case 'concluido':
        return 'var(--success-500)';
      default:
        return 'var(--neutral-500)';
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getWeekDays = () => {
    return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);

  if (loading) {
    return (
      <div className="calendario">
        <div className="calendario-loading">
          <div className="calendario-loading-spinner" />
          <p>Carregando calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendario">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Calendar size={24} />
            Calendário
          </h1>
          <p className="page-subtitle">
            Visualize seus compromissos e prazos
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary">
            <Plus size={20} />
            Novo Evento
          </button>
        </div>
      </div>

      <div className="calendario-container">
        {/* Controles do Calendário */}
        <div className="calendario-controls">
          <div className="calendario-navigation">
            <button 
              className="calendario-nav-btn"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft size={20} />
            </button>
            
            <h2 className="calendario-month-year">
              {formatDate(currentDate)}
            </h2>
            
            <button 
              className="calendario-nav-btn"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendario-actions">
            <button 
              className="btn btn-secondary"
              onClick={navigateToday}
            >
              Hoje
            </button>
            
            <div className="calendario-view-toggle">
              <button 
                className={`calendario-view-btn ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                Mês
              </button>
              <button 
                className={`calendario-view-btn ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Semana
              </button>
              <button 
                className={`calendario-view-btn ${viewMode === 'day' ? 'active' : ''}`}
                onClick={() => setViewMode('day')}
              >
                Dia
              </button>
            </div>
          </div>
        </div>

        <div className="calendario-content">
          {/* Calendário */}
          <div className="calendario-main">
            <div className="calendario-grid">
              {/* Cabeçalho dos dias da semana */}
              <div className="calendario-weekdays">
                {getWeekDays().map(day => (
                  <div key={day} className="calendario-weekday">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do calendário */}
              <div className="calendario-days">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  return (
                    <div
                      key={index}
                      className={`calendario-day ${
                        !day.isCurrentMonth ? 'calendario-day-other-month' : ''
                      } ${day.isToday ? 'calendario-day-today' : ''} ${
                        day.isSelected ? 'calendario-day-selected' : ''
                      }`}
                      onClick={() => handleDateClick(day.date)}
                    >
                      <div className="calendario-day-number">
                        {day.date.getDate()}
                      </div>
                      
                      {dayEvents.length > 0 && (
                        <div className="calendario-day-events">
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              className="calendario-day-event"
                              style={{ backgroundColor: getEventTypeColor(event.type) }}
                              title={event.title}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="calendario-day-event-more">
                              +{dayEvents.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Painel Lateral - Eventos do Dia Selecionado */}
          <div className="calendario-sidebar">
            <div className="calendario-sidebar-header">
              <h3>Eventos de {selectedDate.toLocaleDateString('pt-BR')}</h3>
            </div>
            
            <div className="calendario-sidebar-content">
              {selectedDateEvents.length === 0 ? (
                <div className="calendario-no-events">
                  <Calendar size={32} />
                  <p>Nenhum evento para este dia</p>
                </div>
              ) : (
                <div className="calendario-events-list">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="calendario-event-item">
                      <div className="calendario-event-header">
                        <div 
                          className="calendario-event-type-indicator"
                          style={{ backgroundColor: getEventTypeColor(event.type) }}
                        />
                        <div className="calendario-event-title">
                          {event.title}
                        </div>
                        <div 
                          className="calendario-event-status"
                          style={{ backgroundColor: getEventStatusColor(event.status) }}
                        />
                      </div>
                      
                      <div className="calendario-event-details">
                        <div className="calendario-event-time">
                          <Clock size={14} />
                          <span>{event.time}</span>
                          {event.duration > 0 && (
                            <span className="calendario-event-duration">
                              ({event.duration}min)
                            </span>
                          )}
                        </div>
                        
                        <div className="calendario-event-processo">
                          <FileText size={14} />
                          <span>{event.processo.numero}</span>
                        </div>
                        
                        <div className="calendario-event-description">
                          {event.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendario;
