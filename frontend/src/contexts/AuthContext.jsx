import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar token ao inicializar
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔍 Iniciando verificação de autenticação...');
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('🔑 Token salvo:', !!savedToken);
      console.log('👤 Usuário salvo:', !!savedUser);
      
      if (savedToken && savedUser) {
        try {
          console.log('🔍 Verificando token no backend...');
          // Verificar se o token ainda é válido
          const response = await authService.getProfile();
          console.log('✅ Token válido, usuário:', response.user);
          setUser(response.user);
          setToken(savedToken);
        } catch (error) {
          console.error('❌ Token inválido:', error);
          console.error('❌ Detalhes do erro:', error.response?.status, error.response?.data);
          // Limpar dados inválidos
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      } else {
        // Não há dados salvos, garantir estado limpo
        setUser(null);
        setToken(null);
      }
      console.log('🏁 Finalizando verificação de autenticação');
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Tentando fazer login para:', email);
      const response = await authService.login(email, password);
      console.log('✅ Login bem-sucedido:', response);
      const { token: newToken, user: newUser } = response;
      
      setToken(newToken);
      setUser(newUser);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      console.log('💾 Dados salvos no localStorage');
      return response;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
