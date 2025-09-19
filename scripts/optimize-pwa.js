#!/usr/bin/env node

/**
 * Script para otimizar o PWA
 * Verifica configurações e gera relatório de otimização
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Analisando PWA - JurisAcompanha...\n');

// Verificar arquivos essenciais
const checkFile = (filePath, description) => {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${exists ? 'OK' : 'FALTANDO'}`);
  return exists;
};

console.log('📋 Verificando arquivos essenciais:');
const manifestExists = checkFile('frontend/public/manifest.json', 'Manifest.json');
const swExists = checkFile('frontend/public/sw.js', 'Service Worker');
const iconsDirExists = checkFile('frontend/public/icons', 'Diretório de ícones');

// Verificar ícones
console.log('\n🎨 Verificando ícones:');
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
let iconsOk = 0;

iconSizes.forEach(size => {
  const svgPath = `frontend/public/icons/icon-${size}x${size}.svg`;
  const pngPath = `frontend/public/icons/icon-${size}x${size}.png`;
  const hasSvg = fs.existsSync(svgPath);
  const hasPng = fs.existsSync(pngPath);
  
  if (hasSvg || hasPng) {
    iconsOk++;
    console.log(`✅ Ícone ${size}x${size}: ${hasPng ? 'PNG' : 'SVG'}`);
  } else {
    console.log(`❌ Ícone ${size}x${size}: FALTANDO`);
  }
});

// Verificar manifest
console.log('\n📄 Analisando manifest.json:');
if (manifestExists) {
  try {
    const manifest = JSON.parse(fs.readFileSync('frontend/public/manifest.json', 'utf8'));
    
    const checks = [
      { key: 'name', value: manifest.name, required: true },
      { key: 'short_name', value: manifest.short_name, required: true },
      { key: 'start_url', value: manifest.start_url, required: true },
      { key: 'display', value: manifest.display, required: true },
      { key: 'theme_color', value: manifest.theme_color, required: true },
      { key: 'background_color', value: manifest.background_color, required: true },
      { key: 'icons', value: manifest.icons?.length || 0, required: true, min: 1 }
    ];
    
    checks.forEach(check => {
      if (check.required) {
        if (check.min) {
          const ok = check.value >= check.min;
          console.log(`${ok ? '✅' : '❌'} ${check.key}: ${check.value} ${ok ? '(OK)' : `(mínimo ${check.min})`}`);
        } else {
          const ok = check.value && check.value.length > 0;
          console.log(`${ok ? '✅' : '❌'} ${check.key}: ${ok ? 'OK' : 'FALTANDO'}`);
        }
      }
    });
    
    console.log(`📊 Total de ícones no manifest: ${manifest.icons?.length || 0}`);
    console.log(`🎯 Shortcuts configurados: ${manifest.shortcuts?.length || 0}`);
    
  } catch (error) {
    console.log('❌ Erro ao ler manifest.json:', error.message);
  }
}

// Verificar Service Worker
console.log('\n⚙️ Analisando Service Worker:');
if (swExists) {
  const swContent = fs.readFileSync('frontend/public/sw.js', 'utf8');
  
  const swChecks = [
    { name: 'Cache Strategy', pattern: /cache\.(open|addAll)/, required: true },
    { name: 'Fetch Event', pattern: /addEventListener.*fetch/, required: true },
    { name: 'Install Event', pattern: /addEventListener.*install/, required: true },
    { name: 'Activate Event', pattern: /addEventListener.*activate/, required: true },
    { name: 'Push Notifications', pattern: /addEventListener.*push/, required: false },
    { name: 'Background Sync', pattern: /backgroundSync/, required: false }
  ];
  
  swChecks.forEach(check => {
    const found = check.pattern.test(swContent);
    const status = check.required ? (found ? '✅' : '❌') : (found ? '✅' : '⚪');
    console.log(`${status} ${check.name}: ${found ? 'Implementado' : check.required ? 'FALTANDO' : 'Opcional'}`);
  });
}

// Verificar HTML
console.log('\n🌐 Analisando index.html:');
const htmlPath = 'frontend/index.html';
if (fs.existsSync(htmlPath)) {
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  const htmlChecks = [
    { name: 'Manifest Link', pattern: /<link.*manifest\.json/, required: true },
    { name: 'Theme Color', pattern: /<meta.*theme-color/, required: true },
    { name: 'Viewport', pattern: /<meta.*viewport/, required: true },
    { name: 'Apple Touch Icon', pattern: /<link.*apple-touch-icon/, required: true },
    { name: 'Favicon', pattern: /<link.*icon/, required: true },
    { name: 'Service Worker Registration', pattern: /serviceWorker\.register/, required: true }
  ];
  
  htmlChecks.forEach(check => {
    const found = check.pattern.test(htmlContent);
    console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'OK' : 'FALTANDO'}`);
  });
}

// Gerar relatório
console.log('\n📊 RELATÓRIO FINAL:');
console.log('==================');

const totalChecks = 4; // manifest, sw, icons, html
const passedChecks = [
  manifestExists,
  swExists, 
  iconsDirExists,
  fs.existsSync(htmlPath)
].filter(Boolean).length;

const iconPercentage = Math.round((iconsOk / iconSizes.length) * 100);
const overallScore = Math.round((passedChecks / totalChecks) * 100);

console.log(`🎯 Score Geral: ${overallScore}%`);
console.log(`🎨 Ícones: ${iconPercentage}% (${iconsOk}/${iconSizes.length})`);
console.log(`📱 PWA Ready: ${overallScore >= 75 ? '✅ SIM' : '❌ NÃO'}`);

// Recomendações
console.log('\n💡 RECOMENDAÇÕES:');

if (iconPercentage < 100) {
  console.log('🎨 Converta SVGs para PNGs para melhor compatibilidade');
}

if (overallScore < 100) {
  console.log('🔧 Corrija os itens marcados como ❌ acima');
}

if (overallScore >= 90) {
  console.log('🚀 PWA pronto para produção!');
  console.log('📱 Deploy na Vercel para teste completo');
} else if (overallScore >= 75) {
  console.log('⚠️ PWA funcional, mas pode ser melhorado');
} else {
  console.log('❌ PWA precisa de mais configurações antes do deploy');
}

// Comandos úteis
console.log('\n🛠️ COMANDOS ÚTEIS:');
console.log('==================');
console.log('📱 Testar local: npm run dev');
console.log('🚀 Deploy Vercel: vercel --prod');
console.log('🧪 Lighthouse: DevTools > Lighthouse > PWA');
console.log('🔍 PWA Builder: https://www.pwabuilder.com/');

// Gerar arquivo de status
const statusReport = {
  timestamp: new Date().toISOString(),
  overallScore,
  iconPercentage,
  pwaReady: overallScore >= 75,
  checks: {
    manifest: manifestExists,
    serviceWorker: swExists,
    icons: iconsOk,
    html: fs.existsSync(htmlPath)
  },
  recommendations: []
};

if (iconPercentage < 100) {
  statusReport.recommendations.push('Convert SVGs to PNGs');
}
if (overallScore < 100) {
  statusReport.recommendations.push('Fix missing PWA components');
}

fs.writeFileSync('pwa-status.json', JSON.stringify(statusReport, null, 2));
console.log('\n📄 Relatório salvo em: pwa-status.json');

console.log('\n🎉 Análise concluída!');
