import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para otimização de imagens com lazy loading e compressão
 */
export const useImageOptimization = (src, options = {}) => {
  const [imageState, setImageState] = useState({
    src: null,
    loading: true,
    error: false,
    inView: false
  });

  const {
    lazy = true,
    quality = 0.8,
    format = 'webp',
    width = null,
    height = null,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcnJlZ2FuZG8uLi48L3RleHQ+PC9zdmc+',
    onLoad = null,
    onError = null
  } = options;

  // Otimizar URL da imagem
  const optimizeImageUrl = useCallback((originalSrc) => {
    if (!originalSrc) return null;

    // Se for uma imagem externa, usar serviço de otimização
    if (originalSrc.startsWith('http')) {
      // Exemplo com Cloudinary ou similar
      const baseUrl = 'https://res.cloudinary.com/demo/image/fetch';
      const params = new URLSearchParams({
        f: format,
        q: Math.round(quality * 100).toString(),
        w: width?.toString() || 'auto',
        h: height?.toString() || 'auto'
      });
      
      return `${baseUrl}/${params.toString()}/${encodeURIComponent(originalSrc)}`;
    }

    // Para imagens locais, retornar como está
    return originalSrc;
  }, [format, quality, width, height]);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy) {
      setImageState(prev => ({ ...prev, inView: true }));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageState(prev => ({ ...prev, inView: true }));
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const element = document.createElement('div');
    observer.observe(element);

    return () => observer.disconnect();
  }, [lazy]);

  // Carregar imagem quando estiver em view
  useEffect(() => {
    if (!imageState.inView || !src) return;

    const optimizedSrc = optimizeImageUrl(src);
    
    const img = new Image();
    
    img.onload = () => {
      setImageState(prev => ({
        ...prev,
        src: optimizedSrc,
        loading: false,
        error: false
      }));
      onLoad?.(optimizedSrc);
    };

    img.onerror = () => {
      setImageState(prev => ({
        ...prev,
        loading: false,
        error: true
      }));
      onError?.(src);
    };

    img.src = optimizedSrc;
  }, [imageState.inView, src, optimizeImageUrl, onLoad, onError]);

  return {
    src: imageState.src,
    loading: imageState.loading,
    error: imageState.error,
    placeholder
  };
};

/**
 * Hook para otimização de múltiplas imagens
 */
export const useImageOptimizationBatch = (sources, options = {}) => {
  const [images, setImages] = useState({});

  useEffect(() => {
    const loadImages = async () => {
      const promises = sources.map(async (src, index) => {
        const optimizedSrc = optimizeImageUrl(src, options);
        
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ index, src: optimizedSrc, loaded: true });
          img.onerror = () => resolve({ index, src: null, loaded: false });
          img.src = optimizedSrc;
        });
      });

      const results = await Promise.all(promises);
      
      setImages(prev => {
        const newImages = { ...prev };
        results.forEach(result => {
          newImages[result.index] = result;
        });
        return newImages;
      });
    };

    loadImages();
  }, [sources, options]);

  return images;
};

/**
 * Função para otimizar URL de imagem
 */
const optimizeImageUrl = (src, options = {}) => {
  if (!src) return null;

  const {
    quality = 0.8,
    format = 'webp',
    width = null,
    height = null
  } = options;

  // Se for uma imagem externa, usar serviço de otimização
  if (src.startsWith('http')) {
    // Exemplo com Cloudinary ou similar
    const baseUrl = 'https://res.cloudinary.com/demo/image/fetch';
    const params = new URLSearchParams({
      f: format,
      q: Math.round(quality * 100).toString(),
      w: width?.toString() || 'auto',
      h: height?.toString() || 'auto'
    });
    
    return `${baseUrl}/${params.toString()}/${encodeURIComponent(src)}`;
  }

  return src;
};

/**
 * Hook para detectar suporte a formatos de imagem
 */
export const useImageFormatSupport = () => {
  const [support, setSupport] = useState({
    webp: false,
    avif: false,
    jpeg: true,
    png: true
  });

  useEffect(() => {
    const checkSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;

      const webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      const avif = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;

      setSupport({
        webp,
        avif,
        jpeg: true,
        png: true
      });
    };

    checkSupport();
  }, []);

  return support;
};

export default useImageOptimization;
