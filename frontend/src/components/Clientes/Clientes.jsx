import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Building2, User as UserIcon, Phone, Mail } from 'lucide-react';
import { clienteService } from '../../services/clienteService';
import '../Processos/Processos.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        <button className="btn btn-primary">
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

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
            <button className="btn btn-primary">
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
                      {cliente.cpf || cliente.cnpj}
                    </div>
                  </div>
                </div>
                <div className="processo-card-content">
                  <h4 className="processo-card-title">{cliente.nome}</h4>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clientes;

