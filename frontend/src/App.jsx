import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { authService } from './services/api';
import { ThemeProvider } from './contexts/ThemeContext';
import Topbar from './components/Topbar/Topbar';
import Sidebar from './components/Sidebar/Sidebar';
import LoginForm from './components/LoginForm/LoginForm';
import RegisterForm from './components/RegisterForm/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import Processos from './components/Processos/Processos';
import NovoProcesso from './components/NovoProcesso/NovoProcesso';
import EditarProcesso from './components/EditarProcesso/EditarProcesso';
import Alertas from './components/Alertas/Alertas';
import Calendario from './components/Calendario/Calendario';
import Consultas from './components/Consultas/Consultas';
import Relatorios from './components/Relatorios/Relatorios';
import Usuarios from './components/Usuarios/Usuarios';
import Configuracoes from './components/Configuracoes/Configuracoes';
import Perfil from './components/Perfil/Perfil';
import PWAInstaller from './components/PWAInstaller/PWAInstaller';
import './styles/index.css';
import './styles/layout/App.css';
import './styles/components/forms.css';

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
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
                onMenuToggle={toggleSidebar}
                onLogout={handleLogout}
              />
              
              <div className="app-container">
                <Sidebar 
                  isOpen={sidebarOpen}
                  onClose={closeSidebar}
                />
                
                <main className="main-content">
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
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
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
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
