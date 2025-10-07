-- Criar tabela timesheets
CREATE TABLE IF NOT EXISTS timesheets (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(500) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'outros',
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP,
    duracao INTEGER NOT NULL,
    valor_hora DECIMAL(10,2),
    faturavel BOOLEAN DEFAULT true,
    faturado BOOLEAN DEFAULT false,
    data_faturamento TIMESTAMP,
    observacoes TEXT,
    processo_id INTEGER REFERENCES processos(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_timesheets_user_id ON timesheets(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_processo_id ON timesheets(processo_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_data_inicio ON timesheets(data_inicio);
CREATE INDEX IF NOT EXISTS idx_timesheets_tipo ON timesheets(tipo);
CREATE INDEX IF NOT EXISTS idx_timesheets_faturavel ON timesheets(faturavel);

-- Adicionar constraint para tipo
ALTER TABLE timesheets ADD CONSTRAINT chk_timesheet_tipo 
CHECK (tipo IN (
    'audiencia',
    'peticao', 
    'reuniao',
    'pesquisa',
    'deslocamento',
    'consulta_processo',
    'analise_documentos',
    'outros'
));

-- Adicionar constraint para duração
ALTER TABLE timesheets ADD CONSTRAINT chk_timesheet_duracao 
CHECK (duracao > 0);

-- Adicionar constraint para valor_hora
ALTER TABLE timesheets ADD CONSTRAINT chk_timesheet_valor_hora 
CHECK (valor_hora IS NULL OR valor_hora >= 0);
