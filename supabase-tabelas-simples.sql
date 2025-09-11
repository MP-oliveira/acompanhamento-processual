-- ========================================
-- SCHEMA SIMPLES - APENAS TABELAS
-- ========================================
-- Use este se quiser criar apenas as tabelas sem RLS

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
