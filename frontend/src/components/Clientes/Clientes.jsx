import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Building2, User as UserIcon, Phone, Mail, X, Edit, Trash2, MapPin, Calendar, Filter, FileText, MessageSquare, Clock, MoreHorizontal } from 'lucide-react';
import { clienteService } from '../../services/clienteService';
import '../Processos/Processos.css';
import './Clientes.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'fisica',
    cpf: '',
    cnpj: '',
    email: '',
    telefone: '',
    celular: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.getAll();
      setClientes(Array.isArray(data) ? data : data.clientes || []);
    } catch (err) {
      console.error('Erro:', err);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Preparar dados para envio
      const dadosParaEnvio = { ...formData };
      
      // Limpar campos vazios e garantir que não sejam undefined
      Object.keys(dadosParaEnvio).forEach(key => {
        if (dadosParaEnvio[key] === '' || dadosParaEnvio[key] === undefined) {
          dadosParaEnvio[key] = null;
        }
      });

      if (clienteEditando) {
        await clienteService.update(clienteEditando.id, dadosParaEnvio);
      } else {
        await clienteService.create(dadosParaEnvio);
      }
      
      fecharModal();
      await carregarClientes();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      console.error('Response data:', err.response?.data);
      console.error('Request data:', dadosParaEnvio);
      
      let errorMessage = 'Erro ao salvar cliente';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        const details = err.response.data.details.map(d => `${d.field}: ${d.message}`).join('\n');
        errorMessage += '\n\nDetalhes:\n' + details;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert(`Erro: ${errorMessage}`);
    }
  };

  const abrirModal = () => {
    resetForm();
    setClienteEditando(null);
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setClienteEditando(null);
    resetForm();
  };

  const handleEdit = (cliente) => {
    setClienteEditando(cliente);
    // Garantir que todos os campos sejam strings, nunca null
    setFormData({
      nome: cliente.nome || '',
      tipo: cliente.tipo || 'fisica',
      cpf: cliente.cpf || '',
      cnpj: cliente.cnpj || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      celular: cliente.celular || '',
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      cep: cliente.cep || '',
      observacoes: cliente.observacoes || ''
    });
    setMostrarModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este cliente?')) return;
    
    try {
      await clienteService.delete(id);
      await carregarClientes();
    } catch (err) {
      alert('Erro ao excluir cliente');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'fisica',
      cpf: '',
      cnpj: '',
      email: '',
      telefone: '',
      celular: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: ''
    });
  };

  const clientesFiltrados = clientes.filter(c => {
    const matchesSearch = c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.cpf?.includes(searchTerm) ||
                         c.cnpj?.includes(searchTerm) ||
                         c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'todos' || c.tipo === filterType;
    
    return matchesSearch && matchesType;
  });

  // Estatísticas dos clientes
  const stats = {
    total: clientes.length,
    fisica: clientes.filter(c => c.tipo === 'fisica').length,
    juridica: clientes.filter(c => c.tipo === 'juridica').length,
    ativos: clientes.filter(c => c.ativo !== false).length
  };

  return (
    <div className="processos">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Users size={28} />
            Clientes
          </h1>
          <p className="page-subtitle">Gerencie seus clientes e suas informações</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={abrirModal}>
            <Plus size={20} />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="processos-stats">
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-total">
            <Users size={24} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.total}</div>
            <div className="processos-stat-label">Total de Clientes</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-fisica">
            <UserIcon size={24} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.fisica}</div>
            <div className="processos-stat-label">Pessoa Física</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-juridica">
            <Building2 size={24} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.juridica}</div>
            <div className="processos-stat-label">Pessoa Jurídica</div>
          </div>
        </div>
        
        <div className="processos-stat-card">
          <div className="processos-stat-icon processos-stat-ativos">
            <Calendar size={24} />
          </div>
          <div className="processos-stat-content">
            <div className="processos-stat-value">{stats.ativos}</div>
            <div className="processos-stat-label">Clientes Ativos</div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="processos-filters">
        <div className="processos-search">
          <div className="processos-search-wrapper">
            <Search className="processos-search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="processos-search-input"
            />
          </div>
        </div>
        
        <div className="processos-filter-group">
          <Filter size={18} />
          <select 
            className="processos-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="todos">Todos os tipos</option>
            <option value="fisica">Pessoa Física</option>
            <option value="juridica">Pessoa Jurídica</option>
          </select>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="processos-content">
        {loading ? (
          <div className="processos-loading">
            <div className="processos-loading-spinner" />
            <p>Carregando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="processos-empty">
            <Users size={48} />
            <h3>Nenhum cliente cadastrado</h3>
            <p>Comece criando seu primeiro cliente</p>
            <button className="btn btn-primary" onClick={abrirModal}>
              <Plus size={20} />
              Criar Primeiro Cliente
            </button>
          </div>
        ) : (
          <div className="processos-grid">
            {clientesFiltrados.map(cliente => (
              <div key={cliente.id} className={`cliente-card cliente-card-${cliente.ativo !== false ? 'active' : 'archived'}`}>
                {/* Header Minimalista */}
                <div className="cliente-card-header">
                  <div className="cliente-card-meta">
                    <div className="cliente-card-number">
                      {cliente.nome}
                    </div>
                    <div className="cliente-card-status">
                      {cliente.ativo !== false ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                  <div className="cliente-card-actions">
                    <button className="cliente-card-action-btn" onClick={() => handleEdit(cliente)} title="Editar">
                      <Edit size={18} />
                    </button>
                    <button className="cliente-card-action-btn cliente-card-action-delete" onClick={() => handleDelete(cliente.id)} title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="cliente-card-content">
                  <h4 className="cliente-card-title">
                    {cliente.tipo === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                  </h4>
                  
                  {cliente.email && (
                    <p className="cliente-card-subject">
                      {cliente.email}
                    </p>
                  )}

                  {/* Informações Essenciais */}
                  <div className="cliente-card-info">
                    {cliente.telefone && (
                      <div className="cliente-card-info-item">
                        <Phone size={16} />
                        <span>{cliente.telefone}</span>
                      </div>
                    )}
                    
                    {cliente.cidade && cliente.estado && (
                      <div className="cliente-card-info-item">
                        <MapPin size={16} />
                        <span>{cliente.cidade}/{cliente.estado}</span>
                      </div>
                    )}
                  </div>

                  {/* Documentos - usando a estrutura de deadline */}
                  {(cliente.cpf || cliente.cnpj) && (
                    <div className="cliente-card-deadline">
                      <div className="cliente-card-deadline-header">
                        <FileText size={16} />
                        <span>Documentos</span>
                      </div>
                      <div className="cliente-card-deadline-content">
                        {cliente.cpf && (
                          <span className="cliente-card-deadline-date">
                            CPF: {cliente.cpf}
                          </span>
                        )}
                        {cliente.cnpj && (
                          <span className="cliente-card-deadline-date">
                            CNPJ: {cliente.cnpj}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Simples */}
                <div className="cliente-card-footer">
                  <div className="cliente-card-user">
                    <Clock size={16} />
                    <span>Cadastrado em {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="processo-view-overlay" onClick={fecharModal}>
          <div className="processo-view-container" onClick={(e) => e.stopPropagation()}>
            <div className="processo-view-header">
              <h2>{clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button className="modal-close-btn" onClick={fecharModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="processo-view-content">
              <form onSubmit={handleSubmit} className="processo-form">
                <div className="form-section">
                  <h3 className="form-section-title">Dados Principais</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">Nome Completo</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Tipo</label>
                      <select
                        className="form-select"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      >
                        <option value="fisica">Pessoa Física</option>
                        <option value="juridica">Pessoa Jurídica</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    {formData.tipo === 'fisica' ? (
                      <div className="form-group">
                        <label className="form-label">CPF</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label className="form-label">CNPJ</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.cnpj}
                          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Telefone</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Celular</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={formData.celular}
                        onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Endereço</h3>
                  
                  <div className="form-row">
                    <div className="form-group" style={{flex: 2}}>
                      <label className="form-label">Endereço</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">CEP</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.cep}
                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{flex: 2}}>
                      <label className="form-label">Cidade</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Estado</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                        maxLength="2"
                        placeholder="BA"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={fecharModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {clienteEditando ? 'Salvar Alterações' : 'Criar Cliente'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;