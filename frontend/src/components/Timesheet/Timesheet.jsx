import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, DollarSign, Timer } from 'lucide-react';
import { timesheetService } from '../../services/timesheetService';
import './Timesheet.css';

const Timesheet = ({ processoId = null, userId = null }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoTimesheet, setNovoTimesheet] = useState({
    descricao: '',
    tipo: 'outros',
    dataInicio: new Date().toISOString().slice(0, 16),
    duracao: 60,
    valorHora: '',
    faturavel: true,
    observacoes: ''
  });

  useEffect(() => {
    carregarDados();
  }, [processoId, userId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const params = {};
      if (processoId) params.processoId = processoId;
      
      const [dataTimesheets, dataEstatisticas] = await Promise.all([
        timesheetService.getAll(params),
        timesheetService.getEstatisticas(params)
      ]);

      setTimesheets(dataTimesheets.timesheets || dataTimesheets);
      setEstatisticas(dataEstatisticas);
    } catch (err) {
      console.error('Erro ao carregar timesheet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await timesheetService.create({
        ...novoTimesheet,
        processoId: processoId || null
      });
      
      setNovoTimesheet({
        descricao: '',
        tipo: 'outros',
        dataInicio: new Date().toISOString().slice(0, 16),
        duracao: 60,
        valorHora: '',
        faturavel: true,
        observacoes: ''
      });
      setMostrarForm(false);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao registrar horas');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este registro de horas?')) return;
    
    try {
      await timesheetService.delete(id);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert('Erro ao excluir registro');
    }
  };

  const formatDuracao = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  return (
    <div className="timesheet-container">
      <div className="timesheet-header">
        <h3>
          <Clock size={20} />
          Controle de Horas
        </h3>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : <><Plus size={16} /> Registrar</>}
        </button>
      </div>

      {/* Resumo */}
      {estatisticas && (
        <div className="timesheet-resumo">
          <div className="timesheet-resumo-card total">
            <div className="timesheet-resumo-label">Total de Horas</div>
            <div className="timesheet-resumo-valor">{estatisticas.totalHoras}h</div>
          </div>
          <div className="timesheet-resumo-card faturavel">
            <div className="timesheet-resumo-label">Faturáveis</div>
            <div className="timesheet-resumo-valor">{estatisticas.horasFaturaveis}h</div>
          </div>
          <div className="timesheet-resumo-card valor">
            <div className="timesheet-resumo-label">Valor Total</div>
            <div className="timesheet-resumo-valor">
              R$ {estatisticas.valorTotal?.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Formulário */}
      {mostrarForm && (
        <form className="timesheet-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <input
                type="text"
                className="form-input"
                value={novoTimesheet.descricao}
                onChange={(e) => setNovoTimesheet({ ...novoTimesheet, descricao: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                value={novoTimesheet.tipo}
                onChange={(e) => setNovoTimesheet({ ...novoTimesheet, tipo: e.target.value })}
              >
                <option value="audiencia">Audiência</option>
                <option value="peticao">Petição</option>
                <option value="reuniao">Reunião</option>
                <option value="pesquisa">Pesquisa</option>
                <option value="deslocamento">Deslocamento</option>
                <option value="consulta_processo">Consulta Processo</option>
                <option value="analise_documentos">Análise Documentos</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data/Hora Início</label>
              <input
                type="datetime-local"
                className="form-input"
                value={novoTimesheet.dataInicio}
                onChange={(e) => setNovoTimesheet({ ...novoTimesheet, dataInicio: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duração (minutos)</label>
              <input
                type="number"
                className="form-input"
                value={novoTimesheet.duracao}
                onChange={(e) => setNovoTimesheet({ ...novoTimesheet, duracao: parseInt(e.target.value) })}
                min="1"
                step="15"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valor/Hora (R$)</label>
              <input
                type="number"
                className="form-input"
                value={novoTimesheet.valorHora}
                onChange={(e) => setNovoTimesheet({ ...novoTimesheet, valorHora: e.target.value })}
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={novoTimesheet.faturavel}
                  onChange={(e) => setNovoTimesheet({ ...novoTimesheet, faturavel: e.target.checked })}
                />
                <span>Faturável</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            <Plus size={16} />
            Registrar Horas
          </button>
        </form>
      )}

      {/* Lista de registros */}
      <div className="timesheet-lista">
        {loading ? (
          <div className="timesheet-loading">Carregando...</div>
        ) : timesheets.length === 0 ? (
          <div className="timesheet-empty">
            <Timer size={32} />
            <p>Nenhum registro de horas</p>
          </div>
        ) : (
          timesheets.map((item) => (
            <div key={item.id} className="timesheet-item">
              <div className="timesheet-item-header">
                <span className="timesheet-item-tipo">{item.tipo}</span>
                <span className="timesheet-item-duracao">
                  {formatDuracao(item.duracao)}
                </span>
              </div>
              <div className="timesheet-item-descricao">{item.descricao}</div>
              <div className="timesheet-item-footer">
                <span className="timesheet-item-data">
                  {new Date(item.dataInicio).toLocaleDateString('pt-BR')}
                </span>
                {item.valorTotal && (
                  <span className="timesheet-item-valor">
                    R$ {parseFloat(item.valorTotal).toFixed(2)}
                  </span>
                )}
                <button
                  className="btn-icon-sm btn-danger"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Timesheet;

