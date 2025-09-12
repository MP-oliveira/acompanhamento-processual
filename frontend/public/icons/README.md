
# Ícones do PWA - JurisAcompanha

## 📱 Ícones Gerados
Este diretório contém os ícones necessários para o Progressive Web App.

## 🎨 Como melhorar os ícones:

### Opção 1: Usar PWA Builder (Recomendado)
1. Acesse: https://www.pwabuilder.com/
2. Insira a URL do seu app
3. Baixe os ícones gerados automaticamente
4. Substitua os arquivos SVG por PNG

### Opção 2: Design Profissional
1. Crie um ícone 512x512px no Figma/Photoshop
2. Use as cores do tema: #6366f1 (primária) e #4f46e5 (secundária)
3. Exporte nos tamanhos: 16, 32, 72, 96, 128, 144, 152, 192, 384, 512
4. Salve como PNG com nomes: icon-[tamanho]x[tamanho].png

### Opção 3: Gerar automaticamente
```bash
# Instalar sharp para conversão
npm install sharp

# Converter SVGs para PNGs
node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  const svgPath = path.join(__dirname, 'frontend/public/icons', `icon-${size}x${size}.svg`);
  const pngPath = path.join(__dirname, 'frontend/public/icons', `icon-${size}x${size}.png`);
  
  if (fs.existsSync(svgPath)) {
    sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath)
      .then(() => console.log(`✅ Convertido: icon-${size}x${size}.png`))
      .catch(console.error);
  }
});
"
```

## 📋 Tamanhos Necessários:
- 16x16 - Favicon
- 32x32 - Favicon
- 72x72 - Android Chrome
- 96x96 - Android Chrome
- 128x128 - Android Chrome
- 144x144 - Windows tiles
- 152x152 - iOS Safari
- 192x192 - Android Chrome (principal)
- 384x384 - Android Chrome
- 512x512 - Android Chrome (splash screen)

## 🚀 Testar PWA:
1. Execute o app: npm run dev
2. Abra no Chrome
3. Vá em DevTools > Application > Manifest
4. Verifique se todos os ícones estão carregando
5. Teste a instalação: botão "Instalar" deve aparecer

## 📱 Instalar no Celular:
- **Android Chrome:** Menu > "Adicionar à tela inicial"
- **iOS Safari:** Compartilhar > "Adicionar à Tela de Início"
- **Desktop:** Botão "Instalar" no navegador
