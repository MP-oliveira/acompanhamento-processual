-- ========================================
-- SCHEMA SUPABASE - EXATAMENTE IGUAL AO BANCO ATUAL
-- ========================================
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- ========================================
-- 1. TABELA USERS (exatamente igual)
-- ========================================
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

-- ========================================
-- 2. TABELA PROCESSOS (exatamente igual)
-- ========================================
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

-- ========================================
-- 3. TABELA ALERTS (exatamente igual)
-- ========================================
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

-- ========================================
-- 4. ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_processos_user_id ON processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_numero ON processos(numero);
CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
CREATE INDEX IF NOT EXISTS idx_processos_data_distribuicao ON processos(data_distribuicao);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_processo_id ON alerts(processo_id);
CREATE INDEX IF NOT EXISTS idx_alerts_tipo ON alerts(tipo);
CREATE INDEX IF NOT EXISTS idx_alerts_lido ON alerts(lido);
CREATE INDEX IF NOT EXISTS idx_alerts_prioridade ON alerts(prioridade);
CREATE INDEX IF NOT EXISTS idx_alerts_data_vencimento ON alerts(data_vencimento);

-- ========================================
-- 5. FUNÇÃO PARA HASH DE SENHA (bcrypt)
-- ========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para hash de senha (similar ao bcrypt)
CREATE OR REPLACE FUNCTION hash_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Em produção, use bcrypt. Aqui usamos crypt como alternativa
  NEW.password = crypt(NEW.password, gen_salt('bf'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. TRIGGERS PARA HASH DE SENHA
-- ========================================
CREATE TRIGGER hash_user_password
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION hash_password();

-- ========================================
-- 7. FUNÇÃO PARA UPDATED_AT AUTOMÁTICO
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. TRIGGERS PARA UPDATED_AT
-- ========================================
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processos_updated_at 
  BEFORE UPDATE ON processos
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at 
  BEFORE UPDATE ON alerts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 10. POLÍTICAS DE SEGURANÇA
-- ========================================

-- Políticas para USERS
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para PROCESSOS
CREATE POLICY "Users can view own processes" ON processos
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own processes" ON processos
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own processes" ON processos
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own processes" ON processos
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Políticas para ALERTS
CREATE POLICY "Users can view own alerts" ON alerts
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own alerts" ON alerts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own alerts" ON alerts
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own alerts" ON alerts
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- ========================================
-- 11. DADOS INICIAIS (ADMIN)
-- ========================================
-- Inserir usuário admin padrão
INSERT INTO users (nome, email, password, role, ativo) 
VALUES (
  'Administrador', 
  'admin@teste.com', 
  '123456', -- Será hasheado automaticamente
  'admin', 
  true
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 12. COMENTÁRIOS DAS TABELAS
-- ========================================
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE processos IS 'Tabela de processos judiciais';
COMMENT ON TABLE alerts IS 'Tabela de alertas e notificações';

COMMENT ON COLUMN users.role IS 'Papel do usuário: admin ou user';
COMMENT ON COLUMN processos.status IS 'Status do processo: ativo, arquivado ou suspenso';
COMMENT ON COLUMN alerts.tipo IS 'Tipo do alerta: audiencia, prazo_recurso, prazo_embargos, despacho, distribuicao';
COMMENT ON COLUMN alerts.prioridade IS 'Prioridade do alerta: baixa, media, alta ou urgente';
