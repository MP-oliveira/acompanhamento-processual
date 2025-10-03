import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { processoService } from '../../services/api';
import ProcessoForm from '../ProcessoForm/ProcessoForm';
import './EditarProcesso.css';

const EditarProcesso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProcesso = async () => {
      setLoading(true);
      try {
        // Carrega o processo da API
        const response = await processoService.getById(id);
        console.log('🔍 EditarProcesso: Response da API:', response);
        console.log('🔍 EditarProcesso: response.processo:', response.processo);
        console.log('🔍 EditarProcesso: dataDistribuicao:', response.processo?.dataDistribuicao || response.dataDistribuicao);
        console.log('🔍 EditarProcesso: proximaAudiencia:', response.processo?.proximaAudiencia || response.proximaAudiencia);
        
        const processoData = response.processo || response;
        console.log('🔍 EditarProcesso: Processo que será passado para o form:', processoData);
        
        setProcesso(processoData);
      } catch (error) {
        console.error('Erro ao carregar processo:', error);
        // Processo não encontrado ou erro
        navigate('/processos');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProcesso();
    }
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError(null);

    try {
      // Chama a API para atualizar o processo
      const response = await processoService.update(id, formData);
      
      // Redireciona para a lista de processos
      navigate('/processos', { 
        state: { 
          message: 'Processo atualizado com sucesso!',
          type: 'success'
        }
      });
      
    } catch (err) {
      console.error('Erro ao atualizar processo:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar processo. Tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/processos');
  };

  if (loading) {
    return (
      <div className="editar-processo">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando processo...</p>
        </div>
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="editar-processo">
        <div className="error-container">
          <p>Processo não encontrado.</p>
          <Link to="/processos" className="btn btn-primary">
            Voltar para Processos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-processo">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <Link to="/processos" className="btn btn-secondary">
            <ArrowLeft size={20} />
            Voltar
          </Link>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="editar-processo-content">
        <div className="editar-processo-form">
          <div className="form-header">
            <h2>Editar Processo</h2>
            <p>Atualize as informações do processo {processo.numero}</p>
          </div>

          {error && (
            <div className="form-error-message">
              <X size={16} />
              <span>{error}</span>
            </div>
          )}

          <ProcessoForm
            processo={processo}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={saving}
            submitText="Salvar Alterações"
            cancelText="Cancelar"
          />
        </div>
      </div>
    </div>
  );
};

export default EditarProcesso;