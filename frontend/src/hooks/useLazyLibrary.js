import { useState, useEffect } from 'react';

/**
 * Hook para carregar bibliotecas de forma lazy
 * @param {Function} importFn - Função que retorna a importação dinâmica
 * @param {Object} options - Opções de configuração
 * @returns {Object} - { library, loading, error }
 */
export const useLazyLibrary = (importFn, options = {}) => {
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLibrary = async () => {
    if (library || loading) return library;

    setLoading(true);
    setError(null);

    try {
      const lib = await importFn();
      setLibrary(lib);
      return lib;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carregar automaticamente se especificado
  useEffect(() => {
    if (options.autoLoad) {
      loadLibrary();
    }
  }, [options.autoLoad]);

  return {
    library,
    loading,
    error,
    loadLibrary
  };
};

// Hook específico para jsPDF
export const useJSPDF = () => {
  return useLazyLibrary(() => import('jspdf'), { autoLoad: false });
};

// Hook específico para file-saver
export const useFileSaver = () => {
  return useLazyLibrary(() => import('file-saver'), { autoLoad: false });
};

export default useLazyLibrary;
