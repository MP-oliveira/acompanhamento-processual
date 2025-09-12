
# 📱 Ícones PWA - JurisAcompanha

## ✅ Ícones Criados
- ✅ Ícones SVG profissionais para todos os tamanhos
- ✅ Favicon otimizado
- ✅ Ícones de shortcuts para ações rápidas
- ✅ Design consistente com o tema do app

## 🎨 Design dos Ícones
- **Cores:** Gradiente azul (#6366f1 → #4f46e5)
- **Elementos:** Balança da justiça + símbolo "J"
- **Estilo:** Moderno, limpo e profissional
- **Compatibilidade:** Funciona em todos os dispositivos

## 📋 Tamanhos Disponíveis
- 16x16, 32x32 - Favicons
- 72x72, 96x96, 128x128 - Android Chrome
- 144x144, 152x152 - Windows/iOS
- 192x192, 384x384, 512x512 - Android Chrome (principal)

## 🚀 Como Converter para PNG (Opcional)

### Opção 1: Online (Mais Fácil)
1. Acesse: https://convertio.co/svg-png/
2. Faça upload dos arquivos SVG
3. Converta para PNG
4. Substitua os arquivos

### Opção 2: Usando Sharp (Programático)
```bash
npm install sharp

node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'frontend/public/icons');

sizes.forEach(size => {
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  if (fs.existsSync(svgPath)) {
    sharp(svgPath)
      .resize(size, size)
      .png({ quality: 100 })
      .toFile(pngPath)
      .then(() => console.log(`✅ PNG criado: icon-${size}x${size}.png`))
      .catch(console.error);
  }
});
"
```

### Opção 3: PWA Builder (Recomendado para Produção)
1. Acesse: https://www.pwabuilder.com/
2. Insira a URL do seu app
3. Baixe o pacote completo de ícones
4. Substitua os arquivos

## 🧪 Testar PWA
1. Execute: `npm run dev`
2. Abra no Chrome: `localhost:5173`
3. DevTools > Application > Manifest
4. Verifique se todos os ícones carregam
5. Teste a instalação

## 📱 Instalar no Dispositivo
- **Android Chrome:** Menu > "Adicionar à tela inicial"
- **iOS Safari:** Compartilhar > "Adicionar à Tela de Início"
- **Desktop:** Botão "Instalar" (aparece automaticamente)

## 🎯 Status Atual
- ✅ Manifest.json configurado
- ✅ Service Worker implementado
- ✅ Ícones SVG criados
- ✅ Splash screen configurada
- ✅ Banner de instalação ativo
- ✅ Funcionalidade offline básica

## 🚀 Próximo: Deploy na Vercel
Para teste completo em produção com HTTPS.
