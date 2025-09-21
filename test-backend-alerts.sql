-- SQL para testar se o backend consegue acessar os alertas
-- Execute este SQL no editor SQL do Supabase

-- Verificar se há políticas RLS ativas na tabela alertas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'alertas';

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'alertas';

-- Tentar buscar alertas como se fosse o backend (sem autenticação de usuário)
SELECT * FROM public.alertas WHERE user_id = 4 LIMIT 5;

