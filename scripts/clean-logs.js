#!/usr/bin/env node

/**
 * Script para remover console.log de produção
 * Mantém apenas logs importantes para desenvolvimento
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Logs que devem ser mantidos (importantes para produção)
const KEEP_LOGS = [
  'console.error',
  'console.warn',
  'logger.',
  'console.log.*🔔.*Push Service Worker',
  'console.log.*✅.*Push Service Worker',
  'console.log.*📬.*Push Service Worker',
  'console.log.*👆.*Push Service Worker'
];

function shouldKeepLog(line) {
  return KEEP_LOGS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(line);
    }
    return line.includes(pattern);
  });
}

function cleanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let modified = false;
    const cleanedLines = lines.map(line => {
      // Verificar se a linha contém console.log
      if (line.includes('console.log') && !shouldKeepLog(line)) {
        // Remover a linha ou comentar
        modified = true;
        if (line.trim().startsWith('console.log')) {
          return ''; // Remover linha inteira
        } else {
          return line.replace(/console\.log\([^)]*\);?/g, ''); // Remover apenas o console.log
        }
      }
      return line;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, cleanedLines.join('\n'));
      console.log(`✅ Limpo: ${path.relative(projectRoot, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Pular node_modules e outros diretórios desnecessários
      if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
        processDirectory(fullPath);
      }
    } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx'))) {
      cleanFile(fullPath);
    }
  }
}

console.log('🧹 Limpando console.log para produção...');

// Processar frontend
console.log('📁 Processando frontend...');
processDirectory(path.join(projectRoot, 'frontend/src'));

// Processar backend
console.log('📁 Processando backend...');
processDirectory(path.join(projectRoot, 'backend/src'));

console.log('✅ Limpeza concluída!');
console.log('📝 Logs mantidos:');
KEEP_LOGS.forEach(log => console.log(`  - ${log}`));