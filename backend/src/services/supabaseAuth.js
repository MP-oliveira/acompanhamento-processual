import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const supabaseAuth = {
  async login(email, password) {
    try {
      // Usar auth.signInWithPassword do Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no login Supabase:', error);
      throw error;
    }
  },

  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Usa maybeSingle() em vez de single()

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        throw error;
      }

      // Se não encontrou usuário, retorna null
      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },

  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // Usa maybeSingle() em vez de single()

      if (error) {
        console.error('Erro ao buscar usuário por email:', error);
        throw error;
      }

      // Se não encontrou usuário, retorna null
      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }
};

export default supabaseAuth;
