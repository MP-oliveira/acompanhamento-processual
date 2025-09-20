import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { authService } from './services/api';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Topbar from './components/Topbar/Topbar';
import Sidebar from './components/Sidebar/Sidebar';
import LoginForm from './components/LoginForm/LoginForm';
import RegisterForm from './components/RegisterForm/RegisterForm';
import PWAInstaller from './components/PWAInstaller/PWAInstaller';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import PageLoading from './components/PageLoading/PageLoading';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Breadcrumbs from './components/Breadcrumbs/Breadcrumbs';
import performanceMetrics from './utils/performanceMetrics';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import './styles/index.css';
import './styles/layout/App.css';
import './styles/components/forms.css';

// Lazy loading de todas as páginas
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Processos = lazy(() => import('./components/Processos/Processos'));
const NovoProcesso = lazy(() => import('./components/NovoProcesso/NovoProcesso'));
const EditarProcesso = lazy(() => import('./components/EditarProcesso/EditarProcesso'));
const Alertas = lazy(() => import('./components/Alertas/Alertas'));
const Calendario = lazy(() => import('./components/Calendario/Calendario'));
const Consultas = lazy(() => import('./components/Consultas/Consultas'));
const Relatorios = lazy(() => import('./components/Relatorios/Relatorios'));
const Usuarios = lazy(() => import('./components/Usuarios/Usuarios'));
const Configuracoes = lazy(() => import('./components/Configuracoes/Configuracoes'));
const Perfil = lazy(() => import('./components/Perfil/Perfil'));
const PerformanceDashboard = lazy(() => import('./components/PerformanceDashboard/PerformanceDashboard'));

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente interno para usar hooks dentro do Router
const AppContent = ({ 
  isAuthenticated, 
  sidebarOpen, 
  setSidebarOpen, 
  user, 
  handleLogin, 
  handleLogout, 
  loading 
}) => {
  // Ativar atalhos de teclado dentro do Router
  useKeyboardShortcuts();
  
  // Configurar atualizações em tempo real quando autenticado
  useRealtimeUpdates();

  return (
    <div className="app">
      {!isAuthenticated ? (
        // Páginas de Autenticação
        <div className="login-page">
          <Routes>
            <Route path="/login" element={<LoginForm onSubmit={handleLogin} loading={loading} />} />
            <Route path="/register" element={<RegisterForm onSubmit={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      ) : (
        // Aplicação principal (autenticada)
        <>
          <Topbar 
            user={user}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            onLogout={handleLogout}
          />
          
          <div className="app-container">
            <Sidebar 
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            
            <main className="main-content">
              <ErrorBoundary>
                <Breadcrumbs />
                <Suspense fallback={<PageLoading type="skeleton" />}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/processos" element={<Processos />} />
                    <Route path="/processos/novo" element={<NovoProcesso />} />
                    <Route path="/processos/editar/:id" element={<EditarProcesso />} />
                    <Route path="/alertas" element={<Alertas />} />
                    <Route path="/calendario" element={<Calendario />} />
                    <Route path="/consultas" element={<Consultas />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/usuarios" element={<Usuarios />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/performance" element={<PerformanceDashboard />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
          </div>
        </>
      )}

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
          },
        }}
      />
      
      {/* PWA Installer */}
      <PWAInstaller />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica se há token válido ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verifica se o token ainda é válido
          const response = await authService.getProfile();
          setUser(response.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token inválido, remove dados salvos
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials.email, credentials.password);
      
      // Salva token e dados do usuário
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Remove dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setUser(null);
    setIsAuthenticated(false);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <LoadingSpinner size="large" text="Carregando aplicação..." />
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <AppContent
              isAuthenticated={isAuthenticated}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              user={user}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              loading={loading}
            />
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
