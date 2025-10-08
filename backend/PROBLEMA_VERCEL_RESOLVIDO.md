# Problema Resolvido: Erro 500 no Vercel

## O que aconteceu?

### Antes funcionava porque:
1. O número de requisições simultâneas era menor
2. As associações do modelo Cliente estavam comentadas
3. O Vercel conseguia lidar com o `sequelize.sync()` ocasionalmente

### Por que parou de funcionar?

**Commit `d5b4273` (Gestão de Clientes):**
- Adicionou/descomentou associações entre Cliente e Processo
- Aumentou a complexidade do `sequelize.sync()`

**O problema principal:**
```javascript
// No arquivo app.js (linha 163)
await sequelize.sync();
```

**No ambiente Vercel (serverless):**
- Cada requisição pode iniciar uma nova instância da função
- O `sync()` tenta criar/modificar tabelas no banco
- Isso causa conflitos quando múltiplas requisições chegam simultaneamente
- Resultado: `"ConnectionManager.getConnection was called after the connection manager was closed!"`

## Solução Implementada

### 1. Configuração de Pool Otimizada para Serverless
**Arquivo:** `backend/src/config/database.js`
- Pool reduzido para serverless: max: 2, idle: 0
- Evita manter conexões abertas desnecessariamente

### 2. Modelos sem Sync para Vercel
**Arquivo:** `backend/src/models/serverless.js` (NOVO)
- Importa todos os modelos e define associações
- **NÃO executa** `sequelize.sync()`
- As tabelas já existem no Supabase, não precisam ser criadas

### 3. Vercel Server Otimizado
**Arquivo:** `backend/vercel-server.js`
- Usa `serverless.js` em vez de `index.js`
- Apenas autentica a conexão, não sincroniza
- Middleware resiliente que tenta conectar mas não bloqueia

## Como fazer deploy da correção

```bash
# 1. Commit das alterações
git add backend/src/config/database.js
git add backend/src/models/serverless.js
git add backend/vercel-server.js
git add backend/PROBLEMA_VERCEL_RESOLVIDO.md
git commit -m "fix: corrigir erro 500 no Vercel - otimizar para serverless"

# 2. Push para o repositório
git push origin main

# 3. O Vercel vai fazer deploy automaticamente
```

## Verificação

Após o deploy, teste:
1. `GET https://jurisacompanha-backend.vercel.app/api/health`
2. `GET https://jurisacompanha-backend.vercel.app/api/processos` (com token de autenticação)

## Diferenças entre Desenvolvimento e Produção

### Desenvolvimento Local (app.js)
- Usa `sequelize.sync()` para criar/atualizar tabelas
- Pool de conexões maior
- Logging habilitado

### Produção Vercel (vercel-server.js)
- Usa apenas `sequelize.authenticate()`
- Pool de conexões mínimo
- Logging desabilitado
- Tabelas já existem no Supabase

## Observações Importantes

1. **Não usar sync() em produção serverless** - As tabelas devem ser criadas via migrations ou SQL direto no Supabase
2. **Pool mínimo** - Serverless não deve manter muitas conexões abertas
3. **Conexão lazy** - Apenas conecta quando necessário
4. **Resiliente** - Se uma conexão falhar, tenta novamente na próxima requisição

