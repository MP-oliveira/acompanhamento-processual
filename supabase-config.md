# Configuração Supabase para JurisAcompanha

## Passos para criar o projeto:

1. **Acesse**: https://supabase.com
2. **Crie conta** ou faça login
3. **New Project**:
   - Name: `juris-acompanha-prod`
   - Database Password: `JurisAcompanha2025!`
   - Region: `South America (São Paulo)`
   - Pricing Plan: `Free`

## Configurações necessárias:

### Variáveis de Ambiente para Vercel:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE-ROLE-KEY]
JWT_SECRET=[JWT-SECRET]
```

### Tabelas necessárias:
- users
- processos
- alertas
- relatorios
- consultas
- audit_logs
- push_subscriptions
- notification_preferences

## Próximos passos:
1. Criar projeto no Supabase
2. Executar scripts SQL para criar tabelas
3. Configurar variáveis no Vercel
4. Deploy do backend completo
