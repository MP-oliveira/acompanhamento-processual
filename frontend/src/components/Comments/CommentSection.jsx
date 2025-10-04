import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { commentService } from '../../services/api';
import toast from 'react-hot-toast';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './Comments.css';

const CommentSection = ({ processoId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [processoId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getAll(processoId);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (newComment) => {
    try {
      const response = await commentService.create(processoId, newComment.texto);
      setComments([response.comment, ...comments]);
      toast.success('Comentário adicionado!');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      await commentService.update(commentId, newText);
      setComments(comments.map(c => 
        c.id === commentId 
          ? { ...c, texto: newText, updatedAt: new Date().toISOString(), edited: true }
          : c
      ));
      toast.success('Comentário atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      toast.error('Erro ao atualizar comentário');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.delete(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comentário deletado!');
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast.error('Erro ao deletar comentário');
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <div className="comment-section-title">
          <MessageSquare size={20} />
          <h3>Comentários</h3>
          <span className="comment-count">{comments.length}</span>
        </div>
      </div>

      <CommentForm onSubmit={handleAddComment} />

      {loading ? (
        <div className="comment-loading">
          <LoadingSpinner size="small" text="Carregando comentários..." />
        </div>
      ) : (
        <div className="comment-list">
          {comments.length === 0 ? (
          <div className="comment-empty">
            <MessageSquare size={48} />
            <p>Nenhum comentário ainda</p>
            <span>Seja o primeiro a comentar neste processo</span>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
            />
          ))
        )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;

