import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Trash2, Edit, Check, X, Calendar } from 'lucide-react';
import { custaService } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './CustasProcesso.css';

const TIPOS_CUSTA = {
  custas_judiciais: 'Custas Judiciais',
  honorarios_contratuais: 'Honorários Contratuais',
  honorarios_sucumbenciais: 'Honorários Sucumbenciais',
  despesas_processuais: 'Despesas Processuais',
  honorarios_periciais: 'Honorários Periciais',
  emolumentos: 'Emolumentos',
  outros: 'Outros'
};

const RESPONSAVEIS = {
  cliente: 'Cliente',
  escritorio: 'Escritório',
  sucumbente: 'Sucumbente',
  outro: 'Outro'
};

const STATUS_CUSTA = {
  pendente: 'Pendente',
  pago: 'Pago',
  reembolsado: 'Reembolsado',
  cancelado: 'Cancelado'
};

const CustasProcesso = ({ processoId }) => {
  const [custas, setCustas] = useState([]);
  const [totais, setTotais] = useState({ geral: 0, pendente: 0, pago: 0, porTipo: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    tipo: 'custas_judiciais',
    descricao: '',
    valor: '',
    responsavel: 'cliente',
    status: 'pendente',
    dataVencimento: '',
    dataPagamento: '',
    formaPagamento: '',
    observacoes: ''
  });

  useEffect(() => {
    carregarCustas();
  }, [processoId]);

  const carregarCustas = async () => {
    try {
      setLoading(true);
      const response = await custaService.getAll(processoId);
      setCustas(response.custas || []);
      setTotais(response.totais || { geral: 0, pendente: 0, pago: 0, porTipo: {} });
    } catch (error) {
      console.error('Erro ao carregar custas:', error);
      toast.error('Erro ao carregar custas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editando) {
        await custaService.update(editando, formData);
        toast.success('Custa atualizada!');
      } else {
        await custaService.create(processoId, formData);
        toast.success('Custa registrada!');
      }
      
      resetForm();
      carregarCustas();
    } catch (error) {
      console.error('Erro ao salvar custa:', error);
      toast.error('Erro ao salvar custa');
    }
  };

  const handleEdit = (custa) => {
    setEditando(custa.id);
    setFormData({
      tipo: custa.tipo,
      descricao: custa.descricao,
      valor: custa.valor,
      responsavel: custa.responsavel,
      status: custa.status,
      dataVencimento: custa.dataVencimento ? custa.dataVencimento.split('T')[0] : '',
      dataPagamento: custa.dataPagamento ? custa.dataPagamento.split('T')[0] : '',
      formaPagamento: custa.formaPagamento || '',
      observacoes: custa.observacoes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta custa?')) return;
    
    try {
      await custaService.delete(id);
      toast.success('Custa excluída!');
      carregarCustas();
    } catch (error) {
      console.error('Erro ao excluir custa:', error);
      toast.error('Erro ao excluir custa');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'custas_judiciais',
      descricao: '',
      valor: '',
      responsavel: 'cliente',
      status: 'pendente',
      dataVencimento: '',
      dataPagamento: '',
      formaPagamento: '',
      observacoes: ''
    });
    setShowForm(false);
    setEditando(null);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="custas-processo">
      <div className="custas-header">
        <h3>Custas e Despesas</h3>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancelar' : 'Adicionar Custa'}
        </button>
      </div>

      {/* Resumo Financeiro */}
      <div className="custas-resumo">
        <div className="custa-resumo-card total">
          <div className="custa-resumo-label">Total Geral</div>
          <div className="custa-resumo-valor">{formatarMoeda(totais.geral)}</div>
        </div>
        <div className="custa-resumo-card pendente">
          <div className="custa-resumo-label">Pendente</div>
          <div className="custa-resumo-valor">{formatarMoeda(totais.pendente)}</div>
        </div>
        <div className="custa-resumo-card pago">
          <div className="custa-resumo-label">Pago</div>
          <div className="custa-resumo-valor">{formatarMoeda(totais.pago)}</div>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <form className="custas-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Tipo *</label>
              <select 
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                required
              >
                {Object.entries(TIPOS_CUSTA).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                required
                placeholder="0,00"
              />
            </div>

            <div className="form-field full-width">
              <label>Descrição *</label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                required
                placeholder="Ex: Custas iniciais de distribuição"
              />
            </div>

            <div className="form-field">
              <label>Responsável *</label>
              <select
                value={formData.responsavel}
                onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                required
              >
                {Object.entries(RESPONSAVEIS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                {Object.entries(STATUS_CUSTA).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Vencimento</label>
              <input
                type="date"
                value={formData.dataVencimento}
                onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
              />
            </div>

            <div className="form-field">
              <label>Data Pagamento</label>
              <input
                type="date"
                value={formData.dataPagamento}
                onChange={(e) => setFormData({...formData, dataPagamento: e.target.value})}
              />
            </div>

            <div className="form-field full-width">
              <label>Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                rows="2"
                placeholder="Informações adicionais..."
              />
            </div>
          </div>

          <div className="custas-form-actions">
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editando ? 'Atualizar' : 'Salvar'} Custa
            </button>
          </div>
        </form>
      )}

      {/* Lista de Custas */}
      <div className="custas-lista">
        {loading ? (
          <div className="custas-loading">Carregando...</div>
        ) : custas.length === 0 ? (
          <div className="custas-empty">
            <DollarSign size={48} />
            <p>Nenhuma custa registrada</p>
          </div>
        ) : (
          custas.map(custa => (
            <div key={custa.id} className={`custa-item status-${custa.status}`}>
              <div className="custa-item-header">
                <div className="custa-item-tipo">
                  <DollarSign size={18} />
                  <span>{TIPOS_CUSTA[custa.tipo]}</span>
                </div>
                <div className="custa-item-actions">
                  <button 
                    className="custa-action-btn"
                    onClick={() => handleEdit(custa)}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="custa-action-btn danger"
                    onClick={() => handleDelete(custa.id)}
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="custa-item-body">
                <p className="custa-descricao">{custa.descricao}</p>
                <div className="custa-meta">
                  <span className="custa-meta-item">
                    Responsável: <strong>{RESPONSAVEIS[custa.responsavel]}</strong>
                  </span>
                  {custa.dataVencimento && (
                    <span className="custa-meta-item">
                      <Calendar size={14} />
                      Venc: {format(new Date(custa.dataVencimento), 'dd/MM/yyyy')}
                    </span>
                  )}
                </div>
              </div>

              <div className="custa-item-footer">
                <div className="custa-valor">{formatarMoeda(custa.valor)}</div>
                <div className={`custa-status-badge ${custa.status}`}>
                  {STATUS_CUSTA[custa.status]}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustasProcesso;

