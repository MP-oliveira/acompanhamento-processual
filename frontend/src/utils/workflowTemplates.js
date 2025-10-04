/**
 * Templates pré-definidos de workflows para automação
 */

export const WORKFLOW_TEMPLATES = [
  {
    id: 'novo-processo-atribuir',
    nome: 'Novo Processo → Atribuir Advogado',
    descricao: 'Quando criar novo processo, atribuir automaticamente a um advogado',
    trigger: {
      tipo: 'processo_criado',
      condicoes: []
    },
    acoes: [
      {
        tipo: 'atribuir_usuario',
        parametros: {
          metodo: 'round_robin' // ou 'menor_carga', 'especifico'
        }
      },
      {
        tipo: 'enviar_notificacao',
        parametros: {
          destinatario: 'advogado_atribuido',
          mensagem: 'Novo processo atribuído a você'
        }
      }
    ]
  },
  {
    id: 'prazo-7dias-alerta',
    nome: 'Prazo em 7 dias → Alerta',
    descricao: 'Criar alerta quando prazo estiver próximo (7 dias)',
    trigger: {
      tipo: 'prazo_proximo',
      condicoes: [
        { campo: 'dias_restantes', operador: '<=', valor: 7 }
      ]
    },
    acoes: [
      {
        tipo: 'criar_alerta',
        parametros: {
          tipo: 'prazo_urgente',
          mensagem: 'Prazo em {dias} dias'
        }
      },
      {
        tipo: 'enviar_email',
        parametros: {
          destinatario: 'advogado_responsavel',
          assunto: 'Prazo urgente: {numero_processo}',
          template: 'prazo_urgente'
        }
      }
    ]
  },
  {
    id: 'status-arquivado-notificar',
    nome: 'Status → Arquivado',
    descricao: 'Quando processo for arquivado, notificar cliente e equipe',
    trigger: {
      tipo: 'status_alterado',
      condicoes: [
        { campo: 'status_novo', operador: '==', valor: 'arquivado' }
      ]
    },
    acoes: [
      {
        tipo: 'enviar_notificacao',
        parametros: {
          destinatario: 'equipe',
          mensagem: 'Processo {numero} foi arquivado'
        }
      },
      {
        tipo: 'criar_comentario',
        parametros: {
          texto: 'Processo arquivado automaticamente pelo sistema'
        }
      }
    ]
  },
  {
    id: 'audiencia-lembrete',
    nome: 'Audiência → Lembrete 1 dia antes',
    descricao: 'Enviar lembrete 1 dia antes de cada audiência',
    trigger: {
      tipo: 'audiencia_proxima',
      condicoes: [
        { campo: 'horas_restantes', operador: '<=', valor: 24 }
      ]
    },
    acoes: [
      {
        tipo: 'enviar_notificacao',
        parametros: {
          destinatario: 'advogado_responsavel',
          mensagem: 'Lembrete: Audiência amanhã às {hora}'
        }
      },
      {
        tipo: 'enviar_email',
        parametros: {
          destinatario: 'advogado_responsavel',
          assunto: 'Lembrete: Audiência amanhã',
          template: 'lembrete_audiencia'
        }
      }
    ]
  },
  {
    id: 'processo-urgente-escalacao',
    nome: 'Processo Urgente → Escalar para Sócio',
    descricao: 'Processos urgentes são automaticamente notificados ao sócio',
    trigger: {
      tipo: 'processo_criado',
      condicoes: [
        { campo: 'prazo_dias', operador: '<=', valor: 3 }
      ]
    },
    acoes: [
      {
        tipo: 'enviar_notificacao',
        parametros: {
          destinatario: 'socios',
          mensagem: 'Processo urgente criado: {numero}'
        }
      },
      {
        tipo: 'adicionar_tag',
        parametros: {
          tag: 'URGENTE'
        }
      }
    ]
  }
];

/**
 * Tipos de triggers disponíveis
 */
export const TRIGGER_TYPES = {
  processo_criado: {
    nome: 'Processo Criado',
    descricao: 'Quando um novo processo é cadastrado',
    campos: ['status', 'tribunal', 'classe', 'prazo_dias']
  },
  status_alterado: {
    nome: 'Status Alterado',
    descricao: 'Quando o status de um processo muda',
    campos: ['status_anterior', 'status_novo']
  },
  prazo_proximo: {
    nome: 'Prazo Próximo',
    descricao: 'Quando um prazo está próximo de vencer',
    campos: ['dias_restantes', 'tipo_prazo']
  },
  audiencia_proxima: {
    nome: 'Audiência Próxima',
    descricao: 'Quando uma audiência está próxima',
    campos: ['horas_restantes', 'dias_restantes']
  },
  comentario_adicionado: {
    nome: 'Comentário Adicionado',
    descricao: 'Quando alguém comenta em um processo',
    campos: ['usuario', 'mencoes']
  }
};

