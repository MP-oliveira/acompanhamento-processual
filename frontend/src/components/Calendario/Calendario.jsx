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
  Search,
  RefreshCw
} from 'lucide-react';
import { processoService } from '../../services/api';
import './Calendario.css';

const Calendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'audiencia',
    date: '',
    time: '',
    duration: 60,
    description: '',
    processo: null,
    status: 'agendado'
  });

  // Função utilitária para converter data UTC para data local
  const convertUTCToLocal = (utcDateString) => {
    const date = new Date(utcDateString);
    // Criar uma nova data usando os componentes locais
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Função para buscar processos do backend
  const fetchProcessos = async () => {
    try {
      setLoading(true);
      const response = await processoService.getAll();
      const processos = response.processos || [];
      
      
      // Converter processos em eventos do calendário
      const eventos = [];
      
      processos.forEach(processo => {
        // Evento de distribuição
        if (processo.dataDistribuicao) {
          const dataDistribuicao = convertUTCToLocal(processo.dataDistribuicao);
          eventos.push({
            id: `distribuicao-${processo.id}`,
            title: `Distribuição - ${processo.classe}`,
            type: 'distribuicao',
            date: dataDistribuicao.toISOString().split('T')[0],
            time: '00:00',
            duration: 0,
            description: `Data de distribuição do processo ${processo.numero}`,
            processo: {
              id: processo.id,
              numero: processo.numero,
              classe: processo.classe
            },
            status: 'concluido'
          });
        }
        
        // Evento de audiência
        if (processo.proximaAudiencia) {
          const dataAudiencia = convertUTCToLocal(processo.proximaAudiencia);
          const dataOriginal = new Date(processo.proximaAudiencia);
          eventos.push({
            id: `audiencia-${processo.id}`,
            title: `Audiência - ${processo.classe}`,
            type: 'audiencia',
            date: dataAudiencia.toISOString().split('T')[0],
            time: dataOriginal.toTimeString().slice(0, 5),
            duration: 120,
            description: `Audiência do processo ${processo.numero}`,
            processo: {
              id: processo.id,
              numero: processo.numero,
              classe: processo.classe
            },
            status: 'agendado'
          });
        }
        
        // Evento de prazo de recurso
        if (processo.prazoRecurso) {
          const dataRecurso = convertUTCToLocal(processo.prazoRecurso);
          eventos.push({
            id: `recurso-${processo.id}`,
            title: `Prazo Recurso - ${processo.classe}`,
            type: 'prazo',
            date: dataRecurso.toISOString().split('T')[0],
            time: '23:59',
            duration: 0,
            description: `Prazo para interposição de recurso - ${processo.numero}`,
            processo: {
              id: processo.id,
              numero: processo.numero,
              classe: processo.classe
            },
            status: 'pendente'
          });
        }
        
        // Evento de prazo de embargos
        if (processo.prazoEmbargos) {
          const dataEmbargos = convertUTCToLocal(processo.prazoEmbargos);
          eventos.push({
            id: `embargos-${processo.id}`,
            title: `Prazo Embargos - ${processo.classe}`,
            type: 'prazo',
            date: dataEmbargos.toISOString().split('T')[0],
            time: '23:59',
            duration: 0,
            description: `Prazo para embargos de declaração - ${processo.numero}`,
            processo: {
              id: processo.id,
              numero: processo.numero,
              classe: processo.classe
            },
            status: 'pendente'
          });
        }
      });
      
      setEvents(eventos);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar processos do backend na montagem do componente
  useEffect(() => {
    fetchProcessos();
  }, []);

  // Atualizar automaticamente a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProcessos();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
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
    const dayEvents = events.filter(event => event.date === dateString);
    return dayEvents;
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'audiencia':
        return 'var(--primary-500)';
      case 'prazo':
        return 'var(--warning-500)';
      case 'sentenca':
        return 'var(--success-500)';
      case 'distribuicao':
        return 'var(--info-500)';
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

  const navigateToSeptember2025 = () => {
    const september2025 = new Date(2025, 8, 1); // Mês 8 = setembro (0-indexed)
    setCurrentDate(september2025);
    setSelectedDate(september2025);
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

  const handleNewEvent = () => {
    // Preenche a data com a data selecionada
    const dateString = selectedDate.toISOString().split('T')[0];
    setNewEvent(prev => ({
      ...prev,
      date: dateString,
      time: '09:00'
    }));
    setShowEventModal(true);
  };

  const handleEventInputChange = (field, value) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const event = {
      id: Date.now(), // ID temporário
      ...newEvent,
      processo: newEvent.processo || {
        id: null,
        numero: 'Evento Personalizado',
        classe: 'Evento não processual'
      }
    };

    setEvents(prev => [...prev, event]);
    setShowEventModal(false);
    setNewEvent({
      title: '',
      type: 'audiencia',
      date: '',
      time: '',
      duration: 60,
      description: '',
      processo: null,
      status: 'agendado'
    });
    
    alert('Evento criado com sucesso!');
  };

  const handleCancelEvent = () => {
    setShowEventModal(false);
    setNewEvent({
      title: '',
      type: 'audiencia',
      date: '',
      time: '',
      duration: 60,
      description: '',
      processo: null,
      status: 'agendado'
    });
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
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-secondary"
            onClick={fetchProcessos}
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'spinning' : ''} />
            Atualizar
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleNewEvent}
          >
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
            <button 
              className="btn btn-secondary"
              onClick={navigateToSeptember2025}
            >
              Set 2025
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
            {viewMode === 'month' && (
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
            )}

            {viewMode === 'week' && (
              <div className="calendario-week-view">
                <div className="calendario-week-header">
                  {getWeekDays().map(day => (
                    <div key={day} className="calendario-week-day-header">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="calendario-week-days">
                  {getWeekDays().map((dayName, index) => {
                    const dayDate = new Date(currentDate);
                    const startOfWeek = new Date(dayDate);
                    startOfWeek.setDate(dayDate.getDate() - dayDate.getDay());
                    const dayDate2 = new Date(startOfWeek);
                    dayDate2.setDate(startOfWeek.getDate() + index);
                    
                    const dayEvents = getEventsForDate(dayDate2);
                    return (
                      <div key={index} className="calendario-week-day">
                        <div className="calendario-week-day-number">
                          {dayDate2.getDate()}
                        </div>
                        <div className="calendario-week-day-events">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              className="calendario-week-event"
                              style={{ color: getEventTypeColor(event.type) }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'day' && (
              <div className="calendario-day-view">
                <div className="calendario-day-header">
                  <h3>{selectedDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</h3>
                </div>
                <div className="calendario-day-events-list">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="calendario-day-event-item">
                      <div 
                        className="calendario-day-event-color"
                        style={{ backgroundColor: getEventTypeColor(event.type) }}
                      ></div>
                      <div className="calendario-day-event-content">
                        <h4>{event.title}</h4>
                        <p>{event.description}</p>
                        <span className="calendario-day-event-time">
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                    </div>
                  ))}
                  {getEventsForDate(selectedDate).length === 0 && (
                    <div className="calendario-day-no-events">
                      Nenhum evento para este dia
                    </div>
                  )}
                </div>
              </div>
            )}
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

      {/* Modal para Novo Evento */}
      {showEventModal && (
        <div className="modal-overlay" onClick={handleCancelEvent}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Evento</h2>
              <button 
                className="modal-close"
                onClick={handleCancelEvent}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label required">Título do Evento</label>
                <input
                  type="text"
                  className="form-input"
                  value={newEvent.title}
                  onChange={(e) => handleEventInputChange('title', e.target.value)}
                  placeholder="Ex: Audiência de Conciliação"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Data</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newEvent.date}
                    onChange={(e) => handleEventInputChange('date', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Hora</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newEvent.time}
                    onChange={(e) => handleEventInputChange('time', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-select"
                    value={newEvent.type}
                    onChange={(e) => handleEventInputChange('type', e.target.value)}
                  >
                    <option value="audiencia">Audiência</option>
                    <option value="prazo">Prazo</option>
                    <option value="reuniao">Reunião</option>
                    <option value="sentenca">Sentença</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Duração (minutos)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newEvent.duration}
                    onChange={(e) => handleEventInputChange('duration', parseInt(e.target.value) || 0)}
                    min="0"
                    step="15"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-textarea"
                  value={newEvent.description}
                  onChange={(e) => handleEventInputChange('description', e.target.value)}
                  placeholder="Descrição do evento..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={handleCancelEvent}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveEvent}
              >
                <Plus size={20} />
                Criar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;
