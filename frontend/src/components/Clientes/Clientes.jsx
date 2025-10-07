import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Building2, User as UserIcon, Phone, Mail, X, Edit, Trash2 } from 'lucide-react';
import { clienteService } from '../../services/clienteService';
import '../Processos/Processos.css';
import './Clientes.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      if (clienteEditando) {
        await clienteService.update(clienteEditando.id, formData);
      } else {
        await clienteService.create(formData);
      }
      
      fecharModal();
      await carregarClientes();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar cliente');
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
    setFormData(cliente);
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

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf?.includes(searchTerm) ||
    c.cnpj?.includes(searchTerm)
  );

  return (
    <div className="processos">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Users size={28} />
            Clientes
          </h1>
        </div>
        <button className="btn btn-primary" onClick={abrirModal}>
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div className="processos-filters">
        <div className="processos-search">
          <div className="processos-search-wrapper">
            <Search className="processos-search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="processos-search-input"
            />
          </div>
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
              <div key={cliente.id} className="processo-card">
                <div className="processo-card-header">
                  <div className="processo-card-meta">
                    <div className="processo-card-number">
                      {cliente.tipo === 'juridica' ? <Building2 size={16} /> : <UserIcon size={16} />}
                      {' '}
                      {cliente.cpf || cliente.cnpj}
                    </div>
                  </div>
                  <div className="processo-card-actions">
                    <button className="processo-card-action-btn" onClick={() => handleEdit(cliente)} title="Editar">
                      <Edit size={18} />
                    </button>
                    <button className="processo-card-action-btn processo-card-action-delete" onClick={() => handleDelete(cliente.id)} title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="processo-card-content">
                  <h4 className="processo-card-title">{cliente.nome}</h4>
                  <div className="processo-card-info">
                    {cliente.email && (
                      <div className="processo-card-info-item">
                        <Mail size={16} />
                        <span>{cliente.email}</span>
                      </div>
                    )}
                    {cliente.celular && (
                      <div className="processo-card-info-item">
                        <Phone size={16} />
                        <span>{cliente.celular}</span>
                      </div>
                    )}
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