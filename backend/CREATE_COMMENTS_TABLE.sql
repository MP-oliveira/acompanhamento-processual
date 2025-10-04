-- Tabela de Comentários em Processos
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  processo_id INTEGER NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  texto TEXT NOT NULL,
  edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_comments_processo_id ON comments(processo_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Comentários
COMMENT ON TABLE comments IS 'Comentários em processos jurídicos';
COMMENT ON COLUMN comments.processo_id IS 'ID do processo';
COMMENT ON COLUMN comments.user_id IS 'ID do usuário que comentou';
COMMENT ON COLUMN comments.texto IS 'Texto do comentário';
COMMENT ON COLUMN comments.edited IS 'Se foi editado';

