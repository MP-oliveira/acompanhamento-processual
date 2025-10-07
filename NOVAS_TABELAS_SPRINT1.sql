-- =====================================================
-- SCRIPT SQL - SPRINT 1: Novas Tabelas
-- Execute no Supabase Dashboard (SQL Editor)
-- =====================================================

-- 1. TABELA CALENDAR_EVENTS (Eventos do Calendário)
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(20) NOT NULL DEFAULT 'outro' CHECK (tipo IN ('audiencia', 'prazo_recurso', 'prazo_embargos', 'reuniao', 'outro')),
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  dia_inteiro BOOLEAN DEFAULT true,
  local VARCHAR(300),
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'cancelado')),
  prioridade VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  cor VARCHAR(7),
  lembrete BOOLEAN DEFAULT true,
  lembrete_antecedencia INTEGER DEFAULT 1440,
  notificado BOOLEAN DEFAULT false,
  observacoes TEXT,
  processo_id INTEGER REFERENCES processos(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para calendar_events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_processo_id ON calendar_events(processo_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_data_inicio ON calendar_events(data_inicio);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_tipo ON calendar_events(tipo);

-- =====================================================

-- 2. TABELA TIMESHEETS (Controle de Horas)
CREATE TABLE IF NOT EXISTS timesheets (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(500) NOT NULL,
  tipo VARCHAR(30) NOT NULL DEFAULT 'outros' CHECK (tipo IN (
    'audiencia', 'peticao', 'reuniao', 'pesquisa', 'deslocamento', 
    'consulta_processo', 'analise_documentos', 'outros'
  )),
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  duracao INTEGER NOT NULL, -- em minutos
  valor_hora DECIMAL(10, 2),
  valor_total DECIMAL(10, 2),
  faturavel BOOLEAN DEFAULT true,
  faturado BOOLEAN DEFAULT false,
  data_faturamento TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  processo_id INTEGER REFERENCES processos(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para timesheets
CREATE INDEX IF NOT EXISTS idx_timesheets_user_id ON timesheets(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_processo_id ON timesheets(processo_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_data_inicio ON timesheets(data_inicio);
CREATE INDEX IF NOT EXISTS idx_timesheets_tipo ON timesheets(tipo);
CREATE INDEX IF NOT EXISTS idx_timesheets_faturavel ON timesheets(faturavel);
CREATE INDEX IF NOT EXISTS idx_timesheets_faturado ON timesheets(faturado);

-- =====================================================

-- 3. TABELA CLIENTES (Gestão de Clientes)
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(10) NOT NULL DEFAULT 'fisica' CHECK (tipo IN ('fisica', 'juridica')),
  cpf VARCHAR(14) UNIQUE,
  cnpj VARCHAR(18) UNIQUE,
  rg VARCHAR(20),
  email VARCHAR(200),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  endereco VARCHAR(300),
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(9),
  profissao VARCHAR(100),
  estado_civil VARCHAR(20) CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
  data_nascimento DATE,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);

-- =====================================================

-- 4. ADICIONAR COLUNA cliente_id NA TABELA PROCESSOS (OPCIONAL - para vincular processos a clientes)
-- ATENÇÃO: Execute apenas se quiser vincular processos a clientes!
-- ALTER TABLE processos ADD COLUMN IF NOT EXISTS cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL;
-- CREATE INDEX IF NOT EXISTS idx_processos_cliente_id ON processos(cliente_id);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar se as tabelas foram criadas:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('calendar_events', 'timesheets', 'clientes')
ORDER BY table_name;

