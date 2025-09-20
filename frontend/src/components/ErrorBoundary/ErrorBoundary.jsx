import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para mostrar a UI de erro
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para debugging
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <AlertTriangle size={48} />
            </div>
            <h3 className="error-boundary-title">Ops! Algo deu errado</h3>
            <p className="error-boundary-message">
              Não foi possível carregar esta página. Isso pode ser um problema temporário.
            </p>
            <div className="error-boundary-actions">
              <button 
                className="btn btn-primary"
                onClick={this.handleRetry}
              >
                <RefreshCw size={16} />
                Tentar Novamente
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
              >
                Recarregar Página
              </button>
            </div>
            
            {/* Mostrar detalhes do erro apenas em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary-details">
                <summary>Detalhes do erro (desenvolvimento)</summary>
                <pre className="error-boundary-stack">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
