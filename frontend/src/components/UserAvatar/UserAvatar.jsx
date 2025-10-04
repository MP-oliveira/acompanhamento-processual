import React from 'react';
import './UserAvatar.css';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  showName = false, 
  showTooltip = true,
  onClick 
}) => {
  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getColorFromName = (name) => {
    if (!name) return '#6B7280';
    
    const colors = [
      '#4A90E2', '#28A745', '#FFC107', '#DC3545', 
      '#7B68EE', '#17A2B8', '#FF9800', '#9C27B0'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(user.nome || user.name || user.email);
  const bgColor = getColorFromName(user.nome || user.name || user.email);
  const userName = user.nome || user.name || user.email;

  return (
    <div 
      className={`user-avatar-container ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div 
        className={`user-avatar user-avatar-${size}`}
        style={{ backgroundColor: bgColor }}
        title={showTooltip ? userName : undefined}
      >
        <span className="user-avatar-initials">{initials}</span>
      </div>
      {showName && (
        <span className="user-avatar-name">{userName}</span>
      )}
    </div>
  );
};

export default UserAvatar;

