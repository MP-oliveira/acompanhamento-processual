#!/usr/bin/env node

/**
 * Script para configurar o Supabase
 * Execute: node scripts/setup-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

console.log('🚀 Configurando Supabase para JurisAcompanha...\n');

// Verificar se as variáveis de ambiente estão configuradas
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente faltando:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.log('\n📝 Configure as seguintes variáveis no Vercel:');
  console.log('   1. Acesse: https://vercel.com/dashboard');
  console.log('   2. Selecione o projeto');
  console.log('   3. Vá em Settings > Environment Variables');
  console.log('   4. Adicione as variáveis do Supabase\n');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupSupabase() {
  try {
    console.log('✅ Conectando ao Supabase...');
    
    // Testar conexão
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    
    // Verificar se as tabelas existem
    const tables = ['users', 'processos', 'alertas', 'relatorios', 'consultas'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`⚠️  Tabela ${table} não encontrada. Execute o SQL schema primeiro.`);
      } else {
        console.log(`✅ Tabela ${table} encontrada.`);
      }
    }
    
    // Verificar usuários
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Erro ao verificar usuários:', usersError.message);
    } else {
      console.log(`✅ ${users.length} usuários encontrados no banco.`);
      
      if (users.length === 0) {
        console.log('⚠️  Nenhum usuário encontrado. Execute o SQL schema para criar usuários padrão.');
      }
    }
    
    console.log('\n🎉 Configuração do Supabase concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Execute o SQL schema no Supabase Dashboard');
    console.log('   2. Configure as variáveis no Vercel');
    console.log('   3. Faça deploy do backend');
    
  } catch (error) {
    console.error('❌ Erro durante configuração:', error.message);
    process.exit(1);
  }
}

setupSupabase();
