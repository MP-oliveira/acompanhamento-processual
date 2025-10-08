import Joi from 'joi';
import { Op } from 'sequelize';
import { Processo, User, Alert } from '../models/index.js';
import { calcularPrazoRecurso, calcularPrazoEmbargos } from '../utils/date.js';
import alertScheduler from '../services/alertScheduler.js';
import logger from '../config/logger.js';

// Esquemas de validação
const processoSchema = Joi.object({
  numero: Joi.string().min(10).max(50).required().messages({
    'string.min': 'Número do processo deve ter pelo menos 10 caracteres',
    'string.max': 'Número do processo deve ter no máximo 50 caracteres',
    'any.required': 'Número do processo é obrigatório'
  }),
  classe: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Classe deve ter pelo menos 2 caracteres',
    'string.max': 'Classe deve ter no máximo 100 caracteres',
    'any.required': 'Classe é obrigatória'
  }),
  assunto: Joi.string().max(500).optional().allow(''),
  tribunal: Joi.string().max(100).optional().allow(''),
  comarca: Joi.string().max(100).optional().allow(''),
  status: Joi.string().valid('ativo', 'arquivado', 'suspenso').optional(),
  dataDistribuicao: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.allow(null, '')
  ).optional(),
  dataSentenca: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.allow(null, '')
  ).optional(),
  prazoRecurso: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.allow(null, '')
  ).optional(),
  prazoEmbargos: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.allow(null, '')
  ).optional(),
  proximaAudiencia: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.allow(null, '')
  ).optional(),
  horaAudiencia: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow(null, '').optional().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM'
  }),
  observacoes: Joi.string().max(1000).optional().allow('')
});

// Schema para atualização (campos opcionais) - permite desconhecidos
const processoUpdateSchema = Joi.object({
  numero: Joi.string().min(10).max(50).optional().messages({
    'string.min': 'Número do processo deve ter pelo menos 10 caracteres',
    'string.max': 'Número do processo deve ter no máximo 50 caracteres'
  }),
  classe: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Classe deve ter pelo menos 2 caracteres',
    'string.max': 'Classe deve ter no máximo 100 caracteres'
  }),
  assunto: Joi.string().max(500).optional().allow(''),
  tribunal: Joi.string().max(100).optional().allow(''),
  comarca: Joi.string().max(100).optional().allow(''),
  status: Joi.string().valid('ativo', 'arquivado', 'suspenso').optional(),
  dataDistribuicao: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.allow(null, '')
  ).optional(),
  dataSentenca: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.allow(null, '')
  ).optional(),
  prazoRecurso: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.allow(null, '')
  ).optional(),
  prazoEmbargos: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.allow(null, '')
  ).optional(),
  proximaAudiencia: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().isoDate(),
    Joi.allow(null, '')
  ).optional(),
  horaAudiencia: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow(null, '').optional().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM'
  }),
  observacoes: Joi.string().max(1000).optional().allow('')
}).unknown(true);

/**
 * Lista todos os processos do usuário
 */
