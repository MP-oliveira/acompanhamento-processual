import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import ProcessoForm from '../ProcessoForm/ProcessoForm';
import './EditarProcesso.css';

const EditarProcesso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dados mockados para demonstração
  const mockProcessos = [
    {
      id: 1,
      numero: '0001234-12.2024.8.05.0001',
      classe: 'Ação de Indenização por Dano Moral',
      assunto: 'Indenização por danos morais decorrentes de acidente de trânsito',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'ativo',
      dataDistribuicao: '2024-01-15T10:30:00Z',
      dataSentenca: '2024-02-20T14:15:00Z',
      prazoRecurso: '2024-03-05T23:59:59Z',
      prazoEmbargos: '2024-03-10T23:59:59Z',
      proximaAudiencia: '2024-03-15T09:00:00Z',
      observacoes: 'Processo em fase de produção de provas. Aguardando perícia médica.',
      user: { nome: 'Dr. João Silva' },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      numero: '0001235-12.2024.8.05.0001',
      classe: 'Execução de Título Extrajudicial',
      assunto: 'Execução de título extrajudicial - cheque sem fundos',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'ativo',
      dataDistribuicao: '2024-01-20T08:45:00Z',
      dataSentenca: null,
      prazoRecurso: null,
      prazoEmbargos: null,
      proximaAudiencia: '2024-03-20T14:00:00Z',
      observacoes: 'Aguardando manifestação do executado.',
      user: { nome: 'Dra. Maria Santos' },
      createdAt: '2024-01-20T08:45:00Z'
    },
    {
      id: 3,
      numero: '0001236-12.2024.8.05.0001',
      classe: 'Mandado de Segurança',
      assunto: 'Mandado de segurança contra ato de autoridade pública',
      tribunal: 'Tribunal de Justiça da Bahia',
      comarca: 'Salvador',
      status: 'arquivado',
      dataDistribuicao: '2024-01-10T16:20:00Z',
      dataSentenca: '2024-02-15T11:30:00Z',
      prazoRecurso: '2024-02-28T23:59:59Z',
      prazoEmbargos: '2024-03-05T23:59:59Z',
      proximaAudiencia: null,
      observacoes: 'Processo arquivado por acordo entre as partes.',
      user: { nome: 'Dr. Pedro Costa' },
      createdAt: '2024-01-10T16:20:00Z'
    }
  ];

  useEffect(() => {
    const loadProcesso = async () => {
      setLoading(true);
      try {
        // Simula delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const processoEncontrado = mockProcessos.find(p => p.id === parseInt(id));
        if (processoEncontrado) {
          setProcesso(processoEncontrado);
        } else {
          // Processo não encontrado
          navigate('/processos');
        }
      } catch (error) {
        console.error('Erro ao carregar processo:', error);
        navigate('/processos');
      } finally {
        setLoading(false);
      }
    };

    loadProcesso();
  }, [id, navigate]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      // Simula delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui você faria a chamada para a API para salvar
      console.log('Salvando processo:', { id, ...formData });
      
      // Simula sucesso
      navigate('/processos', {
        state: {
          message: 'Processo atualizado com sucesso!',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
      alert('Erro ao salvar processo. Tente novamente.');
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
        <div className="editar-processo-loading">
          <div className="editar-processo-loading-spinner" />
          <p>Carregando processo...</p>
        </div>
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="editar-processo">
        <div className="editar-processo-error">
          <h3>Processo não encontrado</h3>
          <p>O processo solicitado não foi encontrado.</p>
          <Link to="/processos" className="btn btn-primary">
            <ArrowLeft size={20} />
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
          <div className="page-header-breadcrumb">
            <Link to="/processos" className="page-header-breadcrumb-link">
              <ArrowLeft size={16} />
              Processos
            </Link>
            <span className="page-header-breadcrumb-separator">/</span>
            <span className="page-header-breadcrumb-current">Editar</span>
          </div>
          <h1 className="page-title">Editar Processo</h1>
          <p className="page-subtitle">
            {processo.numero} - {processo.classe}
          </p>
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={saving}
          >
            <X size={20} />
            Cancelar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => document.getElementById('processo-form').dispatchEvent(new Event('submit'))}
            disabled={saving}
          >
            <Save size={20} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Formulário */}
      <div className="editar-processo-content">
        <ProcessoForm
          id="processo-form"
          initialData={processo}
          onSubmit={handleSave}
          isEditing={true}
          loading={saving}
        />
      </div>
    </div>
  );
};

export default EditarProcesso;
