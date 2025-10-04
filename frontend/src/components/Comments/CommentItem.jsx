import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import UserAvatar from '../UserAvatar/UserAvatar';

const CommentItem = ({ comment, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.texto);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user && (user.id === comment.userId || user.email === comment.userEmail);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `há ${minutes}m`;
    if (hours < 24) return `há ${hours}h`;
    if (days < 7) return `há ${days}d`;
    
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(comment.id, editText);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(comment.texto);
    setIsEditing(false);
  };

  const commentUser = comment.user || {
    nome: comment.userName || 'Usuário',
    email: comment.userEmail
  };

  return (
    <div className="comment-item">
      <UserAvatar user={commentUser} size="md" />
      
      <div className="comment-content">
        <div className="comment-header">
          <div className="comment-author">
            <span className="comment-author-name">
              {comment.user?.nome || comment.userName || 'Usuário'}
            </span>
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
            {comment.edited && <span className="comment-edited">(editado)</span>}
          </div>
          
          {isOwner && (
            <div className="comment-actions">
              <button
                className="comment-action-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={16} />
              </button>
              
              {showMenu && (
                <div className="comment-menu">
                  <button
                    className="comment-menu-item"
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button
                    className="comment-menu-item comment-menu-item-danger"
                    onClick={() => {
                      onDelete(comment.id);
                      setShowMenu(false);
                    }}
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="comment-edit-form">
            <textarea
              className="comment-edit-textarea"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
            />
            <div className="comment-edit-actions">
              <button className="btn btn-sm btn-primary" onClick={handleSaveEdit}>
                <Check size={14} />
                Salvar
              </button>
              <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
                <X size={14} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-text">{comment.texto}</p>
        )}
      </div>
    </div>
  );
};

export default CommentItem;

