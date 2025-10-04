import React from 'react';
import Tag from './Tag';
import './Tag.css';

const TagList = ({ tags, onTagClick, onTagRemove, maxVisible = null }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags;
  const hiddenCount = maxVisible && tags.length > maxVisible ? tags.length - maxVisible : 0;

  return (
    <div className="tag-list">
      {visibleTags.map((tag, index) => (
        <Tag
          key={tag.id || index}
          label={tag.label}
          color={tag.color}
          variant={tag.variant || 'filled'}
          size={tag.size || 'sm'}
          icon={tag.icon}
          clickable={!!onTagClick}
          onClick={() => onTagClick && onTagClick(tag)}
          onRemove={onTagRemove ? () => onTagRemove(tag) : null}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="tag-more">+{hiddenCount}</span>
      )}
    </div>
  );
};

export default TagList;

