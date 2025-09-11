-- Schema do Supabase para Juris Acompanhamento
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de processos
CREATE TABLE IF NOT EXISTS processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  numero VARCHAR(50) NOT NULL,
  classe VARCHAR(100) NOT NULL,
  assunto TEXT,
  tribunal VARCHAR(100),
  comarca VARCHAR(100),
  status VARCHAR(50) DEFAULT 'ativo',
  data_distribuicao DATE,
  data_sentenca DATE,
  prazo_recurso DATE,
  prazo_embargos DATE,
  proxima_audiencia DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de alertas
CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  processo_id UUID REFERENCES processos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  lido BOOLEAN DEFAULT false,
  data_vencimento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_processos_user_id ON processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
CREATE INDEX IF NOT EXISTS idx_processos_data_distribuicao ON processos(data_distribuicao);
CREATE INDEX IF NOT EXISTS idx_alertas_user_id ON alertas(user_id);
CREATE INDEX IF NOT EXISTS idx_alertas_lido ON alertas(lido);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas(tipo);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para usuários
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas de segurança para processos
CREATE POLICY "Users can view own processes" ON processos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processes" ON processos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own processes" ON processos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own processes" ON processos
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para alertas
CREATE POLICY "Users can view own alerts" ON alertas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON alertas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON alertas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON alertas
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processos_updated_at BEFORE UPDATE ON processos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
