import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';
import './RegisterForm.css';

const RegisterForm = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

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

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email deve ser válido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register-form-container">
      <div className="register-form-header">
        <div className="register-form-logo">
          <div className="register-form-logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="register-form-title">JurisAcompanha</h1>
        </div>
        <p className="register-form-subtitle">
          Crie sua conta para começar
        </p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        {error && (
          <div className="register-form-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="nome" className="form-label required">
            Nome Completo
          </label>
          <div className="form-input-wrapper">
            <User className="form-input-icon" size={20} />
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`form-input ${errors.nome ? 'error' : ''}`}
              placeholder="Seu nome completo"
              disabled={loading}
            />
          </div>
          {errors.nome && (
            <div className="form-error">
              <AlertCircle className="form-error-icon" size={16} />
              <span>{errors.nome}</span>
            </div>
          )}
        </div>

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
              disabled={loading}
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
              disabled={loading}
            />
            <button
              type="button"
              className="form-input-toggle"
              onClick={togglePasswordVisibility}
              disabled={loading}
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
          <div className="form-help">
            A senha deve conter pelo menos 6 caracteres, incluindo letras maiúsculas, minúsculas e números.
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label required">
            Confirmar Senha
          </label>
          <div className="form-input-wrapper">
            <Lock className="form-input-icon" size={20} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirme sua senha"
              disabled={loading}
            />
            <button
              type="button"
              className="form-input-toggle"
              onClick={toggleConfirmPasswordVisibility}
              disabled={loading}
              aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="form-error">
              <AlertCircle className="form-error-icon" size={16} />
              <span>{errors.confirmPassword}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="role" className="form-label required">
            Tipo de Usuário
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-select"
            disabled={loading}
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
          <div className="form-help">
            Escolha o tipo de usuário. Administradores têm acesso a todas as funcionalidades.
          </div>
        </div>

        <div className="register-form-terms">
          <label className="form-checkbox-group">
            <input
              type="checkbox"
              className="form-checkbox"
              id="terms"
              name="terms"
              required
            />
            <span>
              Eu aceito os{' '}
              <Link to="/termos" className="register-form-terms-link">
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link to="/privacidade" className="register-form-terms-link">
                Política de Privacidade
              </Link>
            </span>
          </label>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn-primary btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Criando conta...' : (
              <>
                <UserPlus size={20} />
                Criar Conta
              </>
            )}
          </button>
        </div>

        <div className="register-form-footer">
          <p className="register-form-footer-text">
            Já tem uma conta?{' '}
            <Link to="/login" className="register-form-footer-link">
              Faça login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
