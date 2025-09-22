-- Script para deletar usuário Guilherme e todos os dados relacionados
-- Execute este script no SQL Editor do Supabase

-- 1. Buscar o ID do usuário
DO $$
DECLARE
    user_id_to_delete INTEGER;
    table_exists BOOLEAN;
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO user_id_to_delete 
    FROM users 
    WHERE email = 'guilhermefernandes.adv@hotmail.com';
    
    IF user_id_to_delete IS NULL THEN
        RAISE NOTICE 'Usuário não encontrado';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuário encontrado com ID: %', user_id_to_delete;
    
    -- 2. Deletar registros relacionados (verificando se as tabelas existem)
    
    -- notification_preferences
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notification_preferences'
    ) INTO table_exists;
    
    IF table_exists THEN
        DELETE FROM notification_preferences WHERE user_id = user_id_to_delete;
        RAISE NOTICE 'notification_preferences deletados';
    ELSE
        RAISE NOTICE 'Tabela notification_preferences não existe';
    END IF;
    
    -- push_subscriptions
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'push_subscriptions'
    ) INTO table_exists;
    
    IF table_exists THEN
        DELETE FROM push_subscriptions WHERE user_id = user_id_to_delete;
        RAISE NOTICE 'push_subscriptions deletados';
    ELSE
        RAISE NOTICE 'Tabela push_subscriptions não existe';
    END IF;
    
    -- consultas
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'consultas'
    ) INTO table_exists;
    
    IF table_exists THEN
        DELETE FROM consultas WHERE user_id = user_id_to_delete;
        RAISE NOTICE 'consultas deletadas';
    ELSE
        RAISE NOTICE 'Tabela consultas não existe';
    END IF;
    
    -- relatorios
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'relatorios'
    ) INTO table_exists;
    
    IF table_exists THEN
        DELETE FROM relatorios WHERE user_id = user_id_to_delete;
        RAISE NOTICE 'relatorios deletados';
    ELSE
        RAISE NOTICE 'Tabela relatorios não existe';
    END IF;
    
    -- alertas (verificar se existe)
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'alertas'
    ) INTO table_exists;
    
    IF table_exists THEN
        DELETE FROM alertas WHERE user_id = user_id_to_delete;
        RAISE NOTICE 'alertas deletados';
    ELSE
        RAISE NOTICE 'Tabela alertas não existe';
    END IF;
    
    -- processos
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'processos'
    ) INTO table_exists;
    
    IF table_exists THEN
        DELETE FROM processos WHERE user_id = user_id_to_delete;
        RAISE NOTICE 'processos deletados';
    ELSE
        RAISE NOTICE 'Tabela processos não existe';
    END IF;
    
    -- audit_logs
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
    ) INTO table_exists;
    
    IF table_exists THEN
        DELETE FROM audit_logs WHERE user_id = user_id_to_delete;
        RAISE NOTICE 'audit_logs deletados';
    ELSE
        RAISE NOTICE 'Tabela audit_logs não existe';
    END IF;
    
    -- 3. Finalmente, deletar o usuário
    DELETE FROM users WHERE id = user_id_to_delete;
    RAISE NOTICE 'Usuário deletado com sucesso!';
    
END $$;
