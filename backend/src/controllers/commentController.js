import Joi from 'joi';
import { Comment, User, Processo } from '../models/index.js';
import logger from '../config/logger.js';

// Schema de validação
const commentSchema = Joi.object({
  texto: Joi.string().min(1).max(5000).required().messages({
    'string.min': 'Comentário não pode estar vazio',
    'string.max': 'Comentário muito longo (máximo 5000 caracteres)',
    'any.required': 'Texto do comentário é obrigatório'
  })
});

/**
 * Lista comentários de um processo
 */
export const listarComentarios = async (req, res) => {
  try {
    const { processoId } = req.params;

    // Verifica se o processo existe e pertence ao usuário
    const processo = await Processo.findOne({
      where: { id: processoId, userId: req.user.id }
    });

    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    const comments = await Comment.findAll({
      where: { processoId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'nome', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ comments });
  } catch (error) {
    logger.error('Erro ao listar comentários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Cria um novo comentário
 */
export const criarComentario = async (req, res) => {
  try {
    const { processoId } = req.params;

    // Verifica se o processo existe e pertence ao usuário
    const processo = await Processo.findOne({
      where: { id: processoId, userId: req.user.id }
    });

    if (!processo) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }

    // Valida dados
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => ({ field: d.path[0], message: d.message }))
      });
    }

    // Cria comentário
    const comment = await Comment.create({
      processoId,
      userId: req.user.id,
      texto: value.texto
    });

    // Retorna com dados do usuário
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'nome', 'email'] }]
    });

    logger.info(`Comentário criado no processo ${processoId} por ${req.user.email}`);

    res.status(201).json({
      message: 'Comentário criado com sucesso',
      comment: commentWithUser
    });
  } catch (error) {
    logger.error('Erro ao criar comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um comentário
 */
export const atualizarComentario = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    // Apenas o dono pode editar
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão para editar este comentário' });
    }

    // Valida dados
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => ({ field: d.path[0], message: d.message }))
      });
    }

    // Atualiza
    await comment.update({
      texto: value.texto,
      edited: true
    });

    const updatedComment = await Comment.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'nome', 'email'] }]
    });

    logger.info(`Comentário ${id} atualizado por ${req.user.email}`);

    res.json({
      message: 'Comentário atualizado com sucesso',
      comment: updatedComment
    });
  } catch (error) {
    logger.error('Erro ao atualizar comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Deleta um comentário
 */
export const deletarComentario = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    // Apenas o dono ou admin pode deletar
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para deletar este comentário' });
    }

    await comment.destroy();

    logger.info(`Comentário ${id} deletado por ${req.user.email}`);

    res.json({ message: 'Comentário deletado com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

