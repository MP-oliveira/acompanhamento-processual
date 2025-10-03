import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import './ProcessoForm.css';

const ProcessoForm = ({ 
  processo = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  error = null 
}) => {
  const [formData, setFormData] = useState({
    numero: '',
    classe: '',
    assunto: '',
    tribunal: '',
    comarca: '',
    status: 'ativo',
    dataDistribuicao: '',
    dataSentenca: '',
    prazoRecurso: '',
    prazoEmbargos: '',
    proximaAudiencia: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState({});

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (processo) {
      console.log('🔍 ProcessoForm: Recebeu processo para edição:', processo);
      console.log('🔍 ProcessoForm: dataDistribuicao:', processo.dataDistribuicao);
      console.log('🔍 ProcessoForm: proximaAudiencia:', processo.proximaAudiencia);
      
      setFormData({
        numero: processo.numero || '',
        classe: processo.classe || '',
        assunto: processo.assunto || '',
        tribunal: processo.tribunal || '',
        comarca: processo.comarca || '',
        status: processo.status || 'ativo',
        dataDistribuicao: processo.dataDistribuicao ? 
          new Date(processo.dataDistribuicao).toISOString().split('T')[0] : '',
        dataSentenca: processo.dataSentenca ? 
          new Date(processo.dataSentenca).toISOString().split('T')[0] : '',
        prazoRecurso: processo.prazoRecurso ? 
          new Date(processo.prazoRecurso).toISOString().split('T')[0] : '',
        prazoEmbargos: processo.prazoEmbargos ? 
          new Date(processo.prazoEmbargos).toISOString().split('T')[0] : '',
        proximaAudiencia: processo.proximaAudiencia ? 
          new Date(processo.proximaAudiencia).toISOString().split('T')[0] : '',
        observacoes: processo.observacoes || ''
      });
    }
  }, [processo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Campos obrigatórios
    if (!formData.numero.trim()) {
      newErrors.numero = 'Número do processo é obrigatório';
    } else if (formData.numero.length < 10) {
      newErrors.numero = 'Número do processo deve ter pelo menos 10 caracteres';
    }

    if (!formData.classe.trim()) {
      newErrors.classe = 'Classe processual é obrigatória';
    }

    if (!formData.tribunal.trim()) {
      newErrors.tribunal = 'Tribunal é obrigatório';
    }

    if (!formData.comarca.trim()) {
      newErrors.comarca = 'Comarca é obrigatória';
    }

    if (!formData.dataDistribuicao) {
      newErrors.dataDistribuicao = 'Data de distribuição é obrigatória';
    }

    // Validação de datas
    if (formData.dataSentenca && formData.dataDistribuicao) {
      const dataDistribuicao = new Date(formData.dataDistribuicao);
      const dataSentenca = new Date(formData.dataSentenca);
      
      if (dataSentenca < dataDistribuicao) {
        newErrors.dataSentenca = 'Data da sentença não pode ser anterior à distribuição';
      }
    }

    if (formData.prazoRecurso && formData.dataSentenca) {
      const dataSentenca = new Date(formData.dataSentenca);
      const prazoRecurso = new Date(formData.prazoRecurso);
      
      if (prazoRecurso < dataSentenca) {
        newErrors.prazoRecurso = 'Prazo para recurso não pode ser anterior à sentença';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('🔍 FormData ao submeter:', formData);
      console.log('🔍 dataDistribuicao no formData:', formData.dataDistribuicao);
      console.log('🔍 proximaAudiencia no formData:', formData.proximaAudiencia);
      
      // Converter datas para formato ISO (apenas se não estiverem vazias)
      const submitData = {
        numero: formData.numero,
        classe: formData.classe,
        assunto: formData.assunto,
        tribunal: formData.tribunal,
        comarca: formData.comarca,
        status: formData.status || 'ativo',
        dataDistribuicao: formData.dataDistribuicao && formData.dataDistribuicao.trim() ? 
          new Date(formData.dataDistribuicao).toISOString() : null,
        dataSentenca: formData.dataSentenca && formData.dataSentenca.trim() ? 
          new Date(formData.dataSentenca).toISOString() : null,
        prazoRecurso: formData.prazoRecurso && formData.prazoRecurso.trim() ? 
          new Date(formData.prazoRecurso).toISOString() : null,
        prazoEmbargos: formData.prazoEmbargos && formData.prazoEmbargos.trim() ? 
          new Date(formData.prazoEmbargos).toISOString() : null,
        proximaAudiencia: formData.proximaAudiencia && formData.proximaAudiencia.trim() ? 
          new Date(formData.proximaAudiencia).toISOString() : null,
        observacoes: formData.observacoes
      };

      console.log('🔍 SubmitData que será enviado:', submitData);

      onSubmit(submitData);
    }
  };

  const handleClearField = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  return (
    <div className="processo-form-container">
      <div className="processo-form-header">
        <div className="processo-form-title">
          <FileText size={24} />
          <h2>{processo ? 'Editar Processo' : 'Novo Processo'}</h2>
        </div>
        <button
          type="button"
          className="processo-form-close"
          onClick={onCancel}
          disabled={loading}
        >
          <X size={20} />
        </button>
      </div>

      <form className="processo-form" onSubmit={handleSubmit}>
        {error && (
          <div className="processo-form-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Informações Básicas */}
        <div className="processo-form-section">
          <h3 className="processo-form-section-title">
            Informações Básicas
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numero" className="form-label required">
                Número do Processo
              </label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className={`form-input ${errors.numero ? 'error' : ''}`}
                  placeholder="0001234-12.2024.8.05.0001"
                  disabled={loading}
                />
                {formData.numero && (
                  <button
                    type="button"
                    className="form-input-clear"
                    onClick={() => handleClearField('numero')}
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {errors.numero && (
                <div className="form-error">
                  <AlertCircle className="form-error-icon" size={16} />
                  <span>{errors.numero}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="classe" className="form-label required">
                Classe Processual
              </label>
              <input
                type="text"
                id="classe"
                name="classe"
                value={formData.classe}
                onChange={handleChange}
                className={`form-input ${errors.classe ? 'error' : ''}`}
                placeholder="Ação de Indenização"
                disabled={loading}
              />
              {errors.classe && (
                <div className="form-error">
                  <AlertCircle className="form-error-icon" size={16} />
                  <span>{errors.classe}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="assunto" className="form-label">
              Assunto
            </label>
            <textarea
              id="assunto"
              name="assunto"
              value={formData.assunto}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Descreva o assunto do processo..."
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        {/* Localização */}
        <div className="processo-form-section">
          <h3 className="processo-form-section-title">
            Localização
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tribunal" className="form-label required">
                Tribunal
              </label>
              <input
                type="text"
                id="tribunal"
                name="tribunal"
                value={formData.tribunal}
                onChange={handleChange}
                className={`form-input ${errors.tribunal ? 'error' : ''}`}
                placeholder="Tribunal de Justiça da Bahia"
                disabled={loading}
              />
              {errors.tribunal && (
                <div className="form-error">
                  <AlertCircle className="form-error-icon" size={16} />
                  <span>{errors.tribunal}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="comarca" className="form-label required">
                Comarca
              </label>
              <input
                type="text"
                id="comarca"
                name="comarca"
                value={formData.comarca}
                onChange={handleChange}
                className={`form-input ${errors.comarca ? 'error' : ''}`}
                placeholder="Salvador"
                disabled={loading}
              />
              {errors.comarca && (
                <div className="form-error">
                  <AlertCircle className="form-error-icon" size={16} />
                  <span>{errors.comarca}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status e Datas */}
        <div className="processo-form-section">
          <h3 className="processo-form-section-title">
            Status e Cronologia
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status" className="form-label required">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dataDistribuicao" className="form-label required">
                Data de Distribuição
              </label>
              <input
                type="date"
                id="dataDistribuicao"
                name="dataDistribuicao"
                value={formData.dataDistribuicao}
                onChange={handleChange}
                className={`form-input ${errors.dataDistribuicao ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.dataDistribuicao && (
                <div className="form-error">
                  <AlertCircle className="form-error-icon" size={16} />
                  <span>{errors.dataDistribuicao}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dataSentenca" className="form-label">
                Data da Sentença
              </label>
              <input
                type="date"
                id="dataSentenca"
                name="dataSentenca"
                value={formData.dataSentenca}
                onChange={handleChange}
                className={`form-input ${errors.dataSentenca ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.dataSentenca && (
                <div className="form-error">
                  <AlertCircle className="form-error-icon" size={16} />
                  <span>{errors.dataSentenca}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="proximaAudiencia" className="form-label">
                Próxima Audiência
              </label>
              <input
                type="date"
                id="proximaAudiencia"
                name="proximaAudiencia"
                value={formData.proximaAudiencia}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Prazos */}
        <div className="processo-form-section">
          <h3 className="processo-form-section-title">
            Prazos
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prazoRecurso" className="form-label">
                Prazo para Recurso
              </label>
              <input
                type="date"
                id="prazoRecurso"
                name="prazoRecurso"
                value={formData.prazoRecurso}
                onChange={handleChange}
                className={`form-input ${errors.prazoRecurso ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.prazoRecurso && (
                <div className="form-error">
                  <AlertCircle className="form-error-icon" size={16} />
                  <span>{errors.prazoRecurso}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="prazoEmbargos" className="form-label">
                Prazo para Embargos
              </label>
              <input
                type="date"
                id="prazoEmbargos"
                name="prazoEmbargos"
                value={formData.prazoEmbargos}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="processo-form-section">
          <h3 className="processo-form-section-title">
            Observações
          </h3>
          
          <div className="form-group">
            <label htmlFor="observacoes" className="form-label">
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Adicione observações relevantes sobre o processo..."
              rows={4}
              disabled={loading}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={16} />
            Cancelar
          </button>
          
          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                {processo ? 'Atualizar' : 'Criar'} Processo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProcessoForm;
