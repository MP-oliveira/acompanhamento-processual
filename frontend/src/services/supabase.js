// Supabase Client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Serviços específicos
export const supabaseService = {
  // Processos
  async getProcessos(userId) {
    const { data, error } = await supabase
      .from('processos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getProcessoById(id) {
    const { data, error } = await supabase
      .from('processos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createProcesso(processoData) {
    const { data, error } = await supabase
      .from('processos')
      .insert([processoData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProcesso(id, updateData) {
    const { data, error } = await supabase
      .from('processos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProcesso(id) {
    const { error } = await supabase
      .from('processos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Alertas
  async getAlertas(userId) {
    const { data, error } = await supabase
      .from('alertas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createAlerta(alertaData) {
    const { data, error } = await supabase
      .from('alertas')
      .insert([alertaData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async markAlertaAsRead(id) {
    const { data, error } = await supabase
      .from('alertas')
      .update({ lido: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Usuários
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Auth
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Listeners em tempo real
  subscribeToProcessos(callback, userId) {
    return supabase
      .channel('processos')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'processos',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  subscribeToAlertas(callback, userId) {
    return supabase
      .channel('alertas')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alertas',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};
