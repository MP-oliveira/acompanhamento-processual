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
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          'utils-vendor': ['axios'],
        },
      },
    },
    // Otimizações de tamanho
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild', // Usar esbuild que é mais rápido
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
})
