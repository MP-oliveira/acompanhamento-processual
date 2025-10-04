import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { PROCESSO_TEMPLATES, getCategorias } from '../../utils/processoTemplates';
import './TemplateSelector.css';

const TemplateSelector = ({ onSelectTemplate, onClose }) => {
  const [selectedCategoria, setSelectedCategoria] = useState('Todos');
  
  const categorias = ['Todos', ...getCategorias()];
  
  const filteredTemplates = selectedCategoria === 'Todos'
    ? PROCESSO_TEMPLATES
    : PROCESSO_TEMPLATES.filter(t => t.categoria === selectedCategoria);

  return (
    <div className="template-selector-overlay" onClick={onClose}>
      <div className="template-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="template-selector-header">
          <div className="template-selector-title">
            <Sparkles size={24} />
            <h3>Selecionar Template</h3>
          </div>
          <button className="template-selector-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="template-selector-filters">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`template-filter-btn ${selectedCategoria === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategoria(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="template-selector-grid">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => {
                onSelectTemplate(template);
                onClose();
              }}
            >
              <div className="template-card-icon">{template.icon}</div>
              <div className="template-card-content">
                <h4 className="template-card-nome">{template.nome}</h4>
                <p className="template-card-descricao">{template.descricao}</p>
                <span className="template-card-categoria">{template.categoria}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="template-selector-empty">
            <p>Nenhum template encontrado nesta categoria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;

