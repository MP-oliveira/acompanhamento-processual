/**
 * Utilitários para gerenciar histórico e favoritos de busca
 */

const SEARCH_HISTORY_KEY = 'search_history';
const SEARCH_FAVORITES_KEY = 'search_favorites';
const MAX_HISTORY = 10;

/**
 * Adiciona uma busca ao histórico
 */
export const addToHistory = (query, type = 'text') => {
  if (!query || query.trim().length < 2) return;
  
  const history = getHistory();
  const newEntry = {
    id: Date.now(),
    query: query.trim(),
    type,
    timestamp: new Date().toISOString()
  };
  
  // Remove duplicatas
  const filtered = history.filter(h => h.query.toLowerCase() !== query.toLowerCase());
  
  // Adiciona no início e limita a MAX_HISTORY
  const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
  
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Obtém o histórico de buscas
 */
export const getHistory = () => {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    return [];
  }
};

/**
 * Limpa o histórico
 */
export const clearHistory = () => {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
};

/**
 * Remove um item do histórico
 */
export const removeFromHistory = (id) => {
  const history = getHistory();
  const updated = history.filter(h => h.id !== id);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Adiciona uma busca aos favoritos
 */
export const addToFavorites = (query, filters = {}) => {
  if (!query || query.trim().length < 2) return;
  
  const favorites = getFavorites();
  const newFavorite = {
    id: Date.now(),
    query: query.trim(),
    filters,
    timestamp: new Date().toISOString()
  };
  
  // Remove duplicatas
  const filtered = favorites.filter(f => f.query.toLowerCase() !== query.toLowerCase());
  
  const updated = [newFavorite, ...filtered];
  localStorage.setItem(SEARCH_FAVORITES_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Obtém as buscas favoritas
 */
export const getFavorites = () => {
  try {
    const stored = localStorage.getItem(SEARCH_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
    return [];
  }
};

/**
 * Remove dos favoritos
 */
export const removeFromFavorites = (id) => {
  const favorites = getFavorites();
  const updated = favorites.filter(f => f.id !== id);
  localStorage.setItem(SEARCH_FAVORITES_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Verifica se uma busca está nos favoritos
 */
export const isFavorite = (query) => {
  const favorites = getFavorites();
  return favorites.some(f => f.query.toLowerCase() === query.toLowerCase());
};

