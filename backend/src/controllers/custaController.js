import Joi from 'joi';
import { Custa, Processo, User } from '../models/index.js';
import logger from '../config/logger.js';
import { Op } from 'sequelize';

const custaSchema = Joi.object({
  tipo: Joi.string().valid(
    'custas_judiciais',
    'honorarios_contratuais',
    'honorarios_sucumbenciais',
    'despesas_processuais',
    'honorarios_periciais',
    'emolumentos',
    'outros'
  ).required(),
  descricao: Joi.string().min(3).max(500).required(),
  valor: Joi.number().positive().required(),
  responsavel: Joi.string().valid('cliente', 'escritorio', 'sucumbente', 'outro').default('cliente'),
  status: Joi.string().valid('pendente', 'pago', 'reembolsado', 'cancelado').default('pendente'),
  dataVencimento: Joi.date().allow(null),
  dataPagamento: Joi.date().allow(null),
  formaPagamento: Joi.string().max(100).allow(null, ''),
  comprovante: Joi.string().max(500).allow(null, ''),
  observacoes: Joi.string().allow(null, '')
});

/**
 * Listar custas de um processo
 */
export const listarCustas = async (req, res) => {
  try {
    const { processoId } = req.params;

    const processo = await Processo.findByPk(processoId);
    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    const custas = await Custa.findAll({
      where: { processoId },
      include: [
        { model: User, as: 'registrador', attributes: ['id', 'nome', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calcular totais
    const totais = {
      geral: 0,
      pendente: 0,
      pago: 0,
      porTipo: {}
    };

    custas.forEach(custa => {
      const valor = parseFloat(custa.valor);
      totais.geral += valor;
      
      if (custa.status === 'pendente') totais.pendente += valor;
      if (custa.status === 'pago') totais.pago += valor;
      
      if (!totais.porTipo[custa.tipo]) totais.porTipo[custa.tipo] = 0;
      totais.porTipo[custa.tipo] += valor;
    });

    res.json({ custas, totais });
  } catch (error) {
    logger.error('Erro ao listar custas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Criar nova custa
 */
export const criarCusta = async (req, res) => {
  try {
    const { processoId } = req.params;
    const { error, value } = custaSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.details });
    }

    const processo = await Processo.findByPk(processoId);
    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    const custa = await Custa.create({
      processoId,
      registradoPor: req.user.id,
      ...value
    });

    const custaCompleta = await Custa.findByPk(custa.id, {
      include: [
        { model: User, as: 'registrador', attributes: ['id', 'nome', 'email'] }
      ]
    });

    logger.info(`Custa criada no processo ${processoId} por ${req.user.email}`);
    res.status(201).json({ message: 'Custa registrada com sucesso', custa: custaCompleta });
  } catch (error) {
    logger.error('Erro ao criar custa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar custa
 */
export const atualizarCusta = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = custaSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.details });
    }

    const custa = await Custa.findByPk(id);
    if (!custa) {
      return res.status(404).json({ error: 'Custa não encontrada' });
    }

    await custa.update(value);

    const custaAtualizada = await Custa.findByPk(id, {
      include: [
        { model: User, as: 'registrador', attributes: ['id', 'nome', 'email'] }
      ]
    });

    logger.info(`Custa ${id} atualizada por ${req.user.email}`);
    res.json({ message: 'Custa atualizada com sucesso', custa: custaAtualizada });
  } catch (error) {
    logger.error('Erro ao atualizar custa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Deletar custa
 */
export const deletarCusta = async (req, res) => {
  try {
    const { id } = req.params;

    const custa = await Custa.findByPk(id);
    if (!custa) {
      return res.status(404).json({ error: 'Custa não encontrada' });
    }

    await custa.destroy();

    logger.info(`Custa ${id} deletada por ${req.user.email}`);
    res.json({ message: 'Custa excluída com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar custa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Obter estatísticas financeiras gerais
 */
export const obterEstatisticas = async (req, res) => {
  try {
    const custas = await Custa.findAll({
      include: [
        { model: Processo, as: 'processo', attributes: ['numero', 'classe', 'status'] }
      ]
    });

    const estatisticas = {
      totalGeral: 0,
      totalPendente: 0,
      totalPago: 0,
      porTipo: {},
      porResponsavel: {},
      porStatus: {},
      custasVencidas: 0
    };

    const hoje = new Date();

    custas.forEach(custa => {
      const valor = parseFloat(custa.valor);
      
      estatisticas.totalGeral += valor;
      
      // Por status
      if (!estatisticas.porStatus[custa.status]) estatisticas.porStatus[custa.status] = 0;
      estatisticas.porStatus[custa.status] += valor;
      
      if (custa.status === 'pendente') estatisticas.totalPendente += valor;
      if (custa.status === 'pago') estatisticas.totalPago += valor;
      
      // Por tipo
      if (!estatisticas.porTipo[custa.tipo]) estatisticas.porTipo[custa.tipo] = 0;
      estatisticas.porTipo[custa.tipo] += valor;
      
      // Por responsável
      if (!estatisticas.porResponsavel[custa.responsavel]) estatisticas.porResponsavel[custa.responsavel] = 0;
      estatisticas.porResponsavel[custa.responsavel] += valor;
      
      // Custas vencidas
      if (custa.status === 'pendente' && custa.dataVencimento && new Date(custa.dataVencimento) < hoje) {
        estatisticas.custasVencidas += valor;
      }
    });

    res.json(estatisticas);
  } catch (error) {
    logger.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

