# 🚀 Guia de Deploy - JurisAcompanha PWA

## 📋 Pré-requisitos
- [ ] Conta no GitHub
- [ ] Conta na Vercel (gratuita)
- [ ] Backend configurado (Supabase)
- [ ] PWA configurado (✅ já feito)

## 🎯 Deploy Frontend (Vercel)

### Passo 1: Preparar Repositório
```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "feat: prepara para deploy PWA"
git push origin main
```

### Passo 2: Deploy na Vercel

#### Opção A: Via Vercel CLI (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy do frontend
cd frontend
vercel --prod

# Seguir as instruções:
# - Set up and deploy? Y
# - Which scope? (sua conta)
# - Link to existing project? N
# - What's your project's name? juris-acompanha
# - In which directory is your code located? ./
```

#### Opção B: Via Interface Web
1. Acesse: https://vercel.com
2. Clique em "New Project"
3. Importe seu repositório GitHub
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Clique em "Deploy"

### Passo 3: Configurar Variáveis de Ambiente
Na Vercel Dashboard:
1. Vá em Settings > Environment Variables
2. Adicione:
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_SUPABASE_URL=https://hdjqsxwkmsyhiczmhwca.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

## 🔧 Deploy Backend (Railway/Render)

### Opção A: Railway (Recomendado)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway init
railway up

# Configurar variáveis
railway variables set DATABASE_URL="postgresql://postgres.hdjqsxwkmsyhiczmhwca:Eusoudejesus1000%@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
railway variables set JWT_SECRET="seu_jwt_secret"
railway variables set NODE_ENV="production"
```

### Opção B: Render
1. Acesse: https://render.com
2. Conecte seu GitHub
3. Crie novo Web Service
4. Configure:
   - **Repository:** seu-repo
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

## 🧪 Testar PWA em Produção

### 1. Verificar HTTPS
- ✅ Vercel fornece HTTPS automaticamente
- ✅ Necessário para PWA funcionar

### 2. Testar Manifest
```bash
# Acesse sua URL
https://juris-acompanha.vercel.app/manifest.json

# Deve retornar JSON válido
```

### 3. Testar Service Worker
```bash
# DevTools > Application > Service Workers
# Deve mostrar "activated and running"
```

### 4. Testar Instalação
- **Desktop Chrome:** Botão "Instalar" deve aparecer
- **Android Chrome:** Menu > "Adicionar à tela inicial"
- **iOS Safari:** Compartilhar > "Adicionar à Tela de Início"

## 📱 Testes em Dispositivos

### Android
1. Abra no Chrome
2. Menu (3 pontos) > "Adicionar à tela inicial"
3. Confirme instalação
4. Teste offline

### iOS
1. Abra no Safari
2. Compartilhar (ícone de compartilhar)
3. "Adicionar à Tela de Início"
4. Confirme instalação

### Desktop
1. Chrome/Edge
2. Ícone de instalação na barra de endereços
3. Clique para instalar

## 🔍 Verificar PWA Score

### Lighthouse Audit
1. DevTools > Lighthouse
2. Selecione "Progressive Web App"
3. Execute auditoria
4. Deve ter score 90+ em todas as categorias

### PWA Builder
1. Acesse: https://www.pwabuilder.com/
2. Insira sua URL
3. Verifique score e sugestões

## 🚨 Troubleshooting

### Service Worker não registra
```javascript
// Verificar no console
navigator.serviceWorker.getRegistrations().then(console.log);
```

### Manifest não carrega
- Verificar se arquivo está em `/manifest.json`
- Verificar Content-Type: `application/manifest+json`

### Ícones não aparecem
- Verificar se arquivos estão em `/icons/`
- Verificar se URLs estão corretas no manifest

### App não instala
- Verificar se está em HTTPS
- Verificar se manifest está válido
- Verificar se service worker está ativo

## 📊 Monitoramento

### Vercel Analytics
- Ativar no dashboard da Vercel
- Monitorar performance e erros

### Logs
```bash
# Railway
railway logs

# Vercel
vercel logs
```

## 🎯 URLs de Produção
Após deploy, você terá:
- **Frontend:** https://juris-acompanha.vercel.app
- **Backend:** https://juris-acompanha-backend.railway.app

## ✅ Checklist Final
- [ ] Frontend deployado na Vercel
- [ ] Backend deployado (Railway/Render)
- [ ] HTTPS configurado
- [ ] PWA instalável
- [ ] Funciona offline
- [ ] Ícones carregando
- [ ] Manifest válido
- [ ] Service Worker ativo
- [ ] Testado em mobile
- [ ] Lighthouse score 90+

## 🎉 Pronto!
Seu PWA está no ar e pode ser instalado como app nativo!
