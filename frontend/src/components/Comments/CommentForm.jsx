import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CommentForm = ({ onSubmit }) => {
  const { user } = useAuth();
  const [texto, setTexto] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!texto.trim()) return;

    setSubmitting(true);
    
    try {
      await onSubmit({
        texto: texto.trim(),
        userId: user.id,
        userName: user.nome || user.name,
        userEmail: user.email
      });
      
      setTexto('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Cmd+Enter ou Ctrl+Enter para enviar
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-form-textarea"
        placeholder="Adicione um comentário... (Cmd+Enter para enviar)"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        disabled={submitting}
      />
      <div className="comment-form-actions">
        <div className="comment-form-hint">
          <kbd>⌘</kbd>
          <kbd>Enter</kbd>
          <span>para enviar</span>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!texto.trim() || submitting}
          style={{ 
            backgroundColor: '#4A90E2',
            color: '#ffffff',
            border: 'none'
          }}
        >
          <Send size={16} />
          {submitting ? 'Enviando...' : 'Comentar'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;

