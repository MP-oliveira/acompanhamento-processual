#!/usr/bin/env node

/**
 * Script para criar ícones PNG do PWA
 * Cria ícones simples mas profissionais usando HTML Canvas
 */

const fs = require('fs');
const path = require('path');

// Criar diretório de ícones se não existir
const iconsDir = path.join(__dirname, '..', 'frontend', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Função para criar ícone SVG mais profissional
const createProfessionalIcon = (size) => {
  const iconSize = size;
  const padding = iconSize * 0.15; // 15% de padding
  const contentSize = iconSize - (padding * 2);
  
  return `
<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradiente principal -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
    
    <!-- Gradiente para elementos internos -->
    <linearGradient id="elementGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.7" />
    </linearGradient>
    
    <!-- Sombra -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- Background com bordas arredondadas -->
  <rect width="${iconSize}" height="${iconSize}" rx="${iconSize * 0.22}" fill="url(#bgGradient)"/>
  
  <!-- Elementos principais -->
  <g transform="translate(${padding}, ${padding}) scale(${contentSize / 100})">
    <!-- Balança da justiça -->
    <g filter="url(#shadow)">
      <!-- Base da balança -->
      <rect x="35" y="65" width="30" height="8" rx="4" fill="url(#elementGradient)"/>
      
      <!-- Poste central -->
      <rect x="48" y="45" width="4" height="25" fill="url(#elementGradient)"/>
      
      <!-- Braço da balança -->
      <rect x="30" y="42" width="40" height="3" rx="1.5" fill="url(#elementGradient)"/>
      
      <!-- Pratos da balança -->
      <ellipse cx="32" cy="48" rx="8" ry="2" fill="url(#elementGradient)"/>
      <ellipse cx="68" cy="48" rx="8" ry="2" fill="url(#elementGradient)"/>
      
      <!-- Cordas dos pratos -->
      <line x1="32" y1="42" x2="32" y2="48" stroke="url(#elementGradient)" stroke-width="1.5"/>
      <line x1="68" y1="42" x2="68" y2="48" stroke="url(#elementGradient)" stroke-width="1.5"/>
    </g>
    
    <!-- Símbolo "J" estilizado -->
    <g transform="translate(50, 75)">
      <text x="0" y="0" font-family="Arial, sans-serif" font-size="18" font-weight="bold" 
            text-anchor="middle" fill="white" opacity="0.9">J</text>
    </g>
    
    <!-- Elementos decorativos -->
    <circle cx="20" cy="20" r="3" fill="white" opacity="0.3"/>
    <circle cx="80" cy="25" r="2" fill="white" opacity="0.4"/>
    <circle cx="15" cy="80" r="2.5" fill="white" opacity="0.3"/>
    <circle cx="85" cy="75" r="2" fill="white" opacity="0.4"/>
  </g>
</svg>`;
};

// Tamanhos necessários
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 Criando ícones profissionais do PWA...');

// Criar ícones SVG profissionais
iconSizes.forEach(size => {
  const svg = createProfessionalIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Criado: ${filename}`);
});

// Criar favicon simples
const faviconSVG = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#6366f1"/>
  <text x="16" y="22" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle" fill="white">⚖️</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSVG);
console.log('✅ Criado: favicon.svg');

// Criar ícones para shortcuts
const createShortcutIcon = (type, size) => {
  let icon = '';
  let color = '#6366f1';
  
  switch (type) {
    case 'dashboard':
      icon = '📊';
      color = '#3b82f6';
      break;
    case 'novo-processo':
      icon = '➕';
      color = '#10b981';
      break;
    case 'alertas':
      icon = '🔔';
      color = '#f59e0b';
      break;
  }
  
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${color}"/>
  <text x="${size/2}" y="${size * 0.65}" font-family="Arial" font-size="${size * 0.4}" 
        text-anchor="middle" fill="white">${icon}</text>
</svg>`;
};

// Criar ícones de shortcuts
const shortcuts = [
  { type: 'dashboard', filename: 'shortcut-dashboard.svg' },
  { type: 'novo-processo', filename: 'shortcut-novo-processo.svg' },
  { type: 'alertas', filename: 'shortcut-alertas.svg' }
];

shortcuts.forEach(({ type, filename }) => {
  const svg = createShortcutIcon(type, 96);
  const filepath = path.join(iconsDir, filename);
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Criado: ${filename}`);
});

// Criar instruções atualizadas
const instructions = `
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
\`\`\`bash
npm install sharp

node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'frontend/public/icons');

sizes.forEach(size => {
  const svgPath = path.join(iconsDir, \`icon-\${size}x\${size}.svg\`);
  const pngPath = path.join(iconsDir, \`icon-\${size}x\${size}.png\`);
  
  if (fs.existsSync(svgPath)) {
    sharp(svgPath)
      .resize(size, size)
      .png({ quality: 100 })
      .toFile(pngPath)
      .then(() => console.log(\`✅ PNG criado: icon-\${size}x\${size}.png\`))
      .catch(console.error);
  }
});
"
\`\`\`

### Opção 3: PWA Builder (Recomendado para Produção)
1. Acesse: https://www.pwabuilder.com/
2. Insira a URL do seu app
3. Baixe o pacote completo de ícones
4. Substitua os arquivos

## 🧪 Testar PWA
1. Execute: \`npm run dev\`
2. Abra no Chrome: \`localhost:5173\`
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
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), instructions);

console.log('📋 Instruções atualizadas criadas');
console.log('🎯 Próximos passos:');
console.log('1. Teste local: npm run dev');
console.log('2. Configure deploy na Vercel');
console.log('3. Teste PWA em produção');
console.log('4. Opcional: Converta SVGs para PNGs');
