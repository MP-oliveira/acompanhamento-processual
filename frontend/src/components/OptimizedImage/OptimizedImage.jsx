import React, { useRef } from 'react';
import { useImageOptimization, useImageFormatSupport } from '../../hooks/useImageOptimization';
import './OptimizedImage.css';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  placeholder,
  lazy = true,
  quality = 0.8,
  width = null,
  height = null,
  onLoad,
  onError,
  ...props
}) => {
  const imgRef = useRef(null);
  const formatSupport = useImageFormatSupport();
  
  // Determinar melhor formato baseado no suporte do navegador
  const getBestFormat = () => {
    if (formatSupport.avif) return 'avif';
    if (formatSupport.webp) return 'webp';
    return 'jpeg';
  };

  const { src: optimizedSrc, loading, error } = useImageOptimization(src, {
    lazy,
    quality,
    format: getBestFormat(),
    width,
    height,
    placeholder,
    onLoad,
    onError
  });

  return (
    <div 
      ref={imgRef}
      className={`optimized-image-container ${className}`}
      {...props}
    >
      {/* Placeholder/Loading */}
      {loading && !error && (
        <div className="optimized-image-placeholder">
          <img 
            src={placeholder} 
            alt="Carregando..." 
            className="optimized-image-placeholder-img"
          />
        </div>
      )}

      {/* Imagem principal */}
      {optimizedSrc && !error && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`optimized-image ${!loading ? 'loaded' : ''}`}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          width={width}
          height={height}
        />
      )}

      {/* Estado de erro */}
      {error && (
        <div className="optimized-image-error">
          <div className="optimized-image-error-icon">⚠️</div>
          <div className="optimized-image-error-text">Erro ao carregar</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
