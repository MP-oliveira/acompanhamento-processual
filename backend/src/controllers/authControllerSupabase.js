import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { supabase } from '../services/supabaseAuth.js';
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

    // Fazer login usando Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      logger.error('Erro de autenticação Supabase:', authError.message);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!authData || !authData.user || !authData.session) {
      return res.status(401).json({ error: 'Falha na autenticação: dados incompletos' });
    }

    // Buscar dados completos do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      logger.warn('Usuário não encontrado na tabela users, usando dados do auth:', userError.message);
    }

    // Usar dados do auth como fallback se não encontrar na tabela users
    const user = userData || {
      id: authData.user.id,
      nome: authData.user.user_metadata?.nome || authData.user.email,
      email: authData.user.email,
      role: authData.user.user_metadata?.role || 'user',
      ativo: true
    };

    // Verificar se usuário está ativo
    if (user.ativo === false) {
      return res.status(401).json({
        error: 'Usuário desativado'
      });
    }

    // Gerar JWT customizado com base nos dados do Supabase
    const token = jwt.sign(
      {
        userId: user.id,
        name: user.nome,
        role: user.role,
        email: user.email,
        supabaseAccessToken: authData.session.access_token
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`Usuário logado via Supabase: ${user.email}`);

    res.json({
      message: 'Login bem-sucedido',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Erro ao fazer login com Supabase:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export default {
  login
};
