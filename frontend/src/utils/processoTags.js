/**
 * Utilitário para gerar tags automáticas baseadas nos dados do processo
 */

export const generateProcessoTags = (processo) => {
  const tags = [];

  // Tag de Tribunal
  if (processo.tribunal) {
    tags.push({
      id: `tribunal-${processo.tribunal}`,
      label: processo.tribunal,
      color: 'primary',
      type: 'tribunal'
    });
  }

  // Tag de Prazo Urgente (próximo de vencer)
  if (processo.prazoRecurso || processo.prazoEmbargos) {
    const prazo = processo.prazoRecurso || processo.prazoEmbargos;
    const diasRestantes = Math.ceil((new Date(prazo) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes >= 0 && diasRestantes <= 5) {
      tags.push({
        id: 'prazo-urgente',
        label: `${diasRestantes}d restantes`,
        color: 'error',
        type: 'urgencia'
      });
    } else if (diasRestantes > 5 && diasRestantes <= 15) {
      tags.push({
        id: 'prazo-atencao',
        label: `${diasRestantes}d restantes`,
        color: 'warning',
        type: 'urgencia'
      });
    }
  }

  // Tag de Audiência Próxima
  if (processo.proximaAudiencia) {
    const diasAteAudiencia = Math.ceil((new Date(processo.proximaAudiencia) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (diasAteAudiencia >= 0 && diasAteAudiencia <= 7) {
      tags.push({
        id: 'audiencia-proxima',
        label: diasAteAudiencia === 0 ? 'Hoje' : diasAteAudiencia === 1 ? 'Amanhã' : `${diasAteAudiencia}d`,
        color: diasAteAudiencia <= 3 ? 'error' : 'warning',
        type: 'audiencia'
      });
    }
  }

  // Tag de Tipo de Ação (baseado na classe)
  if (processo.classe) {
    const tipoAcao = processo.classe.toLowerCase();
    
    if (tipoAcao.includes('trabalhista')) {
      tags.push({
        id: 'tipo-trabalhista',
        label: 'Trabalhista',
        color: 'purple',
        type: 'tipo'
      });
    } else if (tipoAcao.includes('cível') || tipoAcao.includes('civil')) {
      tags.push({
        id: 'tipo-civil',
        label: 'Cível',
        color: 'info',
        type: 'tipo'
      });
    } else if (tipoAcao.includes('criminal') || tipoAcao.includes('penal')) {
      tags.push({
        id: 'tipo-criminal',
        label: 'Criminal',
        color: 'orange',
        type: 'tipo'
      });
    } else if (tipoAcao.includes('família') || tipoAcao.includes('familia')) {
      tags.push({
        id: 'tipo-familia',
        label: 'Família',
        color: 'pink',
        type: 'tipo'
      });
    }
  }

  // Tag de Status
  const statusConfig = {
    'ativo': { label: 'Ativo', color: 'success' },
    'suspenso': { label: 'Suspenso', color: 'warning' },
    'arquivado': { label: 'Arquivado', color: 'default' }
  };

  if (processo.status && statusConfig[processo.status]) {
    tags.push({
      id: `status-${processo.status}`,
      label: statusConfig[processo.status].label,
      color: statusConfig[processo.status].color,
      type: 'status'
    });
  }

  return tags;
};

/**
 * Filtra processos por tags
 */
export const filterProcessosByTags = (processos, selectedTags) => {
  if (!selectedTags || selectedTags.length === 0) {
    return processos;
  }

  return processos.filter(processo => {
    const processoTags = generateProcessoTags(processo);
    return selectedTags.some(selectedTag => 
      processoTags.some(tag => tag.id === selectedTag)
    );
  });
};

/**
 * Conta processos por tag
 */
export const countProcessosByTag = (processos) => {
  const tagCounts = {};

  processos.forEach(processo => {
    const tags = generateProcessoTags(processo);
    tags.forEach(tag => {
      if (!tagCounts[tag.id]) {
        tagCounts[tag.id] = {
          tag,
          count: 0
        };
      }
      tagCounts[tag.id].count++;
    });
  });

  return Object.values(tagCounts);
};

