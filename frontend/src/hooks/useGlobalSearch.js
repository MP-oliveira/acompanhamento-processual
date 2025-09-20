import { useState, useCallback, useRef } from 'react';
import { processoService, alertService, userService, relatorioService, consultaService } from '../services/api';

/**
 * Hook para busca global em tempo real - Versão simplificada e robusta
 */
export const useGlobalSearch = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Função para destacar termos na busca
  const highlightSearchTerms = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  // Busca global principal - Simplificada
  const searchGlobal = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setResults([]);
      return [];
    }

    // Cancelar busca anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    
    try {
      // Busca simples e direta - sem funções intermediárias
      const searchPromises = [
        processoService.getAll({ search: query, limit: 3 }),
        alertService.getAll({ search: query, limit: 3 }),
        userService.getAll({ search: query, limit: 3 }),
        relatorioService.getAll({ search: query, limit: 3 }),
        consultaService.getAll({ search: query, limit: 3 })
      ];

      const responses = await Promise.allSettled(
        searchPromises.map(promise => 
          Promise.race([
            promise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 3000)
            )
          ])
        )
      );

      // Verificar se a busca foi cancelada
      if (signal.aborted) {
        return [];
      }

      // Processar resultados de forma simples
      const allResults = [];
      
      // Processos
      if (responses[0].status === 'fulfilled' && responses[0].value?.processos) {
        allResults.push(...responses[0].value.processos.map(p => ({
          id: p.id,
          type: 'processo',
          title: `Processo: ${p.numero}`,
          description: `${p.assunto} - ${p.status}`,
          link: `/processos?viewProcessId=${p.id}`,
          highlight: {
            title: highlightSearchTerms(p.numero, query),
            description: highlightSearchTerms(`${p.assunto} - ${p.status}`, query)
          }
        })));
      }

      // Alertas
      if (responses[1].status === 'fulfilled' && responses[1].value?.alertas) {
        allResults.push(...responses[1].value.alertas.map(a => ({
          id: a.id,
          type: 'alerta',
          title: `Alerta: ${a.titulo}`,
          description: `${a.mensagem} (Processo: ${a.processo?.numero || 'N/A'})`,
          link: `/alertas?viewAlertId=${a.id}`,
          highlight: {
            title: highlightSearchTerms(a.titulo, query),
            description: highlightSearchTerms(a.mensagem, query)
          }
        })));
      }

      // Usuários
      if (responses[2].status === 'fulfilled' && responses[2].value?.users) {
        allResults.push(...responses[2].value.users.map(u => ({
          id: u.id,
          type: 'usuario',
          title: `Usuário: ${u.nome}`,
          description: u.email,
          link: `/usuarios?viewUserId=${u.id}`,
          highlight: {
            title: highlightSearchTerms(u.nome, query),
            description: highlightSearchTerms(u.email, query)
          }
        })));
      }

      // Relatórios
      if (responses[3].status === 'fulfilled' && responses[3].value?.relatorios) {
        allResults.push(...responses[3].value.relatorios.map(r => ({
          id: r.id,
          type: 'relatorio',
          title: `Relatório: ${r.titulo}`,
          description: `${r.tipo} - ${r.status}`,
          link: `/relatorios?viewRelatorioId=${r.id}`,
          highlight: {
            title: highlightSearchTerms(r.titulo, query),
            description: highlightSearchTerms(`${r.tipo} - ${r.status}`, query)
          }
        })));
      }

      // Consultas
      if (responses[4].status === 'fulfilled' && responses[4].value?.consultas) {
        allResults.push(...responses[4].value.consultas.map(c => ({
          id: c.id,
          type: 'consulta',
          title: `Consulta: ${c.numero}`,
          description: `${c.tipo} - ${c.status}`,
          link: `/consultas?viewConsultaId=${c.id}`,
          highlight: {
            title: highlightSearchTerms(c.numero, query),
            description: highlightSearchTerms(`${c.tipo} - ${c.status}`, query)
          }
        })));
      }

      // Verificar novamente se foi cancelada antes de atualizar estado
      if (!signal.aborted) {
        setResults(allResults);
      }

      return allResults;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro na busca global:', error);
      }
      return [];
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Busca com debounce
  const searchWithDebounce = useCallback((query) => {
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Se query muito curta, limpar resultados
    if (!query || query.length < 2) {
      setResults([]);
      return Promise.resolve([]);
    }

    // Criar novo timeout
    searchTimeoutRef.current = setTimeout(() => {
      searchGlobal(query);
    }, 400); // Debounce de 400ms

    return Promise.resolve([]);
  }, [searchGlobal]);

  // Limpar resultados
  const clearResults = useCallback(() => {
    setResults([]);
    setIsLoading(false);
    
    // Limpar timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Cancelar requisição em andamento
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    results,
    isLoading,
    searchGlobal,
    searchWithSuggestions: searchWithDebounce, // Alias para compatibilidade
    clearResults,
  };
};