-- Script para criar usuário de teste simples
-- Execute este script no SQL Editor do Supabase

-- Deletar usuário existente se houver
DELETE FROM users WHERE email = 'teste@teste.com';

-- Criar usuário de teste com senha simples
INSERT INTO users (email, password, nome, role, ativo, created_at, updated_at) 
VALUES (
  'teste@teste.com', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: password
  'Usuário Teste', 
  'admin',
  true,
  NOW(),
  NOW()
);

-- Verificar se foi criado
SELECT id, email, nome, role, ativo FROM users WHERE email = 'teste@teste.com';
