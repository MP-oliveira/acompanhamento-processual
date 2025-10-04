import Joi from 'joi';
import { Documento, Processo, User } from '../models/index.js';
import logger from '../config/logger.js';

const documentoSchema = Joi.object({
  nome: Joi.string().min(3).max(255).required(),
  tipo: Joi.string().valid(
    'peticao',
    'procuracao',
    'sentenca',
    'despacho',
    'comprovante',
    'contrato',
    'certidao',
    'outros'
  ).required(),
  url: Joi.string().max(500).required(),
  caminho: Joi.string().max(500).required(),
  tamanho: Joi.number().integer().min(0).allow(null),
  mimeType: Joi.string().max(100).allow(null),
  descricao: Joi.string().allow(null, '')
});

/**
 * Listar documentos de um processo
 */
export const listarDocumentos = async (req, res) => {
  try {
    const { processoId } = req.params;

    const processo = await Processo.findByPk(processoId);
    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    const documentos = await Documento.findAll({
      where: { processoId },
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'nome', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ documentos });
  } catch (error) {
    logger.error('Erro ao listar documentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Criar novo documento
 */
export const criarDocumento = async (req, res) => {
  try {
    const { processoId } = req.params;
    const { error, value } = documentoSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.details });
    }

    const processo = await Processo.findByPk(processoId);
    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    const documento = await Documento.create({
      processoId,
      uploadPor: req.user.id,
      ...value
    });

    const documentoCompleto = await Documento.findByPk(documento.id, {
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'nome', 'email'] }
      ]
    });

    logger.info(`Documento ${value.nome} adicionado ao processo ${processoId} por ${req.user.email}`);
    res.status(201).json({ message: 'Documento adicionado com sucesso', documento: documentoCompleto });
  } catch (error) {
    logger.error('Erro ao criar documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Deletar documento
 */
export const deletarDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findByPk(id);
    if (!documento) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Retornar o caminho para o frontend excluir do storage
    const caminho = documento.caminho;

    await documento.destroy();

    logger.info(`Documento ${id} deletado por ${req.user.email}`);
    res.json({ message: 'Documento excluído com sucesso', caminho });
  } catch (error) {
    logger.error('Erro ao deletar documento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

