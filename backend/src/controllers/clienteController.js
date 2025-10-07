import Joi from 'joi';
import { Op } from 'sequelize';
import { Cliente, Processo, User } from '../models/index.js';
import logger from '../config/logger.js';

// Schema de validação simplificado
const clienteSchema = Joi.object({
  nome: Joi.string().min(2).max(200).required(),
  tipo: Joi.string().valid('fisica', 'juridica').default('fisica'),
  cpf: Joi.string().optional().allow('', null),
  cnpj: Joi.string().optional().allow('', null),
  rg: Joi.string().optional().allow('', null),
  email: Joi.string().email().optional().allow('', null),
  telefone: Joi.string().optional().allow('', null),
  celular: Joi.string().optional().allow('', null),
  endereco: Joi.string().optional().allow('', null),
  numero: Joi.string().optional().allow('', null),
  complemento: Joi.string().optional().allow('', null),
  bairro: Joi.string().optional().allow('', null),
  cidade: Joi.string().optional().allow('', null),
  estado: Joi.string().optional().allow('', null),
  cep: Joi.string().optional().allow('', null),
  profissao: Joi.string().optional().allow('', null),
  estadoCivil: Joi.string().optional().allow('', null),
  dataNascimento: Joi.string().optional().allow('', null),
  observacoes: Joi.string().optional().allow('', null),
  ativo: Joi.boolean().default(true)
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
      }
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

    // Verificar CPF/CNPJ duplicado (apenas se não estiver vazio)
    if (value.cpf && value.cpf.trim() !== '') {
      const existe = await Cliente.findOne({ where: { cpf: value.cpf } });
      if (existe) {
        return res.status(409).json({
          error: 'CPF já cadastrado'
        });
      }
    }

    if (value.cnpj && value.cnpj.trim() !== '') {
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

    // Verificar CPF/CNPJ duplicado (apenas se não estiver vazio)
    if (value.cpf && value.cpf.trim() !== '' && value.cpf !== cliente.cpf) {
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

    if (value.cnpj && value.cnpj.trim() !== '' && value.cnpj !== cliente.cnpj) {
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

