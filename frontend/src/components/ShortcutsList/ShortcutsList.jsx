import React from 'react';
import { X, Command } from 'lucide-react';
import './ShortcutsList.css';

const SHORTCUTS = [
  {
    categoria: 'Navegação',
    atalhos: [
      { teclas: ['Ctrl/Cmd', 'K'], descricao: 'Busca global' },
      { teclas: ['D'], descricao: 'Dashboard' },
      { teclas: ['P'], descricao: 'Lista de processos' },
      { teclas: ['N'], descricao: 'Novo processo' },
      { teclas: ['K'], descricao: 'Kanban Board' },
      { teclas: ['C'], descricao: 'Calendário' },
      { teclas: ['A'], descricao: 'Alertas' },
    ]
  },
  {
    categoria: 'Ações',
    atalhos: [
      { teclas: ['Shift', '/'], descricao: 'Mostrar atalhos' },
      { teclas: ['ESC'], descricao: 'Fechar modais' },
      { teclas: ['Enter'], descricao: 'Confirmar / Selecionar' },
    ]
  }
];

const ShortcutsList = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <div className="shortcuts-title">
            <Command size={24} />
            <h3>Atalhos de Teclado</h3>
          </div>
          <button className="shortcuts-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="shortcuts-content">
          {SHORTCUTS.map((grupo, index) => (
            <div key={index} className="shortcuts-group">
              <h4 className="shortcuts-group-title">{grupo.categoria}</h4>
              <div className="shortcuts-list">
                {grupo.atalhos.map((atalho, i) => (
                  <div key={i} className="shortcut-item">
                    <div className="shortcut-keys">
                      {atalho.teclas.map((tecla, k) => (
                        <kbd key={k} className="shortcut-key">{tecla}</kbd>
                      ))}
                    </div>
                    <div className="shortcut-description">{atalho.descricao}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <p>Pressione <kbd>Shift</kbd> + <kbd>/</kbd> a qualquer momento para ver esta lista</p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsList;

