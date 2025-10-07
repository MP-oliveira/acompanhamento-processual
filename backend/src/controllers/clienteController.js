import Joi from 'joi';
import { Op } from 'sequelize';
import { Cliente, Processo, User } from '../models/index.js';
import logger from '../config/logger.js';

// Schema de validação
const clienteSchema = Joi.object({
  nome: Joi.string().min(3).max(200).required(),
  tipo: Joi.string().valid('fisica', 'juridica').required(),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional().allow(null, ''),
  cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional().allow(null, ''),
  rg: Joi.string().max(20).optional().allow(''),
  email: Joi.string().email().max(200).optional().allow(''),
  telefone: Joi.string().max(20).optional().allow(''),
  celular: Joi.string().max(20).optional().allow(''),
  endereco: Joi.string().max(300).optional().allow(''),
  numero: Joi.string().max(10).optional().allow(''),
  complemento: Joi.string().max(100).optional().allow(''),
  bairro: Joi.string().max(100).optional().allow(''),
  cidade: Joi.string().max(100).optional().allow(''),
  estado: Joi.string().length(2).uppercase().optional().allow(''),
  cep: Joi.string().pattern(/^\d{5}-\d{3}$/).optional().allow(''),
  profissao: Joi.string().max(100).optional().allow(''),
  estadoCivil: Joi.string().valid('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel').optional().allow(null),
  dataNascimento: Joi.date().optional().allow(null),
  observacoes: Joi.string().max(2000).optional().allow(''),
  ativo: Joi.boolean().optional()
});

/**
 * Listar clientes
 */
export const listarClientes = async (req, res) => {
  try {
    const { search, tipo, ativo = 'true', page = 1, limit = 50 } = req.query;

    const whereClause = { userId: req.user.id };
    
    if (tipo) whereClause.tipo = tipo;
    if (ativo !== 'todos') whereClause.ativo = ativo === 'true';
    
    if (search) {
      whereClause[Op.or] = [
        { nome: { [Op.iLike]: `%${search}%` } },
        { cpf: { [Op.iLike]: `%${search}%` } },
        { cnpj: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: clientes } = await Cliente.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Processo,
          as: 'processos',
          attributes: ['id', 'numero', 'classe', 'status']
        }
      ],
      order: [['nome', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      clientes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Buscar cliente por ID
 */
export const buscarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findOne({
      where: { 
        id, 
        userId: req.user.id 
      },
      include: [
        {
          model: Processo,
          as: 'processos',
          attributes: ['id', 'numero', 'classe', 'status', 'createdAt']
        }
      ]
    });

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    res.json(cliente);
  } catch (error) {
    logger.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Criar cliente
 */
export const criarCliente = async (req, res) => {
  try {
    const { error, value } = clienteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Verificar CPF/CNPJ duplicado
    if (value.cpf) {
      const existe = await Cliente.findOne({ where: { cpf: value.cpf } });
      if (existe) {
        return res.status(409).json({
          error: 'CPF já cadastrado'
        });
      }
    }

    if (value.cnpj) {
      const existe = await Cliente.findOne({ where: { cnpj: value.cnpj } });
      if (existe) {
        return res.status(409).json({
          error: 'CNPJ já cadastrado'
        });
      }
    }

    const cliente = await Cliente.create({
      ...value,
      userId: req.user.id
    });

    logger.info(`Cliente criado: ${cliente.nome} por ${req.user.email}`);

    res.status(201).json(cliente);
  } catch (error) {
    logger.error('Erro ao criar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar cliente
 */
export const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findOne({
      where: { 
        id, 
        userId: req.user.id 
      }
    });

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    const { error, value } = clienteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Verificar CPF/CNPJ duplicado
    if (value.cpf && value.cpf !== cliente.cpf) {
      const existe = await Cliente.findOne({ 
        where: { 
          cpf: value.cpf,
          id: { [Op.ne]: id }
        } 
      });
      if (existe) {
        return res.status(409).json({
          error: 'CPF já cadastrado'
        });
      }
    }

    if (value.cnpj && value.cnpj !== cliente.cnpj) {
      const existe = await Cliente.findOne({ 
        where: { 
          cnpj: value.cnpj,
          id: { [Op.ne]: id }
        } 
      });
      if (existe) {
        return res.status(409).json({
          error: 'CNPJ já cadastrado'
        });
      }
    }

    await cliente.update(value);

    res.json(cliente);
  } catch (error) {
    logger.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Remover cliente
 */
export const removerCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findOne({
      where: { 
        id, 
        userId: req.user.id 
      }
    });

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    await cliente.destroy();

    res.json({
      message: 'Cliente removido com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao remover cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter estatísticas de clientes
 */
export const obterEstatisticas = async (req, res) => {
  try {
    const [totalClientes, clientesAtivos, pessoasFisicas, pessoasJuridicas] = await Promise.all([
      Cliente.count({ where: { userId: req.user.id } }),
      Cliente.count({ where: { userId: req.user.id, ativo: true } }),
      Cliente.count({ where: { userId: req.user.id, tipo: 'fisica' } }),
      Cliente.count({ where: { userId: req.user.id, tipo: 'juridica' } })
    ]);

    res.json({
      totalClientes,
      clientesAtivos,
      clientesInativos: totalClientes - clientesAtivos,
      pessoasFisicas,
      pessoasJuridicas
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

