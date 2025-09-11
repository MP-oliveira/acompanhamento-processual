#!/usr/bin/env node

// Script para criar tabelas no Supabase automaticamente
// Execute: node scripts/create-tables.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const SUPABASE_URL = 'https://hdjqsxwkmsyhiczmhwca.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkanFzeHdrbXN5aGljem1od2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNTY2MSwiZXhwIjoyMDczMTkxNjYxfQ.75a10J1amBxrvCDzt2YWubrv3IYyr9Hh9BklOcXOqo4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTables() {
  try {
    console.log('🚀 Criando tabelas no Supabase...');
    
    // SQL simplificado para criar as tabelas
    const sql = `
      -- Criar tabela users
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar tabela processos
      CREATE TABLE IF NOT EXISTS processos (
        id SERIAL PRIMARY KEY,
        numero VARCHAR(50) UNIQUE NOT NULL,
        classe VARCHAR(100) NOT NULL,
        assunto TEXT,
        tribunal VARCHAR(100),
        comarca VARCHAR(100),
        status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado', 'suspenso')),
        data_distribuicao TIMESTAMP,
        data_sentenca TIMESTAMP,
        prazo_recurso TIMESTAMP,
        prazo_embargos TIMESTAMP,
        proxima_audiencia TIMESTAMP,
        observacoes TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar tabela alerts
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('audiencia', 'prazo_recurso', 'prazo_embargos', 'despacho', 'distribuicao')),
        titulo VARCHAR(200) NOT NULL,
        mensagem TEXT NOT NULL,
        data_vencimento TIMESTAMP NOT NULL,
        data_notificacao TIMESTAMP NOT NULL,
        lido BOOLEAN DEFAULT false,
        prioridade VARCHAR(10) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        processo_id INTEGER NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar índices
      CREATE INDEX IF NOT EXISTS idx_processos_user_id ON processos(user_id);
      CREATE INDEX IF NOT EXISTS idx_processos_numero ON processos(numero);
      CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
      CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_processo_id ON alerts(processo_id);

      -- Inserir usuário admin padrão
      INSERT INTO users (nome, email, password, role, ativo) 
      VALUES ('Administrador', 'admin@teste.com', '123456', 'admin', true)
      ON CONFLICT (email) DO NOTHING;
    `;
    
    // Executar SQL usando a função rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Erro ao criar tabelas:', error);
      
      // Tentar método alternativo
      console.log('🔄 Tentando método alternativo...');
      await createTablesManually();
    } else {
      console.log('✅ Tabelas criadas com sucesso!');
      console.log('📋 Próximos passos:');
      console.log('1. Verifique as tabelas no Supabase Dashboard');
      console.log('2. Teste o login com admin@teste.com / 123456');
    }
    
  } catch (error) {
    console.error('❌ Erro na criação:', error.message);
    console.log('\n🔧 Execute manualmente o SQL no Supabase Dashboard');
  }
}

async function createTablesManually() {
  console.log('📝 Execute este SQL no Supabase Dashboard > SQL Editor:');
  console.log('==========================================');
  
  const sqlPath = path.join(process.cwd(), 'supabase-tabelas-simples.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(sql);
  console.log('==========================================');
}

// Executar
createTables();
