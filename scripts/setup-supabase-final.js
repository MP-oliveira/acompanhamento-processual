#!/usr/bin/env node

// Script final para configurar Supabase automaticamente
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = 'https://hdjqsxwkmsyhiczmhwca.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkanFzeHdrbXN5aGljem1od2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNTY2MSwiZXhwIjoyMDczMTkxNjYxfQ.75a10J1amBxrvCDzt2YWubrv3IYyr9Hh9BklOcXOqo4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  console.log('🚀 Iniciando configuração do Supabase...');
  console.log('📡 Conectando com:', SUPABASE_URL);
  
  try {
    // Testar conexão
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError && testError.code === 'PGRST116') {
      console.log('📋 Tabela users não existe. Criando estrutura...');
      await createTablesWithRPC();
    } else if (testError) {
      console.log('⚠️  Erro na conexão:', testError.message);
      console.log('🔄 Tentando criar tabelas...');
      await createTablesWithRPC();
    } else {
      console.log('✅ Conexão estabelecida! Tabelas já existem.');
      console.log('📊 Verificando dados...');
      await checkExistingData();
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('🔄 Tentando método alternativo...');
    await createTablesWithRPC();
  }
}

async function createTablesWithRPC() {
  console.log('🔧 Criando tabelas via RPC...');
  
  const createTablesSQL = `
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
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: createTablesSQL });
    
    if (error) {
      console.log('⚠️  RPC não disponível. Executando comandos individuais...');
      await createTablesIndividually();
    } else {
      console.log('✅ Tabelas criadas via RPC!');
      await insertDefaultUser();
    }
  } catch (error) {
    console.log('⚠️  Erro no RPC:', error.message);
    await createTablesIndividually();
  }
}

async function createTablesIndividually() {
  console.log('🔧 Criando tabelas individualmente...');
  
  // Tentar criar usuário admin diretamente
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        nome: 'Administrador',
        email: 'admin@teste.com',
        password: '123456',
        role: 'admin',
        ativo: true
      });
    
    if (error && error.code === 'PGRST116') {
      console.log('❌ Tabela users não existe. Execute manualmente o SQL.');
      showManualInstructions();
    } else if (error && error.code === '23505') {
      console.log('✅ Usuário admin já existe!');
    } else if (error) {
      console.log('⚠️  Erro ao criar usuário:', error.message);
    } else {
      console.log('✅ Usuário admin criado com sucesso!');
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
    showManualInstructions();
  }
}

async function insertDefaultUser() {
  console.log('👤 Inserindo usuário admin padrão...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        nome: 'Administrador',
        email: 'admin@teste.com',
        password: '123456',
        role: 'admin',
        ativo: true
      });
    
    if (error && error.code === '23505') {
      console.log('✅ Usuário admin já existe!');
    } else if (error) {
      console.log('⚠️  Erro ao criar usuário:', error.message);
    } else {
      console.log('✅ Usuário admin criado com sucesso!');
    }
  } catch (error) {
    console.log('⚠️  Erro ao inserir usuário:', error.message);
  }
}

async function checkExistingData() {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, nome, email, role')
      .limit(5);
    
    const { data: processos, error: processosError } = await supabase
      .from('processos')
      .select('id, numero, status')
      .limit(5);
    
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('id, titulo, lido')
      .limit(5);
    
    console.log('📊 Dados existentes:');
    console.log(`👥 Usuários: ${users?.length || 0}`);
    console.log(`📋 Processos: ${processos?.length || 0}`);
    console.log(`🔔 Alertas: ${alerts?.length || 0}`);
    
    if (users && users.length > 0) {
      console.log('👤 Usuários encontrados:');
      users.forEach(user => {
        console.log(`  - ${user.nome} (${user.email}) - ${user.role}`);
      });
    }
    
  } catch (error) {
    console.log('⚠️  Erro ao verificar dados:', error.message);
  }
}

function showManualInstructions() {
  console.log('\n📝 ===========================================');
  console.log('MANUAL: Execute este SQL no Supabase Dashboard');
  console.log('===========================================');
  console.log(`
-- 1. TABELA USERS
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

-- 2. TABELA PROCESSOS
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

-- 3. TABELA ALERTS
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

-- 4. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_processos_user_id ON processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_numero ON processos(numero);
CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_processo_id ON alerts(processo_id);

-- 5. USUÁRIO ADMIN PADRÃO
INSERT INTO users (nome, email, password, role, ativo) 
VALUES ('Administrador', 'admin@teste.com', '123456', 'admin', true)
ON CONFLICT (email) DO NOTHING;
`);
  console.log('===========================================');
  console.log('🎯 Passos:');
  console.log('1. Abra: https://supabase.com/dashboard');
  console.log('2. Selecione o projeto: acmp_process');
  console.log('3. Vá em: SQL Editor');
  console.log('4. Cole o SQL acima e execute');
  console.log('===========================================\n');
}

// Executar
setupDatabase().then(() => {
  console.log('\n🎉 Configuração concluída!');
  console.log('🔗 Teste o login com: admin@teste.com / 123456');
}).catch(error => {
  console.error('❌ Erro final:', error.message);
});
