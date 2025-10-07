-- Adicionar campos de aprovação e pagamento na tabela timesheets

-- Status de aprovação (pendente, aprovado, rejeitado)
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS status_aprovacao VARCHAR(20) DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado'));

-- Quem aprovou
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS aprovado_por INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Data de aprovação
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMP WITH TIME ZONE;

-- Motivo de rejeição
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT;

-- Status de pagamento (pendente, pago)
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS status_pagamento VARCHAR(20) DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'pago'));

-- Data de pagamento
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS data_pagamento TIMESTAMP WITH TIME ZONE;

-- Quem processou o pagamento
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS pago_por INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Observações do pagamento
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS observacoes_pagamento TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_timesheets_status_aprovacao ON timesheets(status_aprovacao);
CREATE INDEX IF NOT EXISTS idx_timesheets_status_pagamento ON timesheets(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_timesheets_aprovado_por ON timesheets(aprovado_por);
CREATE INDEX IF NOT EXISTS idx_timesheets_pago_por ON timesheets(pago_por);

-- Comentários
COMMENT ON COLUMN timesheets.status_aprovacao IS 'Status de aprovação das horas: pendente, aprovado, rejeitado';
COMMENT ON COLUMN timesheets.aprovado_por IS 'ID do usuário que aprovou/rejeitou as horas';
COMMENT ON COLUMN timesheets.data_aprovacao IS 'Data e hora da aprovação/rejeição';
COMMENT ON COLUMN timesheets.motivo_rejeicao IS 'Motivo da rejeição (se aplicável)';
COMMENT ON COLUMN timesheets.status_pagamento IS 'Status do pagamento: pendente, pago';
COMMENT ON COLUMN timesheets.data_pagamento IS 'Data e hora do pagamento';
COMMENT ON COLUMN timesheets.pago_por IS 'ID do usuário que processou o pagamento';
COMMENT ON COLUMN timesheets.observacoes_pagamento IS 'Observações sobre o pagamento';

