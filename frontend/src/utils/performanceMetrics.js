// Performance Metrics - Monitoramento de Performance
class PerformanceMetrics {
  constructor() {
    this.metrics = {
      pageLoad: {},
      apiCalls: [],
      userInteractions: [],
      errors: [],
      bundleSize: {},
      cacheHit: 0,
      cacheMiss: 0
    };
    
    this.init();
  }

  init() {
    // Métricas de carregamento da página
    this.measurePageLoad();
    
    // Métricas de API calls
    this.measureApiCalls();
    
    // Métricas de interações do usuário
    this.measureUserInteractions();
    
    // Métricas de cache
    this.measureCachePerformance();
    
    // Métricas de bundle
    this.measureBundlePerformance();
  }

  // Medir tempo de carregamento da página
  measurePageLoad() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        this.metrics.pageLoad = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: this.getLCP(),
          firstInputDelay: this.getFID(),
          cumulativeLayoutShift: this.getCLS(),
          timestamp: Date.now()
        };

        this.logMetric('pageLoad', this.metrics.pageLoad);
      }, 0);
    });
  }

  // Medir chamadas de API
  measureApiCalls() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        const apiCall = {
          url: url.toString(),
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: duration,
          timestamp: Date.now(),
          success: response.ok
        };

        this.metrics.apiCalls.push(apiCall);
        this.logMetric('apiCall', apiCall);
        
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        const apiCall = {
          url: url.toString(),
          method: args[1]?.method || 'GET',
          status: 0,
          duration: duration,
          timestamp: Date.now(),
          success: false,
          error: error.message
        };

        this.metrics.apiCalls.push(apiCall);
        this.logMetric('apiCall', apiCall);
        
        throw error;
      }
    };
  }

  // Medir interações do usuário
  measureUserInteractions() {
    const interactions = ['click', 'keydown', 'scroll', 'touchstart'];
    
    interactions.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        const interaction = {
          type: eventType,
          target: event.target.tagName,
          timestamp: Date.now(),
          coordinates: {
            x: event.clientX || 0,
            y: event.clientY || 0
          }
        };

        this.metrics.userInteractions.push(interaction);
        
        // Manter apenas as últimas 100 interações
        if (this.metrics.userInteractions.length > 100) {
          this.metrics.userInteractions.shift();
        }
      }, { passive: true });
    });
  }

  // Medir performance do cache
  measureCachePerformance() {
    // Interceptar service worker para métricas de cache
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'cache-metric') {
          if (event.data.hit) {
            this.metrics.cacheHit++;
          } else {
            this.metrics.cacheMiss++;
          }
        }
      });
    }
  }

  // Medir performance do bundle
  measureBundlePerformance() {
    const scripts = Array.from(document.scripts);
    let totalSize = 0;
    
    scripts.forEach(script => {
      if (script.src) {
        const size = this.estimateScriptSize(script.src);
        totalSize += size;
      }
    });

    this.metrics.bundleSize = {
      totalScripts: scripts.length,
      estimatedTotalSize: totalSize,
      timestamp: Date.now()
    };

    this.logMetric('bundleSize', this.metrics.bundleSize);
  }

  // Obter Largest Contentful Paint
  getLCP() {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Timeout após 5 segundos
      setTimeout(() => resolve(0), 5000);
    });
  }

  // Obter First Input Delay
  getFID() {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        resolve(firstEntry.processingStart - firstEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      
      // Timeout após 5 segundos
      setTimeout(() => resolve(0), 5000);
    });
  }

  // Obter Cumulative Layout Shift
  getCLS() {
    return new Promise((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        resolve(clsValue);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      
      // Timeout após 5 segundos
      setTimeout(() => resolve(clsValue), 5000);
    });
  }

  // Estimar tamanho do script
  estimateScriptSize(url) {
    // Estimativa baseada no nome do arquivo
    if (url.includes('vendor')) return 200000; // ~200kb
    if (url.includes('main')) return 50000;   // ~50kb
    if (url.includes('chunk')) return 30000;  // ~30kb
    return 10000; // ~10kb
  }

  // Log de métricas
  logMetric(type, data) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric [${type}]:`, data);
    }
    
    // Em produção, enviar para serviço de analytics
    this.sendToAnalytics(type, data);
  }

  // Enviar para analytics (implementar conforme necessário)
  sendToAnalytics(type, data) {
    // Exemplo: Google Analytics, Mixpanel, etc.
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_type: type,
        metric_data: JSON.stringify(data)
      });
    }
  }

  // Obter resumo das métricas
  getSummary() {
    const apiCalls = this.metrics.apiCalls;
    const avgApiDuration = apiCalls.length > 0 
      ? apiCalls.reduce((sum, call) => sum + call.duration, 0) / apiCalls.length 
      : 0;

    const successRate = apiCalls.length > 0 
      ? (apiCalls.filter(call => call.success).length / apiCalls.length) * 100 
      : 100;

    const cacheHitRate = (this.metrics.cacheHit + this.metrics.cacheMiss) > 0
      ? (this.metrics.cacheHit / (this.metrics.cacheHit + this.metrics.cacheMiss)) * 100
      : 0;

    return {
      pageLoad: this.metrics.pageLoad,
      apiPerformance: {
        totalCalls: apiCalls.length,
        averageDuration: avgApiDuration,
        successRate: successRate
      },
      cachePerformance: {
        hitRate: cacheHitRate,
        totalHits: this.metrics.cacheHit,
        totalMisses: this.metrics.cacheMiss
      },
      bundleSize: this.metrics.bundleSize,
      userInteractions: this.metrics.userInteractions.length,
      timestamp: Date.now()
    };
  }

  // Exportar métricas para análise
  exportMetrics() {
    const summary = this.getSummary();
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Limpar métricas antigas
  cleanup() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    this.metrics.apiCalls = this.metrics.apiCalls.filter(call => call.timestamp > oneHourAgo);
    this.metrics.userInteractions = this.metrics.userInteractions.filter(interaction => interaction.timestamp > oneHourAgo);
  }
}

// Singleton instance
const performanceMetrics = new PerformanceMetrics();

// Cleanup a cada hora
setInterval(() => {
  performanceMetrics.cleanup();
}, 60 * 60 * 1000);

export default performanceMetrics;
