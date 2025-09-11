#!/usr/bin/env node

// Script para configurar automaticamente o Supabase
// Execute: node scripts/setup-supabase.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configurações do Supabase (substitua pelas suas)
const SUPABASE_URL = 'https://hdjqsxwkmsyhiczmhwca.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkanFzeHdrbXN5aGljem1od2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNTY2MSwiZXhwIjoyMDczMTkxNjYxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Substitua pela sua service key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do Supabase...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(process.cwd(), 'supabase-schema-exato.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: command 
        });
        
        if (error) {
          console.warn(`⚠️  Aviso no comando ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      }
    }
    
    console.log('🎉 Configuração concluída!');
    console.log('📋 Próximos passos:');
    console.log('1. Verifique as tabelas no Supabase Dashboard');
    console.log('2. Teste o login com admin@teste.com / 123456');
    console.log('3. Configure as variáveis de ambiente no backend');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
    console.log('\n🔧 Alternativa: Execute manualmente o SQL no Supabase Dashboard');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