export const listarProcessos = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (status && status !== 'todos') {
      whereClause.status = status;
    }

    if (search) {
      whereClause[Op.or] = [
        { numero: { [Op.iLike]: `%${search}%` } },
        { classe: { [Op.iLike]: `%${search}%` } },
        { assunto: { [Op.iLike]: `%${search}%` } },
        { tribunal: { [Op.iLike]: `%${search}%` } },
        { comarca: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: processos } = await Processo.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { 
          model: Alert, 
          as: 'alertas',
          where: { lido: false },
          required: false
        }
      ]
    });

    res.json({
      processos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar processos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Busca um processo específico
 */
export const buscarProcesso = async (req, res) => {
  try {
    const { id } = req.params;

    const processo = await Processo.findOne({
      where: { 
        id, 
        userId: req.user.id 
      },
      include: [
        { model: Alert, as: 'alertas' },
        { model: User, as: 'user', attributes: ['id', 'nome', 'email'] }
      ]
    });

    if (!processo) {
      return res.status(404).json({
        error: 'Processo não encontrado'
      });
    }

    res.json({ processo });
  } catch (error) {
    logger.error('Erro ao buscar processo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Cria um novo processo
 */
export const criarProcesso = async (req, res) => {
  try {
    // Valida os dados de entrada
    const { error, value } = processoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Verifica se o número do processo já existe
    const processoExistente = await Processo.findOne({
      where: { numero: value.numero }
    });
    if (processoExistente) {
      return res.status(409).json({
        error: 'Número do processo já cadastrado'
      });
    }

    // Converter strings vazias em null para campos de data
    const cleanValue = { ...value };
    ['dataDistribuicao', 'dataSentenca', 'prazoRecurso', 'prazoEmbargos', 'proximaAudiencia', 'horaAudiencia'].forEach(field => {
      if (cleanValue[field] === '') {
        cleanValue[field] = null;
      }
    });

    // Se foi informada uma sentença mas não os prazos, calcula automaticamente
    if (cleanValue.dataSentenca && !cleanValue.prazoRecurso && !cleanValue.prazoEmbargos) {
      cleanValue.prazoRecurso = calcularPrazoRecurso(cleanValue.dataSentenca);
      cleanValue.prazoEmbargos = calcularPrazoEmbargos(cleanValue.dataSentenca);
    }

    // Cria o processo
    const processo = await Processo.create({
      ...cleanValue,
      userId: req.user.id
    });

    // Se foi informada uma sentença, agenda os alertas
    if (cleanValue.dataSentenca) {
      await alertScheduler.agendarAlertasSentenca(processo);
    }

    // Se foi informada uma data de distribuição, agenda os alertas
    if (cleanValue.dataDistribuicao) {
      await alertScheduler.agendarAlertasDistribuicao(processo);
    }

    logger.info(`Processo criado: ${processo.numero} por ${req.user.email}`);

    res.status(201).json({
      message: 'Processo criado com sucesso',
      processo
    });
  } catch (error) {
    logger.error('Erro ao criar processo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualiza um processo
 */
export const atualizarProcesso = async (req, res) => {
  try {
    const { id } = req.params;

    // Busca o processo
    const processo = await Processo.findOne({
      where: { 
        id, 
        userId: req.user.id 
      }
    });

    if (!processo) {
      return res.status(404).json({
        error: 'Processo não encontrado'
      });
    }

    // Valida os dados de entrada usando schema de atualização
    const { error, value } = processoUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Verifica se o número do processo já existe (exceto para o processo atual)
    if (value.numero && value.numero !== processo.numero) {
      const processoExistente = await Processo.findOne({
        where: { 
          numero: value.numero,
          id: { [Op.ne]: id }
        }
      });
      if (processoExistente) {
        return res.status(409).json({
          error: 'Número do processo já cadastrado'
        });
      }
    }

    // Converter strings vazias em null para campos de data
    const cleanValue = { ...value };
    ['dataDistribuicao', 'dataSentenca', 'prazoRecurso', 'prazoEmbargos', 'proximaAudiencia', 'horaAudiencia'].forEach(field => {
      if (cleanValue[field] === '') {
        cleanValue[field] = null;
      }
    });

    // Atualiza o processo
    await processo.update(cleanValue);

    // Se foi informada uma sentença, recalcula os prazos
    if (value.dataSentenca) {
      await alertScheduler.agendarAlertasSentenca(processo);
    }

    logger.info(`Processo atualizado: ${processo.numero} por ${req.user.email}`);

    res.json({
      message: 'Processo atualizado com sucesso',
      processo
    });
  } catch (error) {
    logger.error('Erro ao atualizar processo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Remove um processo
 */
export const removerProcesso = async (req, res) => {
  try {
    const { id } = req.params;

    const processo = await Processo.findOne({
      where: { 
        id, 
        userId: req.user.id 
      }
    });

    if (!processo) {
      return res.status(404).json({
        error: 'Processo não encontrado'
      });
    }

    // Remove os alertas associados
    await Alert.destroy({
      where: { processoId: id }
    });

    // Remove o processo
    await processo.destroy();

    logger.info(`Processo removido: ${processo.numero} por ${req.user.email}`);

    res.json({
      message: 'Processo removido com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao remover processo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualiza o status de um processo
 */
export const atualizarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ativo', 'arquivado', 'suspenso'].includes(status)) {
      return res.status(400).json({
        error: 'Status inválido'
      });
    }

    const processo = await Processo.findOne({
      where: { 
        id, 
        userId: req.user.id 
      }
    });

    if (!processo) {
      return res.status(404).json({
        error: 'Processo não encontrado'
      });
    }

    await processo.update({ status });

    logger.info(`Status do processo ${processo.numero} alterado para ${status} por ${req.user.email}`);

    res.json({
      message: 'Status atualizado com sucesso',
      processo
    });
  } catch (error) {
    logger.error('Erro ao atualizar status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};
