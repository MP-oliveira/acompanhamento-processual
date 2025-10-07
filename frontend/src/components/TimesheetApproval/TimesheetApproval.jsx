import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, DollarSign, Clock, User, Briefcase, Calendar, Info, AlertCircle } from 'lucide-react';
import { timesheetService } from '../../services/timesheetService';
import './TimesheetApproval.css';
import PageLoading from '../PageLoading/PageLoading';

const TimesheetApproval = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [filtroAdvogado, setFiltroAdvogado] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [mostrarModalRejeicao, setMostrarModalRejeicao] = useState(false);
  const [mostrarModalPagamento, setMostrarModalPagamento] = useState(false);
  const [timesheetSelecionado, setTimesheetSelecionado] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [observacoesPagamento, setObservacoesPagamento] = useState('');
  const [estatisticas, setEstatisticas] = useState(null);

  useEffect(() => {
    // Debounce para evitar muitas requisições
    const timeoutId = setTimeout(() => {
      carregarDados();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filtroStatus, filtroAdvogado, filtroPeriodo]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filtroStatus !== 'todos') {
        params.statusAprovacao = filtroStatus;
      }
      if (filtroAdvogado) {
        params.advogado = filtroAdvogado;
      }
      
      const response = await timesheetService.getPendentesAprovacao(params);
      setTimesheets(response.timesheets || []);
      
      // Carregar estatísticas
      const statsResponse = await timesheetService.getEstatisticas();
      setEstatisticas(statsResponse);
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados de aprovação');
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (id) => {
    try {
      await timesheetService.aprovar(id);
      alert('Timesheet aprovado com sucesso!');
      carregarDados();
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      alert('Erro ao aprovar timesheet');
    }
  };

  const handleRejeitar = async () => {
    if (!motivoRejeicao.trim()) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }
    
    try {
      await timesheetService.rejeitar(timesheetSelecionado.id, motivoRejeicao);
      alert('Timesheet rejeitado com sucesso!');
      setMostrarModalRejeicao(false);
      setMotivoRejeicao('');
      setTimesheetSelecionado(null);
      carregarDados();
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
      alert('Erro ao rejeitar timesheet');
    }
  };

  const handleMarcarPago = async () => {
    try {
      await timesheetService.marcarPago(timesheetSelecionado.id, observacoesPagamento);
      alert('Timesheet marcado como pago!');
      setMostrarModalPagamento(false);
      setObservacoesPagamento('');
      setTimesheetSelecionado(null);
      carregarDados();
    } catch (err) {
      console.error('Erro ao marcar como pago:', err);
      alert('Erro ao marcar como pago');
    }
  };

  const getStatusIcon = (timesheet) => {
    switch (timesheet.statusAprovacao) {
      case 'pendente':
        return <Clock className="text-yellow-500" size={20} />;
      case 'aprovado':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejeitado':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusBadge = (timesheet) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
    switch (timesheet.statusAprovacao) {
      case 'pendente':
        return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>Pendente</span>;
      case 'aprovado':
        return <span className={`${baseClass} bg-green-100 text-green-800`}>Aprovado</span>;
      case 'rejeitado':
        return <span className={`${baseClass} bg-red-100 text-red-800`}>Rejeitado</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>Desconhecido</span>;
    }
  };

  if (loading) {
    return <PageLoading type="skeleton" />;
  }

  if (error) {
    return (
      <div className="timesheet-approval-container">
        <div className="error-message">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={carregarDados} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="timesheet-approval-container">
      {/* Header */}
      <div className="approval-header">
        <div className="approval-title">
          <h1>Dashboard de Aprovação de Horas</h1>
        </div>
        <div className="approval-actions">
          <button onClick={carregarDados} className="btn btn-primary">
            <Clock size={16} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="approval-stats-grid">
          <div className="approval-stat-card">
            <div className="approval-stat-icon pendente">
              <Clock size={24} />
            </div>
            <div className="approval-stat-content">
              <div className="approval-stat-value">{timesheets.length}</div>
              <div className="approval-stat-label">Pendentes</div>
            </div>
          </div>
          <div className="approval-stat-card">
            <div className="approval-stat-icon aprovado">
              <CheckCircle size={24} />
            </div>
            <div className="approval-stat-content">
              <div className="approval-stat-value">{estatisticas.aprovados || 0}</div>
              <div className="approval-stat-label">Aprovados</div>
            </div>
          </div>
          <div className="approval-stat-card">
            <div className="approval-stat-icon rejeitado">
              <XCircle size={24} />
            </div>
            <div className="approval-stat-content">
              <div className="approval-stat-value">{estatisticas.rejeitados || 0}</div>
              <div className="approval-stat-label">Rejeitados</div>
            </div>
          </div>
          <div className="approval-stat-card">
            <div className="approval-stat-icon pago">
              <DollarSign size={24} />
            </div>
            <div className="approval-stat-content">
              <div className="approval-stat-value">{estatisticas.pagos || 0}</div>
              <div className="approval-stat-label">Pagos</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="approval-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filtroStatus} 
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="aprovado">Aprovados</option>
            <option value="rejeitado">Rejeitados</option>
            <option value="pago">Pagos</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Período:</label>
          <select 
            value={filtroPeriodo} 
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
          </select>
        </div>
      </div>

      {/* Lista de Timesheets */}
      <div className="approval-list">
        {timesheets.length === 0 ? (
          <div className="empty-state">
            <Info size={48} />
            <h3>Nenhum timesheet encontrado</h3>
            <p>Não há timesheets para aprovação no momento.</p>
          </div>
        ) : (
          timesheets.map((timesheet) => (
            <div key={timesheet.id} className="approval-item">
              <div className="approval-item-header">
                <div className="approval-item-info">
                  {getStatusIcon(timesheet)}
                  <div className="approval-item-details">
                    <h4>{timesheet.descricao}</h4>
                    <div className="approval-item-meta">
                      <span className="advogado">
                        <User size={14} />
                        {timesheet.user?.nome || 'Advogado'}
                      </span>
                      <span className="cliente">
                        {timesheet.processo?.cliente?.nome || 'Sem cliente'}
                      </span>
                      <span className="processo">
                        {timesheet.processo?.numero || 'Sem processo'}
                      </span>
                    </div>
                    
                    {/* Rastreamento de aprovação */}
                    {timesheet.aprovador && (
                      <div className="approval-tracking">
                        <span className="tracking-item">
                          <strong>
                            {timesheet.statusAprovacao === 'aprovado' ? '✅ Aprovado' : '❌ Rejeitado'} por:
                          </strong> {timesheet.aprovador.nome} em {new Date(timesheet.dataAprovacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    
                    {timesheet.pagador && (
                      <div className="approval-tracking">
                        <span className="tracking-item">
                          <strong>💰 Pago por:</strong> {timesheet.pagador.nome} em {new Date(timesheet.dataPagamento).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="approval-item-actions">
                  {getStatusBadge(timesheet)}
                  <button
                    onClick={() => {
                      setTimesheetSelecionado(timesheet);
                      setMostrarModalRejeicao(true);
                    }}
                    className="action-button reject"
                    disabled={timesheet.statusAprovacao !== 'pendente'}
                  >
                    <XCircle size={16} />
                    Rejeitar
                  </button>
                  <button
                    onClick={() => handleAprovar(timesheet.id)}
                    className="action-button approve"
                    disabled={timesheet.statusAprovacao !== 'pendente'}
                  >
                    <CheckCircle size={16} />
                    Aprovar
                  </button>
                  <button
                    onClick={() => {
                      setTimesheetSelecionado(timesheet);
                      setMostrarModalPagamento(true);
                    }}
                    className="action-button pay"
                    disabled={timesheet.statusAprovacao !== 'aprovado' || timesheet.statusPagamento === 'pago'}
                  >
                    <DollarSign size={16} />
                    Marcar Pago
                  </button>
                </div>
              </div>
              
              <div className="approval-item-details">
                <div className="detail-row">
                  <span className="detail-label">Duração:</span>
                  <span className="detail-value">{timesheet.duracao} minutos</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Valor/Hora:</span>
                  <span className="detail-value">R$ {timesheet.valorHora || '0,00'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Valor Total:</span>
                  <span className="detail-value">R$ {((timesheet.duracao / 60) * (timesheet.valorHora || 0)).toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Data:</span>
                  <span className="detail-value">{new Date(timesheet.dataInicio).toLocaleDateString('pt-BR')}</span>
                </div>
                {timesheet.observacoes && (
                  <div className="detail-row">
                    <span className="detail-label">Observações:</span>
                    <span className="detail-value">{timesheet.observacoes}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Rejeição */}
      {mostrarModalRejeicao && (
        <div className="processo-view-overlay" onClick={() => {
          setMostrarModalRejeicao(false);
          setMotivoRejeicao('');
          setTimesheetSelecionado(null);
        }}>
          <div className="processo-view-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rejeitar Timesheet</h2>
              <button className="modal-close-btn" onClick={() => {
                setMostrarModalRejeicao(false);
                setMotivoRejeicao('');
                setTimesheetSelecionado(null);
              }}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-content">
              <p>Informe o motivo da rejeição:</p>
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Digite o motivo da rejeição..."
                className="rejection-textarea"
                rows={4}
              />
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setMostrarModalRejeicao(false);
                    setMotivoRejeicao('');
                    setTimesheetSelecionado(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRejeitar}
                  className="btn btn-danger"
                >
                  Rejeitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {mostrarModalPagamento && (
        <div className="processo-view-overlay" onClick={() => {
          setMostrarModalPagamento(false);
          setObservacoesPagamento('');
          setTimesheetSelecionado(null);
        }}>
          <div className="processo-view-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Marcar como Pago</h2>
              <button className="modal-close-btn" onClick={() => {
                setMostrarModalPagamento(false);
                setObservacoesPagamento('');
                setTimesheetSelecionado(null);
              }}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-content">
              <p>Observações sobre o pagamento (opcional):</p>
              <textarea
                value={observacoesPagamento}
                onChange={(e) => setObservacoesPagamento(e.target.value)}
                placeholder="Digite observações sobre o pagamento..."
                className="payment-textarea"
                rows={4}
              />
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setMostrarModalPagamento(false);
                    setObservacoesPagamento('');
                    setTimesheetSelecionado(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMarcarPago}
                  className="btn btn-success"
                >
                  Marcar como Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetApproval;