import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, DollarSign, Timer, Filter, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { timesheetService } from '../../services/timesheetService';
import './Timesheet.css';

const Timesheet = ({ processoId = null, userId = null }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [novoTimesheet, setNovoTimesheet] = useState({
    descricao: '',
    tipo: 'outros',
    dataInicio: new Date().toISOString().slice(0, 16),
    duracao: 60,
    valorHora: '',
    faturavel: true,
    observacoes: ''
  });
  
  const [filtros, setFiltros] = useState({
    periodo: 'mes', // hoje, semana, mes, todos, personalizado
    dataInicio: '',
    dataFim: '',
    tipo: '',
    faturavel: '',
    faturado: ''
  });

  useEffect(() => {
    carregarDados();
  }, [processoId, userId, filtros]);

  const calcularPeriodo = () => {
    const hoje = new Date();
    let dataInicio, dataFim;
    
    switch (filtros.periodo) {
      case 'hoje':
        dataInicio = new Date(hoje.setHours(0, 0, 0, 0));
        dataFim = new Date(hoje.setHours(23, 59, 59, 999));
        break;
      case 'semana':
        dataInicio = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
        dataInicio.setHours(0, 0, 0, 0);
        dataFim = new Date(hoje.setDate(hoje.getDate() - hoje.getDay() + 6));
        dataFim.setHours(23, 59, 59, 999);
        break;
      case 'mes':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'personalizado':
        dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
        dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;
        break;
      default:
        dataInicio = null;
        dataFim = null;
    }
    
    return { dataInicio, dataFim };
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const params = {};
      if (processoId) params.processoId = processoId;
      
      const { dataInicio, dataFim } = calcularPeriodo();
      if (dataInicio) params.dataInicio = dataInicio.toISOString();
      if (dataFim) params.dataFim = dataFim.toISOString();
      if (filtros.tipo) params.tipo = filtros.tipo;
      if (filtros.faturavel !== '') params.faturavel = filtros.faturavel;
      if (filtros.faturado !== '') params.faturado = filtros.faturado;
      
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

  const handleToggleFaturado = async (id, faturadoAtual) => {
    try {
      await timesheetService.marcarFaturado(id, !faturadoAtual);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao atualizar faturamento:', err);
      alert('Erro ao atualizar status de faturamento');
    }
  };

  const formatDuracao = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  const agruparPorCliente = () => {
    const agrupado = {};
    
    timesheets.forEach(item => {
      const clienteNome = item.processo?.cliente?.nome || 'Sem Cliente';
      const clienteId = item.processo?.cliente?.id || 'sem-cliente';
      
      if (!agrupado[clienteId]) {
        agrupado[clienteId] = {
          nome: clienteNome,
          processos: {},
          totalHoras: 0,
          totalValor: 0
        };
      }
      
      const processoNumero = item.processo?.numero || 'Sem Processo';
      const processoId = item.processoId || 'sem-processo';
      
      if (!agrupado[clienteId].processos[processoId]) {
        agrupado[clienteId].processos[processoId] = {
          numero: processoNumero,
          timesheets: [],
          totalHoras: 0,
          totalValor: 0
        };
      }
      
      agrupado[clienteId].processos[processoId].timesheets.push(item);
      agrupado[clienteId].processos[processoId].totalHoras += item.duracao;
      agrupado[clienteId].processos[processoId].totalValor += parseFloat(item.valorTotal || 0);
      
      agrupado[clienteId].totalHoras += item.duracao;
      agrupado[clienteId].totalValor += parseFloat(item.valorTotal || 0);
    });
    
    return agrupado;
  };

  return (
    <div className="timesheet-container">
      <div className="timesheet-header">
        <h3>
          Controle de Horas
        </h3>
        <div className="timesheet-header-actions">
          <button
            className={`btn btn-sm ${mostrarFiltros ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Filter size={16} />
            Filtros
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? 'Cancelar' : <><Plus size={16} /> Registrar</>}
          </button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="timesheet-filtros">
          <div className="filtros-grid">
            <div className="form-group">
              <label className="form-label">Período</label>
              <select
                className="form-select"
                value={filtros.periodo}
                onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mês</option>
                <option value="todos">Todos</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            {filtros.periodo === 'personalizado' && (
              <>
                <div className="form-group">
                  <label className="form-label">Data Início</label>
                  <input
                    type="date"
                    className="form-input"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Data Fim</label>
                  <input
                    type="date"
                    className="form-input"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              >
                <option value="">Todos</option>
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
              <label className="form-label">Faturável</label>
              <select
                className="form-select"
                value={filtros.faturavel}
                onChange={(e) => setFiltros({ ...filtros, faturavel: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status Faturamento</label>
              <select
                className="form-select"
                value={filtros.faturado}
                onChange={(e) => setFiltros({ ...filtros, faturado: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="true">Faturado</option>
                <option value="false">Pendente</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Resumo */}
      {estatisticas && (
        <div className="timesheet-resumo">
          <div className="timesheet-resumo-card total">
            <div className="timesheet-resumo-icon">
              <Clock size={24} />
            </div>
            <div className="timesheet-resumo-content">
              <div className="timesheet-resumo-label">Total de Horas</div>
              <div className="timesheet-resumo-valor">{estatisticas.totalHoras}h</div>
            </div>
          </div>
          <div className="timesheet-resumo-card faturavel">
            <div className="timesheet-resumo-icon">
              <DollarSign size={24} />
            </div>
            <div className="timesheet-resumo-content">
              <div className="timesheet-resumo-label">Horas Faturáveis</div>
              <div className="timesheet-resumo-valor">{estatisticas.horasFaturaveis}h</div>
            </div>
          </div>
          <div className="timesheet-resumo-card valor">
            <div className="timesheet-resumo-icon">
              <CheckCircle size={24} />
            </div>
            <div className="timesheet-resumo-content">
              <div className="timesheet-resumo-label">Valor Total</div>
              <div className="timesheet-resumo-valor">
                R$ {estatisticas.valorTotal?.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="timesheet-resumo-card pendente">
            <div className="timesheet-resumo-icon">
              <XCircle size={24} />
            </div>
            <div className="timesheet-resumo-content">
              <div className="timesheet-resumo-label">Pendente Faturamento</div>
              <div className="timesheet-resumo-valor">
                R$ {estatisticas.valorPendente?.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumo de Status de Aprovação */}
      {timesheets.length > 0 && (
        <div className="timesheet-status-resumo">
          <h4>📊 Resumo de Status</h4>
          <div className="status-resumo-grid">
            <div className="status-resumo-item">
              <span className="status-count pendente">
                {timesheets.filter(t => t.statusAprovacao === 'pendente').length}
              </span>
              <span className="status-label">Pendentes</span>
            </div>
            <div className="status-resumo-item">
              <span className="status-count aprovado">
                {timesheets.filter(t => t.statusAprovacao === 'aprovado').length}
              </span>
              <span className="status-label">Aprovados</span>
            </div>
            <div className="status-resumo-item">
              <span className="status-count rejeitado">
                {timesheets.filter(t => t.statusAprovacao === 'rejeitado').length}
              </span>
              <span className="status-label">Rejeitados</span>
            </div>
            <div className="status-resumo-item">
              <span className="status-count pago">
                {timesheets.filter(t => t.statusPagamento === 'pago').length}
              </span>
              <span className="status-label">Pagos</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Formulário */}
      {mostrarForm && (
        <div className="processo-view-overlay" onClick={() => setMostrarForm(false)}>
          <div className="processo-view-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Horas</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setMostrarForm(false)}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-content">
                <div className="form-grid">
                  <div className="form-group form-group-full">
                    <label className="form-label">Descrição</label>
                    <input
                      type="text"
                      className="form-input"
                      value={novoTimesheet.descricao}
                      onChange={(e) => setNovoTimesheet({ ...novoTimesheet, descricao: e.target.value })}
                      placeholder="Ex: Elaboração de petição inicial"
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
                      value={novoTimesheet.duracao || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setNovoTimesheet({ ...novoTimesheet, duracao: isNaN(value) ? 60 : value });
                      }}
                      min="1"
                      step="15"
                      placeholder="60"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Valor/Hora (R$)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={novoTimesheet.valorHora || ''}
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

                  <div className="form-group form-group-full">
                    <label className="form-label">Observações</label>
                    <textarea
                      className="form-textarea"
                      value={novoTimesheet.observacoes}
                      onChange={(e) => setNovoTimesheet({ ...novoTimesheet, observacoes: e.target.value })}
                      placeholder="Observações adicionais..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMostrarForm(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Registrar Horas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de registros agrupados por cliente */}
      <div className="timesheet-lista">
        {loading ? (
          <div className="timesheet-loading">
            <Timer size={32} className="spin" />
            <p>Carregando...</p>
          </div>
        ) : timesheets.length === 0 ? (
          <div className="timesheet-empty">
            <Timer size={48} />
            <p>Nenhum registro de horas neste período</p>
            <small>Altere os filtros ou registre novas horas</small>
          </div>
        ) : (
          Object.entries(agruparPorCliente()).map(([clienteId, cliente]) => (
            <div key={clienteId} className="timesheet-grupo-cliente">
              <div className="timesheet-grupo-header">
                <h4>{cliente.nome}</h4>
                <div className="timesheet-grupo-stats">
                  <span className="timesheet-stat-horas">
                    {formatDuracao(cliente.totalHoras)}
                  </span>
                  {cliente.totalValor > 0 && (
                    <span className="timesheet-stat-valor">
                      R$ {cliente.totalValor.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {Object.entries(cliente.processos).map(([processoId, processo]) => (
                <div key={processoId} className="timesheet-grupo-processo">
                  {processo.numero !== 'Sem Processo' && (
                    <div className="timesheet-processo-header">
                      <span>Processo: {processo.numero}</span>
                      <div className="timesheet-processo-stats">
                        <span>{formatDuracao(processo.totalHoras)}</span>
                        {processo.totalValor > 0 && (
                          <span>R$ {processo.totalValor.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {processo.timesheets.map((item) => (
                    <div key={item.id} className={`timesheet-item ${item.faturado ? 'faturado' : ''}`}>
                      <div className="timesheet-item-header">
                        <span className={`timesheet-item-tipo tipo-${item.tipo}`}>
                          {item.tipo.replace('_', ' ')}
                        </span>
                        <span className="timesheet-item-duracao">
                          <Clock size={14} />
                          {formatDuracao(item.duracao)}
                        </span>
                        {item.faturavel && (
                          <span className="timesheet-item-badge faturavel">
                            Faturável
                          </span>
                        )}
                        {item.faturado && (
                          <span className="timesheet-item-badge faturado">
                            <CheckCircle size={14} />
                            Faturado
                          </span>
                        )}
                        {item.statusAprovacao === 'pendente' && (
                          <span className="timesheet-item-badge pendente">
                            <Clock size={14} />
                            Pendente
                          </span>
                        )}
                        {item.statusAprovacao === 'aprovado' && (
                          <span className="timesheet-item-badge aprovado">
                            <CheckCircle size={14} />
                            Aprovado
                          </span>
                        )}
                        {item.statusAprovacao === 'rejeitado' && (
                          <span className="timesheet-item-badge rejeitado">
                            <XCircle size={14} />
                            Rejeitado
                          </span>
                        )}
                        {item.statusPagamento === 'pago' && (
                          <span className="timesheet-item-badge pago">
                            <DollarSign size={14} />
                            Pago
                          </span>
                        )}
                      </div>
                      
                      <div className="timesheet-item-descricao">{item.descricao}</div>
                      
                      {item.observacoes && (
                        <div className="timesheet-item-observacoes">
                          {item.observacoes}
                        </div>
                      )}

                      {item.motivoRejeicao && (
                        <div className="timesheet-item-rejeicao">
                          <strong>Motivo da rejeição:</strong> {item.motivoRejeicao}
                        </div>
                      )}

                      {/* Informações de rastreamento */}
                      <div className="timesheet-item-rastreamento">
                        <div className="rastreamento-item">
                          <strong>👤 Requerente:</strong> {item.user?.nome || 'Advogado'}
                        </div>
                        
                        {item.aprovador && (
                          <div className="rastreamento-item">
                            <strong>
                              {item.statusAprovacao === 'aprovado' ? '✅ Aprovado' : '❌ Rejeitado'} por:
                            </strong> {item.aprovador.nome} em {new Date(item.dataAprovacao).toLocaleDateString('pt-BR')}
                          </div>
                        )}

                        {item.pagador && (
                          <div className="rastreamento-item">
                            <strong>💰 Pago por:</strong> {item.pagador.nome} em {new Date(item.dataPagamento).toLocaleDateString('pt-BR')}
                          </div>
                        )}

                        {item.statusAprovacao === 'pendente' && (
                          <div className="rastreamento-item pendente">
                            <strong>⏳ Status:</strong> Aguardando aprovação
                          </div>
                        )}
                      </div>
                      
                      <div className="timesheet-item-footer">
                        <span className="timesheet-item-data">
                          <Calendar size={14} />
                          {new Date(item.dataInicio).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        {item.valorTotal && (
                          <span className="timesheet-item-valor">
                            <DollarSign size={14} />
                            R$ {parseFloat(item.valorTotal).toFixed(2)}
                          </span>
                        )}
                        
                        <div className="timesheet-item-actions">
                          {item.faturavel && (
                            <button
                              className={`btn-icon-sm ${item.faturado ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => handleToggleFaturado(item.id, item.faturado)}
                              title={item.faturado ? 'Marcar como não faturado' : 'Marcar como faturado'}
                            >
                              {item.faturado ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            </button>
                          )}
                          <button
                            className="btn-icon-sm btn-danger"
                            onClick={() => handleDelete(item.id)}
                            title="Excluir registro"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Timesheet;
