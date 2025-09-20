import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - gera relatório de análise do bundle
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  build: {
    // Otimizações de build
    rollupOptions: {
      output: {
        // Code splitting por chunks
        manualChunks: (id) => {
          // Vendor chunks otimizados
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) {
              return 'ui-vendor';
            }
            if (id.includes('axios') || id.includes('lodash')) {
              return 'utils-vendor';
            }
            // Chunk separado para bibliotecas pesadas
            if (id.includes('jspdf') || id.includes('file-saver')) {
              return 'export-vendor';
            }
            if (id.includes('html2canvas') || id.includes('dompurify')) {
              return 'dom-vendor';
            }
            // Outras bibliotecas em chunk separado
            return 'vendor';
          }
        },
        // Otimizações de chunk
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: 'assets/[name]-[hash].[ext]',
        entryFileNames: 'assets/[name]-[hash].js',
      },
      // Tree shaking otimizado
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Otimizações de tamanho
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    // Tree shaking agressivo
    treeshake: true,
    // Otimizações de CSS
    cssCodeSplit: true,
    cssMinify: true,
    // Source maps para debug em produção
    sourcemap: false,
    // Otimizações de assets
    assetsInlineLimit: 4096, // 4kb
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@tanstack/react-query',
      'lucide-react',
      'axios'
    ],
    // Excluir bibliotecas pesadas do pre-bundle
    exclude: ['jspdf', 'file-saver', 'html2canvas']
  },
  // Configurações de esbuild para tree shaking
  esbuild: {
    treeShaking: true,
    drop: ['console', 'debugger'], // Remove console.log em produção
    pure: ['console.log', 'console.warn'], // Marca como pure functions
  },
})
