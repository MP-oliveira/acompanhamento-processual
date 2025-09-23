import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';
// Lazy loading de bibliotecas pesadas - só carregam quando necessário
import { consultaService } from '../../services/api';
import './Consultas.css';

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dataFilter, setDataFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('dataConsulta');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);

  // Buscar consultas do backend
  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        setLoading(true);
        const response = await consultaService.getAll({
          tipo: tipoFilter !== 'todos' ? tipoFilter : undefined,
          status: statusFilter !== 'todos' ? statusFilter : undefined,
          data: dataFilter !== 'todos' ? dataFilter : undefined
        });
        setConsultas(response.consultas || []);
      } catch (error) {
        console.error('Erro ao buscar consultas:', error);
        setConsultas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, [tipoFilter, statusFilter, dataFilter]);

  const filteredConsultas = consultas.filter(consulta => {
    const matchesSearch = 
      consulta.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consulta.classe && consulta.classe.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (consulta.tribunal && consulta.tribunal.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (consulta.comarca && consulta.comarca.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTipo = tipoFilter === 'todos' || consulta.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'todos' || consulta.status === statusFilter;
    
    let matchesData = true;
    if (dataFilter !== 'todos') {
      const consultaDate = new Date(consulta.dataConsulta);
      const now = new Date();
      const daysDiff = Math.floor((now - consultaDate) / (1000 * 60 * 60 * 24));
      
      switch (dataFilter) {
        case 'hoje':
          matchesData = daysDiff === 0;
          break;
        case 'semana':
          matchesData = daysDiff <= 7;
          break;
        case 'mes':
          matchesData = daysDiff <= 30;
          break;
        default:
          matchesData = true;
      }
    }

    return matchesSearch && matchesTipo && matchesStatus && matchesData;
  });


  const sortedConsultas = [...filteredConsultas].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'dataConsulta') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleNovaConsulta = () => {
    // Aqui você pode abrir um modal ou navegar para uma página de nova consulta
  };


  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await consultaService.getAll({
        tipo: tipoFilter !== 'todos' ? tipoFilter : undefined,
        status: statusFilter !== 'todos' ? statusFilter : undefined,
        data: dataFilter !== 'todos' ? dataFilter : undefined
      });
      setConsultas(response.consultas || []);
    } catch (error) {
      console.error('Erro ao atualizar consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (consulta) => {
    setSelectedConsulta(consulta);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedConsulta(null);
  };

  // Função para exportar em PDF (lazy loading)
  const handleExportPDF = async () => {
    if (!selectedConsulta) return;

    try {
      // Lazy loading do jsPDF
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Função para adicionar texto com quebra de linha
      const addText = (text, fontSize = 12, isBold = false, color = '#000000') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color);
        
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * (fontSize * 0.4) + 5;
      };

      // Função para adicionar linha separadora
      const addSeparator = () => {
        yPosition += 5;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      };

      // Título
      addText('Relatório de Consulta', 18, true, '#2c3e50');
      addText(`Data: ${formatDate(selectedConsulta.dataConsulta)}`, 12, false, '#7f8c8d');
      yPosition += 10;

      // Informações Básicas
      addText('Informações Básicas', 14, true, '#34495e');
      addSeparator();
      
      addText(`Tipo: ${getTipoText(selectedConsulta.tipo)}`, 12, false);
      addText(`Número: ${selectedConsulta.numero}`, 12, false);
      addText(`Classe: ${selectedConsulta.classe}`, 12, false);
      addText(`Tribunal: ${selectedConsulta.tribunal}`, 12, false);
      addText(`Comarca: ${selectedConsulta.comarca}`, 12, false);
      addText(`Status: ${getStatusText(selectedConsulta.status)}`, 12, false);
      
      yPosition += 10;

      // Resultado da Consulta
      if (selectedConsulta.resultado) {
        addText('Resultado da Consulta', 14, true, '#34495e');
        addSeparator();

        if (selectedConsulta.tipo === 'processo') {
          addText(`Status do Processo: ${selectedConsulta.resultado.status}`, 12, false);
          addText(`Última Movimentação: ${formatDate(selectedConsulta.resultado.ultimaMovimentacao)}`, 12, false);
          addText(`Valor da Causa: ${selectedConsulta.resultado.valorCausa}`, 12, false);
          addText('Partes Envolvidas:', 12, true);
          
          selectedConsulta.resultado.partes.forEach(parte => {
            addText(`• ${parte.nome} (${parte.tipo})`, 11, false, '#7f8c8d');
          });
        } else if (selectedConsulta.tipo === 'pessoa') {
          addText(`Nome: ${selectedConsulta.resultado.nome}`, 12, false);
          addText(`Situação: ${selectedConsulta.resultado.situacao}`, 12, false);
          addText(`Última Atualização: ${formatDate(selectedConsulta.resultado.ultimaAtualizacao)}`, 12, false);
        } else if (selectedConsulta.tipo === 'empresa') {
          addText(`Razão Social: ${selectedConsulta.resultado.razaoSocial}`, 12, false);
          addText(`Situação: ${selectedConsulta.resultado.situacao}`, 12, false);
          addText(`Última Atualização: ${formatDate(selectedConsulta.resultado.ultimaAtualizacao)}`, 12, false);
        }
      } else {
        addText('Resultado da Consulta', 14, true, '#34495e');
        addSeparator();
        addText('Nenhum resultado encontrado para esta consulta.', 12, false, '#7f8c8d');
      }

      const fileName = `consulta_${selectedConsulta.numero}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    }
  };

  // Função para exportar em Word (lazy loading)
  const handleExportWord = async () => {
    if (!selectedConsulta) return;

    try {
      // Lazy loading do file-saver
      const { saveAs } = await import('file-saver');
      let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:w="urn:schemas-microsoft-com:office:word" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <meta name="ProgId" content="Word.Document">
          <meta name="Generator" content="Microsoft Word 15">
          <meta name="Originator" content="Microsoft Word 15">
          <title>Relatório de Consulta</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 30px; }
            .info-item { margin: 10px 0; }
            .label { font-weight: bold; color: #2c3e50; }
            .value { margin-left: 10px; }
            .section { margin: 20px 0; }
            .no-result { font-style: italic; color: #7f8c8d; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>Relatório de Consulta</h1>
          <p><strong>Data:</strong> ${formatDate(selectedConsulta.dataConsulta)}</p>
          
          <div class="section">
            <h2>Informações Básicas</h2>
            <div class="info-item">
              <span class="label">Tipo:</span>
              <span class="value">${getTipoText(selectedConsulta.tipo)}</span>
            </div>
            <div class="info-item">
              <span class="label">Número:</span>
              <span class="value">${selectedConsulta.numero}</span>
            </div>
            <div class="info-item">
              <span class="label">Classe:</span>
              <span class="value">${selectedConsulta.classe}</span>
            </div>
            <div class="info-item">
              <span class="label">Tribunal:</span>
              <span class="value">${selectedConsulta.tribunal}</span>
            </div>
            <div class="info-item">
              <span class="label">Comarca:</span>
              <span class="value">${selectedConsulta.comarca}</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <span class="value">${getStatusText(selectedConsulta.status)}</span>
            </div>
          </div>
      `;

      if (selectedConsulta.resultado) {
        htmlContent += `
          <div class="section">
            <h2>Resultado da Consulta</h2>
        `;

        if (selectedConsulta.tipo === 'processo') {
          htmlContent += `
            <div class="info-item">
              <span class="label">Status do Processo:</span>
              <span class="value">${selectedConsulta.resultado.status}</span>
            </div>
            <div class="info-item">
              <span class="label">Última Movimentação:</span>
              <span class="value">${formatDate(selectedConsulta.resultado.ultimaMovimentacao)}</span>
            </div>
            <div class="info-item">
              <span class="label">Valor da Causa:</span>
              <span class="value">${selectedConsulta.resultado.valorCausa}</span>
            </div>
            <div class="info-item">
              <span class="label">Partes Envolvidas:</span>
              <ul>
                ${selectedConsulta.resultado.partes.map(parte => 
                  `<li>${parte.nome} (${parte.tipo})</li>`
                ).join('')}
              </ul>
            </div>
          `;
        } else if (selectedConsulta.tipo === 'pessoa') {
          htmlContent += `
            <div class="info-item">
              <span class="label">Nome:</span>
              <span class="value">${selectedConsulta.resultado.nome}</span>
            </div>
            <div class="info-item">
              <span class="label">Situação:</span>
              <span class="value">${selectedConsulta.resultado.situacao}</span>
            </div>
            <div class="info-item">
              <span class="label">Última Atualização:</span>
              <span class="value">${formatDate(selectedConsulta.resultado.ultimaAtualizacao)}</span>
            </div>
          `;
        } else if (selectedConsulta.tipo === 'empresa') {
          htmlContent += `
            <div class="info-item">
              <span class="label">Razão Social:</span>
              <span class="value">${selectedConsulta.resultado.razaoSocial}</span>
            </div>
            <div class="info-item">
              <span class="label">Situação:</span>
              <span class="value">${selectedConsulta.resultado.situacao}</span>
            </div>
            <div class="info-item">
              <span class="label">Última Atualização:</span>
              <span class="value">${formatDate(selectedConsulta.resultado.ultimaAtualizacao)}</span>
            </div>
          `;
        }

        htmlContent += `</div>`;
      } else {
        htmlContent += `
          <div class="section">
            <h2>Resultado da Consulta</h2>
            <p class="no-result">Nenhum resultado encontrado para esta consulta.</p>
          </div>
        `;
      }

      htmlContent += `
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const fileName = `consulta_${selectedConsulta.numero}_${new Date().toISOString().split('T')[0]}.doc`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Erro ao exportar Word:', error);
      alert('Erro ao exportar Word. Tente novamente.');
    }
  };

  const [stats, setStats] = useState({
    total: 0,
    encontrados: 0,
    naoEncontrados: 0,
    hoje: 0
  });

  // Buscar estatísticas do backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await consultaService.getStats();
        setStats(response);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'encontrado':
        return <CheckCircle size={16} className="status-icon status-success" />;
      case 'nao_encontrado':
        return <XCircle size={16} className="status-icon status-error" />;
      default:
        return <AlertTriangle size={16} className="status-icon status-warning" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'encontrado':
        return 'Encontrado';
      case 'nao_encontrado':
        return 'Não Encontrado';
      default:
        return 'Pendente';
    }
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'processo':
        return 'Processo';
      case 'pessoa':
        return 'Pessoa Física';
      case 'empresa':
        return 'Pessoa Jurídica';
      default:
        return 'Consulta';
    }
  };

  if (loading) {
    return (
      <div className="consultas">
        <div className="consultas-loading">
          <div className="consultas-loading-spinner" />
          <p>Carregando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consultas">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <Search size={24} />
            Consultas
          </h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={20} />
            Atualizar
          </button>
          <button className="btn btn-primary" onClick={handleNovaConsulta}>
            <Plus size={20} />
            Nova Consulta
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="consultas-stats">
        <div className="consultas-stat-card">
          <div className="consultas-stat-icon consultas-stat-total">
            <Search size={20} />
          </div>
          <div className="consultas-stat-content">
            <div className="consultas-stat-value">{stats.total}</div>
            <div className="consultas-stat-label">Total</div>
          </div>
        </div>
        
        <div className="consultas-stat-card">
          <div className="consultas-stat-icon consultas-stat-found">
            <CheckCircle size={20} />
          </div>
          <div className="consultas-stat-content">
            <div className="consultas-stat-value">{stats.encontrados}</div>
            <div className="consultas-stat-label">Encontrados</div>
          </div>
        </div>
        
        <div className="consultas-stat-card">
          <div className="consultas-stat-icon consultas-stat-not-found">
            <XCircle size={20} />
          </div>
          <div className="consultas-stat-content">
            <div className="consultas-stat-value">{stats.naoEncontrados}</div>
            <div className="consultas-stat-label">Não Encontrados</div>
          </div>
        </div>
        
        <div className="consultas-stat-card">
          <div className="consultas-stat-icon consultas-stat-today">
            <Calendar size={20} />
          </div>
          <div className="consultas-stat-content">
            <div className="consultas-stat-value">{stats.hoje}</div>
            <div className="consultas-stat-label">Hoje</div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="consultas-filters">
        <div className="consultas-search">
          <div className="consultas-search-wrapper">
            <Search className="consultas-search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, classe, tribunal, comarca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="consultas-search-input"
            />
          </div>
          <button 
            className="consultas-filters-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="consultas-filters-row">
            <div className="consultas-filter">
              <label htmlFor="tipoFilter">Tipo:</label>
              <select
                id="tipoFilter"
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="consultas-filter-select"
              >
                <option value="todos">Todos</option>
                <option value="processo">Processo</option>
                <option value="pessoa">Pessoa Física</option>
                <option value="empresa">Pessoa Jurídica</option>
              </select>
            </div>

            <div className="consultas-filter">
              <label htmlFor="statusFilter">Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="consultas-filter-select"
              >
                <option value="todos">Todos</option>
                <option value="encontrado">Encontrado</option>
                <option value="nao_encontrado">Não Encontrado</option>
              </select>
            </div>

            <div className="consultas-filter">
              <label htmlFor="dataFilter">Período:</label>
              <select
                id="dataFilter"
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                className="consultas-filter-select"
              >
                <option value="todos">Todos</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mês</option>
              </select>
            </div>

            <div className="consultas-filter">
              <label htmlFor="sortBy">Ordenar por:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="consultas-filter-select"
              >
                <option value="dataConsulta">Data da Consulta</option>
                <option value="numero">Número</option>
                <option value="classe">Classe</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="consultas-filter">
              <label htmlFor="sortOrder">Ordem:</label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="consultas-filter-select"
              >
                <option value="desc">Mais Recente</option>
                <option value="asc">Mais Antigo</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Consultas */}
      <div className="consultas-content">
        {sortedConsultas.length === 0 ? (
          <div className="consultas-empty">
            <Search size={48} />
            <h3>Nenhuma consulta encontrada</h3>
            <p>
              {searchTerm || tipoFilter !== 'todos' || statusFilter !== 'todos' || dataFilter !== 'todos'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece fazendo sua primeira consulta.'
              }
            </p>
          </div>
        ) : (
          <div className="consultas-list">
            {sortedConsultas.map(consulta => (
              <div key={consulta.id} className="consulta-card">
                <div className="consulta-card-header">
                  <div className="consulta-card-type">
                    <FileText size={16} />
                    <span>{getTipoText(consulta.tipo)}</span>
                  </div>
                  <div className="consulta-card-status">
                    {getStatusIcon(consulta.status)}
                    <span>{getStatusText(consulta.status)}</span>
                  </div>
                </div>

                <div className="consulta-card-content">
                  <div className="consulta-card-main">
                    <h4 className="consulta-card-title">
                      {consulta.numero}
                    </h4>
                    <p className="consulta-card-class">
                      {consulta.classe}
                    </p>
                    <div className="consulta-card-location">
                      <MapPin size={14} />
                      <span>{consulta.tribunal} - {consulta.comarca}</span>
                    </div>
                  </div>

                  <div className="consulta-card-meta">
                    <div className="consulta-card-date">
                      <Clock size={14} />
                      <span>{formatDate(consulta.dataConsulta)}</span>
                    </div>
                  </div>
                </div>

                {consulta.resultado && (
                  <div className="consulta-card-result">
                    <h5>Resultado da Consulta:</h5>
                    {consulta.tipo === 'processo' && (
                      <div className="consulta-result-details">
                        <div className="consulta-result-item">
                          <strong>Status:</strong> {consulta.resultado.status}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Última Movimentação:</strong> {formatDate(consulta.resultado.ultimaMovimentacao)}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Valor da Causa:</strong> {consulta.resultado.valorCausa}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Partes:</strong>
                          <ul>
                            {consulta.resultado.partes.map((parte, index) => (
                              <li key={index}>{parte}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {consulta.tipo === 'pessoa' && (
                      <div className="consulta-result-details">
                        <div className="consulta-result-item">
                          <strong>Nome:</strong> {consulta.resultado.nome}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Situação:</strong> {consulta.resultado.situacao}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Última Atualização:</strong> {formatDate(consulta.resultado.ultimaAtualizacao)}
                        </div>
                      </div>
                    )}
                    {consulta.tipo === 'empresa' && (
                      <div className="consulta-result-details">
                        <div className="consulta-result-item">
                          <strong>Razão Social:</strong> {consulta.resultado.razaoSocial}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Situação:</strong> {consulta.resultado.situacao}
                        </div>
                        <div className="consulta-result-item">
                          <strong>Última Atualização:</strong> {formatDate(consulta.resultado.ultimaAtualizacao)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="consulta-card-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleViewDetails(consulta)}
                  >
                    <ExternalLink size={16} />
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetailModal && selectedConsulta && (
        <div className="consulta-modal-overlay" onClick={handleCloseModal}>
          <div className="consulta-modal" onClick={(e) => e.stopPropagation()}>
            <div className="consulta-modal-header">
              <h3>Detalhes da Consulta</h3>
              <button 
                className="consulta-modal-close"
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="consulta-modal-content">
              <div className="consulta-modal-section">
                <h4>Informações Básicas</h4>
                <div className="consulta-modal-info">
                  <div className="consulta-modal-info-item">
                    <strong>Tipo:</strong> {getTipoText(selectedConsulta.tipo)}
                  </div>
                  <div className="consulta-modal-info-item">
                    <strong>Número:</strong> {selectedConsulta.numero}
                  </div>
                  <div className="consulta-modal-info-item">
                    <strong>Classe:</strong> {selectedConsulta.classe}
                  </div>
                  <div className="consulta-modal-info-item">
                    <strong>Tribunal:</strong> {selectedConsulta.tribunal}
                  </div>
                  <div className="consulta-modal-info-item">
                    <strong>Comarca:</strong> {selectedConsulta.comarca}
                  </div>
                  <div className="consulta-modal-info-item">
                    <strong>Status:</strong> 
                    <span className={`consulta-modal-status ${selectedConsulta.status}`}>
                      {getStatusIcon(selectedConsulta.status)}
                      {getStatusText(selectedConsulta.status)}
                    </span>
                  </div>
                  <div className="consulta-modal-info-item">
                    <strong>Data da Consulta:</strong> {formatDate(selectedConsulta.dataConsulta)}
                  </div>
                </div>
              </div>

              {selectedConsulta.resultado && (
                <div className="consulta-modal-section">
                  <h4>Resultado da Consulta</h4>
                  <div className="consulta-modal-result">
                    {selectedConsulta.tipo === 'processo' && (
                      <div className="consulta-modal-result-details">
                        <div className="consulta-modal-result-item">
                          <strong>Status do Processo:</strong> {selectedConsulta.resultado.status}
                        </div>
                        <div className="consulta-modal-result-item">
                          <strong>Última Movimentação:</strong> {formatDate(selectedConsulta.resultado.ultimaMovimentacao)}
                        </div>
                        <div className="consulta-modal-result-item">
                          <strong>Valor da Causa:</strong> {selectedConsulta.resultado.valorCausa}
                        </div>
                        <div className="consulta-modal-result-item">
                          <strong>Partes Envolvidas:</strong>
                          <ul className="consulta-modal-list">
                            {selectedConsulta.resultado.partes.map((parte, index) => (
                              <li key={index}>{parte}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {selectedConsulta.tipo === 'pessoa' && (
                      <div className="consulta-modal-result-details">
                        <div className="consulta-modal-result-item">
                          <strong>Nome:</strong> {selectedConsulta.resultado.nome}
                        </div>
                        <div className="consulta-modal-result-item">
                          <strong>Situação:</strong> {selectedConsulta.resultado.situacao}
                        </div>
                        <div className="consulta-modal-result-item">
                          <strong>Última Atualização:</strong> {formatDate(selectedConsulta.resultado.ultimaAtualizacao)}
                        </div>
                      </div>
                    )}
                    {selectedConsulta.tipo === 'empresa' && (
                      <div className="consulta-modal-result-details">
                        <div className="consulta-modal-result-item">
                          <strong>Razão Social:</strong> {selectedConsulta.resultado.razaoSocial}
                        </div>
                        <div className="consulta-modal-result-item">
                          <strong>Situação:</strong> {selectedConsulta.resultado.situacao}
                        </div>
                        <div className="consulta-modal-result-item">
                          <strong>Última Atualização:</strong> {formatDate(selectedConsulta.resultado.ultimaAtualizacao)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!selectedConsulta.resultado && (
                <div className="consulta-modal-section">
                  <h4>Resultado da Consulta</h4>
                  <div className="consulta-modal-no-result">
                    <XCircle size={48} />
                    <p>Nenhum resultado encontrado para esta consulta.</p>
                    <p>Verifique se o número ou dados informados estão corretos.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="consulta-modal-actions">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Fechar
              </button>
              <button className="btn btn-outline" onClick={handleExportPDF}>
                <Download size={16} />
                Exportar PDF
              </button>
              <button className="btn btn-primary" onClick={handleExportWord}>
                <Download size={16} />
                Exportar Word
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultas;
