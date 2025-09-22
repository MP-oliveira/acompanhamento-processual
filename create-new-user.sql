-- Script para criar novo usuário Guilherme
-- Execute este script no SQL Editor do Supabase APÓS executar o cleanup-user.sql

-- Hash bcrypt para a senha "Gui@2025!"
INSERT INTO users (email, password, nome, role, ativo, created_at, updated_at) 
VALUES (
  'guilhermefernandes.adv@hotmail.com', 
  '$2b$10$DIpqWuouU1CudL8tIUe0oOAxYTNPGNQaNBN0Vu30brndYsj3lQu02', 
  'Guilherme Fernandes', 
  'admin',
  true,
  NOW(),
  NOW()
);

-- Verificar se foi criado
SELECT id, email, nome, role, ativo FROM users WHERE email = 'guilhermefernandes.adv@hotmail.com';
