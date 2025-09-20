import React from 'react';
import './AccessibleButton.css';

const AccessibleButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ariaLabel,
  ariaDescribedBy,
  ...props
}) => {
  const baseClasses = 'accessible-button';
  const variantClasses = `accessible-button-${variant}`;
  const sizeClasses = `accessible-button-${size}`;
  const stateClasses = [
    disabled ? 'accessible-button-disabled' : '',
    loading ? 'accessible-button-loading' : ''
  ].filter(Boolean).join(' ');

  const buttonClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    stateClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const handleKeyDown = (e) => {
    // Permitir ativação com Enter e Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && !loading) {
        onClick?.(e);
      }
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconElement = React.cloneElement(icon, {
      size: size === 'sm' ? 16 : size === 'lg' ? 24 : 20,
      'aria-hidden': true
    });

    return (
      <span className={`accessible-button-icon accessible-button-icon-${iconPosition}`}>
        {iconElement}
      </span>
    );
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="accessible-button-spinner" aria-hidden="true">
          <svg
            className="accessible-button-spinner-svg"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="accessible-button-spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
            />
          </svg>
        </span>
      )}
      
      {!loading && iconPosition === 'left' && renderIcon()}
      
      <span className="accessible-button-content">
        {children}
      </span>
      
      {!loading && iconPosition === 'right' && renderIcon()}
      
      <span className="accessible-button-focus-ring" />
    </button>
  );
};

export default AccessibleButton;
