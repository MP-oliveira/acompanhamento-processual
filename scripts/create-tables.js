#!/usr/bin/env node

/**
 * Script para criar tabelas no Supabase
 * Execute: node scripts/create-tables.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Criando tabelas no Supabase...\n');

// Verificar se as variáveis de ambiente estão configuradas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente faltando:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.log('\n📝 Configure as variáveis primeiro no Vercel Dashboard\n');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  try {
    console.log('✅ Conectando ao Supabase...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL (Supabase não suporta execução direta via API)
    console.log('⚠️  IMPORTANTE: Execute o SQL manualmente no Supabase Dashboard');
    console.log('📁 Arquivo SQL:', sqlPath);
    console.log('\n📋 Passos:');
    console.log('   1. Acesse: https://supabase.com/dashboard');
    console.log('   2. Selecione o projeto: JurisAcompanha');
    console.log('   3. Vá em: SQL Editor');
    console.log('   4. Cole o conteúdo do arquivo supabase-schema.sql');
    console.log('   5. Clique em "Run"');
    
    // Testar conexão
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('\n⚠️  Tabelas ainda não foram criadas.');
      console.log('   Execute o SQL no Dashboard primeiro.');
    } else {
      console.log('\n✅ Conexão com Supabase funcionando!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createTables();
