import React, { useState, useEffect } from 'react';
import { Clock, Plus, Calendar, DollarSign } from 'lucide-react';
import { timesheetService } from '../../services/timesheetService';
import Timesheet from '../Timesheet/Timesheet';
import '../Dashboard/Dashboard.css';

const TimesheetPage = () => {
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const data = await timesheetService.getEstatisticas();
      setEstatisticas(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            Controle de Horas
          </h1>
        </div>
      </div>

      {estatisticas && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{estatisticas.totalHoras}h</div>
              <div className="stat-label">Total de Horas</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{estatisticas.horasFaturaveis}h</div>
              <div className="stat-label">Horas Faturáveis</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">R$ {estatisticas.valorTotal?.toFixed(2)}</div>
              <div className="stat-label">Valor Total</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">R$ {estatisticas.valorPendente?.toFixed(2)}</div>
              <div className="stat-label">Pendente</div>
            </div>
          </div>
        </div>
      )}

      <Timesheet />
    </div>
  );
};

export default TimesheetPage;

