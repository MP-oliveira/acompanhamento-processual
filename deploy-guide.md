# 🚀 Guia de Deploy - Vercel + Supabase

## 📋 Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Código no GitHub

## 🗄️ 1. Configurar Supabase (Database)

### 1.1 Criar Projeto
1. Acesse [Supabase](https://supabase.com)
2. Clique em "New Project"
3. Escolha organização
4. Nome: `juris-acompanhamento`
5. Senha do banco: `sua-senha-super-segura`
6. Região: `South America (São Paulo)`
7. Clique em "Create new project"

### 1.2 Configurar Banco
```sql
-- Executar no SQL Editor do Supabase
-- Copiar e colar o conteúdo do arquivo backend/database/schema.sql
```

### 1.3 Obter Credenciais
1. Vá em Settings > Database
2. Copie as credenciais:
   - Host: `db.xxxxx.supabase.co`
   - Database: `postgres`
   - Username: `postgres`
   - Password: `sua-senha`
   - Port: `5432`

## 🌐 2. Deploy Backend (Vercel)

### 2.1 Preparar Backend
```bash
# No diretório backend/
npm install
```

### 2.2 Configurar Variáveis de Ambiente
No Vercel Dashboard:
```
DATABASE_URL=postgresql://postgres:sua-senha@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=sua-chave-jwt-super-secreta
NODE_ENV=production
PORT=3001
```

### 2.3 Deploy
1. Conecte repositório GitHub no Vercel
2. Selecione pasta `backend/`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy!

## 🎨 3. Deploy Frontend (Vercel)

### 3.1 Configurar Variáveis
```
VITE_API_BASE_URL=https://seu-backend.vercel.app/api
VITE_FIREBASE_API_KEY=opcional
VITE_FIREBASE_AUTH_DOMAIN=opcional
VITE_FIREBASE_PROJECT_ID=opcional
VITE_FIREBASE_STORAGE_BUCKET=opcional
VITE_FIREBASE_MESSAGING_SENDER_ID=opcional
VITE_FIREBASE_APP_ID=opcional
VITE_USE_FIREBASE=false
```

### 3.2 Deploy
1. Conecte repositório GitHub no Vercel
2. Selecione pasta `frontend/`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy!

## 🔧 4. Configurações Finais

### 4.1 CORS (Backend)
```javascript
// backend/src/app.js
app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://seu-frontend.vercel.app'
  ],
  credentials: true
}));
```

### 4.2 Domínio Personalizado (Opcional)
1. No Vercel: Settings > Domains
2. Adicione seu domínio
3. Configure DNS no seu provedor

## 💰 5. Custos

### Supabase (Gratuito)
- ✅ 500MB de banco
- ✅ 2GB de transferência
- ✅ 50MB de storage
- ✅ 50.000 requests/mês

### Vercel (Gratuito)
- ✅ 100GB de bandwidth
- ✅ 100 deploys/mês
- ✅ Serverless functions

## 🚀 6. Comandos de Deploy

```bash
# 1. Preparar repositório
git add .
git commit -m "feat: preparar para deploy"
git push origin main

# 2. Deploy automático via Vercel
# - Conecte GitHub no Vercel
# - Configure variáveis de ambiente
# - Deploy automático a cada push
```

## 🔍 7. Monitoramento

### Vercel Analytics
- Acessos em tempo real
- Performance
- Erros

### Supabase Dashboard
- Queries do banco
- Uso de storage
- Logs de autenticação

## 🛠️ 8. Troubleshooting

### Problema: CORS Error
```javascript
// Solução: Adicionar domínio no CORS
origin: ['https://seu-frontend.vercel.app']
```

### Problema: Database Connection
```bash
# Verificar variável DATABASE_URL
# Formato: postgresql://user:pass@host:port/db
```

### Problema: Build Error
```bash
# Verificar se todas as dependências estão no package.json
npm install --production
```

## 📱 9. URLs Finais

- **Frontend**: `https://seu-frontend.vercel.app`
- **Backend**: `https://seu-backend.vercel.app`
- **Database**: `https://supabase.com/dashboard/project/xxxxx`

## 🎯 10. Próximos Passos

1. ✅ Testar aplicação em produção
2. ✅ Configurar domínio personalizado
3. ✅ Configurar backup automático
4. ✅ Monitorar performance
5. ✅ Configurar alertas

---

**🎉 Pronto! Sua aplicação estará online e acessível para o cliente!**
