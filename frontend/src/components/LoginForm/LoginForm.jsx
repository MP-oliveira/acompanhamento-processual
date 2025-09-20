import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import './LoginForm.css';

const LoginForm = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega dados salvos do localStorage ao montar o componente
  useEffect(() => {
    const savedData = localStorage.getItem('loginData');
    if (savedData) {
      try {
        const { email, password, rememberMe: savedRememberMe } = JSON.parse(savedData);
        setFormData({ email, password });
        setRememberMe(savedRememberMe);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        // Remove dados corrompidos
        localStorage.removeItem('loginData');
      }
    }
  }, []);

  // Salva dados no localStorage quando rememberMe está ativo
  const saveLoginData = (email, password, remember) => {
    if (remember) {
      const loginData = { email, password, rememberMe: remember };
      localStorage.setItem('loginData', JSON.stringify(loginData));
    } else {
      localStorage.removeItem('loginData');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email deve ser válido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Salva dados se "Lembrar de mim" estiver marcado
        saveLoginData(formData.email, formData.password, rememberMe);
        
        // Chama a função de login e aguarda a resposta
        const result = await onSubmit(formData);
        
        if (!result.success) {
          // Se houver erro, mostra a mensagem
          setErrors({ general: result.error });
        }
      } catch (error) {
        setErrors({ general: 'Erro inesperado ao fazer login' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    
    // Se desmarcar, remove dados salvos
    if (!isChecked) {
      localStorage.removeItem('loginData');
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-header">
        <div className="login-form-logo">
          <div className="login-form-logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="login-form-title">JurisAcompanha</h1>
        </div>
        <p className="login-form-subtitle">
          Sistema de Acompanhamento Processual
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {(error || errors.general) && (
          <div className="login-form-error">
            <AlertCircle size={16} />
            <span>{error || errors.general}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label required">
            Email
          </label>
          <div className="form-input-wrapper">
            <Mail className="form-input-icon" size={20} />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="seu@email.com"
              disabled={loading || isSubmitting}
            />
          </div>
          {errors.email && (
            <div className="form-error">
              <AlertCircle className="form-error-icon" size={16} />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label required">
            Senha
          </label>
          <div className="form-input-wrapper">
            <Lock className="form-input-icon" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Sua senha"
              disabled={loading || isSubmitting}
            />
            <button
              type="button"
              className="form-input-toggle"
              onClick={togglePasswordVisibility}
              disabled={loading || isSubmitting}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <div className="form-error">
              <AlertCircle className="form-error-icon" size={16} />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        <div className="login-form-options">
          <label className="form-checkbox-group">
            <input
              type="checkbox"
              className="form-checkbox"
              id="remember"
              name="remember"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              disabled={loading || isSubmitting}
            />
            <span>Lembrar de mim</span>
          </label>
          
          <Link to="/esqueci-senha" className="login-form-forgot">
            Esqueceu a senha?
          </Link>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn-primary btn-lg ${(loading || isSubmitting) ? 'btn-loading' : ''}`}
            disabled={loading || isSubmitting}
          >
            {(loading || isSubmitting) ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <div className="login-form-footer">
          <p className="login-form-footer-text">
            Não tem uma conta?{' '}
            <Link to="/register" className="login-form-footer-link">
              Registre-se
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
