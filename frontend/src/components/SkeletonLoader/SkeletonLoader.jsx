import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ 
  type = 'text', 
  width = '100%', 
  height = '1rem', 
  lines = 1,
  className = '',
  animate = true 
}) => {
  const getSkeletonClass = () => {
    let baseClass = 'skeleton-loader';
    
    if (animate) {
      baseClass += ' skeleton-animate';
    }
    
    if (type === 'card') {
      baseClass += ' skeleton-card';
    } else if (type === 'avatar') {
      baseClass += ' skeleton-avatar';
    } else if (type === 'button') {
      baseClass += ' skeleton-button';
    } else {
      baseClass += ' skeleton-text';
    }
    
    if (className) {
      baseClass += ` ${className}`;
    }
    
    return baseClass;
  };

  const getStyle = () => ({
    width: width,
    height: height,
  });

  if (type === 'card') {
    return (
      <div className={getSkeletonClass()}>
        <div className="skeleton-card-header" style={getStyle()}>
          <div className="skeleton-avatar skeleton-animate"></div>
          <div className="skeleton-text skeleton-animate" style={{ width: '60%', height: '1rem' }}></div>
        </div>
        <div className="skeleton-card-content">
          {Array.from({ length: lines }).map((_, index) => (
            <div 
              key={index}
              className="skeleton-text skeleton-animate" 
              style={{ 
                width: index === lines - 1 ? '70%' : '100%', 
                height: '0.875rem',
                marginBottom: index < lines - 1 ? '0.5rem' : '0'
              }}
            ></div>
          ))}
        </div>
        <div className="skeleton-card-footer">
          <div className="skeleton-button skeleton-animate" style={{ width: '80px', height: '2rem' }}></div>
        </div>
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div 
        className={getSkeletonClass()}
        style={{ 
          width: height, 
          height: height,
          borderRadius: '50%'
        }}
      ></div>
    );
  }

  if (type === 'button') {
    return (
      <div 
        className={getSkeletonClass()}
        style={getStyle()}
      ></div>
    );
  }

  // Text skeleton
  if (lines > 1) {
    return (
      <div className="skeleton-text-container">
        {Array.from({ length: lines }).map((_, index) => (
          <div 
            key={index}
            className={getSkeletonClass()}
            style={{ 
              width: index === lines - 1 ? '70%' : '100%', 
              height: height,
              marginBottom: index < lines - 1 ? '0.5rem' : '0'
            }}
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={getSkeletonClass()}
      style={getStyle()}
    ></div>
  );
};

export default SkeletonLoader;