/**
 * Tipos de ações disponíveis
 */
export const ACTION_TYPES = {
  atribuir_usuario: {
    nome: 'Atribuir a Advogado',
    descricao: 'Atribui o processo a um advogado',
    parametros: ['metodo', 'usuario_id']
  },
  enviar_notificacao: {
    nome: 'Enviar Notificação',
    descricao: 'Envia notificação push',
    parametros: ['destinatario', 'mensagem']
  },
  enviar_email: {
    nome: 'Enviar Email',
    descricao: 'Envia email personalizado',
    parametros: ['destinatario', 'assunto', 'template']
  },
  criar_alerta: {
    nome: 'Criar Alerta',
    descricao: 'Cria um novo alerta no sistema',
    parametros: ['tipo', 'mensagem']
  },
  adicionar_tag: {
    nome: 'Adicionar Tag',
    descricao: 'Adiciona uma tag ao processo',
    parametros: ['tag']
  },
  criar_comentario: {
    nome: 'Criar Comentário',
    descricao: 'Adiciona um comentário automático',
    parametros: ['texto']
  },
  alterar_status: {
    nome: 'Alterar Status',
    descricao: 'Muda o status do processo',
    parametros: ['status']
  }
};

/**
 * Operadores de condição
 */
export const OPERATORS = {
  '==': 'Igual a',
  '!=': 'Diferente de',
  '>': 'Maior que',
  '>=': 'Maior ou igual a',
  '<': 'Menor que',
  '<=': 'Menor ou igual a',
  'contains': 'Contém',
  'not_contains': 'Não contém'
};

/**
 * Executa um workflow
 */
export const executarWorkflow = async (workflow, processo, contexto = {}) => {
  console.log('Executando workflow:', workflow.nome, 'para processo:', processo.numero);
  
  try {
    // Verificar condições do trigger
    const condicoesAtendidas = verificarCondicoes(workflow.trigger.condicoes, processo);
    
    if (!condicoesAtendidas) {
      console.log('Condições do workflow não foram atendidas');
      return { sucesso: false, motivo: 'Condições não atendidas' };
    }
    
    // Executar ações em sequência
    const resultados = [];
    for (const acao of workflow.acoes) {
      const resultado = await executarAcao(acao, processo, contexto);
      resultados.push(resultado);
    }
    
    return { sucesso: true, resultados };
  } catch (error) {
    console.error('Erro ao executar workflow:', error);
    return { sucesso: false, erro: error.message };
  }
};

/**
 * Verifica se as condições são atendidas
 */
const verificarCondicoes = (condicoes, processo) => {
  if (!condicoes || condicoes.length === 0) return true;
  
  return condicoes.every(condicao => {
    const valor = processo[condicao.campo];
    const valorEsperado = condicao.valor;
    
    switch (condicao.operador) {
      case '==':
        return valor === valorEsperado;
      case '!=':
        return valor !== valorEsperado;
      case '>':
        return valor > valorEsperado;
      case '>=':
        return valor >= valorEsperado;
      case '<':
        return valor < valorEsperado;
      case '<=':
        return valor <= valorEsperado;
      case 'contains':
        return String(valor).toLowerCase().includes(String(valorEsperado).toLowerCase());
      case 'not_contains':
        return !String(valor).toLowerCase().includes(String(valorEsperado).toLowerCase());
      default:
        return false;
    }
  });
};

/**
 * Executa uma ação individual
 */
const executarAcao = async (acao, processo, contexto) => {
  console.log('Executando ação:', acao.tipo);
  
  // Aqui você integraria com as APIs reais
  // Por enquanto, apenas log
  
  switch (acao.tipo) {
    case 'enviar_notificacao':
      console.log('📢 Notificação enviada:', acao.parametros.mensagem);
      return { tipo: 'notificacao', sucesso: true };
      
    case 'enviar_email':
      console.log('📧 Email enviado para:', acao.parametros.destinatario);
      return { tipo: 'email', sucesso: true };
      
    case 'criar_alerta':
      console.log('⚠️ Alerta criado:', acao.parametros.tipo);
      return { tipo: 'alerta', sucesso: true };
      
    case 'adicionar_tag':
      console.log('🏷️ Tag adicionada:', acao.parametros.tag);
      return { tipo: 'tag', sucesso: true };
      
    case 'criar_comentario':
      console.log('💬 Comentário criado:', acao.parametros.texto);
      return { tipo: 'comentario', sucesso: true };
      
    case 'atribuir_usuario':
      console.log('👤 Usuário atribuído:', acao.parametros.metodo);
      return { tipo: 'atribuicao', sucesso: true };
      
    case 'alterar_status':
      console.log('🔄 Status alterado para:', acao.parametros.status);
      return { tipo: 'status', sucesso: true };
      
    default:
      console.log('❌ Ação desconhecida:', acao.tipo);
      return { tipo: 'desconhecido', sucesso: false };
  }
};

