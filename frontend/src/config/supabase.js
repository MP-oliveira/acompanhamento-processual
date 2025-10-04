import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variáveis de ambiente do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configurações do Storage
export const STORAGE_BUCKET = 'documentos-processuais';

/**
 * Faz upload de um arquivo para o Supabase Storage
 */
export const uploadArquivo = async (arquivo, processoId, tipo = 'outros') => {
  try {
    const extensao = arquivo.name.split('.').pop();
    const timestamp = Date.now();
    const nomeArquivo = `${processoId}/${tipo}/${timestamp}.${extensao}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(nomeArquivo, arquivo, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(nomeArquivo);

    return {
      caminho: nomeArquivo,
      url: urlData.publicUrl,
      tamanho: arquivo.size,
      tipo: arquivo.type,
      nome: arquivo.name
    };
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
};

/**
 * Remove um arquivo do Supabase Storage
 */
export const removerArquivo = async (caminho) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([caminho]);

    if (error) throw error;

    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao remover arquivo:', error);
    throw error;
  }
};

/**
 * Obtém URL assinada (privada) com expiração
 */
export const obterUrlAssinada = async (caminho, expiracaoSegundos = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(caminho, expiracaoSegundos);

    if (error) throw error;

    return data.signedUrl;
  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error);
    throw error;
  }
};

