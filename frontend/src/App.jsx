import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Topbar from './components/Topbar/Topbar';
import Sidebar from './components/Sidebar/Sidebar';
import LoginForm from './components/LoginForm/LoginForm';
import RegisterForm from './components/RegisterForm/RegisterForm';
import PWAInstaller from './components/PWAInstaller/PWAInstaller';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import PageLoading from './components/PageLoading/PageLoading';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Breadcrumbs from './components/Breadcrumbs/Breadcrumbs';
import AdminRoute from './components/AdminRoute/AdminRoute';
import GlobalSearch from './components/GlobalSearch/GlobalSearch';
import ChatBot from './components/ChatBot/ChatBot';
import ShortcutsList from './components/ShortcutsList/ShortcutsList';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useGlobalSearch } from './hooks/useGlobalSearch';
import './styles/index.css';
import './styles/layout/App.css';
import './styles/components/forms.css';

// Lazy loading de todas as páginas
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Processos = lazy(() => import('./components/Processos/Processos'));
const KanbanBoard = lazy(() => import('./components/KanbanBoard/KanbanBoard'));
const NovoProcesso = lazy(() => import('./components/NovoProcesso/NovoProcesso'));
const EditarProcesso = lazy(() => import('./components/EditarProcesso/EditarProcesso'));
const Audiencias = lazy(() => import('./components/Audiencias/Audiencias'));
const Recursos = lazy(() => import('./components/Recursos/Recursos'));
const Alertas = lazy(() => import('./components/Alertas/Alertas'));
const Calendario = lazy(() => import('./components/Calendario/Calendario'));
const Consultas = lazy(() => import('./components/Consultas/Consultas'));
const Relatorios = lazy(() => import('./components/Relatorios/Relatorios'));
const Usuarios = lazy(() => import('./components/Usuarios/Usuarios'));
const Configuracoes = lazy(() => import('./components/Configuracoes/Configuracoes'));
const Perfil = lazy(() => import('./components/Perfil/Perfil'));
const PerformanceDashboard = lazy(() => import('./components/PerformanceDashboard/PerformanceDashboard'));
const Workflows = lazy(() => import('./components/Workflows/Workflows'));
const DashboardFinanceiro = lazy(() => import('./components/DashboardFinanceiro/DashboardFinanceiro'));
const Clientes = lazy(() => import('./components/Clientes/Clientes'));
const TimesheetPage = lazy(() => import('./components/TimesheetPage/TimesheetPage'));
const TimesheetApproval = lazy(() => import('./components/TimesheetApproval/TimesheetApproval'));

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
const AppContent = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  const [showShortcuts, setShowShortcuts] = React.useState(false);
  
  // Hook de busca global (Cmd+K)
  const { isOpen: searchOpen, close: closeSearch } = useGlobalSearch();
  
  // Ativar atalhos de teclado dentro do Router
  useKeyboardShortcuts(() => setShowShortcuts(true));
  
  // Configurar atualizações em tempo real quando autenticado
  // useRealtimeUpdates(); // Temporariamente desabilitado para debug

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      return { success: true };
    } catch (error) {
      console.error('💥 App.jsx - Erro no login:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      return { success: false, error: errorMessage };
    }
  };

  const handleLogout = () => {
    logout();
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
              user={user}
            />
            
            <main className="main-content">
              <ErrorBoundary>
                <Breadcrumbs />
                <Suspense fallback={<PageLoading type="skeleton" />}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/processos" element={<Processos />} />
                    <Route path="/processos/kanban" element={<KanbanBoard />} />
                    <Route path="/processos/novo" element={<NovoProcesso />} />
                    <Route path="/processos/editar/:id" element={<EditarProcesso />} />
                    <Route path="/audiencias" element={<Audiencias />} />
                    <Route path="/recursos" element={<Recursos />} />
                    <Route path="/alertas" element={<Alertas />} />
                    <Route path="/calendario" element={<Calendario />} />
                    <Route path="/consultas" element={<Consultas />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/usuarios" element={
                      <AdminRoute user={user}>
                        <Usuarios />
                      </AdminRoute>
                    } />
                    <Route path="/workflows" element={<Workflows />} />
                    <Route path="/financeiro" element={<DashboardFinanceiro />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/timesheet" element={<TimesheetPage />} />
                    <Route path="/timesheet/approval" element={
                      <AdminRoute user={user}>
                        <TimesheetApproval />
                      </AdminRoute>
                    } />
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
      
      {/* Global Search (Cmd+K) */}
      {isAuthenticated && (
        <GlobalSearch isOpen={searchOpen} onClose={closeSearch} />
      )}
      
      {/* ChatBot Assistant */}
      {isAuthenticated && (
        <ChatBot />
      )}
      
      {/* Shortcuts List (?) */}
      <ShortcutsList 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <AppContent
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
