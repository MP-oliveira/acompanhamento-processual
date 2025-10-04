/**
 * Serviço de Chatbot - Processa comandos e retorna respostas
 */

import { processoService } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Processa a mensagem do usuário e retorna resposta do bot
 */
export const processarMensagem = async (mensagem, processos = []) => {
  const msg = mensagem.toLowerCase().trim();
  
  try {
    // Comandos de ajuda
    if (msg.includes('ajuda') || msg === '?' || msg === 'help') {
      return {
        tipo: 'ajuda',
        texto: `Posso te ajudar com:

• "quantos processos ativos?" - Estatísticas
• "buscar processo 123" - Buscar processo
• "próximas audiências" - Audiências futuras
• "processos urgentes" - Processos com prazos próximos
• "criar novo processo" - Abrir formulário
• "resumo" - Visão geral do sistema

Digite um comando ou me pergunte algo!`,
        sugestoes: ['Quantos processos ativos?', 'Próximas audiências', 'Processos urgentes', 'Resumo']
      };
    }

    // Buscar processo
    if (msg.includes('buscar processo') || msg.includes('encontrar processo') || msg.includes('processo numero')) {
      const numero = msg.replace(/buscar|encontrar|processo|numero/gi, '').trim();
      if (numero) {
        const processo = processos.find(p => p.numero?.includes(numero));
        if (processo) {
          return {
            tipo: 'processo',
            texto: `Encontrei o processo ${processo.numero}

Classe: ${processo.classe}
Status: ${processo.status}
Tribunal: ${processo.tribunal || 'Não informado'}

Deseja abrir este processo?`,
            dados: processo,
            acoes: [
              { texto: 'Abrir Processo', acao: 'abrir_processo', id: processo.id },
              { texto: 'Ver Timeline', acao: 'timeline', id: processo.id }
            ]
          };
        } else {
          return {
            tipo: 'erro',
            texto: `Não encontrei nenhum processo com o número "${numero}".

Tente buscar com outro número ou veja todos os processos.`,
            sugestoes: ['Ver todos processos', 'Criar novo processo']
          };
        }
      }
    }

    // Estatísticas de processos
    if (msg.includes('quantos processo') || msg.includes('estatistica') || msg.includes('resumo')) {
      const ativos = processos.filter(p => p.status === 'ativo').length;
      const suspensos = processos.filter(p => p.status === 'suspenso').length;
      const arquivados = processos.filter(p => p.status === 'arquivado').length;
      const total = processos.length;

      return {
        tipo: 'estatistica',
        texto: `Resumo dos Processos

Total: ${total} processos
Ativos: ${ativos}
Suspensos: ${suspensos}
Arquivados: ${arquivados}

${ativos > 0 ? `Você tem ${ativos} processo${ativos > 1 ? 's' : ''} em andamento.` : 'Nenhum processo ativo no momento.'}`,
        sugestoes: ['Ver processos ativos', 'Próximas audiências', 'Criar novo processo']
      };
    }

    // Próximas audiências
    if (msg.includes('proxima audiencia') || msg.includes('audiencia') || msg.includes('próxima')) {
      const hoje = new Date();
      const processosComAudiencia = processos
        .filter(p => p.proximaAudiencia && new Date(p.proximaAudiencia) > hoje)
        .sort((a, b) => new Date(a.proximaAudiencia) - new Date(b.proximaAudiencia))
        .slice(0, 5);

      if (processosComAudiencia.length > 0) {
        const lista = processosComAudiencia.map(p => {
          const data = format(new Date(p.proximaAudiencia), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
          return `• ${p.numero} - ${data}`;
        }).join('\n');

        return {
          tipo: 'audiencias',
          texto: `Próximas Audiências

${lista}

${processosComAudiencia.length === 5 ? '\nMostrando apenas as 5 próximas' : ''}`,
          sugestoes: ['Ver calendário', 'Ver todos processos']
        };
      } else {
        return {
          tipo: 'info',
          texto: `Nenhuma audiência agendada no momento.

Deseja ver o calendário completo?`,
          sugestoes: ['Abrir calendário', 'Ver processos']
        };
      }
    }

    // Processos urgentes
    if (msg.includes('urgente') || msg.includes('prazo') || msg.includes('alerta')) {
      const hoje = new Date();
      const processosUrgentes = processos.filter(p => {
        if (p.prazoRecurso) {
          const prazo = new Date(p.prazoRecurso);
          const diff = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
          return diff <= 7 && diff >= 0;
        }
        return false;
      });

      if (processosUrgentes.length > 0) {
        const lista = processosUrgentes.map(p => {
          const prazo = new Date(p.prazoRecurso);
          const diff = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
          return `• ${p.numero} - ${diff} dia${diff > 1 ? 's' : ''} restante${diff > 1 ? 's' : ''}`;
        }).join('\n');

        return {
          tipo: 'alerta',
          texto: `Processos Urgentes

${lista}

Atenção aos prazos!`,
          sugestoes: ['Ver alertas', 'Abrir processos']
        };
      } else {
        return {
          tipo: 'info',
          texto: `Nenhum processo urgente no momento.

Todos os prazos estão sob controle!`,
          sugestoes: ['Ver todos processos', 'Ver calendário']
        };
      }
    }

    // Criar novo processo
    if (msg.includes('criar') || msg.includes('novo processo') || msg.includes('cadastrar')) {
      return {
        tipo: 'acao',
        texto: `Criar Novo Processo

Vou te redirecionar para o formulário de cadastro de processo.

Deseja continuar?`,
        acoes: [
          { texto: 'Sim, criar processo', acao: 'novo_processo' },
          { texto: 'Usar template', acao: 'template' }
        ]
      };
    }

    // Ver processos
    if (msg.includes('ver processo') || msg.includes('listar') || msg.includes('todos')) {
      return {
        tipo: 'acao',
        texto: `Ver Processos

Você tem ${processos.length} processo${processos.length > 1 ? 's' : ''} cadastrado${processos.length > 1 ? 's' : ''}.

Como deseja visualizar?`,
        sugestoes: ['Lista de processos', 'Kanban Board', 'Calendário']
      };
    }

    // Saudações
    if (msg.includes('oi') || msg.includes('olá') || msg.includes('ola') || msg.includes('hello') || msg.includes('hi')) {
      const hora = new Date().getHours();
      const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
      
      return {
        tipo: 'saudacao',
        texto: `${saudacao}! Como posso ajudar você hoje?

Digite "ajuda" para ver os comandos disponíveis.`,
        sugestoes: ['Ajuda', 'Resumo', 'Próximas audiências']
      };
    }

    // Resposta padrão para mensagens não reconhecidas
    return {
      tipo: 'default',
      texto: `Desculpe, não entendi sua pergunta.

Digite "ajuda" para ver o que posso fazer por você.`,
      sugestoes: ['Ajuda', 'Resumo', 'Buscar processo']
    };

  } catch (error) {
    console.error('Erro no chatbot:', error);
    return {
      tipo: 'erro',
      texto: `Ops! Ocorreu um erro ao processar sua mensagem.

Por favor, tente novamente.`,
      sugestoes: ['Ajuda']
    };
  }
};

/**
 * Obtém mensagens de boas-vindas
 */
export const getMensagemBoasVindas = () => {
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  
  return {
    tipo: 'boas-vindas',
    texto: `${saudacao}! Sou seu assistente virtual.

Como posso ajudar você hoje?`,
    sugestoes: ['Ajuda', 'Resumo', 'Próximas audiências', 'Criar processo']
  };
};

/**
 * Salva histórico de conversa no localStorage
 */
export const salvarHistorico = (mensagens) => {
  try {
    localStorage.setItem('chatbot_historico', JSON.stringify(mensagens.slice(-50))); // Últimas 50 mensagens
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
  }
};

/**
 * Carrega histórico de conversa do localStorage
 */
export const carregarHistorico = () => {
  try {
    const historico = localStorage.getItem('chatbot_historico');
    return historico ? JSON.parse(historico) : [];
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    return [];
  }
};

/**
 * Limpa histórico de conversa
 */
export const limparHistorico = () => {
  try {
    localStorage.removeItem('chatbot_historico');
  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
  }
};

