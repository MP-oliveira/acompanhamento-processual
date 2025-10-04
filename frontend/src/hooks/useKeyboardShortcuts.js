import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para gerenciar atalhos de teclado
 */
export const useKeyboardShortcuts = (onShowShortcuts) => {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event) => {
    // Ignorar se estiver digitando em um input, textarea ou contenteditable
    const target = event.target;
    const isTyping = target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]');
    
    // Atalho ? funciona em qualquer contexto
    // Apenas quando a tecla for exatamente '?'
    if (event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      if (onShowShortcuts) {
        onShowShortcuts();
      }
      return;
    }
    
    if (isTyping) {
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

    // Atalhos sem modificadores (quando não estiver digitando)
    if (!event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
      switch (event.key.toLowerCase()) {
        case 'd':
          event.preventDefault();
          navigate('/dashboard');
          break;
        case 'p':
          event.preventDefault();
          navigate('/processos');
          break;
        case 'n':
          event.preventDefault();
          navigate('/processos/novo');
          break;
        case 't':
          event.preventDefault();
          // Navega para novo processo e abre templates
          navigate('/processos/novo', { state: { openTemplates: true } });
          break;
        case 'k':
          event.preventDefault();
          navigate('/processos/kanban');
          break;
        case 'c':
          event.preventDefault();
          navigate('/calendario');
          break;
        case 'a':
          event.preventDefault();
          navigate('/alertas');
          break;
        default:
          break;
      }
    }
  }, [navigate, onShowShortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
