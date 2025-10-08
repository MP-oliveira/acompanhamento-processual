-- Adicionar campo horaAudiencia na tabela processos
ALTER TABLE processos ADD COLUMN IF NOT EXISTS horaAudiencia VARCHAR(5);

-- Comentário explicando o campo
COMMENT ON COLUMN processos.horaAudiencia IS 'Horário da audiência no formato HH:MM (opcional)';

