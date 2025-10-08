-- Adicionar campo hora_audiencia na tabela processos
ALTER TABLE processos ADD COLUMN IF NOT EXISTS hora_audiencia VARCHAR(5);

-- Comentário explicando o campo
COMMENT ON COLUMN processos.hora_audiencia IS 'Horário da audiência no formato HH:MM (opcional)';

