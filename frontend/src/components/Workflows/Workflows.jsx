import React, { useState } from 'react';
import { Plus, Play, Pause, Trash2, Edit, Zap, ChevronRight } from 'lucide-react';
import { WORKFLOW_TEMPLATES, TRIGGER_TYPES, ACTION_TYPES } from '../../utils/workflowTemplates';
import './Workflows.css';

const Workflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleActivateTemplate = (template) => {
    const novoWorkflow = {
      id: Date.now(),
      ...template,
      ativo: true,
      executacoes: 0,
      criadoEm: new Date().toISOString()
    };
    
    setWorkflows([...workflows, novoWorkflow]);
    setShowTemplates(false);
  };

  const handleToggleActive = (id) => {
    setWorkflows(workflows.map(w => 
      w.id === id ? { ...w, ativo: !w.ativo } : w
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm('Deseja realmente excluir este workflow?')) {
      setWorkflows(workflows.filter(w => w.id !== id));
    }
  };

  return (
    <div className="workflows-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Automação de Workflows</h1>
          <p className="page-subtitle">Configure regras automáticas para seus processos</p>
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowTemplates(true)}
          >
            <Plus size={20} />
            Novo Workflow
          </button>
        </div>
      </div>

      <div className="workflows-content">
        {workflows.length === 0 ? (
          <div className="workflows-empty">
            <Zap size={64} />
            <h3>Nenhum workflow configurado</h3>
            <p>Crie workflows para automatizar tarefas repetitivas</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowTemplates(true)}
            >
              <Plus size={18} />
              Criar Primeiro Workflow
            </button>
          </div>
        ) : (
          <div className="workflows-grid">
            {workflows.map(workflow => (
              <div key={workflow.id} className={`workflow-card ${workflow.ativo ? 'active' : 'inactive'}`}>
                <div className="workflow-card-header">
                  <div className="workflow-card-icon">
                    <Zap size={24} />
                  </div>
                  <div className="workflow-card-title">
                    <h3>{workflow.nome}</h3>
                    <p>{workflow.descricao}</p>
                  </div>
                  <div className={`workflow-status-badge ${workflow.ativo ? 'active' : 'inactive'}`}>
                    {workflow.ativo ? 'Ativo' : 'Inativo'}
                  </div>
                </div>

                <div className="workflow-card-body">
                  <div className="workflow-trigger">
                    <span className="workflow-label">Quando</span>
                    <div className="workflow-trigger-box">
                      {TRIGGER_TYPES[workflow.trigger.tipo]?.nome || workflow.trigger.tipo}
                    </div>
                  </div>

                  <ChevronRight className="workflow-arrow" size={20} />

                  <div className="workflow-actions">
                    <span className="workflow-label">Então</span>
                    <div className="workflow-actions-list">
                      {workflow.acoes.map((acao, index) => (
                        <div key={index} className="workflow-action-box">
                          {ACTION_TYPES[acao.tipo]?.nome || acao.tipo}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="workflow-card-footer">
                  <div className="workflow-stats">
                    <span className="workflow-stat">
                      {workflow.executacoes || 0} execuções
                    </span>
                  </div>
                  <div className="workflow-card-actions">
                    <button
                      className="workflow-action-btn"
                      onClick={() => handleToggleActive(workflow.id)}
                      title={workflow.ativo ? 'Pausar' : 'Ativar'}
                    >
                      {workflow.ativo ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      className="workflow-action-btn danger"
                      onClick={() => handleDelete(workflow.id)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Templates */}
      {showTemplates && (
        <div className="workflow-templates-overlay" onClick={() => setShowTemplates(false)}>
          <div className="workflow-templates-modal" onClick={(e) => e.stopPropagation()}>
            <div className="workflow-templates-header">
              <h3>Selecionar Template de Workflow</h3>
              <button onClick={() => setShowTemplates(false)}>×</button>
            </div>
            <div className="workflow-templates-grid">
              {WORKFLOW_TEMPLATES.map(template => (
                <div 
                  key={template.id}
                  className="workflow-template-card"
                  onClick={() => handleActivateTemplate(template)}
                >
                  <div className="workflow-template-icon">
                    <Zap size={32} />
                  </div>
                  <h4>{template.nome}</h4>
                  <p>{template.descricao}</p>
                  <div className="workflow-template-summary">
                    <span>{template.acoes.length} ações</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;

