import React from 'react';
import './Tag.css';

const Tag = ({ 
  label, 
  color = 'default', 
  variant = 'filled', 
  size = 'sm',
  icon: Icon,
  onRemove,
  clickable = false,
  onClick
}) => {
  const handleClick = (e) => {
    if (clickable && onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const handleRemove = (e) => {
    if (onRemove) {
      e.stopPropagation();
      onRemove();
    }
  };

  return (
    <span 
      className={`tag tag-${color} tag-${variant} tag-${size} ${clickable ? 'tag-clickable' : ''}`}
      onClick={handleClick}
    >
      {Icon && <Icon size={14} className="tag-icon" />}
      <span className="tag-label">{label}</span>
      {onRemove && (
        <button 
          className="tag-remove"
          onClick={handleRemove}
          aria-label="Remover tag"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Tag;

