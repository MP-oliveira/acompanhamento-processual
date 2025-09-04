import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Topbar from './components/Topbar/Topbar';
import Sidebar from './components/Sidebar/Sidebar';
import LoginForm from './components/LoginForm/LoginForm';
import RegisterForm from './components/RegisterForm/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import Processos from './components/Processos/Processos';
import NovoProcesso from './components/NovoProcesso/NovoProcesso';
import Alertas from './components/Alertas/Alertas';
import Calendario from './components/Calendario/Calendario';
import Consultas from './components/Consultas/Consultas';
import Relatorios from './components/Relatorios/Relatorios';
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

// Mock de usuário para demonstração
const mockUser = {
  id: 1,
  nome: 'Dr. João Silva',
  email: 'joao.silva@advocacia.com',
  role: 'advogado'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = async (credentials) => {
    // Simulação de login
    console.log('Tentando fazer login com:', credentials);
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock de validação
    if (credentials.email === 'admin@teste.com' && credentials.password === '123456') {
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return { success: false, error: 'Email ou senha incorretos' };
    }
  };

  const handleLogout = () => {
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

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          {!isAuthenticated ? (
            // Páginas de Autenticação
            <div className="login-page">
              <Routes>
                <Route path="/login" element={<LoginForm onSubmit={handleLogin} />} />
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
                    <Route path="/processos/editar/:id" element={<div>Editar Processo (em desenvolvimento)</div>} />
                    <Route path="/processos/:id" element={<div>Visualizar Processo (em desenvolvimento)</div>} />
                    <Route path="/alertas" element={<Alertas />} />
                    <Route path="/calendario" element={<Calendario />} />
                    <Route path="/consultas" element={<Consultas />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/usuarios" element={<div>Página de Usuários (em desenvolvimento)</div>} />
                    <Route path="/configuracoes" element={<div>Página de Configurações (em desenvolvimento)</div>} />
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
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
