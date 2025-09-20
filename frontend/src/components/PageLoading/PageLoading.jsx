import React from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import SkeletonLoader from '../SkeletonLoader/SkeletonLoader';
import './PageLoading.css';

const PageLoading = ({ type = 'spinner', page = 'dashboard' }) => {
  if (type === 'skeleton') {
    return (
      <div className="page-loading-skeleton">
        <div className="page-loading-header">
          <SkeletonLoader type="text" width="200px" height="2rem" />
          <SkeletonLoader type="button" width="120px" height="2.5rem" />
        </div>
        
        <div className="page-loading-stats">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLoader key={index} type="card" lines={2} />
          ))}
        </div>
        
        <div className="page-loading-content">
          <div className="page-loading-filters">
            <SkeletonLoader type="text" width="300px" height="2.5rem" />
            <SkeletonLoader type="button" width="100px" height="2.5rem" />
          </div>
          
          <div className="page-loading-list">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonLoader key={index} type="card" lines={3} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default spinner loading
  return (
    <div className="page-loading-spinner">
      <LoadingSpinner size="large" text="Carregando página..." />
    </div>
  );
};

export default PageLoading;
