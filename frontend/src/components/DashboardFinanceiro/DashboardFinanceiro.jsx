import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Calendar, FileText } from 'lucide-react';
import { custaService } from '../../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import './DashboardFinanceiro.css';

const CORES = {
  custas_judiciais: '#6366f1',
  honorarios_contratuais: '#8b5cf6',
  honorarios_sucumbenciais: '#22c55e',
  despesas_processuais: '#f59e0b',
  honorarios_periciais: '#ec4899',
  emolumentos: '#14b8a6',
  outros: '#94a3b8'
};

const DashboardFinanceiro = () => {
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      const data = await custaService.getEstatisticas();
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarTipo = (tipo) => {
    const nomes = {
      custas_judiciais: 'Custas Judiciais',
      honorarios_contratuais: 'Honorários Contratuais',
      honorarios_sucumbenciais: 'Honorários Sucumbenciais',
      despesas_processuais: 'Despesas Processuais',
      honorarios_periciais: 'Honorários Periciais',
      emolumentos: 'Emolumentos',
      outros: 'Outros'
    };
    return nomes[tipo] || tipo;
  };

  if (loading) {
    return <div className="dashboard-financeiro-loading">Carregando estatísticas...</div>;
  }

  if (!estatisticas) {
    return <div className="dashboard-financeiro-error">Erro ao carregar dados financeiros</div>;
  }

  // Preparar dados para gráfico de pizza (por tipo)
  const dadosPorTipo = Object.entries(estatisticas.porTipo || {}).map(([tipo, valor]) => ({
    name: formatarTipo(tipo),
    value: parseFloat(valor),
    cor: CORES[tipo]
  }));

  // Preparar dados para gráfico de barras (por responsável)
  const dadosPorResponsavel = Object.entries(estatisticas.porResponsavel || {}).map(([resp, valor]) => ({
    name: resp.charAt(0).toUpperCase() + resp.slice(1),
    valor: parseFloat(valor)
  }));

  // Calcular percentuais
  const percentualPago = estatisticas.totalGeral > 0 
    ? (estatisticas.totalPago / estatisticas.totalGeral * 100).toFixed(1)
    : 0;
  
  const percentualPendente = estatisticas.totalGeral > 0
    ? (estatisticas.totalPendente / estatisticas.totalGeral * 100).toFixed(1)
    : 0;

  return (
    <div className="dashboard-financeiro">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Dashboard Financeiro</h1>
          <p className="page-subtitle">Visão geral de custas e honorários</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="financeiro-cards">
        <div className="financeiro-card total">
          <div className="financeiro-card-icon">
            <DollarSign size={24} />
          </div>
          <div className="financeiro-card-content">
            <div className="financeiro-card-label">Total Geral</div>
            <div className="financeiro-card-valor">{formatarMoeda(estatisticas.totalGeral)}</div>
          </div>
        </div>

        <div className="financeiro-card pago">
          <div className="financeiro-card-icon success">
            <TrendingUp size={24} />
          </div>
          <div className="financeiro-card-content">
            <div className="financeiro-card-label">Pago</div>
            <div className="financeiro-card-valor">{formatarMoeda(estatisticas.totalPago)}</div>
            <div className="financeiro-card-meta">{percentualPago}% do total</div>
          </div>
        </div>

        <div className="financeiro-card pendente">
          <div className="financeiro-card-icon warning">
            <TrendingDown size={24} />
          </div>
          <div className="financeiro-card-content">
            <div className="financeiro-card-label">Pendente</div>
            <div className="financeiro-card-valor">{formatarMoeda(estatisticas.totalPendente)}</div>
            <div className="financeiro-card-meta">{percentualPendente}% do total</div>
          </div>
        </div>

        <div className="financeiro-card vencidas">
          <div className="financeiro-card-icon danger">
            <AlertCircle size={24} />
          </div>
          <div className="financeiro-card-content">
            <div className="financeiro-card-label">Vencidas</div>
            <div className="financeiro-card-valor">{formatarMoeda(estatisticas.custasVencidas)}</div>
            <div className="financeiro-card-meta">Atenção necessária</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="financeiro-graficos">
        {/* Gráfico de Pizza - Por Tipo */}
        <div className="financeiro-grafico-card">
          <h3>Distribuição por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosPorTipo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatarMoeda(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Por Responsável */}
        <div className="financeiro-grafico-card">
          <h3>Por Responsável</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosPorResponsavel}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatarMoeda(value)} />
              <Bar dataKey="valor" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="financeiro-tabela-card">
        <h3>Detalhamento por Tipo</h3>
        <table className="financeiro-tabela">
          <thead>
            <tr>
              <th>Tipo</th>
              <th className="text-right">Valor</th>
              <th className="text-right">% do Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(estatisticas.porTipo || {}).map(([tipo, valor]) => {
              const percentual = estatisticas.totalGeral > 0 
                ? (parseFloat(valor) / estatisticas.totalGeral * 100).toFixed(1)
                : 0;
              return (
                <tr key={tipo}>
                  <td>
                    <div className="financeiro-tipo">
                      <span 
                        className="financeiro-tipo-cor" 
                        style={{ backgroundColor: CORES[tipo] }}
                      />
                      {formatarTipo(tipo)}
                    </div>
                  </td>
                  <td className="text-right font-semibold">{formatarMoeda(valor)}</td>
                  <td className="text-right text-muted">{percentual}%</td>
                </tr>
              );
            })}
            {Object.keys(estatisticas.porTipo || {}).length === 0 && (
              <tr>
                <td colSpan="3" className="text-center text-muted">
                  Nenhuma custa registrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardFinanceiro;

