import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import './Comments.css';

const CommentSection = ({ processoId, initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);

  const handleAddComment = (newComment) => {
    const comment = {
      id: Date.now(),
      processoId,
      texto: newComment.texto,
      userId: newComment.userId,
      userName: newComment.userName,
      userEmail: newComment.userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setComments([comment, ...comments]);
  };

  const handleEditComment = (commentId, newText) => {
    setComments(comments.map(c => 
      c.id === commentId 
        ? { ...c, texto: newText, updatedAt: new Date().toISOString(), edited: true }
        : c
    ));
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
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
    </div>
  );
};

export default CommentSection;

