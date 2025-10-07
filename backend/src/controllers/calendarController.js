import Joi from 'joi';
import { Op } from 'sequelize';
import { CalendarEvent, Processo, User } from '../models/index.js';
import logger from '../config/logger.js';

// Schema de validação
const eventSchema = Joi.object({
  titulo: Joi.string().min(3).max(200).required(),
  descricao: Joi.string().max(2000).optional().allow(''),
  tipo: Joi.string().valid('audiencia', 'prazo_recurso', 'prazo_embargos', 'reuniao', 'outro').optional(),
  dataInicio: Joi.date().required(),
  dataFim: Joi.date().optional().allow(null),
  diaInteiro: Joi.boolean().optional(),
  local: Joi.string().max(300).optional().allow(''),
  status: Joi.string().valid('pendente', 'concluido', 'cancelado').optional(),
  prioridade: Joi.string().valid('baixa', 'media', 'alta', 'urgente').optional(),
  cor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().allow(null),
  lembrete: Joi.boolean().optional(),
  lembreteAntecedencia: Joi.number().integer().min(0).optional(),
  observacoes: Joi.string().max(2000).optional().allow(''),
  processoId: Joi.number().integer().optional().allow(null)
});

/**
 * Listar eventos do calendário
 */
export const listarEventos = async (req, res) => {
  try {
    const { 
      dataInicio, 
      dataFim, 
      tipo, 
      status, 
      processoId 
    } = req.query;

    const whereClause = { userId: req.user.id };

    // Filtros
    if (tipo) whereClause.tipo = tipo;
    if (status) whereClause.status = status;
    if (processoId) whereClause.processoId = processoId;

    // Filtro de data
    if (dataInicio && dataFim) {
      whereClause.dataInicio = {
        [Op.between]: [new Date(dataInicio), new Date(dataFim)]
      };
    } else if (dataInicio) {
      whereClause.dataInicio = {
        [Op.gte]: new Date(dataInicio)
      };
    } else if (dataFim) {
      whereClause.dataInicio = {
        [Op.lte]: new Date(dataFim)
      };
    }

    const eventos = await CalendarEvent.findAll({
      where: whereClause,
      include: [
        {
          model: Processo,
          as: 'processo',
          attributes: ['id', 'numero', 'classe', 'status']
        }
      ],
      order: [['dataInicio', 'ASC']]
    });

    res.json(eventos);
  } catch (error) {
    logger.error('Erro ao listar eventos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar evento por ID
 */
export const buscarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await CalendarEvent.findOne({
      where: { 
        id, 
        userId: req.user.id 
      },
      include: [
        {
          model: Processo,
          as: 'processo',
          attributes: ['id', 'numero', 'classe', 'status']
        }
      ]
    });

    if (!evento) {
      return res.status(404).json({
        error: 'Evento não encontrado'
      });
    }

    res.json(evento);
  } catch (error) {
    logger.error('Erro ao buscar evento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Criar evento
 */
export const criarEvento = async (req, res) => {
  try {
    // Validação
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Verificar se o processo existe (se fornecido)
    if (value.processoId) {
      const processo = await Processo.findOne({
        where: { 
          id: value.processoId,
          userId: req.user.id 
        }
      });

      if (!processo) {
        return res.status(404).json({
          error: 'Processo não encontrado'
        });
      }
    }

    // Criar evento
    const evento = await CalendarEvent.create({
      ...value,
      userId: req.user.id
    });

    // Buscar evento criado com associações
    const eventoCompleto = await CalendarEvent.findByPk(evento.id, {
      include: [
        {
          model: Processo,
          as: 'processo',
          attributes: ['id', 'numero', 'classe', 'status']
        }
      ]
    });

    logger.info(`Evento criado: ${evento.titulo} por ${req.user.email}`);

    res.status(201).json(eventoCompleto);
  } catch (error) {
    logger.error('Erro ao criar evento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar evento
 */
export const atualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar evento
    const evento = await CalendarEvent.findOne({
      where: { 
        id, 
        userId: req.user.id 
      }
    });

    if (!evento) {
      return res.status(404).json({
        error: 'Evento não encontrado'
      });
    }

    // Validação
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Verificar se o processo existe (se fornecido)
    if (value.processoId && value.processoId !== evento.processoId) {
      const processo = await Processo.findOne({
        where: { 
          id: value.processoId,
          userId: req.user.id 
        }
      });

      if (!processo) {
        return res.status(404).json({
          error: 'Processo não encontrado'
        });
      }
    }

    // Atualizar evento
    await evento.update(value);

    // Buscar evento atualizado com associações
    const eventoAtualizado = await CalendarEvent.findByPk(evento.id, {
      include: [
        {
          model: Processo,
          as: 'processo',
          attributes: ['id', 'numero', 'classe', 'status']
        }
      ]
    });

    logger.info(`Evento atualizado: ${evento.titulo} por ${req.user.email}`);

    res.json(eventoAtualizado);
  } catch (error) {
    logger.error('Erro ao atualizar evento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Remover evento
 */
export const removerEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await CalendarEvent.findOne({
      where: { 
        id, 
        userId: req.user.id 
      }
    });

    if (!evento) {
      return res.status(404).json({
        error: 'Evento não encontrado'
      });
    }

    await evento.destroy();

    logger.info(`Evento removido: ${evento.titulo} por ${req.user.email}`);

    res.json({
      message: 'Evento removido com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao remover evento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Sincronizar eventos com prazos dos processos
 */
export const sincronizarEventos = async (req, res) => {
  try {
    const processos = await Processo.findAll({
      where: { userId: req.user.id }
    });

    let eventosCriados = 0;

    for (const processo of processos) {
      // Audiência
      if (processo.proximaAudiencia) {
        const eventoExiste = await CalendarEvent.findOne({
          where: {
            processoId: processo.id,
            tipo: 'audiencia',
            dataInicio: processo.proximaAudiencia
          }
        });

        if (!eventoExiste) {
          await CalendarEvent.create({
            titulo: `Audiência - ${processo.numero}`,
            descricao: `Audiência do processo ${processo.classe}`,
            tipo: 'audiencia',
            dataInicio: processo.proximaAudiencia,
            diaInteiro: true,
            processoId: processo.id,
            userId: req.user.id,
            prioridade: 'alta',
            cor: '#4A90E2'
          });
          eventosCriados++;
        }
      }

      // Prazo de recurso
      if (processo.prazoRecurso) {
        const eventoExiste = await CalendarEvent.findOne({
          where: {
            processoId: processo.id,
            tipo: 'prazo_recurso',
            dataInicio: processo.prazoRecurso
          }
        });

        if (!eventoExiste) {
          await CalendarEvent.create({
            titulo: `Prazo de Recurso - ${processo.numero}`,
            descricao: `Prazo para interpor recurso no processo ${processo.classe}`,
            tipo: 'prazo_recurso',
            dataInicio: processo.prazoRecurso,
            diaInteiro: true,
            processoId: processo.id,
            userId: req.user.id,
            prioridade: 'urgente',
            cor: '#E74C3C'
          });
          eventosCriados++;
        }
      }

      // Prazo de embargos
      if (processo.prazoEmbargos) {
        const eventoExiste = await CalendarEvent.findOne({
          where: {
            processoId: processo.id,
            tipo: 'prazo_embargos',
            dataInicio: processo.prazoEmbargos
          }
        });

        if (!eventoExiste) {
          await CalendarEvent.create({
            titulo: `Prazo de Embargos - ${processo.numero}`,
            descricao: `Prazo para embargos de declaração no processo ${processo.classe}`,
            tipo: 'prazo_embargos',
            dataInicio: processo.prazoEmbargos,
            diaInteiro: true,
            processoId: processo.id,
            userId: req.user.id,
            prioridade: 'alta',
            cor: '#F39C12'
          });
          eventosCriados++;
        }
      }
    }

    logger.info(`Sincronização concluída: ${eventosCriados} eventos criados para ${req.user.email}`);

    res.json({
      message: 'Sincronização concluída com sucesso',
      eventosCriados
    });
  } catch (error) {
    logger.error('Erro ao sincronizar eventos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter estatísticas do calendário
 */
export const obterEstatisticas = async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const proximos7Dias = new Date(hoje);
    proximos7Dias.setDate(proximos7Dias.getDate() + 7);

    const proximos30Dias = new Date(hoje);
    proximos30Dias.setDate(proximos30Dias.getDate() + 30);

    const [
      totalEventos,
      eventosHoje,
      eventosProximos7Dias,
      eventosProximos30Dias,
      eventosPendentes,
      eventosUrgentes
    ] = await Promise.all([
      CalendarEvent.count({
        where: { userId: req.user.id }
      }),
      CalendarEvent.count({
        where: {
          userId: req.user.id,
          dataInicio: {
            [Op.gte]: hoje,
            [Op.lt]: new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }),
      CalendarEvent.count({
        where: {
          userId: req.user.id,
          dataInicio: {
            [Op.between]: [hoje, proximos7Dias]
          }
        }
      }),
      CalendarEvent.count({
        where: {
          userId: req.user.id,
          dataInicio: {
            [Op.between]: [hoje, proximos30Dias]
          }
        }
      }),
      CalendarEvent.count({
        where: {
          userId: req.user.id,
          status: 'pendente'
        }
      }),
      CalendarEvent.count({
        where: {
          userId: req.user.id,
          prioridade: 'urgente',
          status: 'pendente'
        }
      })
    ]);

    res.json({
      totalEventos,
      eventosHoje,
      eventosProximos7Dias,
      eventosProximos30Dias,
      eventosPendentes,
      eventosUrgentes
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

