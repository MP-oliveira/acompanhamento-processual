import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Carregando...' }) => {
  return (
    <div className={`loading-spinner-container loading-spinner-${size}`}>
      <div className="loading-spinner">
        <div className="loading-spinner-inner"></div>
      </div>
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
