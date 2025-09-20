import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Zap,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import performanceMetrics from '../../utils/performanceMetrics';
import './PerformanceDashboard.css';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadMetrics = () => {
    setIsLoading(true);
    const summary = performanceMetrics.getSummary();
    setMetrics(summary);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    loadMetrics();
    
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'var(--success-500)';
    if (value <= thresholds.warning) return 'var(--warning-500)';
    return 'var(--error-500)';
  };

  const exportMetrics = () => {
    performanceMetrics.exportMetrics();
  };

  if (isLoading) {
    return (
      <div className="performance-dashboard">
        <div className="performance-dashboard-loading">
          <RefreshCw size={24} className="spinning" />
          <p>Carregando métricas de performance...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="performance-dashboard">
        <div className="performance-dashboard-error">
          <AlertTriangle size={24} />
          <p>Erro ao carregar métricas de performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-dashboard">
      <div className="performance-dashboard-header">
        <div className="performance-dashboard-title">
          <Activity size={24} />
          <h2>Performance Dashboard</h2>
        </div>
        <div className="performance-dashboard-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={loadMetrics}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            Atualizar
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={exportMetrics}
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {lastUpdate && (
        <div className="performance-dashboard-update">
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        </div>
      )}

      {/* Métricas de Carregamento da Página */}
      <div className="performance-section">
        <h3>
          <Clock size={20} />
          Carregamento da Página
        </h3>
        <div className="performance-metrics-grid">
          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: getPerformanceColor(metrics.pageLoad.firstContentfulPaint, { good: 1500, warning: 2500 }) }}>
              <Zap size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {formatTime(metrics.pageLoad.firstContentfulPaint)}
              </div>
              <div className="performance-metric-label">First Contentful Paint</div>
            </div>
          </div>

          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: getPerformanceColor(metrics.pageLoad.largestContentfulPaint, { good: 2500, warning: 4000 }) }}>
              <TrendingUp size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {formatTime(metrics.pageLoad.largestContentfulPaint)}
              </div>
              <div className="performance-metric-label">Largest Contentful Paint</div>
            </div>
          </div>

          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: getPerformanceColor(metrics.pageLoad.domContentLoaded, { good: 1000, warning: 2000 }) }}>
              <Database size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {formatTime(metrics.pageLoad.domContentLoaded)}
              </div>
              <div className="performance-metric-label">DOM Content Loaded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de API */}
      <div className="performance-section">
        <h3>
          <Wifi size={20} />
          Performance da API
        </h3>
        <div className="performance-metrics-grid">
          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: getPerformanceColor(metrics.apiPerformance.averageDuration, { good: 500, warning: 1000 }) }}>
              <Clock size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {formatTime(metrics.apiPerformance.averageDuration)}
              </div>
              <div className="performance-metric-label">Tempo Médio de Resposta</div>
            </div>
          </div>

          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: getPerformanceColor(100 - metrics.apiPerformance.successRate, { good: 5, warning: 10 }) }}>
              {metrics.apiPerformance.successRate >= 95 ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {metrics.apiPerformance.successRate.toFixed(1)}%
              </div>
              <div className="performance-metric-label">Taxa de Sucesso</div>
            </div>
          </div>

          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: 'var(--primary-500)' }}>
              <BarChart3 size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {metrics.apiPerformance.totalCalls}
              </div>
              <div className="performance-metric-label">Total de Chamadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Cache */}
      <div className="performance-section">
        <h3>
          <Database size={20} />
          Performance do Cache
        </h3>
        <div className="performance-metrics-grid">
          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: getPerformanceColor(100 - metrics.cachePerformance.hitRate, { good: 10, warning: 20 }) }}>
              <TrendingUp size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {metrics.cachePerformance.hitRate.toFixed(1)}%
              </div>
              <div className="performance-metric-label">Taxa de Acerto do Cache</div>
            </div>
          </div>

          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: 'var(--success-500)' }}>
              <CheckCircle size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {metrics.cachePerformance.totalHits}
              </div>
              <div className="performance-metric-label">Cache Hits</div>
            </div>
          </div>

          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: 'var(--warning-500)' }}>
              <TrendingDown size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {metrics.cachePerformance.totalMisses}
              </div>
              <div className="performance-metric-label">Cache Misses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas do Bundle */}
      <div className="performance-section">
        <h3>
          <BarChart3 size={20} />
          Tamanho do Bundle
        </h3>
        <div className="performance-metrics-grid">
          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: 'var(--primary-500)' }}>
              <Database size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {metrics.bundleSize.totalScripts}
              </div>
              <div className="performance-metric-label">Total de Scripts</div>
            </div>
          </div>

          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: getPerformanceColor(metrics.bundleSize.estimatedTotalSize / 1024, { good: 500, warning: 1000 }) }}>
              <Activity size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {formatBytes(metrics.bundleSize.estimatedTotalSize)}
              </div>
              <div className="performance-metric-label">Tamanho Estimado</div>
            </div>
          </div>

          <div className="performance-metric-card">
            <div className="performance-metric-icon" style={{ color: 'var(--primary-500)' }}>
              <BarChart3 size={20} />
            </div>
            <div className="performance-metric-content">
              <div className="performance-metric-value">
                {metrics.userInteractions}
              </div>
              <div className="performance-metric-label">Interações do Usuário</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
