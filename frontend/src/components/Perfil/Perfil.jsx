import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X
} from 'lucide-react';
import { authService } from '../../services/api.js';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Perfil.css';

const Perfil = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cpf: '',
    oab: '',
    especialidade: '',
    dataNascimento: '',
    dataAdmissao: '',
    role: 'user'
  });

  const [formData, setFormData] = useState({ ...user });

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const response = await authService.getProfile();
        setUser(response.user);
        setFormData(response.user);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        // Se não conseguir carregar, redireciona para login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Aqui você pode implementar a atualização do perfil via API
      // Por enquanto, apenas atualiza localmente
      setUser(formData);
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setIsEditing(false);
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'advogado': return 'Advogado';
      case 'assistente': return 'Assistente';
      default: return 'Usuário';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'admin';
      case 'advogado': return 'advogado';
      case 'assistente': return 'assistente';
      default: return 'usuario';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="perfil">
        <div className="perfil-loading">
          <div className="perfil-loading-spinner" />
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-breadcrumb">
            <button 
              className="page-header-breadcrumb-link"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <span className="page-header-breadcrumb-separator">/</span>
            <span className="page-header-breadcrumb-current">Meu Perfil</span>
          </div>
          <h1 className="page-title">Meu Perfil</h1>
        </div>
        <div className="page-header-actions">
          {!isEditing ? (
            <button 
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={20} />
              Editar Perfil
            </button>
          ) : (
            <div className="perfil-edit-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={20} />
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={20} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="perfil-content">
        <div className="perfil-grid">
          {/* Informações Pessoais */}
          <div className="perfil-section">
            <div className="perfil-section-header">
              <h2 className="perfil-section-title">
                <User size={20} />
                Informações Pessoais
              </h2>
            </div>
            <div className="perfil-section-content">
              <div className="perfil-form-grid">
                <div className="perfil-form-group">
                  <label>Nome Completo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="perfil-input"
                    />
                  ) : (
                    <span className="perfil-value">{user.nome}</span>
                  )}
                </div>
                <div className="perfil-form-group">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="perfil-input"
                    />
                  ) : (
                    <span className="perfil-value">{user.email}</span>
                  )}
                </div>
                <div className="perfil-form-group">
                  <label>Telefone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      className="perfil-input"
                      placeholder="(00) 0000-0000"
                    />
                  ) : (
                    <span className="perfil-value">{user.telefone}</span>
                  )}
                </div>
                <div className="perfil-form-group">
                  <label>CPF</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      className="perfil-input"
                      placeholder="000.000.000-00"
                    />
                  ) : (
                    <span className="perfil-value">{user.cpf}</span>
                  )}
                </div>
                <div className="perfil-form-group perfil-form-group-full">
                  <label>Endereço</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      className="perfil-input"
                    />
                  ) : (
                    <span className="perfil-value">{user.endereco}</span>
                  )}
                </div>
                <div className="perfil-form-group">
                  <label>Data de Nascimento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                      className="perfil-input"
                    />
                  ) : (
                    <span className="perfil-value">{formatDate(user.dataNascimento)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="perfil-section">
            <div className="perfil-section-header">
              <h2 className="perfil-section-title">
                <Shield size={20} />
                Informações Profissionais
              </h2>
            </div>
            <div className="perfil-section-content">
              <div className="perfil-form-grid">
                <div className="perfil-form-group">
                  <label>OAB</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.oab}
                      onChange={(e) => handleInputChange('oab', e.target.value)}
                      className="perfil-input"
                      placeholder="00000/UF"
                    />
                  ) : (
                    <span className="perfil-value">{user.oab}</span>
                  )}
                </div>
                <div className="perfil-form-group">
                  <label>Especialidade</label>
                  {isEditing ? (
                    <select
                      value={formData.especialidade}
                      onChange={(e) => handleInputChange('especialidade', e.target.value)}
                      className="perfil-select"
                    >
                      <option value="Direito Civil">Direito Civil</option>
                      <option value="Direito Penal">Direito Penal</option>
                      <option value="Direito Trabalhista">Direito Trabalhista</option>
                      <option value="Direito Tributário">Direito Tributário</option>
                      <option value="Direito Empresarial">Direito Empresarial</option>
                      <option value="Direito de Família">Direito de Família</option>
                    </select>
                  ) : (
                    <span className="perfil-value">{user.especialidade}</span>
                  )}
                </div>
                <div className="perfil-form-group">
                  <label>Função</label>
                  <span className={`perfil-role-badge perfil-role-${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                </div>
                <div className="perfil-form-group">
                  <label>Data de Admissão</label>
                  <span className="perfil-value">{formatDate(user.dataAdmissao)}</span>
                </div>
              </div>
            </div>

            {/* Seção de Configurações */}
            <div className="perfil-section">
              <div className="perfil-section-header">
                <h3>Configurações</h3>
              </div>
              <div className="perfil-section-content">
                <div className="perfil-form-group">
                  <label>Tema da Interface</label>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
