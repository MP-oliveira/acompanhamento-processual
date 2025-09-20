import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { processoService } from '../../services/api';
import ProcessoForm from '../ProcessoForm/ProcessoForm';
import './NovoProcesso.css';

const NovoProcesso = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Chama a API para criar o processo
      const response = await processoService.create(formData);
      
      // Redireciona para a lista de processos
      navigate('/processos', { 
        state: { 
          message: 'Processo criado com sucesso!',
          type: 'success'
        }
      });
      
    } catch (err) {
      console.error('Erro ao criar processo:', err);
      
      // Tratamento específico de erros
      if (err.response?.data?.error === 'Número do processo já cadastrado') {
        setError('Este número de processo já está cadastrado. Por favor, use um número diferente.');
      } else if (err.response?.data?.error === 'Dados inválidos') {
        const details = err.response?.data?.details || [];
        const errorMessages = details.map(detail => `${detail.field}: ${detail.message}`).join(', ');
        setError(`Dados inválidos: ${errorMessages}`);
      } else {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Erro ao criar processo. Tente novamente.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/processos');
  };

  return (
    <div className="novo-processo">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <div></div>
          <button
            className="page-header-back"
            onClick={() => navigate('/processos')}
            disabled={loading}
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
        </div>
      </div>

      {/* Formulário */}
      <div className="novo-processo-content">
        <ProcessoForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          error={error}
        />
      </div>

      {/* Dicas */}
      <div className="novo-processo-tips">
        <div className="novo-processo-tips-header">
          <h3>💡 Dicas para preenchimento</h3>
        </div>
        <div className="novo-processo-tips-content">
          <div className="novo-processo-tip">
            <strong>Número do Processo:</strong> Use o formato padrão do CNJ (ex: 0001234-12.2024.8.05.0001)
          </div>
          <div className="novo-processo-tip">
            <strong>Classe Processual:</strong> Seja específico (ex: "Ação de Indenização por Dano Moral")
          </div>
          <div className="novo-processo-tip">
            <strong>Prazos:</strong> O sistema calculará automaticamente os prazos baseados na data da sentença
          </div>
          <div className="novo-processo-tip">
            <strong>Observações:</strong> Adicione informações relevantes que possam ser úteis no acompanhamento
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovoProcesso;
