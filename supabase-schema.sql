-- Schema para Supabase - JurisAcompanha
-- Execute este SQL no SQL Editor do Supabase

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de processos
CREATE TABLE IF NOT EXISTS processos (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(100) UNIQUE NOT NULL,
    classe VARCHAR(255) NOT NULL,
    assunto TEXT,
    valor_causa DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado', 'suspenso')),
    proxima_audiencia DATE,
    prazo_recurso DATE,
    prazo_embargos DATE,
    observacoes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de alertas
CREATE TABLE IF NOT EXISTS alertas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('prazo', 'audiencia', 'recurso', 'embargos', 'atualizacao')),
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
    lido BOOLEAN DEFAULT false,
    data_prazo TIMESTAMP WITH TIME ZONE,
    processo_id INTEGER REFERENCES processos(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS relatorios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('processos', 'prazos', 'audiencias', 'personalizado')),
    filtros JSONB,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'concluido', 'erro')),
    arquivo_url VARCHAR(500),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de consultas
CREATE TABLE IF NOT EXISTS consultas (
    id SERIAL PRIMARY KEY,
    numero_processo VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('trf1', 'tjsp', 'stj', 'stf')),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'concluida', 'erro')),
    resultado JSONB,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'warning')),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de subscrições push
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de preferências de notificação
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    email_critical_alerts BOOLEAN DEFAULT true,
    push_critical_alerts BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    alert_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (alert_frequency IN ('immediate', 'hourly', 'daily')),
    preferred_time TIME,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_processos_user_id ON processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
CREATE INDEX IF NOT EXISTS idx_alertas_user_id ON alertas(user_id);
CREATE INDEX IF NOT EXISTS idx_alertas_lido ON alertas(lido);
CREATE INDEX IF NOT EXISTS idx_alertas_data_prazo ON alertas(data_prazo);
CREATE INDEX IF NOT EXISTS idx_relatorios_user_id ON relatorios(user_id);
CREATE INDEX IF NOT EXISTS idx_consultas_user_id ON consultas(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processos_updated_at BEFORE UPDATE ON processos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alertas_updated_at BEFORE UPDATE ON alertas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relatorios_updated_at BEFORE UPDATE ON relatorios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultas_updated_at BEFORE UPDATE ON consultas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin padrão
INSERT INTO users (nome, email, password, role, ativo) 
VALUES ('Admin Sistema', 'admin@jurisacompanha.com', '$2b$10$rQKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Inserir usuário de teste
INSERT INTO users (nome, email, password, role, ativo) 
VALUES ('Guilherme Fernandes', 'guilhermefernandes.adv@hotmail.com', '$2b$10$rQKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvKvK', 'user', true)
ON CONFLICT (email) DO NOTHING;

-- Inserir preferências padrão para os usuários
INSERT INTO notification_preferences (user_id, email_critical_alerts, push_critical_alerts, email_enabled, push_enabled)
SELECT id, true, true, true, true FROM users
ON CONFLICT (user_id) DO NOTHING;
