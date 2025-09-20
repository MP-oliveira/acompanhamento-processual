import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para gerenciar atalhos de teclado
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event) => {
    // Ignorar se estiver digitando em um input, textarea ou contenteditable
    const target = event.target;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    // Atalhos com Ctrl/Cmd
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          navigate('/dashboard');
          break;
        case '2':
          event.preventDefault();
          navigate('/processos');
          break;
        case '3':
          event.preventDefault();
          navigate('/alertas');
          break;
        case '4':
          event.preventDefault();
          navigate('/calendario');
          break;
        case '5':
          event.preventDefault();
          navigate('/consultas');
          break;
        case '6':
          event.preventDefault();
          navigate('/relatorios');
          break;
        case '7':
          event.preventDefault();
          navigate('/usuarios');
          break;
        case '8':
          event.preventDefault();
          navigate('/configuracoes');
          break;
        case 'p':
          event.preventDefault();
          navigate('/performance');
          break;
        case 'n':
          event.preventDefault();
          navigate('/processos/novo');
          break;
        case 'k':
          event.preventDefault();
          // Disparar evento customizado para abrir busca global
          window.dispatchEvent(new CustomEvent('openGlobalSearch'));
          break;
        default:
          break;
      }
    }

    // Atalhos com Alt
    if (event.altKey) {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          window.history.back();
          break;
        case 'ArrowRight':
          event.preventDefault();
          window.history.forward();
          break;
        case 'h':
          event.preventDefault();
          navigate('/dashboard');
          break;
        case 'p':
          event.preventDefault();
          navigate('/processos');
          break;
        case 'a':
          event.preventDefault();
          navigate('/alertas');
          break;
        case 'c':
          event.preventDefault();
          navigate('/calendario');
          break;
        default:
          break;
      }
    }

    // Atalhos especiais
    switch (event.key) {
      case 'Escape':
        // Fechar modais ou menus
        const modals = document.querySelectorAll('[role="dialog"], .modal');
        if (modals.length > 0) {
          const lastModal = modals[modals.length - 1];
          const closeButton = lastModal.querySelector('[aria-label*="fechar"], [aria-label*="close"], .close, .modal-close');
          if (closeButton) {
            closeButton.click();
          }
        }
        break;
      case '?':
        // Mostrar ajuda de atalhos
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
          event.preventDefault();
          showKeyboardShortcuts();
        }
        break;
      default:
        break;
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * Função para mostrar os atalhos de teclado
 */
const showKeyboardShortcuts = () => {
  const shortcuts = [
    { key: 'Ctrl/Cmd + 1-8', description: 'Navegar entre páginas principais' },
    { key: 'Ctrl/Cmd + K', description: 'Busca global' },
    { key: 'Ctrl/Cmd + N', description: 'Novo processo' },
    { key: 'Ctrl/Cmd + P', description: 'Performance dashboard' },
    { key: 'Alt + ←/→', description: 'Voltar/Avançar no histórico' },
    { key: 'Alt + H', description: 'Ir para Home (Dashboard)' },
    { key: 'Alt + P', description: 'Ir para Processos' },
    { key: 'Alt + A', description: 'Ir para Alertas' },
    { key: 'Alt + C', description: 'Ir para Calendário' },
    { key: 'Esc', description: 'Fechar modais' },
    { key: '?', description: 'Mostrar esta ajuda' }
  ];

  // Criar modal de ajuda
  const modal = document.createElement('div');
  modal.className = 'keyboard-shortcuts-modal';
  modal.innerHTML = `
    <div class="keyboard-shortcuts-overlay">
      <div class="keyboard-shortcuts-content">
        <div class="keyboard-shortcuts-header">
          <h3>Atalhos de Teclado</h3>
          <button class="keyboard-shortcuts-close" aria-label="Fechar">×</button>
        </div>
        <div class="keyboard-shortcuts-list">
          ${shortcuts.map(shortcut => `
            <div class="keyboard-shortcut-item">
              <kbd class="keyboard-shortcut-key">${shortcut.key}</kbd>
              <span class="keyboard-shortcut-description">${shortcut.description}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Adicionar estilos
  const styles = document.createElement('style');
  styles.textContent = `
    .keyboard-shortcuts-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
    }
    .keyboard-shortcuts-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .keyboard-shortcuts-content {
      background: white;
      border-radius: 8px;
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .keyboard-shortcuts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .keyboard-shortcuts-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .keyboard-shortcuts-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .keyboard-shortcuts-list {
      padding: 20px;
    }
    .keyboard-shortcut-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .keyboard-shortcut-item:last-child {
      border-bottom: none;
    }
    .keyboard-shortcut-key {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 4px 8px;
      font-family: monospace;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      white-space: nowrap;
    }
    .keyboard-shortcut-description {
      color: #6b7280;
      font-size: 14px;
      margin-left: 16px;
    }
    @media (max-width: 640px) {
      .keyboard-shortcut-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .keyboard-shortcut-description {
        margin-left: 0;
      }
    }
  `;

  document.head.appendChild(styles);
  document.body.appendChild(modal);

  // Event listeners
  const closeModal = () => {
    document.body.removeChild(modal);
    document.head.removeChild(styles);
  };

  modal.querySelector('.keyboard-shortcuts-close').addEventListener('click', closeModal);
  modal.querySelector('.keyboard-shortcuts-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Fechar com ESC
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
};

export default useKeyboardShortcuts;
