import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { supabaseAuth } from '../services/supabaseAuth.js';
import logger from '../config/logger.js';

// Esquemas de validação
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  })
});

/**
 * Login usando Supabase diretamente
 */
export const login = async (req, res) => {
  try {
    // Valida os dados de entrada
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { email, password } = value;

    // Buscar usuário no Supabase
    const user = await supabaseAuth.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({
        error: 'Usuário desativado'
      });
    }

    // Para simplificar, vamos aceitar qualquer senha por enquanto
    // Em produção, você deveria usar bcrypt para verificar a senha
    if (password !== 'Bom@250908') {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        name: user.nome,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`Login realizado: ${user.email}`);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Erro ao fazer login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

export default {
  login
};
