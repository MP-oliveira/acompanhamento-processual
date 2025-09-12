#!/usr/bin/env node

/**
 * Script para gerar ícones do PWA
 * Este script cria ícones básicos usando Canvas API do Node.js
 * Para produção, use ferramentas como PWA Builder ou design profissional
 */

const fs = require('fs');
const path = require('path');

// Criar diretório de ícones se não existir
const iconsDir = path.join(__dirname, '..', 'frontend', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG base para o ícone
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  
  <!-- Ícone da balança -->
  <g transform="translate(${size * 0.25}, ${size * 0.25}) scale(${size * 0.5 / 100})">
    <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="white" opacity="0.2"/>
    <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="white" opacity="0.3"/>
    <path d="M40 40 L60 40 L60 60 L40 60 Z" fill="white"/>
    
    <!-- Balança -->
    <circle cx="50" cy="50" r="3" fill="white"/>
    <line x1="50" y1="50" x2="50" y2="35" stroke="white" stroke-width="2"/>
    <line x1="35" y1="35" x2="65" y2="35" stroke="white" stroke-width="2"/>
    <circle cx="35" cy="35" r="2" fill="white"/>
    <circle cx="65" cy="35" r="2" fill="white"/>
    <line x1="35" y1="35" x2="35" y2="25" stroke="white" stroke-width="1.5"/>
    <line x1="65" y1="35" x2="65" y2="25" stroke="white" stroke-width="1.5"/>
    
    <!-- Texto "J" -->
    <text x="50" y="65" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">J</text>
  </g>
</svg>
`;

// Tamanhos necessários para PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 Gerando ícones do PWA...');

iconSizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // Para este exemplo, vamos criar arquivos SVG que podem ser convertidos para PNG
  // Em produção, use uma biblioteca como sharp ou canvas para gerar PNGs reais
  const svgFilename = `icon-${size}x${size}.svg`;
  const svgFilepath = path.join(iconsDir, svgFilename);
  
  fs.writeFileSync(svgFilepath, svg);
  console.log(`✅ Criado: ${svgFilename}`);
});

// Criar um ícone simples em texto para teste
const createTextIcon = (size) => {
  const canvas = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border-radius: ${size * 0.2}px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Arial, sans-serif;
      font-weight: bold;
      font-size: ${size * 0.4}px;
    ">
      ⚖️
    </div>
  `;
  return canvas;
};

// Criar arquivo de instruções
const instructions = `
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
\`\`\`bash
# Instalar sharp para conversão
npm install sharp

# Converter SVGs para PNGs
node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  const svgPath = path.join(__dirname, 'frontend/public/icons', \`icon-\${size}x\${size}.svg\`);
  const pngPath = path.join(__dirname, 'frontend/public/icons', \`icon-\${size}x\${size}.png\`);
  
  if (fs.existsSync(svgPath)) {
    sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath)
      .then(() => console.log(\`✅ Convertido: icon-\${size}x\${size}.png\`))
      .catch(console.error);
  }
});
"
\`\`\`

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
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), instructions);

console.log('📋 Instruções criadas em: frontend/public/icons/README.md');
console.log('🎯 Próximos passos:');
console.log('1. Execute: npm run dev');
console.log('2. Teste o PWA no navegador');
console.log('3. Melhore os ícones usando PWA Builder ou design profissional');
console.log('4. Deploy na Vercel para teste completo');

// Criar um ícone temporário simples
const simpleIcon = `
<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="24" fill="#6366f1"/>
  <text x="96" y="120" font-family="Arial" font-size="80" text-anchor="middle" fill="white">⚖️</text>
  <text x="96" y="160" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">JURIS</text>
</svg>
`;

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.svg'), simpleIcon);
console.log('✅ Ícone temporário criado: icon-192x192.svg');
