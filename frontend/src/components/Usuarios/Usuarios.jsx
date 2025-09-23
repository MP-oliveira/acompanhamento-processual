import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  User,
  Mail,
  Phone,
  Shield,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  XCircle
} from 'lucide-react';
import { userService } from '../../services/api.js';
import './Usuarios.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nome: '',
    email: '',
    telefone: '',
    role: 'advogado',
    status: 'ativo',
    senha: '',
    confirmarSenha: ''
  });

  useEffect(() => {
    const loadUsuarios = async () => {
      setLoading(true);
      try {
        const response = await userService.getAll({
          page: 1,
          limit: 100,
          search: searchTerm,
          role: roleFilter === 'todos' ? '' : roleFilter,
          status: statusFilter === 'todos' ? '' : statusFilter
        });
        setUsuarios(response.users || []);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsuarios();
  }, [searchTerm, roleFilter, statusFilter]);

  const sortedUsuarios = [...usuarios].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'ultimoAcesso' || sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'advogado': return 'Advogado';
      case 'assistente': return 'Assistente';
      default: return 'Usuário';
    }
  };

  const getInitials = (nome) => {
    const names = nome.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'admin';
      case 'advogado': return 'advogado';
      case 'assistente': return 'assistente';
      default: return 'usuario';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return 'active';
      case 'inativo': return 'inactive';
      default: return 'unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (id) => {
    // Implementar edição
  };

  const handleDelete = async (id) => {
    const usuario = usuarios.find(u => u.id === id);
    const usuarioNome = usuario ? usuario.nome : 'este usuário';
    
    if (window.confirm(`Tem certeza que deseja excluir ${usuarioNome}?\n\nEsta ação não pode ser desfeita.`)) {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUsuarios(prev => prev.filter(u => u.id !== id));
        alert('Usuário excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsuarios(prev => prev.map(u => 
        u.id === id 
          ? { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' }
          : u
      ));
      
      const usuario = usuarios.find(u => u.id === id);
      const novoStatus = usuario?.status === 'ativo' ? 'inativo' : 'ativo';
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = usuarios.length;
    const ativos = usuarios.filter(u => u.status === 'ativo').length;
    const inativos = usuarios.filter(u => u.status === 'inativo').length;
    const admins = usuarios.filter(u => u.role === 'admin').length;
    
    return { total, ativos, inativos, admins };
  };

  const stats = getStats();

  const handleNewUser = () => {
    setNewUser({
      nome: '',
      email: '',
      telefone: '',
      role: 'advogado',
      status: 'ativo',
      senha: '',
      confirmarSenha: ''
    });
    setShowNewUserModal(true);
  };

  const handleUserInputChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateNewUser = () => {
    const errors = [];

    if (!newUser.nome.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!newUser.email.trim()) {
      errors.push('Email é obrigatório');
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.push('Email deve ser válido');
    }

    if (!newUser.telefone.trim()) {
      errors.push('Telefone é obrigatório');
    }

    if (!newUser.senha.trim()) {
      errors.push('Senha é obrigatória');
    } else if (newUser.senha.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (newUser.senha !== newUser.confirmarSenha) {
      errors.push('Senhas não coincidem');
    }

    // Verificar se email já existe
    const emailExists = usuarios.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (emailExists) {
      errors.push('Este email já está em uso');
    }

    return errors;
  };

  const handleSaveUser = async () => {
    const errors = validateNewUser();
    
    if (errors.length > 0) {
      alert('Por favor, corrija os seguintes erros:\n\n' + errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      
      // Simula delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));

      const user = {
        id: Date.now(), // ID temporário
        nome: newUser.nome.trim(),
        email: newUser.email.trim().toLowerCase(),
        telefone: newUser.telefone.trim(),
        role: newUser.role,
        status: newUser.status,
        ultimoAcesso: null,
        processosAtivos: 0,
        createdAt: new Date().toISOString()
      };

      setUsuarios(prev => [...prev, user]);
      setShowNewUserModal(false);
      setNewUser({
        nome: '',
        email: '',
        telefone: '',
        role: 'advogado',
        status: 'ativo',
        senha: '',
        confirmarSenha: ''
      });
      
      alert('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUser = () => {
    setShowNewUserModal(false);
    setNewUser({
      nome: '',
      email: '',
      telefone: '',
      role: 'advogado',
      status: 'ativo',
      senha: '',
      confirmarSenha: ''
    });
  };

  if (loading) {
    return (
      <div className="usuarios">
        <div className="usuarios-loading">
          <div className="usuarios-loading-spinner" />
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Usuários</h1>
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleNewUser}
          >
            <Plus size={20} />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="usuarios-stats">
        <div className="usuarios-stat-card">
          <div className="usuarios-stat-icon usuarios-stat-total">
            <User size={20} />
          </div>
          <div className="usuarios-stat-content">
            <div className="usuarios-stat-value">{stats.total}</div>
            <div className="usuarios-stat-label">Total</div>
          </div>
        </div>
        
        <div className="usuarios-stat-card">
          <div className="usuarios-stat-icon usuarios-stat-active">
            <UserCheck size={20} />
          </div>
          <div className="usuarios-stat-content">
            <div className="usuarios-stat-value">{stats.ativos}</div>
            <div className="usuarios-stat-label">Ativos</div>
          </div>
        </div>
        
        <div className="usuarios-stat-card">
          <div className="usuarios-stat-icon usuarios-stat-inactive">
            <UserX size={20} />
          </div>
          <div className="usuarios-stat-content">
            <div className="usuarios-stat-value">{stats.inativos}</div>
            <div className="usuarios-stat-label">Inativos</div>
          </div>
        </div>
        
        <div className="usuarios-stat-card">
          <div className="usuarios-stat-icon usuarios-stat-admin">
            <Shield size={20} />
          </div>
          <div className="usuarios-stat-content">
            <div className="usuarios-stat-value">{stats.admins}</div>
            <div className="usuarios-stat-label">Administradores</div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="usuarios-filters">
        <div className="usuarios-search">
          <div className="usuarios-search-wrapper">
            <Search className="usuarios-search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="usuarios-search-input"
            />
          </div>
        </div>

        <div className="usuarios-filters-row">
          <div className="usuarios-filter">
            <label htmlFor="roleFilter">Função:</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="usuarios-filter-select"
            >
              <option value="todos">Todas</option>
              <option value="admin">Administrador</option>
              <option value="advogado">Advogado</option>
              <option value="assistente">Assistente</option>
            </select>
          </div>

          <div className="usuarios-filter">
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="usuarios-filter-select"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          <div className="usuarios-filter">
            <label htmlFor="sortBy">Ordenar por:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="usuarios-filter-select"
            >
              <option value="nome">Nome</option>
              <option value="ultimoAcesso">Último Acesso</option>
              <option value="createdAt">Data de Criação</option>
              <option value="processosAtivos">Processos Ativos</option>
            </select>
          </div>

          <div className="usuarios-filter">
            <label htmlFor="sortOrder">Ordem:</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="usuarios-filter-select"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="usuarios-content">
        {sortedUsuarios.length === 0 ? (
          <div className="usuarios-empty">
            <User size={48} />
            <h3>Nenhum usuário encontrado</h3>
            <p>
              {searchTerm || roleFilter !== 'todos' || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece adicionando o primeiro usuário.'
              }
            </p>
            {!searchTerm && roleFilter === 'todos' && statusFilter === 'todos' && (
              <button 
                className="btn btn-primary"
                onClick={handleNewUser}
              >
                <Plus size={20} />
                Adicionar Primeiro Usuário
              </button>
            )}
          </div>
        ) : (
          <div className="usuarios-grid">
            {sortedUsuarios.map(usuario => (
              <div key={usuario.id} className="usuario-card">
                <div className="usuario-card-header">
                  <div className="usuario-card-avatar">
                    {getInitials(usuario.nome)}
                  </div>
                  <div className="usuario-card-info">
                    <h4 className="usuario-card-name">{usuario.nome}</h4>
                    <div className="usuario-card-role">
                      <span className={`usuario-role-badge usuario-role-${getRoleColor(usuario.role)}`}>
                        {getRoleText(usuario.role)}
                      </span>
                    </div>
                  </div>
                  <div className="usuario-card-actions">
                    <button
                      className="usuario-action-btn usuario-action-toggle"
                      onClick={() => handleToggleStatus(usuario.id)}
                      title={usuario.status === 'ativo' ? 'Desativar usuário' : 'Ativar usuário'}
                    >
                      {usuario.status === 'ativo' ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button
                      className="usuario-action-btn usuario-action-edit"
                      onClick={() => handleEdit(usuario.id)}
                      title="Editar usuário"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="usuario-action-btn usuario-action-delete"
                      onClick={() => handleDelete(usuario.id)}
                      title="Excluir usuário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="usuario-card-content">
                  <div className="usuario-card-details">
                    <div className="usuario-detail-item">
                      <Mail size={14} />
                      <span>{usuario.email}</span>
                    </div>
                    <div className="usuario-detail-item">
                      <Phone size={14} />
                      <span>{usuario.telefone}</span>
                    </div>
                    <div className="usuario-detail-item">
                      <span className="usuario-detail-label">Processos Ativos:</span>
                      <span className="usuario-detail-value">{usuario.processosAtivos}</span>
                    </div>
                  </div>

                  <div className="usuario-card-footer">
                    <div className="usuario-card-status">
                      <span className={`usuario-status-badge usuario-status-${getStatusColor(usuario.status)}`}>
                        {getStatusText(usuario.status)}
                      </span>
                    </div>
                    <div className="usuario-card-meta">
                      <span className="usuario-card-last-access">
                        Último acesso: {formatDate(usuario.ultimoAcesso)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Novo Usuário */}
      {showNewUserModal && (
        <div className="modal-overlay" onClick={handleCancelUser}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Usuário</h2>
              <button 
                className="modal-close"
                onClick={handleCancelUser}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label required">Nome Completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUser.nome}
                  onChange={(e) => handleUserInputChange('nome', e.target.value)}
                  placeholder="Ex: Dr. João Silva"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={newUser.email}
                  onChange={(e) => handleUserInputChange('email', e.target.value)}
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Telefone</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUser.telefone}
                  onChange={(e) => handleUserInputChange('telefone', e.target.value)}
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Função</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) => handleUserInputChange('role', e.target.value)}
                  >
                    <option value="advogado">Advogado</option>
                    <option value="assistente">Assistente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={newUser.status}
                    onChange={(e) => handleUserInputChange('status', e.target.value)}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Senha</label>
                <input
                  type="password"
                  className="form-input"
                  value={newUser.senha}
                  onChange={(e) => handleUserInputChange('senha', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Confirmar Senha</label>
                <input
                  type="password"
                  className="form-input"
                  value={newUser.confirmarSenha}
                  onChange={(e) => handleUserInputChange('confirmarSenha', e.target.value)}
                  placeholder="Digite a senha novamente"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={handleCancelUser}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveUser}
                disabled={loading}
              >
                <Plus size={20} />
                {loading ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
