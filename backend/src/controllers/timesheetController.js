import Joi from 'joi';
import { Op } from 'sequelize';
import { Timesheet, Processo, User } from '../models/index.js';
import logger from '../config/logger.js';

// Schema de validação
const timesheetSchema = Joi.object({
  descricao: Joi.string().min(3).max(500).required(),
  tipo: Joi.string().valid(
    'audiencia',
    'peticao',
    'reuniao',
    'pesquisa',
    'deslocamento',
    'consulta_processo',
    'analise_documentos',
    'outros'
  ).optional(),
  dataInicio: Joi.date().required(),
  dataFim: Joi.date().optional().allow(null),
  duracao: Joi.number().integer().min(1).required(),
  valorHora: Joi.number().min(0).optional().allow(null),
  faturavel: Joi.boolean().optional(),
  faturado: Joi.boolean().optional(),
  dataFaturamento: Joi.date().optional().allow(null),
  observacoes: Joi.string().max(2000).optional().allow(''),
  processoId: Joi.number().integer().optional().allow(null)
});

/**
 * Listar timesheets
 */
export const listarTimesheets = async (req, res) => {
  try {
    const { 
      processoId,
      dataInicio,
      dataFim,
      tipo,
      faturavel,
      faturado,
      page = 1,
      limit = 50
    } = req.query;

    const whereClause = { userId: req.user.id };
    
    if (processoId) whereClause.processoId = processoId;
    if (tipo) whereClause.tipo = tipo;
    if (faturavel !== undefined) whereClause.faturavel = faturavel === 'true';
    if (faturado !== undefined) whereClause.faturado = faturado === 'true';
    
    if (dataInicio && dataFim) {
      whereClause.dataInicio = {
        [Op.between]: [new Date(dataInicio), new Date(dataFim)]
      };
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: timesheets } = await Timesheet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Processo,
          as: 'processo',
          attributes: ['id', 'numero', 'classe']
        }
      ],
      order: [['dataInicio', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      timesheets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar timesheets:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Criar timesheet
 */
export const criarTimesheet = async (req, res) => {
  try {
    const { error, value } = timesheetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Verificar se processo existe (se fornecido)
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

    const timesheet = await Timesheet.create({
      ...value,
      userId: req.user.id
    });

    const timesheetCompleto = await Timesheet.findByPk(timesheet.id, {
      include: [
        {
          model: Processo,
          as: 'processo',
          attributes: ['id', 'numero', 'classe']
        }
      ]
    });

    logger.info(`Timesheet criado: ${timesheet.id} por ${req.user.email}`);

    res.status(201).json(timesheetCompleto);
  } catch (error) {
    logger.error('Erro ao criar timesheet:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar timesheet
 */
export const atualizarTimesheet = async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await Timesheet.findOne({
      where: { 
        id, 
        userId: req.user.id 
      }
    });

    if (!timesheet) {
      return res.status(404).json({
        error: 'Registro de horas não encontrado'
      });
    }

    const { error, value } = timesheetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    await timesheet.update(value);

    const timesheetAtualizado = await Timesheet.findByPk(timesheet.id, {
      include: [
        {
          model: Processo,
          as: 'processo',
          attributes: ['id', 'numero', 'classe']
        }
      ]
    });

    res.json(timesheetAtualizado);
  } catch (error) {
    logger.error('Erro ao atualizar timesheet:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Remover timesheet
 */
export const removerTimesheet = async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await Timesheet.findOne({
      where: { 
        id, 
        userId: req.user.id 
      }
    });

    if (!timesheet) {
      return res.status(404).json({
        error: 'Registro de horas não encontrado'
      });
    }

    await timesheet.destroy();

    res.json({
      message: 'Registro removido com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao remover timesheet:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter estatísticas de horas
 */
export const obterEstatisticas = async (req, res) => {
  try {
    const { dataInicio, dataFim, processoId } = req.query;

    const whereClause = { userId: req.user.id };
    
    if (processoId) whereClause.processoId = processoId;
    
    if (dataInicio && dataFim) {
      whereClause.dataInicio = {
        [Op.between]: [new Date(dataInicio), new Date(dataFim)]
      };
    }

    const timesheets = await Timesheet.findAll({
      where: whereClause,
      attributes: [
        'tipo',
        'faturavel',
        'faturado',
        'duracao',
        'valorTotal'
      ]
    });

    // Calcular estatísticas
    const totalMinutos = timesheets.reduce((sum, t) => sum + t.duracao, 0);
    const totalHoras = (totalMinutos / 60).toFixed(2);
    
    const minutosFaturaveis = timesheets
      .filter(t => t.faturavel)
      .reduce((sum, t) => sum + t.duracao, 0);
    const horasFaturaveis = (minutosFaturaveis / 60).toFixed(2);
    
    const minutosFaturados = timesheets
      .filter(t => t.faturado)
      .reduce((sum, t) => sum + t.duracao, 0);
    const horasFaturadas = (minutosFaturados / 60).toFixed(2);
    
    const valorTotal = timesheets
      .reduce((sum, t) => sum + (parseFloat(t.valorTotal) || 0), 0)
      .toFixed(2);
    
    const valorFaturado = timesheets
      .filter(t => t.faturado)
      .reduce((sum, t) => sum + (parseFloat(t.valorTotal) || 0), 0)
      .toFixed(2);
    
    const valorPendente = (parseFloat(valorTotal) - parseFloat(valorFaturado)).toFixed(2);

    // Por tipo
    const porTipo = {};
    timesheets.forEach(t => {
      if (!porTipo[t.tipo]) {
        porTipo[t.tipo] = { minutos: 0, valor: 0 };
      }
      porTipo[t.tipo].minutos += t.duracao;
      porTipo[t.tipo].valor += parseFloat(t.valorTotal) || 0;
    });

    Object.keys(porTipo).forEach(tipo => {
      porTipo[tipo].horas = (porTipo[tipo].minutos / 60).toFixed(2);
      porTipo[tipo].valor = porTipo[tipo].valor.toFixed(2);
    });

    res.json({
      totalHoras: parseFloat(totalHoras),
      horasFaturaveis: parseFloat(horasFaturaveis),
      horasFaturadas: parseFloat(horasFaturadas),
      valorTotal: parseFloat(valorTotal),
      valorFaturado: parseFloat(valorFaturado),
      valorPendente: parseFloat(valorPendente),
      porTipo,
      totalRegistros: timesheets.length
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

